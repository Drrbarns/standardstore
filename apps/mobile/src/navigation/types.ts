import type { NavigatorScreenParams } from "@react-navigation/native";

export type MainTabParamList = {
  Shop: undefined;
  Cart: undefined;
  Account: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  PaymentResult: {
    orderNumber: string;
    paymentStatus: "paid" | "pending" | "failed";
    total?: number;
  };
  OrderTracking: {
    orderNumber: string;
  };
};
