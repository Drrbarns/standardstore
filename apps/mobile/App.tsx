import { StatusBar } from "expo-status-bar";
import { AppServicesProvider } from "./src/context/AppServicesProvider";
import { AuthProvider } from "./src/context/AuthContext";
import { CartProvider } from "./src/context/CartContext";
import { AppNavigator } from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <AuthProvider>
      <AppServicesProvider>
        <CartProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </CartProvider>
      </AppServicesProvider>
    </AuthProvider>
  );
}
