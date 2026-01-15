// /lib/push.ts
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { supabase } from "./supabase";

/**
 * Registers for Expo push notifications and stores the token in Supabase.
 *
 * ⚠️ Expo Go (SDK 53+) no longer supports Android push tokens.
 * In Expo Go we skip token registration to avoid runtime errors.
 *
 * Safe to call multiple times; de-dupe by (user_id, token) via UPSERT.
 */
export async function registerForPushAndSaveToken(): Promise<string | null> {
  // ✅ Skip in Expo Go (Store Client) — push tokens are not supported there on SDK 53+
  const executionEnvironment = (Constants as any)?.executionEnvironment;
  const isExpoGo = executionEnvironment === "storeClient";
  if (isExpoGo) return null;

  const { data: userRes } = await supabase.auth.getUser();
  const uid = userRes?.user?.id;
  if (!uid) return null;

  // Ask permission (does not crash in Expo Go, but we already returned above)
  const perm = await Notifications.getPermissionsAsync();
  let status = perm.status;
  if (status !== "granted") {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (status !== "granted") return null;

  // EAS projectId if available (recommended)
  const projectId =
    (Constants.expoConfig as any)?.extra?.eas?.projectId ||
    (Constants as any)?.easConfig?.projectId;

  let token: string | null = null;

  try {
    const tokenRes = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    token = tokenRes.data ?? null;
  } catch {
    // Don’t crash the app if token retrieval fails (e.g. misconfigured projectId)
    return null;
  }

  if (!token) return null;

  // ✅ UPSERT: works even if already exists (user_id, token)
  const { error } = await supabase
    .from("user_push_tokens")
    .upsert(
      {
        user_id: uid,
        token,
        device: Platform.OS,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,token" }
    );

  if (error) {
    // Don't crash the app because of this
    // console.log("push token upsert error", error);
  }

  return token;
}
