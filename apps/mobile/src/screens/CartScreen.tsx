import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { createOrderFromCart } from "../lib/api";
import { formatCurrency } from "../utils/format";

export function CartScreen() {
  const { user } = useAuth();
  const { items, subtotal, removeItem, updateQuantity, clearCart } = useCart();
  const [fullName, setFullName] = useState(
    (user?.user_metadata?.full_name as string) || ""
  );
  const [phone, setPhone] = useState((user?.phone as string) || "");
  const [placing, setPlacing] = useState(false);

  const shipping = useMemo(() => (subtotal >= 200 ? 0 : 15), [subtotal]);
  const total = subtotal + shipping;

  async function placeOrder() {
    if (!user?.email) {
      Alert.alert("Sign in required", "Please sign in from the Account tab first.");
      return;
    }
    if (!fullName.trim() || !phone.trim()) {
      Alert.alert(
        "Missing details",
        "Enter your full name and phone number before checkout."
      );
      return;
    }
    if (items.length === 0) {
      Alert.alert("Empty cart", "Add products before placing an order.");
      return;
    }

    try {
      setPlacing(true);
      const result = await createOrderFromCart({
        userId: user.id,
        email: user.email,
        phone,
        fullName,
        items,
      });

      clearCart();
      Alert.alert(
        "Order placed",
        `Order ${result.order.order_number} created successfully.`
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to place order.";
      Alert.alert("Checkout failed", message);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cart</Text>
        <Text style={styles.subtitle}>{items.length} line items</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>
            Add products from the Shop tab to continue.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemSlug}>/{item.slug}</Text>
                <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
              </View>
              <View style={styles.qtyWrap}>
                <Pressable
                  style={styles.qtyButton}
                  onPress={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  <Text style={styles.qtyButtonText}>-</Text>
                </Pressable>
                <Text style={styles.qtyValue}>{item.quantity}</Text>
                <Pressable
                  style={styles.qtyButton}
                  onPress={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Text style={styles.qtyButtonText}>+</Text>
                </Pressable>
              </View>
              <Pressable onPress={() => removeItem(item.id)}>
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            </View>
          )}
          ListFooterComponent={
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Checkout</Text>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Full name</Text>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="John Doe"
                  style={styles.input}
                />
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Phone</Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+233..."
                  keyboardType="phone-pad"
                  style={styles.input}
                />
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.muted}>Subtotal</Text>
                <Text style={styles.value}>{formatCurrency(subtotal, "GHS")}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.muted}>Shipping</Text>
                <Text style={styles.value}>{formatCurrency(shipping, "GHS")}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalText}>Total</Text>
                <Text style={styles.totalText}>{formatCurrency(total, "GHS")}</Text>
              </View>

              <Pressable
                style={[styles.checkoutButton, placing && { opacity: 0.7 }]}
                onPress={() => void placeOrder()}
                disabled={placing}
              >
                <Text style={styles.checkoutButtonText}>
                  {placing ? "Placing order..." : "Place order"}
                </Text>
              </Pressable>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#cbd5e1",
    backgroundColor: "#ffffff",
  },
  title: { fontSize: 26, fontWeight: "700", color: "#0f172a" },
  subtitle: { marginTop: 3, color: "#64748b" },
  emptyState: { margin: 20, gap: 8 },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: "#0f172a" },
  emptyText: { color: "#64748b" },
  listContent: { padding: 14, gap: 12, paddingBottom: 80 },
  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  itemName: { fontSize: 16, fontWeight: "600", color: "#0f172a" },
  itemSlug: { marginTop: 2, fontSize: 12, color: "#64748b" },
  itemPrice: { marginTop: 6, color: "#1d4ed8", fontWeight: "700" },
  qtyWrap: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyButtonText: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  qtyValue: { width: 24, textAlign: "center", color: "#0f172a", fontWeight: "600" },
  removeText: { marginTop: 6, color: "#b91c1c", fontWeight: "600" },
  summaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    gap: 12,
  },
  summaryTitle: { fontSize: 20, fontWeight: "700", color: "#0f172a" },
  fieldBlock: { gap: 6 },
  fieldLabel: { fontSize: 13, color: "#334155", fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  muted: { color: "#64748b" },
  value: { color: "#0f172a", fontWeight: "600" },
  totalRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#cbd5e1",
    paddingTop: 8,
    marginTop: 4,
  },
  totalText: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  checkoutButton: {
    marginTop: 8,
    backgroundColor: "#0f172a",
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 12,
  },
  checkoutButtonText: { color: "#ffffff", fontWeight: "700" },
});
