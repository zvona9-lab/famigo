import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useT } from "../../lib/useT";

const logo = require("../../assets/images/logo.png");


function getT() {
  const tx = useT() as any;
  return typeof tx === "function" ? tx : tx?.t;
}

const inputBase = {
  borderWidth: 1,
  borderColor: "#d1d5db",
  borderRadius: 12,
  paddingHorizontal: 12,
  paddingVertical: Platform.OS === "ios" ? 12 : 10,
  backgroundColor: "#fff",
  color: "#111827",
} as const;

const button = (primary: boolean) =>
  ({
    backgroundColor: primary ? "#2563eb" : "#fff",
    borderWidth: primary ? 0 : 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  }) as const;

const buttonText = (primary: boolean) =>
  ({
    color: primary ? "#fff" : "#111827",
    fontSize: 16,
    fontWeight: "700",
  }) as const;

export default function LoginScreen() {
  const t = getT();
  const router = useRouter();

  function tr(key: string, fallback: string, params?: Record<string, any>) {
    const v = t?.(key, params);
    if (!v) return fallback;
    if (typeof v === "string" && v.startsWith("[missing")) return fallback;
    return v as string;
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const emailClean = useMemo(() => email.trim().toLowerCase(), [email]);

  // IMPORTANT:
  // If Supabase rejects the redirect URL, it falls back to your "Site URL".
  // That is why you were ending up on agrofarm.hr / famigo.app in the browser.
  // This helper makes the redirect unambiguous:
  // - Expo Go => exp://... (opens in Expo Go)
  // - Installed build => famigo://... (opens your app)
  const AUTH_CONFIRMED_URL = "https://auth.agrofarm.hr/confirmed";
const AUTH_RESET_URL = "https://auth.agrofarm.hr/reset";

function getAuthRedirectTo(kind: "confirmed" | "reset") {
  return kind === "reset" ? AUTH_RESET_URL : AUTH_CONFIRMED_URL;
}


  async function loginPassword() {
    if (!emailClean || !password) {
      Alert.alert(
        tr("common.error", "Error"),
        tr("auth.alerts.missingEmailPasswordBody", "Enter email and password.")
      );
      return;
    }

    try {
      setBusy(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: emailClean,
        password,
      });
      if (error) {
        Alert.alert(tr("auth.alerts.loginErrorTitle", "Login error"), error.message);
      }
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword() {
    if (!emailClean) {
      Alert.alert(tr("common.error", "Error"), tr("auth.alerts.missingEmailBody", "Enter your email."));
      return;
    }

    try {
      setBusy(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
  redirectTo: "https://auth.agrofarm.hr/reset",
});
if (error) throw error;


      Alert.alert(
        tr("common.ok", "OK"),
        tr("auth.alerts.resetSentBody", "We emailed you a link to set a new password.")
      );
    } catch (e: any) {
      Alert.alert(tr("auth.alerts.resetErrorTitle", "Reset error"), String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  async function magicLink() {
    if (!emailClean) {
      Alert.alert(tr("common.error", "Error"), tr("auth.alerts.missingEmailBody", "Enter your email."));
      return;
    }

    try {
      setBusy(true);
      const { error } = await supabase.auth.signInWithOtp({
        email: emailClean,
        options: {
          // For production: ensure this URL/scheme is included in Supabase Auth Redirect URLs.
          emailRedirectTo: getAuthRedirectTo("confirmed"),
        },
      });
      if (error) throw error;

      Alert.alert(
        tr("common.ok", "OK"),
        tr("auth.alerts.magicLinkSentBody", "Magic link has been sent to your email.")
      );
    } catch (e: any) {
      Alert.alert(tr("auth.alerts.magicLinkErrorTitle", "Magic link error"), String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#f3f4f6" }}
        // ✅ Works on both platforms: iOS lifts content, Android resizes height.
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, padding: 16, justifyContent: "center" }}
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
            {/* Header */}
            <View style={{ alignItems: "center", marginBottom: 14 }}>
              <Image
                source={logo}
                style={{ width: 150, height: 150, marginBottom: 10 }}
                resizeMode="contain"
              />
              <Text style={{ fontSize: 28, fontWeight: "900", color: "#111827" }}>Famigo</Text>
              <Text style={{ marginTop: 4, fontSize: 13, color: "#6b7280", textAlign: "center" }}>
                {tr("auth.tagline", "Family tasks, simplified")}
              </Text>
            </View>

            <Text style={{ fontSize: 18, fontWeight: "800", color: "#111827", marginBottom: 12 }}>
              {tr("auth.title", "Sign in")}
            </Text>

            <Text style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>
              {tr("auth.email", "Email")}
            </Text>
            <TextInput
              style={inputBase}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholder={tr("auth.placeholders.email", "name@email.com")}
              placeholderTextColor="#9ca3af"
              returnKeyType="next"
            />

            <View style={{ height: 12 }} />

            <Text style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>
              {tr("auth.password", "Password")}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#d1d5db",
                borderRadius: 12,
                backgroundColor: "#fff",
              }}
            >
              <TextInput
                style={{ flex: 1, paddingHorizontal: 12, paddingVertical: Platform.OS === "ios" ? 12 : 10, color: "#111827" }}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                placeholder={tr("auth.placeholders.password", "••••••••")}
                placeholderTextColor="#9ca3af"
                returnKeyType="done"
                onSubmitEditing={loginPassword}
              />
              <Pressable
                onPress={() => setShowPassword((s) => !s)}
                style={({ pressed }) => ({ paddingHorizontal: 12, paddingVertical: 10, opacity: pressed ? 0.7 : 1 })}
                accessibilityLabel={tr("auth.togglePassword", "Show or hide password")}
              >
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#6b7280" />
              </Pressable>
            </View>

            <View style={{ height: 14 }} />

            <Pressable disabled={busy} onPress={loginPassword} style={button(true)}>
              <Text style={buttonText(true)}>{busy ? "..." : tr("auth.passwordLoginBtn", "Sign in (email + password)")}</Text>
            </Pressable>

            <View style={{ height: 10 }} />

            <Pressable disabled={busy} onPress={resetPassword} style={button(false)}>
              <Text style={buttonText(false)}>{busy ? "..." : tr("auth.forgotPasswordBtn", "Forgot password")}</Text>
            </Pressable>

            <View style={{ height: 10 }} />

            <Pressable disabled={busy} onPress={magicLink} style={button(false)}>
              <Text style={buttonText(false)}>{busy ? "..." : tr("auth.sendMagicLinkBtn", "Send magic link")}</Text>
            </Pressable>

            <View style={{ height: 16 }} />

            <Pressable disabled={busy} onPress={() => router.push("/register")} style={{ alignItems: "center", paddingVertical: 6 }}>
              <Text style={{ color: "#2563eb", fontWeight: "800" }}>
                {tr("auth.noAccount", "New here?")} {tr("auth.createAccount", "Create an account")}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
