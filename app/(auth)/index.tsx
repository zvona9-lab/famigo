import React, { useMemo, useState } from "react";
import { Alert, Platform, Pressable, Text, TextInput, View } from "react-native";
import { supabase } from "../../lib/supabase";
import { useT } from "../../lib/useT";

const inputStyle = {
  borderWidth: 1,
  borderColor: "#d1d5db",
  borderRadius: 12,
  paddingHorizontal: 12,
  paddingVertical: Platform.OS === "ios" ? 12 : 10,
  backgroundColor: "#fff",
};

const button = (primary: boolean) => ({
  backgroundColor: primary ? "#2563eb" : "#fff",
  borderWidth: primary ? 0 : 1,
  borderColor: "#d1d5db",
  borderRadius: 12,
  paddingVertical: 12,
  alignItems: "center" as const,
});

const buttonText = (primary: boolean) => ({
  color: primary ? "#fff" : "#111827",
  fontSize: 16,
  fontWeight: "700" as const,
});

function getT() {
  const tx = useT() as any;
  return typeof tx === "function" ? tx : tx?.t;
}

export default function AuthScreen() {
  const t = getT();

  function tr(key: string, fallback: string) {
    const v = t?.(key);
    if (!v) return fallback;
    if (typeof v === "string" && v.startsWith("[missing")) return fallback;
    return v as string;
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const emailClean = useMemo(() => email.trim().toLowerCase(), [email]);

  async function loginPassword() {
    if (!emailClean || !password) {
      Alert.alert(
        tr("auth.alerts.missingEmailTitle", tr("common.error", "Error")),
        tr("auth.alerts.missingEmailPasswordBody", "Enter email and password.")
      );
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: emailClean,
      password,
    });
    setBusy(false);

    if (error) {
      Alert.alert(tr("auth.alerts.loginErrorTitle", "Login error"), error.message);
    }
  }

  async function resetPassword() {
    if (!emailClean) {
      Alert.alert(
        tr("auth.alerts.missingEmailTitle", tr("common.error", "Error")),
        tr("auth.alerts.missingEmailBody", "Enter your email.")
      );
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(emailClean, {
      redirectTo: "famigo://reset-password",
    });
    setBusy(false);

    if (error) {
      Alert.alert(tr("auth.alerts.resetErrorTitle", "Reset error"), error.message);
    } else {
      Alert.alert(
        tr("auth.alerts.resetSentTitle", tr("common.ok", "OK")),
        tr("auth.alerts.resetSentBody", "We emailed you a link to set a new password.")
      );
    }
  }

  async function magicLink() {
    if (!emailClean) {
      Alert.alert(
        tr("auth.alerts.missingEmailTitle", tr("common.error", "Error")),
        tr("auth.alerts.missingEmailBody", "Enter your email.")
      );
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: emailClean,
      options: {
        emailRedirectTo: "famigo://login-callback",
      },
    });
    setBusy(false);

    if (error) {
      Alert.alert(tr("auth.alerts.magicLinkErrorTitle", "Magic link error"), error.message);
    } else {
      Alert.alert(
        tr("auth.alerts.magicLinkSentTitle", tr("common.ok", "OK")),
        tr("auth.alerts.magicLinkSentBody", "Magic link has been sent to your email.")
      );
    }
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#f3f4f6",
        padding: 16,
        justifyContent: "center",
      }}
    >
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: "#e5e7eb",
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: "800",
            color: "#111827",
            marginBottom: 14,
          }}
        >
          {tr("auth.title", "Sign in")}
        </Text>

        <Text style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>
          {tr("auth.email", "Email")}
        </Text>
        <TextInput
          style={inputStyle}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder={tr("auth.placeholders.email", "name@email.com")}
        />

        <View style={{ height: 12 }} />

        <Text style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>
          {tr("auth.password", "Password")}
        </Text>
        <TextInput
          style={inputStyle}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder={tr("auth.placeholders.password", "••••••••")}
        />

        <View style={{ height: 14 }} />

        <Pressable disabled={busy} onPress={loginPassword} style={button(true)}>
          <Text style={buttonText(true)}>{busy ? "..." : tr("auth.passwordLoginBtn", "Sign in (email + password)")}</Text>
        </Pressable>

        <View style={{ height: 10 }} />

        <Pressable disabled={busy} onPress={resetPassword} style={button(false)}>
          <Text style={buttonText(false)}>{busy ? "..." : tr("auth.forgotPasswordBtn", "Forgot password")}</Text>
        </Pressable>

        <View style={{ height: 14 }} />

        <Pressable disabled={busy} onPress={magicLink} style={button(false)}>
          <Text style={buttonText(false)}>{busy ? "..." : tr("auth.sendMagicLinkBtn", "Send magic link")}</Text>
        </Pressable>
      </View>
    </View>
  );
}
