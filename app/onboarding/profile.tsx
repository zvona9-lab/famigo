// /app/onboarding/profile.tsx
import React, { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useMembers } from "../../lib/members";

import { Screen } from "../../src/ui/components/Screen";
import { Card } from "../../src/ui/components/Card";
import { Button } from "../../src/ui/components/Button";
import { theme } from "../../src/ui/theme";
import { useT } from "../../lib/useT";

type Role = "parent" | "child";
type Gender = "male" | "female";

function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.pill, active && styles.pillActive]}>
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </Pressable>
  );
}

export default function OnboardingProfileScreen() {
  const tr = useT() as any;
  const members = useMembers() as any;
  const inFamily = !!members?.inFamily;
  const refreshMembers = members?.refreshMembers ?? members?.refresh ?? (async () => {});

  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("parent");
  const [gender, setGender] = useState<Gender>("male");

  const avatarKey = useMemo(() => {
    if (role === "parent") return gender === "female" ? "mom" : "dad";
    return gender === "female" ? "girl" : "boy";
  }, [role, gender]);

  async function goNext() {
    const n = String(name ?? "").trim();
    if (!n) {
      Alert.alert(tr("common.error", "Error"), tr("settings.myNameRequired", "Please enter your name."));
      return;
    }

    try {
      // Save profile to user metadata so the global AuthGate can validate it
      const { error } = await supabase.auth.updateUser({
        data: { name: n, role, gender },
      });
      if (error) throw error;

      // ✅ If the user is ALREADY in a family, we must NOT send them to /onboarding/family.
      // This prevents the "create/join family" screen from showing to existing members.
      if (inFamily) {
        await supabase.auth.refreshSession().catch(() => {});
        await refreshMembers();
        router.replace("/(tabs)/home");
        return;
      }

      router.push({
        pathname: "/onboarding/family",
        params: { name: n, role, gender, avatarKey },
      });
    } catch (e: any) {
      Alert.alert(tr("common.error", "Error"), e?.message ?? "Failed to save profile.");
    }
  }

  async function doLogout() {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    router.replace("/(auth)");
  }

  return (
    <Screen safeBottom>
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        <View style={{ marginTop: 8 }}>
          <Text style={styles.title}>{tr("onboarding.profile.title", "Set up your profile")}</Text>
          <Text style={styles.sub}>
            {tr("onboarding.profile.subtitle", "This helps the family recognize who is who.")}
          </Text>
        </View>

        <Card style={{ marginTop: 16, padding: 14 }}>
          <Text style={styles.label}>{tr("onboarding.profile.name", "Your name")}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={tr("settings.myNamePlaceholder", "e.g. Alex")}
            placeholderTextColor={theme.colors.muted}
            autoCapitalize="words"
            style={styles.input}
            returnKeyType="done"
          />

          <Text style={[styles.label, { marginTop: 14 }]}>{tr("onboarding.profile.role", "You are")}</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pill
              label={tr("members.parent", "Parent")}
              active={role === "parent"}
              onPress={() => setRole("parent")}
            />
            <Pill
              label={tr("members.child", "Child")}
              active={role === "child"}
              onPress={() => setRole("child")}
            />
          </View>

          <Text style={[styles.label, { marginTop: 14 }]}>{tr("onboarding.profile.gender", "Gender")}</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pill
              label={tr("onboarding.profile.male", "Male")}
              active={gender === "male"}
              onPress={() => setGender("male")}
            />
            <Pill
              label={tr("onboarding.profile.female", "Female")}
              active={gender === "female"}
              onPress={() => setGender("female")}
            />
          </View>

          <View style={styles.previewRow}>
            <View style={styles.previewDot} />
            <Text style={styles.previewText}>
              {tr("onboarding.profile.autoAvatar", "Avatar will be set automatically")}:{" "}
              <Text style={{ fontFamily: theme.fonts.bold }}>{String(avatarKey)}</Text>
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
            <Button
              title={tr("common.logout", "Logout")}
              variant="secondary"
              onPress={doLogout}
              style={{ flex: 1, minHeight: 52 }}
            />
            <Button
              title={tr("common.continue", "Continue")}
              onPress={goNext}
              style={{ flex: 1, minHeight: 52 }}
            />
          </View>
        </Card>

        <View style={{ height: 10 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    lineHeight: 32,
    color: theme.colors.text,
    fontFamily: theme.fonts.extraBold,
  },
  sub: {
    marginTop: 6,
    color: theme.colors.muted,
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 13,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: theme.colors.frostStrong,
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 16,
  },
  pill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
    backgroundColor: theme.colors.frost,
    alignItems: "center",
  },
  pillActive: {
    backgroundColor: "rgba(37, 99, 235, 0.12)",
    borderColor: "rgba(37, 99, 235, 0.25)",
  },
  pillText: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.muted,
    fontSize: 14,
  },
  pillTextActive: {
    color: theme.colors.primary,
  },
  previewRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "rgba(34, 197, 94, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.20)",
  },
  previewDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: theme.colors.success,
  },
  previewText: {
    flex: 1,
    color: theme.colors.text,
    fontFamily: theme.fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
});
