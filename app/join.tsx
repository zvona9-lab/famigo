import React, { useMemo, useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { Screen } from "../src/ui/components/Screen";
import { Card } from "../src/ui/components/Card";
import { Button } from "../src/ui/components/Button";
import { SectionTitle } from "../src/ui/components/SectionTitle";
import { theme } from "../src/ui/theme";
import { useT } from "../lib/useT";

// 🔌 Kasnije (kad budeš spajao pravu logiku):
// import { useFamily } from "../lib/family";

function normalizeCode(input: string) {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}

// Demo “backend” — samo da screen radi odmah.
async function demoJoinByCode(code: string) {
  await new Promise((r) => setTimeout(r, 350));
  if (code === "FAM-7K2Q") {
    return { ok: true as const, familyName: "Obitelj Pavlović" };
  }
  return { ok: false as const, error: "Invalid invite code" };
}

export default function JoinScreen() {
  const router = useRouter();
  const tt = useT();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const clean = useMemo(() => normalizeCode(code), [code]);
  const canSubmit = clean.length >= 4 && !loading;

  async function onJoin() {
    const c = normalizeCode(code);
    if (!c) return;

    setLoading(true);
    try {
      const res = await demoJoinByCode(c);

      if (!res.ok) {
        Alert.alert(
          tt("join.cannotJoinTitle"),
          res.error ?? tt("join.unknownError")
        );
        return;
      }

      Alert.alert(
        tt("join.joinedTitle"),
        tt("join.welcomeTo", { family: res.familyName }),
        [
          {
            text: tt("common.ok"),
            onPress: () => {
              router.replace("/(tabs)/home");
            },
          },
        ]
      );
    } catch (e: any) {
      Alert.alert(
        tt("common.error"),
        String(e?.message ?? e)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
        <SectionTitle
          title={tt("join.title")}
          subtitle={tt("join.subtitle")}
          style={{ marginBottom: theme.spacing.m }}
        />

        <Card>
          <Text style={{ color: theme.colors.muted, marginBottom: 8 }}>
            {tt("join.inviteCode")}
          </Text>

          <TextInput
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder={tt("join.placeholder")}
            placeholderTextColor={theme.colors.muted}
            style={{
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.input,
              paddingHorizontal: 12,
              paddingVertical: 12,
              backgroundColor: "#fff",
              color: theme.colors.text,
              fontWeight: "700",
              letterSpacing: 0.5,
            }}
          />

          <View style={{ marginTop: 12, flexDirection: "row", gap: 10 }}>
            <Button
              title={tt("common.cancel")}
              variant="ghost"
              style={{ flex: 1 }}
              onPress={() => router.back()}
            />
            <Button
              title={loading ? tt("join.joining") : tt("join.join")}
              style={{ flex: 1 }}
              onPress={onJoin}
              disabled={!canSubmit}
              loading={loading}
            />
          </View>

          <Text style={{ color: theme.colors.muted, marginTop: 10 }}>
            {tt("join.tip")}
          </Text>
        </Card>
      </View>
    </Screen>
  );
}
