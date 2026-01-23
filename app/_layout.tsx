import "react-native-gesture-handler";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, LogBox, View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Linking from "expo-linking";
import Constants from "expo-constants";

import { LocaleProvider, useLocale } from "../lib/locale";
import { AuthProvider } from "../lib/auth";
import { MembersProvider, useMembers } from "../lib/members";
import { TasksProvider } from "../lib/tasks";
import { supabase } from "../lib/supabase";
import { registerForPushAndSaveToken } from "../lib/push";

/**
 * Root layout (stable gate)
 * ------------------------
 * Fixes the case where Expo Go / dev restores last navigation state (e.g. /(tabs)/home),
 * even for a brand new user who is NOT in a family.
 *
 * Key ideas:
 * - Always route to a CONCRETE screen (/(tabs)/home), never just /(tabs)
 * - De-dupe replace() calls
 * - Also check current segments so we don't loop
 * - No expo-navigation-bar calls (they spam warnings in Expo Go with edge-to-edge)
 */

function Loader() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

function DeepLinkNormalizer() {
  const router = useRouter();

  useEffect(() => {
    const handler = ({ url }: { url: string }) => {
      try {
        const parsed = Linking.parse(url);
        if (parsed.scheme !== "famigo") return;

        const host = (parsed.hostname || "").toLowerCase();
        const path = (parsed.path || "").toLowerCase();

        if ((host === "auth-callback" || host === "reset-password") && !path) {
          const qp = parsed.queryParams || {};
          const qs = Object.keys(qp).length
            ? "?" +
              Object.entries(qp)
                .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
                .join("&")
            : "";
          router.replace(`/(auth)/${host}${qs}`);
        }
      } catch {}
    };

    const sub: any = (Linking as any).addEventListener?.("url", handler);
    return () => {
      if (sub && typeof sub.remove === "function") sub.remove();
      else (Linking as any).removeEventListener?.("url", handler);
    };
  }, [router]);

  return null;
}

function NavigationGate({ hasSession }: { hasSession: boolean }) {
  const router = useRouter();
  const segments = useSegments();
  const { ready: membersReady, me, inFamily } = useMembers();

  // Current route like "/(tabs)/home"
  const currentPath = useMemo(() => "/" + segments.join("/"), [segments]);

  const lastTargetRef = useRef<string | null>(null);

  const go = (target: string) => {
    if (currentPath === target) return;
    if (lastTargetRef.current === target) return;
    lastTargetRef.current = target;
    router.replace(target);
  };

  useEffect(() => {
    if (!hasSession) {
      go("/(auth)");
      return;
    }

    if (!membersReady) return;

    if (!me) {
      go("/onboarding/profile");
      return;
    }

    if (!inFamily) {
      go("/onboarding/family");
      return;
    }

    go("/(tabs)/home");
  }, [hasSession, membersReady, me, inFamily, currentPath]);

  return null;
}

function AppShell() {
  const { ready: localeReady } = useLocale();

  const [sessionReady, setSessionReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    LogBox.ignoreLogs([
      "setBackgroundColorAsync is not supported with edge-to-edge enabled.",
      "setBehaviorAsync is not supported with edge-to-edge enabled.",
      "expo-notifications: Android Push notifications",
    ]);
  }, []);

  // Exchange session if opened from email link
  useEffect(() => {
    const handleUrl = async (url?: string | null) => {
      if (!url) return;
      if (!url.startsWith("famigo://")) return;

      try {
        await supabase.auth.exchangeCodeForSession(url);
      } catch (e) {
        console.log("Auth deep link exchange error:", e);
      }
    };

    Linking.getInitialURL().then((url) => handleUrl(url));
    const sub = Linking.addEventListener("url", ({ url }) => handleUrl(url));
    return () => {
      // @ts-ignore
      sub?.remove?.();
    };
  }, []);

  // Session state
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

  // Push (skip in Expo Go)
  useEffect(() => {
    if (!sessionReady || !hasSession) return;
    const isExpoGo = Constants.appOwnership === "expo";
    if (isExpoGo) return;

    try {
      registerForPushAndSaveToken();
    } catch (e) {
      console.log("[push] error (ignored):", e);
    }
  }, [sessionReady, hasSession]);

  if (!sessionReady || !localeReady) {
    return <Loader />;
  }

  return (
    <AuthProvider>
      <MembersProvider>
        <TasksProvider>
          <DeepLinkNormalizer />
          <NavigationGate hasSession={hasSession} />
          <Stack screenOptions={{ headerShown: false }} />
        </TasksProvider>
      </MembersProvider>
    </AuthProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LocaleProvider>
        <AppShell />
      </LocaleProvider>
    </GestureHandlerRootView>
  );
}
