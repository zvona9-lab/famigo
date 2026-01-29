import "react-native-gesture-handler";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, LogBox, Platform, View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Linking from "expo-linking";

import { useFonts, Nunito_500Medium, Nunito_600SemiBold, Nunito_800ExtraBold } from "@expo-google-fonts/nunito";

import { LocaleProvider, useLocale } from "../lib/locale";
import { AuthProvider } from "../lib/auth";
import { MembersProvider, useMembers } from "../lib/members";
import { TasksProvider } from "../lib/tasks";
import { supabase } from "../lib/supabase";
import { registerForPushAndSaveToken } from "../lib/push";

/**
 * Root layout (stable gate)
 * ------------------------
 * Ensures correct first screen after login:
 * - no session -> /(auth)
 * - has session but no profile name -> /onboarding/profile
 * - has session + profile but not in family -> /onboarding/family
 * - has session + profile + in family -> /(tabs)/home
 *
 * Also normalizes host-based deep links like: famigo://auth-callback?code=...
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

        // Convert famigo://auth-callback?... to /(auth)/auth-callback?...
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
      } catch {
        // ignore
      }
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
  const { ready: membersReady, inFamily } = useMembers() as any;

  const [metaReady, setMetaReady] = useState(false);
  const [profileMeta, setProfileMeta] = useState<{ name: string; role: string; gender: string; avatarKey: string } | null>(null);

  // Current route like "/(tabs)/home"
  const currentPath = useMemo(() => "/" + segments.join("/"), [segments]);
  const lastTargetRef = useRef<string | null>(null);

  const go = (target: any) => {
    const targetPath = typeof target === "string" ? target : String(target?.pathname ?? "");
    if (targetPath && currentPath === targetPath) return;
    if (lastTargetRef.current === JSON.stringify(target)) return;
    lastTargetRef.current = JSON.stringify(target);
    router.replace(target);
  };

  // Load auth metadata (name/role/gender) after login so we can decide onboarding.
  useEffect(() => {
    let alive = true;

    if (!hasSession) {
      setMetaReady(false);
      setProfileMeta(null);
      return;
    }

    setMetaReady(false);
    supabase.auth
      .getUser()
      .then(({ data, error }) => {
        if (!alive) return;
        if (error) throw error;

        const u: any = data?.user;
        const md: any = u?.user_metadata || {};
        const name = String(md?.name ?? "").trim();
        const role = String(md?.role ?? "parent");
        const gender = String(md?.gender ?? "male");
        const avatarKey =
          role === "parent" ? (gender === "female" ? "mom" : "dad") : gender === "female" ? "girl" : "boy";

        setProfileMeta({ name, role, gender, avatarKey });
        setMetaReady(true);
      })
      .catch(() => {
        if (!alive) return;
        setProfileMeta({ name: "", role: "parent", gender: "male", avatarKey: "dad" });
        setMetaReady(true);
      });

    return () => {
      alive = false;
    };
  }, [hasSession]);

  useEffect(() => {
    // 1) Not signed in
    if (!hasSession) {
      go("/(auth)");
      return;
    }

    // 2) Wait for providers
    if (!membersReady || !metaReady) return;

    // 3) Need profile?
    const hasName = !!String(profileMeta?.name ?? "").trim();
    if (!hasName) {
      go("/onboarding/profile");
      return;
    }

    // 4) Need family?
    if (!inFamily) {
      go({
        pathname: "/onboarding/family",
        params: {
          name: profileMeta?.name ?? "",
          role: profileMeta?.role ?? "parent",
          gender: profileMeta?.gender ?? "male",
          avatarKey: profileMeta?.avatarKey ?? "",
        },
      });
      return;
    }

    // 5) Ready -> Home
    go("/(tabs)/home");
  }, [hasSession, membersReady, metaReady, profileMeta, inFamily, currentPath]);

  return null;
}

function AppShell() {
  const [fontsLoaded] = useFonts({
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_800ExtraBold,
  });

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

  // Exchange session if opened from email link (famigo://...)
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

  // Push token
  useEffect(() => {
    if (!sessionReady || !hasSession) return;
    registerForPushAndSaveToken();
  }, [sessionReady, hasSession]);

  // Optional: Android nav bar (best effort)
  useEffect(() => {
    if (Platform.OS !== "android") return;
    // Keep empty: expo-navigation-bar calls often warn in Expo Go with edge-to-edge.
  }, []);

  if (!fontsLoaded || !localeReady || !sessionReady) return <Loader />;

  return (
    <>
      <DeepLinkNormalizer />
      <NavigationGate hasSession={hasSession} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LocaleProvider>
        <AuthProvider>
          <MembersProvider>
            <TasksProvider>
              <AppShell />
            </TasksProvider>
          </MembersProvider>
        </AuthProvider>
      </LocaleProvider>
    </GestureHandlerRootView>
  );
}
