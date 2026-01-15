// /lib/auth.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import * as Linking from "expo-linking";
import { supabase } from "./supabase";
import { tr } from "./locale";

type AuthContextValue = {
  ready: boolean;
  isSignedIn: boolean;
  email: string | null;

  sendMagicLink: (email: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function cleanEmail(input: string) {
  return String(input ?? "").trim().toLowerCase();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session ?? null;

        if (!alive) return;
        setIsSignedIn(!!session);
        setEmail(session?.user?.email ?? null);
        setReady(true);
      } catch {
        if (!alive) return;
        setReady(true);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(!!session);
      setEmail(session?.user?.email ?? null);
      setReady(true);
    });

    return () => {
      alive = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  async function sendMagicLink(emailInput: string): Promise<boolean> {
    const e = cleanEmail(emailInput);
    if (!e || !e.includes("@")) {
      Alert.alert(tr("common.error"), tr("auth.invalidEmail"));
      return false;
    }

    // ✅ dinamički redirect koji radi i u Expo Go i u buildu
    // - Expo Go: exp://.../--/auth
    // - build:   famigo://auth
    const emailRedirectTo = Linking.createURL("auth");

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: e,
        options: {
          emailRedirectTo,
        },
      });

      if (error) {
        Alert.alert(tr("common.error"), error.message);
        return false;
      }

      Alert.alert(tr("auth.magicLinkSentTitle"), tr("auth.magicLinkSentBody", { email: e }));
      return true;
    } catch (err: any) {
      Alert.alert(tr("common.error"), String(err?.message ?? err));
      return false;
    }
  }

  async function signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      isSignedIn,
      email,
      sendMagicLink,
      signOut,
    }),
    [ready, isSignedIn, email]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
