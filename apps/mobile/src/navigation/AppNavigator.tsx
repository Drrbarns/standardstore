import { NavigationContainer } from "@react-navigation/native";
import type { LinkingOptions } from "@react-navigation/native";
import * as ExpoLinking from "expo-linking";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AccountScreen } from "../screens/AccountScreen";
import { CartScreen } from "../screens/CartScreen";
import { OrderTrackingScreen } from "../screens/OrderTrackingScreen";
import { PaymentResultScreen } from "../screens/PaymentResultScreen";
import { ShopScreen } from "../screens/ShopScreen";
import { useCart } from "../context/CartContext";
import type { MainTabParamList, RootStackParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function MainTabs() {
  const { itemCount } = useCart();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0f172a",
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: {
          borderTopColor: "#e2e8f0",
          height: 62,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="Shop"
        component={ShopScreen}
        options={{ tabBarLabel: "Shop" }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: "Cart",
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{ tabBarLabel: "Account" }}
      />
    </Tab.Navigator>
  );
}

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [
    ExpoLinking.createURL("/"),
    "standardstore://",
    "https://standardecom.com",
    "https://www.standardecom.com",
  ],
  config: {
    screens: {
      MainTabs: {
        screens: {
          Shop: "shop",
          Cart: "cart",
          Account: "account",
        },
      },
      PaymentResult: "payment-return",
      OrderTracking: "order-tracking",
    },
  },
};

export function AppNavigator() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PaymentResult"
          component={PaymentResultScreen}
          options={{ title: "Payment Result" }}
        />
        <Stack.Screen
          name="OrderTracking"
          component={OrderTrackingScreen}
          options={{ title: "Order Tracking" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
