import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { lookupOrder, trackMobileEvent } from "../lib/api";
import type { OrderLookup } from "../lib/api";
import { formatCurrency } from "../utils/format";

type Props = NativeStackScreenProps<RootStackParamList, "OrderTracking">;

const STATUS_STEPS = [
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

function statusIndex(status?: string) {
  const value = (status || "").toLowerCase();
  const idx = STATUS_STEPS.findIndex((step) => step.key === value);
  return idx === -1 ? 0 : idx;
}

export function OrderTrackingScreen({ route }: Props) {
  const { orderNumber } = route.params;
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderLookup | null>(null);

  useEffect(() => {
    async function run() {
      try {
        const response = await lookupOrder({ orderId: orderNumber, includeItems: true });
        setOrder(response.order);
        await trackMobileEvent({
          event: "order_tracking_viewed",
          payload: { orderNumber, status: response.order.status },
        });
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    }
    void run();
  }, [orderNumber]);

  const activeStepIndex = useMemo(() => statusIndex(order?.status), [order?.status]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#0f172a" />
        <Text style={styles.muted}>Loading tracking details...</Text>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.title}>Order not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Track Order</Text>
        <Text style={styles.subtitle}>{order.order_number}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Status Timeline</Text>
        {STATUS_STEPS.map((step, idx) => {
          const done = idx <= activeStepIndex;
          return (
            <View key={step.key} style={styles.stepRow}>
              <View style={[styles.dot, done && styles.dotDone]} />
              <Text style={[styles.stepLabel, done && styles.stepLabelDone]}>
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Order Summary</Text>
        <Text style={styles.metaLine}>
          Payment: {order.payment_status === "paid" ? "Paid" : "Pending"}
        </Text>
        <Text style={styles.metaLine}>
          Total: {formatCurrency(order.total ?? 0, "GHS")}
        </Text>
      </View>

      <FlatList
        data={order.order_items ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 90 }}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <Text style={styles.itemName}>{item.product_name}</Text>
            <Text style={styles.itemMeta}>Qty {item.quantity}</Text>
            <Text style={styles.itemMeta}>
              {formatCurrency(item.unit_price, "GHS")}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
  muted: { marginTop: 10, color: "#64748b" },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#cbd5e1",
    backgroundColor: "#ffffff",
  },
  title: { fontSize: 24, fontWeight: "700", color: "#0f172a" },
  subtitle: { marginTop: 4, color: "#64748b" },
  card: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    padding: 14,
    gap: 8,
  },
  cardTitle: { fontWeight: "700", color: "#0f172a" },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 99,
    backgroundColor: "#cbd5e1",
  },
  dotDone: { backgroundColor: "#0f766e" },
  stepLabel: { color: "#64748b" },
  stepLabelDone: { color: "#0f172a", fontWeight: "600" },
  metaLine: { color: "#334155" },
  itemCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    padding: 12,
    gap: 4,
  },
  itemName: { fontWeight: "600", color: "#0f172a" },
  itemMeta: { color: "#64748b" },
});
