import { useEffect } from "react";
import type { ReactNode } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { useAuth } from "./AuthContext";
import { registerPushToken } from "../lib/api";
import { requestPushPermissionsAndToken } from "../lib/notifications";

export function AppServicesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  useEffect(() => {
    async function setupPush() {
      const token = await requestPushPermissionsAndToken();
      if (!token) return;
      await registerPushToken({
        token,
        userId: user?.id ?? null,
        email: user?.email ?? null,
        platform: Platform.OS,
        deviceName: Device.modelName ?? undefined,
        appVersion: Constants.expoConfig?.version,
      });
    }

    void setupPush();
  }, [user?.id]);

  return children;
}
