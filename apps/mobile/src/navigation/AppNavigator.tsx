import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AccountScreen } from "../screens/AccountScreen";
import { CartScreen } from "../screens/CartScreen";
import { ShopScreen } from "../screens/ShopScreen";
import { useCart } from "../context/CartContext";

const Tab = createBottomTabNavigator();

export function AppNavigator() {
  const { itemCount } = useCart();

  return (
    <NavigationContainer>
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
    </NavigationContainer>
  );
}
