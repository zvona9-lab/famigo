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
 * - Works in production/dev builds.
 * - In Expo Go it MAY work, but isn't reliable; we still attempt it for easier testing.
 */
export async function registerForPushAndSaveToken(): Promise<string | null> {
  try {
    // Must be signed in (DB user_id is NOT NULL)
    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr) {
      logStep("FAIL: supabase.auth.getUser error", userErr);
      return null;
    }

    const uid = userRes?.user?.id;
    if (!uid) {
      logStep("SKIP: no user id yet (not signed in / session not ready)");
      return null;
    }
    logStep("OK: user id", uid);

    // Permission
    const perm = await Notifications.getPermissionsAsync();
    let status = perm.status;

    if (status !== "granted") {
      logStep("INFO: requesting notifications permission (current: " + status + ")");
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }

    if (status !== "granted") {
      logStep("SKIP: notifications permission not granted (" + status + ")");
      return null;
    }
    logStep("OK: permission granted");

    // projectId (required in many EAS builds)
    const projectId =
      (Constants.expoConfig as any)?.extra?.eas?.projectId ||
      (Constants as any)?.easConfig?.projectId ||
      process.env.EXPO_PUBLIC_EAS_PROJECT_ID;

    if (!projectId) {
      logStep("WARN: missing projectId (will try without it).");
    } else {
      logStep("OK: projectId", projectId);
    }

    // Get Expo push token
    let token: string | null = null;
    try {
      // Try with projectId if available; otherwise try without.
      const tokenRes = projectId
        ? await Notifications.getExpoPushTokenAsync({ projectId })
        : await Notifications.getExpoPushTokenAsync();
      token = tokenRes?.data ?? null;
    } catch (e) {
      logStep("FAIL: getExpoPushTokenAsync threw", e);
      return null;
    }

    if (!token) {
      logStep("FAIL: getExpoPushTokenAsync returned empty token");
      return null;
    }
    logStep("OK: got expo push token", token);

    // Save to DB (table: user_push_tokens)
    const payload = { user_id: uid, token, device: Platform.OS };

    const { error } = await supabase
      .from("user_push_tokens")
      .upsert(payload, { onConflict: "user_id,token" });

    if (error) {
      logStep("FAIL: user_push_tokens upsert error", error);
      return null;
    }

    logStep("SUCCESS: token saved to Supabase");
    return token;
  } catch (e) {
    logStep("FATAL: unexpected error", e);
    return null;
  }
}
