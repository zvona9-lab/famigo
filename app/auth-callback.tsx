// /app/auth-callback.tsx
// Handles Supabase email confirmation + magic link deep links.

import "react-native-url-polyfill/auto";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";

import { supabase } from "../lib/supabase";

function getParam(url: string, key: string): string | null {
  // expo-linking parses query params, but some providers put tokens in the hash fragment.
  try {
    const parsed = Linking.parse(url);
    const qp: any = parsed?.queryParams || {};
    const v = qp?.[key];
    if (typeof v === "string") return v;
    if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  } catch {
    // ignore
  }

  const hashIndex = url.indexOf("#");
  if (hashIndex >= 0) {
    const frag = url.slice(hashIndex + 1);
    try {
      const sp = new URLSearchParams(frag);
      const hv = sp.get(key);
      if (hv) return hv;
    } catch {
      // ignore
    }
  }

  return null;
}

export default function AuthCallbackScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<"working" | "ok" | "error">("working");
  const [msg, setMsg] = useState<string>("Signing you in...");

  const finalize = useCallback(() => {
    // Keep it simple: go to tabs after successful auth.
    // Adjust the route if your app uses a different initial screen.
    try {
      router.replace("/(tabs)/home");
    } catch {
      router.replace("/");
    }
  }, [router]);

  const handleUrl = useCallback(
    async (url: string) => {
      if (!url) return;

      setStatus("working");
      setMsg("Signing you in...");

      try {
        // Newer Supabase email links often use PKCE and send a `code` query param.
        const code = getParam(url, "code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          setStatus("ok");
          setMsg("Done ✅");
          finalize();
          return;
        }

        // Older magic links may redirect with access_token/refresh_token in hash.
        const accessToken = getParam(url, "access_token");
        const refreshToken = getParam(url, "refresh_token");
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          setStatus("ok");
          setMsg("Done ✅");
          finalize();
          return;
        }

        // If we get here, the link wasn't in a format we can consume.
        setStatus("error");
        setMsg("This link doesn't contain a session code/token.");
      } catch (e: any) {
        setStatus("error");
        setMsg(e?.message || "Auth failed");
      }
    },
    [finalize]
  );

  useEffect(() => {
    let sub: any;

    (async () => {
      const initial = await Linking.getInitialURL();
      if (initial) await handleUrl(initial);
    })();

    sub = Linking.addEventListener("url", ({ url }) => {
      handleUrl(url);
    });

    return () => {
      // expo-linking uses different subscription APIs across versions
      try {
        sub?.remove?.();
      } catch {
        // ignore
      }
    };
  }, [handleUrl]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 14, fontSize: 16, fontWeight: "800" }}>FamiGo</Text>
      <Text style={{ marginTop: 6, fontSize: 13, fontWeight: "700", opacity: 0.75, textAlign: "center" }}>{msg}</Text>
      {status === "error" ? (
        <Text style={{ marginTop: 10, fontSize: 12, fontWeight: "600", opacity: 0.65, textAlign: "center" }}>
          If this keeps happening, open the app first, then tap the email link again.
        </Text>
      ) : null}
    </View>
  );
}
