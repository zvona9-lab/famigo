import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { Platform, LogBox } from "react-native";
import {
  Stack,
  useRouter,
  useSegments,
  useRootNavigationState,
} from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import * as Linking from "expo-linking";
import * as NavigationBar from "expo-navigation-bar";
import { LocaleProvider } from "../../lib/locale";
import { AuthProvider } from "../../lib/auth";
import { MembersProvider } from "../../lib/members";
import { TasksProvider } from "../../lib/tasks";
import { supabase } from "../../lib/supabase";
import { registerForPushAndSaveToken } from "../../lib/push";

function AuthGate(props: { sessionReady: boolean; hasSession: boolean }) {
  const { sessionReady, hasSession } = props;

  const router = useRouter();
  
// Normalize host-based deep links (needed because Supabase allow-list accepts famigo://auth-callback,
// while Expo Router usually uses path-based links).
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

  // Neke verzije vraćaju subscription s .remove(), neke ne
  const sub: any = (Linking as any).addEventListener?.("url", handler);

  return () => {
    if (sub && typeof sub.remove === "function") sub.remove();
    else (Linking as any).removeEventListener?.("url", handler);
  };
}, [router]);

const segments = useSegments();
  const navState = useRootNavigationState();

  useEffect(() => {
    if (!navState?.key) return;
    if (!sessionReady) return;

    const first = segments?.[0] ?? "";
    const inAuth = first === "(auth)";
    const inTabs = first === "(tabs)";

    if (!hasSession) {
      if (!inAuth) router.replace("/(auth)");
      return;
    }

    if (inAuth) {
      router.replace("/(tabs)/home");
      return;
    }

    if (!inTabs) {
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
      "setBehaviorAsync is not supported",
      "setBackgroundColorAsync is not supported",
      "expo-notifications: Android Push notifications",
    ]);
  }, []);

  // ✅ KLJUČNO: uhvati auth link (email verification / magic link) i preuzmi session
  useEffect(() => {
    const handleUrl = async (url?: string | null) => {
      if (!url) return;

      // prihvati samo naš scheme (da ne hvatamo sve moguće linkove)
      if (!url.startsWith("famigo://")) return;

      try {
        // Ovo rješava slučaj: link otvori app, ali session se ne osvježi dok ne restartas
        await supabase.auth.exchangeCodeForSession(url);
      } catch (e) {
        console.log("Auth deep link exchange error:", e);
      }
    };

    // App otvoren iz emaila (cold start)
    Linking.getInitialURL().then((url) => handleUrl(url));

    // App već radi u pozadini pa dođe link
    const sub = Linking.addEventListener("url", ({ url }) => {
      handleUrl(url);
    });

    return () => {
      // @ts-ignore - expo-linking vraća subscription s remove()
      sub?.remove?.();
    };
  }, []);

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

  // ✅ OVO JE KLJUČNO – POZIV ZA PUSH TOKEN
  useEffect(() => {
    if (!sessionReady || !hasSession) return;
    registerForPushAndSaveToken();
  }, [sessionReady, hasSession]);

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

  // Prevent a brief flash of the auth screen before session is resolved
  if (!sessionReady) {
    return null;
  }

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
