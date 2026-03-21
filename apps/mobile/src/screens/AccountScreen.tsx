import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { supabase } from "../lib/supabase";
import { formatCurrency } from "../utils/format";

type UserOrder = {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  total: number;
};

function AuthForm() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Email and password are required.");
      return;
    }
    if (mode === "signup" && password.length < 6) {
      Alert.alert("Weak password", "Use at least 6 characters.");
      return;
    }

    try {
      setSubmitting(true);
      if (mode === "signin") {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password, fullName.trim());
        Alert.alert(
          "Account created",
          "If email confirmation is enabled, check your inbox before signing in."
        );
      }
      setPassword("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Authentication failed.";
      Alert.alert("Auth error", message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.authCard}>
      <Text style={styles.authTitle}>
        {mode === "signin" ? "Sign in" : "Create account"}
      </Text>

      {mode === "signup" ? (
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder="Full name"
          style={styles.input}
        />
      ) : null}

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={styles.input}
      />

      <Pressable
        style={[styles.primaryButton, submitting && { opacity: 0.7 }]}
        onPress={() => void submit()}
        disabled={submitting}
      >
        <Text style={styles.primaryButtonText}>
          {submitting
            ? "Please wait..."
            : mode === "signin"
              ? "Sign in"
              : "Create account"}
        </Text>
      </Pressable>

      <Pressable
        style={styles.linkButton}
        onPress={() => setMode((prev) => (prev === "signin" ? "signup" : "signin"))}
      >
        <Text style={styles.linkText}>
          {mode === "signin"
            ? "Need an account? Sign up"
            : "Already have an account? Sign in"}
        </Text>
      </Pressable>
    </View>
  );
}

export function AccountScreen() {
  const { user, loading, signOut } = useAuth();
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orders, setOrders] = useState<UserOrder[]>([]);

  useEffect(() => {
    async function loadOrders() {
      if (!user) {
        setOrders([]);
        return;
      }
      try {
        setOrdersLoading(true);
        const { data, error } = await supabase
          .from("orders")
          .select("id, order_number, created_at, status, total")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);
        if (error) throw error;
        setOrders((data ?? []) as UserOrder[]);
      } catch (error) {
        console.error("Failed to load orders:", error);
      } finally {
        setOrdersLoading(false);
      }
    }

    void loadOrders();
  }, [user]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#0f172a" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Account</Text>
      </View>

      {!user ? (
        <View style={{ padding: 16 }}>
          <Text style={styles.subtitle}>
            Sign in to view your orders and place checkout orders.
          </Text>
          <AuthForm />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.profileCard}>
              <Text style={styles.profileTitle}>
                {(user.user_metadata?.full_name as string) || "Signed-in user"}
              </Text>
              <Text style={styles.profileSub}>{user.email}</Text>
              <Pressable style={styles.secondaryButton} onPress={() => void signOut()}>
                <Text style={styles.secondaryButtonText}>Sign out</Text>
              </Pressable>
            </View>
          }
          ListEmptyComponent={
            ordersLoading ? (
              <View style={styles.centerInline}>
                <ActivityIndicator size="small" color="#0f172a" />
                <Text style={styles.mutedInline}>Loading order history...</Text>
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No orders yet</Text>
                <Text style={styles.emptyText}>
                  Place an order from the Cart tab to see it here.
                </Text>
              </View>
            )
          }
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <Text style={styles.orderNumber}>{item.order_number}</Text>
              <Text style={styles.orderMeta}>
                {new Date(item.created_at).toLocaleDateString()} • {item.status}
              </Text>
              <Text style={styles.orderTotal}>{formatCurrency(item.total, "GHS")}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  center: {
    flex: 1,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#cbd5e1",
    backgroundColor: "#ffffff",
  },
  title: { fontSize: 26, fontWeight: "700", color: "#0f172a" },
  subtitle: { color: "#64748b", marginBottom: 10 },
  authCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    gap: 10,
  },
  authTitle: { fontSize: 20, fontWeight: "700", color: "#0f172a", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
  },
  primaryButton: {
    backgroundColor: "#0f172a",
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 11,
  },
  primaryButtonText: { color: "#ffffff", fontWeight: "700" },
  linkButton: { alignSelf: "flex-start" },
  linkText: { color: "#1d4ed8", fontWeight: "600" },
  listContent: { padding: 14, gap: 12, paddingBottom: 80 },
  profileCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    gap: 6,
  },
  profileTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  profileSub: { color: "#64748b", marginBottom: 8 },
  secondaryButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  secondaryButtonText: { color: "#0f172a", fontWeight: "600" },
  centerInline: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10 },
  mutedInline: { color: "#64748b" },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    gap: 6,
  },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: "#0f172a" },
  emptyText: { color: "#64748b" },
  orderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    gap: 4,
  },
  orderNumber: { fontWeight: "700", color: "#0f172a" },
  orderMeta: { color: "#64748b", fontSize: 12 },
  orderTotal: { marginTop: 4, color: "#1d4ed8", fontWeight: "700" },
});
