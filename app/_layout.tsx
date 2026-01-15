// /app/_layout.tsx
import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { Platform, LogBox } from "react-native";
import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { LocaleProvider } from "../lib/locale";
import { AuthProvider } from "../lib/auth";
import { MembersProvider } from "../lib/members";
import { TasksProvider } from "../lib/tasks";
import { supabase } from "../lib/supabase";

// ✅ Android system navigation bar
import * as NavigationBar from "expo-navigation-bar";

// ✅ Notifications
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ACTION_CLAIM = "FAMIGO_CLAIM";
const ACTION_SNOOZE_10 = "FAMIGO_SNOOZE_10";
const STORAGE_KEY = "famigo.tasks.v2"; // isti key kao u lib/tasks.ts

// ✅ prikaz notifikacije dok je app otvoren
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function ensureNotifPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.status === "granted") return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.status === "granted";
}

// ✅ Android: kategorije s action gumbima
async function setupNotificationCategory() {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationCategoryAsync("famigo_task", [
    { identifier: ACTION_CLAIM, buttonTitle: "JA PREUZIMAM", options: { opensAppToForeground: false } },
    { identifier: ACTION_SNOOZE_10, buttonTitle: "ODGODI 10 MIN", options: { opensAppToForeground: false } },
  ]);
}

// ✅ Minimalni "direct storage update" (bez hookova), da claim radi iz backgrounda
type StoredTask = any;

async function loadStoredTasks(): Promise<StoredTask[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveStoredTasks(tasks: StoredTask[]) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // ignore
  }
}

async function claimTaskInStorage(taskId: string, myName: string) {
  const tasks = await loadStoredTasks();
  const next = tasks.map((t) => {
    if (t?.id !== taskId) return t;
    if (t?.status === "done") return t;
    return { ...t, status: "claimed", claimedById: null, claimedByName: myName };
  });
  await saveStoredTasks(next);
}

async function snoozeIn10Min(taskId: string, title: string) {
  const ok = await ensureNotifPermission();
  if (!ok) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Famigo • Tko preuzima?",
      body: `Uskoro: ${title}`,
      data: { kind: "task_reminder", taskId, title },
      categoryIdentifier: "famigo_task",
    },
    trigger: { seconds: 10 * 60 },
  });
}

/**
 * ✅ AuthGate radi redirect TEK kad je router spreman (navState.key)
 * i kad znamo session (sessionReady).
 */
function AuthGate(props: { sessionReady: boolean; hasSession: boolean }) {
  const { sessionReady, hasSession } = props;

  const router = useRouter();
  const segments = useSegments();
  const navState = useRootNavigationState();

  useEffect(() => {
    if (!navState?.key) return; // router još nije montiran
    if (!sessionReady) return; // session još nije učitan

    const first = segments?.[0] ?? "";
    // ✅ route groups su "(auth)" i "(tabs)" (ne "auth")
    const inAuth = first === "(auth)";
    const inTabs = first === "(tabs)";

    // Ako nisi logiran → vodi u auth group
    if (!hasSession && !inAuth) {
      router.replace("/(auth)");
      return;
    }

    // Ako jesi logiran → HOME mora biti prvi
    if (hasSession && !inTabs) {
      router.replace("/(tabs)/home");
      return;
    }
  }, [sessionReady, hasSession, segments, navState?.key, router]);

  return null;
}

export default function RootLayout() {
  const [sessionReady, setSessionReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    LogBox.ignoreLogs([
      "expo-notifications: Android Push notifications (remote notifications) functionality provided by expo-notifications was removed from Expo Go",
      "setBehaviorAsync is not supported with edge-to-edge enabled",
      "setBackgroundColorAsync is not supported with edge-to-edge enabled",
    ]);
  }, []);

  // ✅ Session bootstrap + listener
  useEffect(() => {
    let alive = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!alive) return;
        setHasSession(!!data.session);
        setSessionReady(true);
      })
      .catch(() => {
        if (!alive) return;
        setHasSession(false);
        setSessionReady(true);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setHasSession(!!session);
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // ✅ Notifications setup
  useEffect(() => {
    ensureNotifPermission().catch(() => {});
    setupNotificationCategory().catch(() => {});

    const sub = Notifications.addNotificationResponseReceivedListener(async (resp) => {
      try {
        const actionId = resp.actionIdentifier;
        const data: any = resp.notification.request.content.data ?? {};
        const taskId = String(data.taskId ?? "");
        const title = String(data.title ?? "");
        const myName = String(data.myName ?? "Ja"); // dolazi iz tasks schedulinga

        if (!taskId) return;

        if (actionId === ACTION_CLAIM) {
          await claimTaskInStorage(taskId, myName);
          return;
        }

        if (actionId === ACTION_SNOOZE_10) {
          await snoozeIn10Min(taskId, title || "Obaveza");
          return;
        }
      } catch {
        // ignore
      }
    });

    return () => sub.remove();
  }, []);

  // ✅ Android nav bar
  useEffect(() => {
    if (Platform.OS !== "android") return;

    (async () => {
      try {
        await NavigationBar.setBackgroundColorAsync("#111111");
        await NavigationBar.setButtonStyleAsync("light");
        await NavigationBar.setBehaviorAsync("inset-swipe");
      } catch {
        // ignore
      }
    })();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LocaleProvider>
        <AuthProvider>
          <MembersProvider>
            <TasksProvider>
              <AuthGate sessionReady={sessionReady} hasSession={hasSession} />
              <Stack screenOptions={{ headerShown: false }} />
            </TasksProvider>
          </MembersProvider>
        </AuthProvider>
      </LocaleProvider>
    </GestureHandlerRootView>
  );
}
