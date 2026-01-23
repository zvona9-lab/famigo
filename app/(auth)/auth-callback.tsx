import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { supabase } from "../../lib/supabase";

function safeString(v: any) {
  try {
    return typeof v === "string" ? v : v == null ? "" : String(v);
  } catch {
    return "";
  }
}

function extractFromUrl(url: string) {
  const parsed = Linking.parse(url);
  const qp = (parsed.queryParams || {}) as Record<string, any>;
  const code = safeString(qp.code);
  const error = safeString(qp.error);
  const error_description = safeString(qp.error_description);

  // Hash tokens support (rare)
  const hash = url.includes("#") ? url.split("#")[1] : "";
  const hp = new URLSearchParams(hash || "");
  const access_token = hp.get("access_token") || "";
  const refresh_token = hp.get("refresh_token") || "";

  return { url, parsed, code, error, error_description, access_token, refresh_token };
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let t: any;
  const timeout = new Promise<T>((_, rej) => {
    t = setTimeout(() => rej(new Error("Timed out waiting for Supabase auth exchange.")), ms);
  });
  try {
    // @ts-ignore
    return await Promise.race([p, timeout]);
  } finally {
    clearTimeout(t);
  }
}

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string; error?: string; error_description?: string }>();
  const liveUrl = Linking.useURL();

  const handledRef = useRef(false);

  const [status, setStatus] = useState<"working" | "error">("working");
  const [message, setMessage] = useState<string>("");
  const [debug, setDebug] = useState<any>({});

  const fail = (msg: string, extra?: any) => {
    setStatus("error");
    setMessage(msg);
    if (extra) setDebug((d: any) => ({ ...d, ...extra }));
  };

  const complete = () => router.replace("/(tabs)/home");

  const run = async (info: ReturnType<typeof extractFromUrl>) => {
    if (handledRef.current) return;
    handledRef.current = true;

    const fnType = typeof (supabase as any)?.auth?.exchangeCodeForSession;
    setDebug({
      lastUrl: info.url,
      parsed: info.parsed,
      extracted: {
        hasCode: !!info.code,
        hasTokens: !!(info.access_token && info.refresh_token),
        error: info.error || "",
      },
      supabase: {
        exchangeCodeForSessionType: fnType,
        flowType: "pkce",
      },
    });

    try {
      if (info.error) {
        fail(info.error_description || info.error || "Authentication error.");
        return;
      }

      // PKCE: ?code=...
      if (info.code) {
        const ex = (supabase as any)?.auth?.exchangeCodeForSession;
        if (typeof ex !== "function") {
          fail(
            "Supabase client missing exchangeCodeForSession().\n\n" +
              "Fix: ensure @supabase/supabase-js v2 is installed and lib/supabase.ts sets auth.flowType = 'pkce'."
          );
          return;
        }

        const { error } = await withTimeout(ex.call(supabase.auth, info.code), 15000);
        if (error) {
          fail(error.message || "Failed to exchange code for session.");
          return;
        }
        complete();
        return;
      }

      // Token hash fallback
      if (info.access_token && info.refresh_token) {
        const { error } = await withTimeout(
          supabase.auth.setSession({ access_token: info.access_token, refresh_token: info.refresh_token }),
          15000
        );
        if (error) {
          fail(error.message || "Failed to set session.");
          return;
        }
        complete();
        return;
      }

      fail(
        "Missing auth parameters in callback.\n\n" +
          "In build: email link must contain redirect_to=famigo://auth-callback\n" +
          "In Expo Go: redirect_to=exp://.../--/auth-callback"
      );
    } catch (e: any) {
      // Show the real error instead of a generic one
      fail(e?.message || "Unknown error.", { stack: e?.stack || "" });
    }
  };

  // A) If router params already have code/error
  useEffect(() => {
    const code = safeString(params.code);
    const error = safeString(params.error);
    const error_description = safeString(params.error_description);
    if (code || error) {
      const fake =
        Linking.createURL("auth-callback", { scheme: "famigo" }) +
        `?${new URLSearchParams({ code, error, error_description }).toString()}`;
      run(extractFromUrl(fake));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.code, params.error, params.error_description]);

  // B) If deep link URL arrives
  useEffect(() => {
    if (!liveUrl) return;
    run(extractFromUrl(liveUrl));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveUrl]);

  // C) Fallback getInitialURL with a small delay
  useEffect(() => {
    const t = setTimeout(() => {
      Linking.getInitialURL().then((url) => {
        if (url) run(extractFromUrl(url));
      });
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // D) Stop infinite spinner after 8s
  useEffect(() => {
    const t = setTimeout(() => {
      if (!handledRef.current) {
        fail(
          "No deep link received.\n\n" +
            "The app opened, but it did not receive the auth callback URL.\n" +
            "Check that the installed build supports the famigo:// scheme and the email link uses redirect_to=famigo://auth-callback."
        );
      }
    }, 8000);
    return () => clearTimeout(t);
  }, []);

  if (status === "working") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f6f7fb", padding: 16 }}>
        <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 18, width: "100%", borderWidth: 1, borderColor: "#e9ecf4" }}>
          <View style={{ alignItems: "center" }}>
            <ActivityIndicator />
            <Text style={{ marginTop: 12, fontSize: 16, fontWeight: "700", color: "#111827" }}>Signing you in...</Text>
            <Text style={{ marginTop: 8, fontSize: 12, color: "#6b7280", textAlign: "center" }}>
              (If this takes more than a few seconds, we'll show debug details.)
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f6f7fb", padding: 16 }}>
      <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 18, width: "100%", borderWidth: 1, borderColor: "#e9ecf4" }}>
        <Text style={{ fontSize: 18, fontWeight: "800", color: "#111827", marginBottom: 8 }}>Link error</Text>
        <Text style={{ color: "#374151", lineHeight: 20, marginBottom: 12 }}>{message}</Text>

        <TouchableOpacity onPress={() => router.replace("/(auth)")}>
          <Text style={{ color: "#2563eb", fontWeight: "800" }}>Prijava</Text>
        </TouchableOpacity>

        <Text style={{ marginTop: 14, fontWeight: "800", color: "#111827" }}>DEBUG</Text>
        <ScrollView style={{ marginTop: 8, maxHeight: 260, backgroundColor: "#f9fafb", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#eef2ff" }}>
          <Text style={{ fontFamily: "monospace", fontSize: 12, color: "#111827" }}>{JSON.stringify(debug, null, 2)}</Text>
        </ScrollView>
      </View>
    </View>
  );
}
