// /lib/push.ts
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { supabase } from "./supabase";

function logStep(msg: string, extra?: any) {
  if (extra !== undefined) console.log(`[push] ${msg}`, extra);
  else console.log(`[push] ${msg}`);
}

/**
 * Register for Expo push notifications and store token in Supabase.
 */
export async function registerForPushAndSaveToken(): Promise<string | null> {
  try {
    // Must be signed in
    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userRes?.user) {
      logStep("FAIL: user not signed in");
      return null;
    }
    const user = userRes.user;

    // Permissions
    const perm = await Notifications.getPermissionsAsync();
    let status = perm.status;
    if (status !== "granted") {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== "granted") {
      logStep("FAIL: permission not granted");
      return null;
    }

    // Android channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    const tokenRes = await Notifications.getExpoPushTokenAsync({ projectId });
    const expoPushToken = tokenRes.data;

    logStep("OK: got expo push token", expoPushToken);

    const device_id =
      Platform.OS === "ios"
        ? Constants.deviceId ?? "ios"
        : Constants.sessionId ?? "android";

    const { error } = await supabase.from("user_push_tokens").upsert({
      user_id: user.id,           // 🔑 RLS requires this
      token: expoPushToken,
      device_id,
      platform: Platform.OS,
    });

    if (error) {
      logStep("FAIL: user_push_tokens upsert error", error);
      return null;
    }

    logStep("OK: push token saved");
    return expoPushToken;
  } catch (e) {
    logStep("FAIL: exception", e);
    return null;
  }
}
