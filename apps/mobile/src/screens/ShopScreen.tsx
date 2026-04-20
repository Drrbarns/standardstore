import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useCart } from "../context/CartContext";
import { getProducts, trackMobileEvent } from "../lib/api";
import type { StorefrontProduct } from "../types/storefront";
import { formatCurrency } from "../utils/format";

export function ShopScreen() {
  const { addProduct, itemCount } = useCart();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<StorefrontProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<StorefrontProduct | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setError(null);
      const data = await getProducts(40);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    void trackMobileEvent({
      event: "shop_viewed",
      payload: { productCount: products.length },
    });
  }, [products.length]);

  const subtitle = useMemo(() => {
    const productLabel = products.length === 1 ? "1 product" : `${products.length} products`;
    return `${productLabel} • ${itemCount} in cart`;
  }, [products.length, itemCount]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#0f172a" />
        <Text style={styles.muted}>Loading storefront...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shop</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Unable to fetch products</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.primaryButton} onPress={() => void loadProducts()}>
            <Text style={styles.primaryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                void loadProducts();
              }}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Pressable onPress={() => setSelected(item)}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productSlug}>/{item.slug}</Text>
                <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
              </Pressable>
              <Pressable
                style={styles.addButton}
                onPress={() => {
                  addProduct(item);
                  void trackMobileEvent({
                    event: "add_to_cart",
                    payload: { productId: item.id, slug: item.slug, price: item.price },
                  });
                }}
                disabled={item.price == null}
              >
                <Text style={styles.addButtonText}>
                  {item.price == null ? "Unavailable" : "Add to Cart"}
                </Text>
              </Pressable>
            </View>
          )}
        />
      )}

      <Modal
        animationType="slide"
        transparent
        visible={Boolean(selected)}
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{selected?.name}</Text>
            <Text style={styles.modalPrice}>
              {formatCurrency(selected?.price ?? null)}
            </Text>
            <Text style={styles.modalDescription}>
              {selected?.description || "No description available yet."}
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.primaryButton, { flex: 1 }]}
                onPress={() => {
                  if (selected) addProduct(selected);
                }}
              >
                <Text style={styles.primaryButtonText}>Add to Cart</Text>
              </Pressable>
              <Pressable
                style={[styles.secondaryButton, { flex: 1 }]}
                onPress={() => setSelected(null)}
              >
                <Text style={styles.secondaryButtonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  title: { fontSize: 26, fontWeight: "700", color: "#0f172a" },
  subtitle: { marginTop: 3, color: "#64748b" },
  listContent: { padding: 14, gap: 12 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    gap: 10,
  },
  productName: { fontSize: 16, fontWeight: "600", color: "#0f172a" },
  productSlug: { marginTop: 2, color: "#64748b", fontSize: 12 },
  productPrice: { marginTop: 6, fontWeight: "700", color: "#1d4ed8" },
  addButton: {
    borderRadius: 8,
    backgroundColor: "#0f172a",
    paddingVertical: 9,
    alignItems: "center",
  },
  addButtonText: { color: "#ffffff", fontWeight: "600" },
  errorCard: {
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
    padding: 16,
    gap: 8,
  },
  errorTitle: { fontWeight: "700", color: "#991b1b" },
  errorText: { color: "#7f1d1d" },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(2, 6, 23, 0.45)",
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 20,
    gap: 10,
  },
  modalTitle: { fontSize: 22, fontWeight: "700", color: "#0f172a" },
  modalPrice: { fontSize: 17, color: "#1d4ed8", fontWeight: "700" },
  modalDescription: { color: "#334155", lineHeight: 20 },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 8 },
  primaryButton: {
    backgroundColor: "#0f172a",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  primaryButtonText: { color: "#ffffff", fontWeight: "600" },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  secondaryButtonText: { color: "#0f172a", fontWeight: "600" },
});
