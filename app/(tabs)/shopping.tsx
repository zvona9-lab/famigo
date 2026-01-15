// /app/(tabs)/shopping.tsx
import React, { useMemo, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "../../src/ui/components/Screen";
import { Card } from "../../src/ui/components/Card";
import { EmptyState } from "../../src/ui/components/EmptyState";
import { theme } from "../../src/ui/theme";

import { useT } from "../../lib/useT";
import { useMembers } from "../../lib/members";
import { useLocale } from "../../lib/locale";
import { useShopping, ShoppingItem, addShoppingItem, markShoppingBought, deleteShoppingItem } from "../../lib/shopping";

function getT() {
  const tx = useT() as any;
  return typeof tx === "function" ? tx : tx?.t;
}

function formatHHMM(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatLongDate(d: Date, locale: string) {
  const loc = locale === "hr" ? "hr-HR" : "en-GB";
  try {
    return d.toLocaleDateString(loc, { weekday: "long", day: "numeric", month: "numeric" });
  } catch {
    return d.toLocaleDateString();
  }
}

export default function ShoppingScreen() {
  const { locale } = useLocale();
  const { familyId, inFamily, isParent, members, myId } = useMembers();
  const { items, loading, refresh } = useShopping(familyId, { includeBought: false });

  const t = getT();
  function tr(key: string, fallback: string) {
    const v = t?.(key);
    if (!v) return fallback;
    if (typeof v === "string" && v.startsWith("[missing")) return fallback;
    return v as string;
  }

  // Live clock (same as Members hero)
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const [custom, setCustom] = useState("");

  const meName = useMemo(() => {
    const me = members.find((m) => m.id === myId);
    return me?.name ?? null;
  }, [members, myId]);

  async function onAdd(title: string) {
    if (!familyId) return;
    const clean = String(title ?? "").trim();
    if (!clean) return;

    try {
      await addShoppingItem({ familyId, title: clean });
      setCustom("");
      await refresh();
    } catch (e: any) {
      Alert.alert(tr("shopping.errorTitle", "Shopping"), String(e?.message ?? e));
    }
  }

  // ✅ Allow both parents and children to mark "bought"
  async function onBought(item: ShoppingItem) {
    try {
      await markShoppingBought({ id: item.id, bought: true });
      await refresh();
    } catch (e: any) {
      Alert.alert(tr("shopping.errorTitle", "Shopping"), String(e?.message ?? e));
    }
  }

  async function onDelete(item: ShoppingItem) {
    if (!isParent) return;
    Alert.alert(
      tr("shopping.deleteTitle", "Delete item"),
      tr("shopping.deleteBody", "Do you want to remove this item from the list?"),
      [
        { text: tr("common.cancel", "Cancel"), style: "cancel" },
        {
          text: tr("common.delete", "Delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteShoppingItem({ id: item.id });
              await refresh();
            } catch (e: any) {
              Alert.alert(tr("shopping.errorTitle", "Shopping"), String(e?.message ?? e));
            }
          },
        },
      ]
    );
  }

  function renderRow({ item }: { item: ShoppingItem }) {
    return (
      <Card style={{ marginBottom: 10, padding: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Pressable
            onPress={() => onBought(item)}
            style={({ pressed }) => ({
              width: 38,
              height: 38,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.colors.primary,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Ionicons name="checkmark" size={22} color="#fff" />
          </Pressable>

          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 15 }}>{item.title}</Text>
            <Text style={{ color: theme.colors.muted, marginTop: 2, fontSize: 12 }}>
              {tr("shopping.suggestedBy", "Suggested by")}:{" "}
              {item.created_by === myId ? (meName ?? tr("shopping.me", "Me")) : tr("shopping.member", "Member")}
            </Text>
          </View>

          {isParent ? (
            <Pressable
              onPress={() => onDelete(item)}
              style={({ pressed }) => ({
                width: 38,
                height: 38,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.colors.card,
                borderWidth: 1,
                borderColor: theme.colors.border,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Ionicons name="trash" size={18} color={theme.colors.muted} />
            </Pressable>
          ) : null}
        </View>
      </Card>
    );
  }

  if (!inFamily) {
    return (
      <Screen title={tr("shopping.title", "Shopping")}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <EmptyState
            title={tr("shopping.noFamilyTitle", "Shopping")}
            subtitle={tr("shopping.noFamilyBody", "Join or create a family to use shared shopping list.")}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen title={tr("shopping.title", "Shopping")}>
      <View style={{ flex: 1 }}>
        {/* TOP (Members-style hero) */}
        <View style={styles.fixedTop}>
          <View style={styles.heroWrap}>
            <View style={styles.heroCard}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.heroTitle}>{tr("shopping.title", "Shopping")}</Text>
                  <Text style={styles.heroSub}>{tr("shopping.subtitle", "Shared list for the whole family.")}</Text>
                </View>

                <View style={styles.heroRight}>
                  <Text style={styles.heroTime}>{formatHHMM(now.getTime())}</Text>
                  <Text style={styles.heroDate}>{formatLongDate(now, locale)}</Text>
                </View>
              </View>

              <View style={styles.heroAccentBg}>
                <View style={[styles.heroAccent, { backgroundColor: theme.colors.primary }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Custom input */}
        <Card style={{ marginBottom: 12, padding: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TextInput
              value={custom}
              onChangeText={setCustom}
              placeholder={tr("shopping.addPlaceholder", "Add an item…")}
              placeholderTextColor={theme.colors.muted}
              style={styles.input}
              returnKeyType="done"
              onSubmitEditing={() => onAdd(custom)}
            />

            <Pressable
              onPress={() => onAdd(custom)}
              style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.addBtnText}>{tr("shopping.addBtn", "Add")}</Text>
            </Pressable>
          </View>
        </Card>

        {/* List */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 15 }}>
              {tr("shopping.toBuy", "To buy")}
            </Text>
          </View>

          {loading && !items?.length ? (
            <View style={{ paddingVertical: 20 }}>
              <ActivityIndicator />
            </View>
          ) : !items?.length ? (
            <EmptyState
              title={tr("shopping.emptyTitle", "Nothing to buy")}
              subtitle={tr("shopping.emptyBody", "Add items using the input above.")}
            />
          ) : (
            <FlatList
              data={items}
              keyExtractor={(x) => x.id}
              renderItem={renderRow}
              onRefresh={refresh}
              refreshing={loading}
              contentContainerStyle={{ paddingBottom: 30 }}
            />
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = {
  fixedTop: { paddingBottom: 10 },

  heroWrap: { paddingTop: 4, paddingBottom: 8 },
  heroCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    overflow: "hidden" as const,
    ...Platform.select({
      android: { elevation: 1 },
      ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } },
      default: {},
    }),
  },
  heroTitle: { fontSize: 22, fontWeight: "900" as const, color: theme.colors.text, letterSpacing: 0.2 },
  heroSub: { marginTop: 4, fontSize: 13, fontWeight: "700" as const, color: theme.colors.muted },
  heroRight: { alignItems: "flex-end" as const, minWidth: 96 },
  heroTime: { fontSize: 20, fontWeight: "900" as const, color: theme.colors.text },
  heroDate: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "800" as const,
    color: theme.colors.muted,
    textTransform: "capitalize" as const,
  },
  heroAccentBg: {
    position: "absolute" as const,
    left: 0,
    right: 0,
    bottom: 0,
    height: 6,
    backgroundColor: "#f1f5f9",
  },
  heroAccent: { height: 6, width: "42%", borderTopRightRadius: 999, borderBottomRightRadius: 999 },

  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
    paddingVertical: Platform.select({ ios: 10, android: 8, default: 8 }),
    fontWeight: "800" as const,
  },

  addBtn: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: theme.colors.primary,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "900" as const,
    fontSize: 13,
  },
};
