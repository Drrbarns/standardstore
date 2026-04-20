import { useEffect } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { formatCurrency } from "../utils/format";
import { trackMobileEvent } from "../lib/api";

type Props = NativeStackScreenProps<RootStackParamList, "PaymentResult">;

export function PaymentResultScreen({ route, navigation }: Props) {
  const { orderNumber, paymentStatus, total } = route.params;
  const success = paymentStatus === "paid";

  useEffect(() => {
    void trackMobileEvent({
      event: "payment_result_viewed",
      payload: { orderNumber, paymentStatus, total: total ?? null },
    });
  }, [orderNumber, paymentStatus, total]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>{success ? "✅" : "⚠️"}</Text>
        <Text style={styles.title}>
          {success ? "Payment successful" : "Payment pending"}
        </Text>
        <Text style={styles.subtitle}>
          {success
            ? `Order ${orderNumber} has been confirmed.`
            : `Order ${orderNumber} is created but payment is still pending.`}
        </Text>
        {typeof total === "number" ? (
          <Text style={styles.amount}>{formatCurrency(total, "GHS")}</Text>
        ) : null}

        <Pressable
          style={styles.primaryButton}
          onPress={() =>
            navigation.navigate("OrderTracking", {
              orderNumber,
            })
          }
        >
          <Text style={styles.primaryButtonText}>Track order</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("MainTabs")}
        >
          <Text style={styles.secondaryButtonText}>Back to shop</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 20,
    alignItems: "center",
    gap: 10,
  },
  icon: { fontSize: 44 },
  title: { fontSize: 24, fontWeight: "700", color: "#0f172a" },
  subtitle: { color: "#475569", textAlign: "center" },
  amount: { marginTop: 2, fontSize: 18, fontWeight: "700", color: "#1d4ed8" },
  primaryButton: {
    marginTop: 12,
    width: "100%",
    borderRadius: 8,
    backgroundColor: "#0f172a",
    alignItems: "center",
    paddingVertical: 12,
  },
  primaryButtonText: { color: "#ffffff", fontWeight: "700" },
  secondaryButton: {
    width: "100%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
    paddingVertical: 12,
  },
  secondaryButtonText: { color: "#0f172a", fontWeight: "700" },
});
