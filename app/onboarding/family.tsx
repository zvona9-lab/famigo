// /app/onboarding/family.tsx
import React, { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { Screen } from "../../src/ui/components/Screen";
import { Card } from "../../src/ui/components/Card";
import { Button } from "../../src/ui/components/Button";
import { theme } from "../../src/ui/theme";

import { useT } from "../../lib/useT";
import { useMembers } from "../../lib/members";
import { supabase } from "../../lib/supabase";

export default function OnboardingFamilyScreen() {
  const tr = useT() as any;
  const params = useLocalSearchParams() as any;

  const profile = useMemo(() => {
    const name = String(params?.name ?? "").trim();
    const role = String(params?.role ?? "parent");
    const gender = String(params?.gender ?? "male");
    const avatarKey = String(params?.avatarKey ?? "");
    return { name, role, gender, avatarKey };
  }, [params]);

  const membersCtx = useMembers() as any;
  const createFamily = membersCtx?.createFamily as undefined | ((name: string) => Promise<boolean>);
  const joinFamilyWithCode = membersCtx?.joinFamilyWithCode as undefined | ((code: string) => Promise<boolean>);
  const refreshMembers = membersCtx?.refreshMembers ?? membersCtx?.refresh ?? (async () => {});

  const [createName, setCreateName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [busy, setBusy] = useState<"create" | "join" | null>(null);

  async function applyProfileToMyMember() {
    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr) throw userErr;
    const uid = userRes?.user?.id;
    if (!uid) throw new Error("Missing user");

    // Try to update the newest membership row that has a family_id (after join/create)
    const updatePayload: any = {
      display_name: profile.name,
      role: profile.role,
      gender: profile.gender,
      avatar_key:
        profile.avatarKey ||
        (profile.role === "parent"
          ? profile.gender === "female"
            ? "mom"
            : "dad"
          : profile.gender === "female"
          ? "girl"
          : "boy"),
    };

    // Best effort update (schema-safe): update only rows that are in a family
    const { error: upErr } = await supabase
      .from("family_members")
      .update(updatePayload)
      .eq("user_id", uid)
      .not("family_id", "is", null);

    if (upErr) {
      // If family_id column name differs, fall back to updating all rows for this user (still safe for most setups)
      const { error: upErr2 } = await supabase
        .from("family_members")
        .update(updatePayload)
        .eq("user_id", uid);

      if (upErr2) throw upErr2;
    }
  }

  async function finish() {
    // Ensure fresh user_metadata is available for the gate (prevents bounce back to Profile)
    await supabase.auth.refreshSession().catch(() => {});
    await refreshMembers();
    await applyProfileToMyMember();
    await refreshMembers();
    router.replace("/(tabs)/home");
  }

  async function doCreate() {
    const n = String(createName ?? "").trim();
    if (!n) {
      Alert.alert(tr("common.error", "Error"), tr("settings.createFamily.nameRequired", "Enter a family name."));
      return;
    }
    if (!createFamily) {
      Alert.alert(tr("common.error", "Error"), "createFamily() not available");
      return;
    }
    try {
      setBusy("create");
      const ok = await createFamily(n);
      if (ok) await finish();
    } catch (e: any) {
      Alert.alert(tr("common.error", "Error"), String(e?.message ?? e));
    } finally {
      setBusy(null);
    }
  }

  async function doJoin() {
    const code = String(inviteCode ?? "").trim();
    if (!code) {
      Alert.alert(tr("common.error", "Error"), tr("settings.joinFamily.invalidCode", "Enter invite code."));
      return;
    }
    if (!joinFamilyWithCode) {
      Alert.alert(tr("common.error", "Error"), "joinFamilyWithCode() not available");
      return;
    }
    try {
      setBusy("join");
      const ok = await joinFamilyWithCode(code);
      if (ok) await finish();
    } catch (e: any) {
      Alert.alert(tr("common.error", "Error"), String(e?.message ?? e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <Screen safeBottom>
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        <View style={{ marginTop: 8 }}>
          <Text style={styles.title}>{tr("onboarding.family.title", "Family setup")}</Text>
          <Text style={styles.sub}>
            {tr("onboarding.family.subtitle", "Create a new family or join an existing one.")}
          </Text>
        </View>

        <Card style={{ marginTop: 16, padding: 14 }}>
          <Text style={styles.cardTitle}>{tr("onboarding.family.createTitle", "Create new family")}</Text>
          <Text style={styles.cardSub}>
            {tr("onboarding.family.createSub", "You will be the first parent in the family.")}
          </Text>

          <TextInput
            value={createName}
            onChangeText={setCreateName}
            placeholder={tr("settings.createFamily.placeholder", "e.g. Pavlović family")}
            placeholderTextColor={theme.colors.muted}
            autoCapitalize="words"
            style={styles.input}
          />

          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
            <Button
              title={busy === "create" ? tr("common.loading", "Loading...") : tr("common.create", "Create")}
              onPress={doCreate}
              disabled={busy !== null}
              style={{ flex: 1 }}
            />
          </View>
        </Card>

        <Card style={{ marginTop: 14, padding: 14 }}>
          <Text style={styles.cardTitle}>{tr("onboarding.family.joinTitle", "Join with invite code")}</Text>
          <Text style={styles.cardSub}>
            {tr("onboarding.family.joinSub", "Ask a parent for the invite code from Settings → Family.")}
          </Text>

          <TextInput
            value={inviteCode}
            onChangeText={setInviteCode}
            placeholder={tr("settings.joinFamily.placeholder", "Invite code")}
            placeholderTextColor={theme.colors.muted}
            autoCapitalize="characters"
            style={styles.input}
          />

          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
            <Button
              title={busy === "join" ? tr("common.loading", "Loading...") : tr("common.join", "Join")}
              variant="secondary"
              onPress={doJoin}
              disabled={busy !== null}
              style={{ flex: 1 }}
            />
          </View>
        </Card>

        <View style={{ marginTop: 14, alignItems: "center" }}>
          <Button
            title={tr("common.back", "Back")}
            variant="ghost"
            onPress={() => router.replace({ pathname: "/onboarding/profile", params: { name: profile.name, role: profile.role, gender: profile.gender, avatarKey: profile.avatarKey } })}
          />
        </View>
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
  cardTitle: {
    fontSize: 16,
    lineHeight: 22,
    color: theme.colors.text,
    fontFamily: theme.fonts.extraBold,
  },
  cardSub: {
    marginTop: 4,
    color: theme.colors.muted,
    fontFamily: theme.fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
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
});
