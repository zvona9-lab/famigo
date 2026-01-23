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

const logo = require("../../assets/logo.png");

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

export default function RegisterScreen() {
  const router = useRouter();
  const t = getT();

  function tr(key: string, fallback: string, params?: Record<string, any>) {
    const v = t?.(key, params);
    if (!v) return fallback;
    if (typeof v === "string" && v.startsWith("[missing")) return fallback;
    return v as string;
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const emailClean = useMemo(() => email.trim().toLowerCase(), [email]);

  function getAuthRedirectTo() {
  return "https://auth.agrofarm.hr/confirmed";
}


  async function registerPassword() {
    if (!emailClean || !password || !confirm) {
      Alert.alert(tr("common.error", "Error"), tr("auth.alerts.missingRegisterBody", "Enter email and both password fields."));
      return;
    }

    if (password.length < 6) {
      Alert.alert(tr("common.error", "Error"), tr("auth.alerts.weakPasswordBody", "Password must be at least 6 characters."));
      return;
    }

    if (password !== confirm) {
      Alert.alert(tr("common.error", "Error"), tr("auth.alerts.passwordMismatchBody", "Passwords do not match."));
      return;
    }

    try {
      setBusy(true);
      const { data, error } = await supabase.auth.signUp({
        email: emailClean,
        password,
        options: {
          emailRedirectTo: getAuthRedirectTo(),
          // Back-compat for some client/server combos
          redirectTo: getAuthRedirectTo() as any,
        },
      });
      if (error) throw error;

      const needsConfirmation = !data?.session;
      Alert.alert(
        tr("common.ok", "OK"),
        needsConfirmation
          ? tr(
              "auth.alerts.registerConfirmEmailBody",
              "Account created. Please confirm your email address using the link we sent you, then sign in."
            )
          : tr("auth.alerts.registerOkBody", "Account created. You can sign in now."),
        [{ text: tr("common.ok", "OK"), onPress: () => router.back() }]
      );
    } catch (e: any) {
      Alert.alert(tr("auth.alerts.registerErrorTitle", "Register error"), String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#f3f4f6" }}
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
              {tr("auth.registerTitle", "Create account")}
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
              />
              <Pressable
                onPress={() => setShowPassword((s) => !s)}
                style={({ pressed }) => ({ paddingHorizontal: 12, paddingVertical: 10, opacity: pressed ? 0.7 : 1 })}
                accessibilityLabel={tr("auth.togglePassword", "Show or hide password")}
              >
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#6b7280" />
              </Pressable>
            </View>

            <View style={{ height: 12 }} />

            <Text style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>
              {tr("auth.confirmPassword", "Confirm password")}
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
                secureTextEntry={!showConfirm}
                value={confirm}
                onChangeText={setConfirm}
                placeholder={tr("auth.placeholders.confirmPassword", "••••••••")}
                placeholderTextColor="#9ca3af"
              />
              <Pressable
                onPress={() => setShowConfirm((s) => !s)}
                style={({ pressed }) => ({ paddingHorizontal: 12, paddingVertical: 10, opacity: pressed ? 0.7 : 1 })}
                accessibilityLabel={tr("auth.togglePassword", "Show or hide password")}
              >
                <Ionicons name={showConfirm ? "eye-off" : "eye"} size={20} color="#6b7280" />
              </Pressable>
            </View>

            <View style={{ height: 14 }} />

            <Pressable disabled={busy} onPress={registerPassword} style={button(true)}>
              <Text style={buttonText(true)}>{busy ? "..." : tr("auth.registerBtn", "Create account")}</Text>
            </Pressable>

            <View style={{ height: 14 }} />

            <Pressable disabled={busy} onPress={() => router.back()} style={{ alignItems: "center", paddingVertical: 6 }}>
              <Text style={{ color: "#2563eb", fontWeight: "800" }}>
                {tr("auth.haveAccount", "Already have an account?")} {tr("auth.backToLogin", "Sign in")}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
