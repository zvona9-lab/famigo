// /app/(tabs)/shopping.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SHOPPING_HEADER_IMG = require("../../assets/avatars/stats/header-shopping.png");

import { Screen } from "../../src/ui/components/Screen";
import { Card } from "../../src/ui/components/Card";
import { EmptyState } from "../../src/ui/components/EmptyState";
import { theme } from "../../src/ui/theme";
import { FONT, LETTER_SPACING } from "../../lib/typography";

import { useT } from "../../lib/useT";
import { useMembers } from "../../lib/members";
import { useLocale } from "../../lib/locale";
import {
  useShopping,
  ShoppingItem,
  addShoppingItem,
  markShoppingBought,
  deleteShoppingItem,
  sendShoppingList,
} from "../../lib/shopping";

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

function toMs(v: any): number | null {
  if (!v) return null;
  if (typeof v === "number") return v;
  const d = new Date(v);
  const ms = d.getTime();
  return Number.isFinite(ms) ? ms : null;
}

function normalizeId(raw: any): string {
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  if (typeof raw === "object") {
    if (typeof raw.id === "string") return raw.id;
    if (typeof raw.uuid === "string") return raw.uuid;
  }
  return "";
}

function getBoughtMs(item: ShoppingItem): number | null {
  const anyItem: any = item as any;
  return (
    toMs(anyItem.bought_at) ??
    toMs(anyItem.boughtAt) ??
    toMs(anyItem.bought_ts) ??
    toMs(anyItem.boughtTs) ??
    toMs(anyItem.updated_at) ??
    toMs(anyItem.updatedAt) ??
    null
  );
}

function getCreatedMs(item: ShoppingItem): number | null {
  const anyItem: any = item as any;
  return (
    toMs(anyItem.created_at) ??
    toMs(anyItem.createdAt) ??
    toMs(anyItem.inserted_at) ??
    toMs(anyItem.insertedAt) ??
    null
  );
}

function formatShortDateTime(ms: number, locale: string) {
  const loc = locale === "hr" ? "hr-HR" : "en-GB";
  try {
    // Example: 16/01, 18:45
    return new Date(ms).toLocaleString(loc, {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return new Date(ms).toLocaleString();
  }
}

const TYPO = {
  title: { fontFamily: FONT.title, letterSpacing: LETTER_SPACING.title as any },
  body: { fontFamily: FONT.body, letterSpacing: LETTER_SPACING.body as any },
};

export default function ShoppingScreen() {
  const { locale } = useLocale();
  const { familyId, inFamily, isParent, members, myId } = useMembers();

  // Include bought items so we can show a 7-day "Bought" view.
  const { items, loading, refresh } = useShopping(familyId, { includeBought: true });

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
  const [tab, setTab] = useState<"toBuy" | "bought">("toBuy");

  const [sendOpen, setSendOpen] = useState(false);
  const [sendToId, setSendToId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const membersById = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of members) {
      if (m?.id) map.set(String(m.id), String((m as any).name ?? ""));
    }
    return map;
  }, [members]);

  const meName = useMemo(() => {
    const me = members.find((m) => String(m.id) === String(myId));
    return (me as any)?.name ?? null;
  }, [members, myId]);

  const toBuyItems = useMemo(() => {
    return (items ?? []).filter((it: any) => !it?.bought);
  }, [items]);

  const sendToName = useMemo(() => {
    if (!sendToId) return null;
    const name = membersById.get(String(sendToId));
    return name && name.trim().length ? name : null;
  }, [sendToId, membersById]);

  async function onSendList() {
    if (!familyId) return;
    if (!sendToId) {
      Alert.alert(tr("shopping.sendTitle", "Send list"), tr("shopping.sendPick", "Choose who is going shopping."));
      return;
    }
    if (!toBuyItems.length) {
      Alert.alert(tr("shopping.sendTitle", "Send list"), tr("shopping.sendEmpty", "The list is empty."));
      return;
    }

    setSending(true);
    try {
      await sendShoppingList({
        familyId,
        toUserId: sendToId,
        items: toBuyItems.map((it: any) => ({ title: String(it?.title ?? "") })),
        fromName: meName ?? tr("shopping.me", "Me"),
      });
      setSendOpen(false);
      Alert.alert(
        tr("shopping.sentTitle", "Sent"),
        tr("shopping.sentBody", "Shopping list notification was sent.")
      );
    } catch (e: any) {
      Alert.alert(tr("shopping.errorTitle", "Shopping"), String(e?.message ?? e));
    } finally {
      setSending(false);
    }
  }

  const boughtItems7d = useMemo(() => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const list = (items ?? []).filter((it: any) => !!it?.bought);
    const filtered = list
      .map((it: any) => ({ it, ms: getBoughtMs(it) }))
      .filter((x) => (x.ms ?? 0) >= cutoff)
      .sort((a, b) => (b.ms ?? 0) - (a.ms ?? 0))
      .map((x) => x.it);
    return filtered;
  }, [items]);

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

  // Allow both parents and children to mark "bought"
  async function onBought(item: ShoppingItem) {
    try {
      await markShoppingBought({ id: normalizeId((item as any).id) || (item as any).id, bought: true });
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
            const id = normalizeId((item as any).id) || normalizeId((item as any).item_id) || normalizeId((item as any).uuid);
            try {
              if (!id) throw new Error("Missing item id");
              // Some versions expect deleteShoppingItem(id), others expect deleteShoppingItem({ id })
              try {
                await (deleteShoppingItem as any)(id);
              } catch {
                await (deleteShoppingItem as any)({ id });
              }
              await refresh();
            } catch (e: any) {
              Alert.alert(tr("shopping.errorTitle", "Shopping"), String(e?.message ?? e));
            }
          },
        },
      ]
    );
  }

  function getAddedByName(item: ShoppingItem): string {
    const anyItem: any = item as any;
    const createdById = normalizeId(anyItem.created_by) || normalizeId(anyItem.createdBy);

    if (createdById && String(createdById) === String(myId)) {
      return meName ?? tr("shopping.me", "Me");
    }

    const name = createdById ? membersById.get(String(createdById)) : null;
    return name && name.trim().length ? name : tr("shopping.member", "Member");
  }

  function renderRow({ item }: { item: ShoppingItem }) {
    const addedBy = getAddedByName(item);
    const createdMs = getCreatedMs(item);
    const addedAt = createdMs ? formatShortDateTime(createdMs, locale) : null;

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
            <Text style={[{ color: theme.colors.text, fontWeight: "900", fontSize: 15 }, TYPO.title]}>{(item as any).title}</Text>
            <Text style={[{ color: theme.colors.muted, marginTop: 2, fontSize: 12 }, TYPO.body]}>
              {tr("shopping.addedBy", "Added by")}: {addedBy}
              {addedAt ? `  ·  ${tr("shopping.addedAt", "Added")}: ${addedAt}` : ""}
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

  function renderBoughtRow({ item }: { item: ShoppingItem }) {
    const ms = getBoughtMs(item);
    const when = ms ? formatShortDateTime(ms, locale) : null;

    return (
      <Card style={{ marginBottom: 10, padding: 12, opacity: 0.95 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.colors.card,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Ionicons name="checkmark" size={22} color={theme.colors.primary} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[{ color: theme.colors.text, fontWeight: "900", fontSize: 15 }, TYPO.title]}>{(item as any).title}</Text>
            <Text style={[{ color: theme.colors.muted, marginTop: 2, fontSize: 12 }, TYPO.body]}>
              {when ? `${tr("shopping.boughtWhen", "Bought")}: ${when}` : tr("shopping.bought", "Bought")}
            </Text>
          </View>
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
            <View style={styles.heroOuter}>
              <View style={styles.heroCardClip}>
                <View style={styles.heroRow}>
                  <View style={styles.heroLeft}>
                    <Text style={[styles.heroTitle, TYPO.title]}>{tr("shopping.title", "Shopping")}</Text>
                    <Text style={[styles.heroSub, TYPO.body]}>{tr("shopping.subtitle", "Shared list for the whole family.")}</Text>
                  </View>
                </View>

                <View style={styles.heroAccentBg}>
                  <View style={[styles.heroAccent, { backgroundColor: theme.colors.primary }]} />
                </View>
              </View>

              {/* Illustration is outside the clip layer so it can "float" without breaking rounded corners */}
              <Image source={SHOPPING_HEADER_IMG} style={styles.heroArt} resizeMode="contain" />
            </View>
          </View>
        </View>

        {/* Custom input */}
        <Card style={{ marginBottom: 12, padding: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TextInput
              value={custom}
              onChangeText={setCustom}
              placeholder={tr("shopping.addPlaceholder", "Add an item...")}
              placeholderTextColor={theme.colors.muted}
              style={[styles.input, TYPO.body]}
              returnKeyType="done"
              onSubmitEditing={() => onAdd(custom)}
            />

            <Pressable onPress={() => onAdd(custom)} style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.85 }]}>
              <Text style={[styles.addBtnText, TYPO.body]}>{tr("shopping.addBtn", "Add")}</Text>
            </Pressable>
          </View>
        </Card>


        

        {/* Send as one notification (compact inline bar) */}
        <View style={styles.sendWrap}>
          <View style={styles.sendBar}>
            <Pressable
              onPress={() => setSendOpen(true)}
              style={({ pressed }) => [styles.sendSelect, pressed && { opacity: 0.92 }]}
            >
              <Text style={[styles.sendSelectText, TYPO.body]} numberOfLines={1}>
                {sendToName ? String(sendToName) : tr("shopping.sendHeader", "Who is going shopping?")}
              </Text>
              <Ionicons name="chevron-down" size={16} color={theme.colors.muted} />
            </Pressable>

            <Pressable
              onPress={onSendList}
              disabled={!toBuyItems.length || !sendToId || sending}
              style={({ pressed }) => [
                styles.sendGoBtn,
                (!toBuyItems.length || !sendToId || sending) && { backgroundColor: theme.colors.border },
                pressed && { opacity: 0.92 },
              ]}
            >
              {sending ? (
                <ActivityIndicator />
              ) : (
                <Text style={[styles.sendGoText, TYPO.body]}>{tr("shopping.goShop", "Go shop")}</Text>
              )}
            </Pressable>
          </View>

          <Text style={[styles.sendHint, TYPO.body]} numberOfLines={1}>
            {tr("shopping.sendHint", "Send the whole list as one notification (no spam).")}
          </Text>
        </View>

        <Modal visible={sendOpen} transparent animationType="fade" onRequestClose={() => setSendOpen(false)}>
          <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }} onPress={() => setSendOpen(false)} />
          <View
            style={{
              position: "absolute",
              left: 14,
              right: 14,
              bottom: 14,
              borderRadius: 18,
              backgroundColor: theme.colors.background,
              borderWidth: 1,
              borderColor: theme.colors.border,
              padding: 14,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <Text style={[{ color: theme.colors.text, fontWeight: "900", fontSize: 14 }, TYPO.title]}>
                {tr("shopping.sendHeader", "Who is going shopping?")}
              </Text>
              <Pressable onPress={() => setSendOpen(false)} hitSlop={12} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, padding: 4 })}>
                <Ionicons name="close" size={18} color={theme.colors.muted} />
              </Pressable>
            </View>

            <FlatList
              data={members || []}
              keyExtractor={(x: any) => String(normalizeId((x as any).id) || (x as any).id)}
              renderItem={({ item }: any) => {
                const id = String(normalizeId(item?.id) || item?.id || "");
                const name = String(item?.name || "");
                const active = !!sendToId && String(sendToId) === id;
                return (
                  <Pressable
                    onPress={() => {
                      setSendToId(id);
                      setSendOpen(false);
                    }}
                    style={({ pressed }) => ({
                      paddingVertical: 12,
                      paddingHorizontal: 12,
                      borderRadius: 14,
                      backgroundColor: active ? "rgba(47,107,255,0.10)" : theme.colors.card,
                      borderWidth: 1,
                      borderColor: active ? "rgba(47,107,255,0.30)" : theme.colors.border,
                      opacity: pressed ? 0.92 : 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    })}
                  >
                    <Text style={[{ color: theme.colors.text, fontWeight: "800" }, TYPO.body]} numberOfLines={1}>
                      {name || tr("shopping.member", "Member")}
                    </Text>
                    {active ? <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} /> : null}
                  </Pressable>
                );
              }}
              style={{ maxHeight: 340 }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </Modal>

        {/* List */}
        <View style={{ flex: 1 }}>
          <View style={styles.segmentRow}>
            <View style={styles.segmentWrap}>
              <Pressable
                onPress={() => setTab("toBuy")}
                style={({ pressed }) => [
                  styles.segmentBtn,
                  tab === "toBuy" && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                  pressed && { opacity: 0.9 },
                ]}
              >
                <Text style={[styles.segmentText, tab === "toBuy" && { color: "#fff" }]}>{tr("shopping.toBuy", "To buy")}</Text>
              </Pressable>
              <Pressable
                onPress={() => setTab("bought")}
                style={({ pressed }) => [
                  styles.segmentBtn,
                  tab === "bought" && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                  pressed && { opacity: 0.9 },
                ]}
              >
                <Text style={[styles.segmentText, tab === "bought" && { color: "#fff" }]}>
                  {tr("shopping.bought7d", "Bought (7 days)")}
                </Text>
              </Pressable>
            </View>
          </View>

          {loading && !(tab === "toBuy" ? toBuyItems?.length : boughtItems7d?.length) ? (
            <View style={{ paddingVertical: 20 }}>
              <ActivityIndicator />
            </View>
          ) : (
            <FlatList
              data={tab === "toBuy" ? toBuyItems : boughtItems7d}
              keyExtractor={(x: any) => String(normalizeId((x as any).id) || (x as any).id)}
              renderItem={tab === "toBuy" ? renderRow : renderBoughtRow}
              onRefresh={refresh}
              refreshing={loading}
              contentContainerStyle={{ paddingBottom: 130 }}
              ListEmptyComponent={
                tab === "toBuy" ? (
                  <EmptyState
                    title={tr("shopping.emptyTitle", "Nothing to buy")}
                    subtitle={tr("shopping.emptyBody", "Add items using the input above.")}
                  />
                ) : (
                  <EmptyState
                    title={tr("shopping.boughtEmptyTitle", "No recent purchases")}
                    subtitle={tr("shopping.boughtEmptyBody", "Items you mark as bought will appear here for 7 days.")}
                  />
                )
              }
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
  heroOuter: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    borderRadius: 18,
    overflow: "visible" as const,
    ...Platform.select({
      android: { elevation: 1 },
      ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } },
      default: {},
    }),
  },
  heroCardClip: {
    borderRadius: 18,
    overflow: "hidden" as const,
    backgroundColor: theme.colors.card,
    padding: 14,
  },
  heroRow: { flexDirection: "row" as const, alignItems: "flex-start" as const },
  heroLeft: { flex: 1, minWidth: 0, paddingRight: 170 },
  heroTitle: { fontSize: 22, fontWeight: "900" as const, color: theme.colors.text, letterSpacing: 0.2 },
  heroSub: { marginTop: 4, fontSize: 13, fontWeight: "700" as const, color: theme.colors.muted },
  heroArt: {
    position: "absolute" as const,
    right: 24,
    top: -22,
    width: 110,
    height: 110,
    pointerEvents: "none" as const,
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
    height: 34,
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


  // Send list (compact inline bar)
  sendWrap: {
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  sendBar: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  sendSelect: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sendSelectText: {
    color: theme.colors.text,
    fontWeight: "900" as const,
    fontSize: 13,
    paddingRight: 8,
  },
  sendGoBtn: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    minWidth: 74,
  },
  sendGoText: {
    color: "#fff",
    fontWeight: "900" as const,
    fontSize: 11,
  },
  sendHint: {
    color: theme.colors.muted,
    marginTop: 2,
    fontSize: 9,
    fontWeight: "700" as const,
  },
  segmentRow: {
    marginBottom: 10,
  },
  segmentWrap: {
    flexDirection: "row" as const,
    gap: 8,
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  segmentBtn: {
    flex: 1,
    height: 34,
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    paddingHorizontal: 10,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "900" as const,
    color: theme.colors.text,
  },
};