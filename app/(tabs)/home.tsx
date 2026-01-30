// app/(tabs)/home.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { FONT, LETTER_SPACING } from "../../lib/typography";
import { Screen } from "../../src/ui/components/Screen";
import { Card } from "../../src/ui/components/Card";
import { theme } from "../../src/ui/theme";

import { useT } from "../../lib/useT";
import { useMembers } from "../../lib/members";
import { useTasks } from "../../lib/tasks";
import { useShopping } from "../../lib/shopping";
import { supabase } from "../../lib/supabase";

// Local Planner is stored in AsyncStorage (same as planner.tsx)
const STORAGE_KEY = "famigo_planner_v2";

const HOME_HEADER_IMG = require("../../assets/avatars/stats/home.png");
const PLANNER_HEADER_IMG = require("../../assets/avatars/stats/planner.png");
const TASKS_HEADER_IMG = require("../../assets/avatars/stats/header-tasks.png");
const SHOPPING_HEADER_IMG = require("../../assets/avatars/stats/header-shopping.png");

// Central typography helpers (Nunito via lib/typography)
const TYPO = {
  title: { fontFamily: FONT.title, letterSpacing: LETTER_SPACING.title as any },
  body: { fontFamily: FONT.body, letterSpacing: LETTER_SPACING.body as any },
};

// Optional AsyncStorage (if installed)
let AsyncStorage: any = null;

// Optional Haptics (if installed)
let Haptics: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Haptics = require("expo-haptics");
} catch {
  Haptics = null;
}

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {
  AsyncStorage = null;
}

function getT() {
  const tx = useT() as any;
  return typeof tx === "function" ? tx : tx?.t;
}

function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function formatTimeFromDigits(digits: string) {
  const d = String(digits ?? "").replace(/[^0-9]/g, "").slice(0, 4);
  if (!d) return "";
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}:${d.slice(2)}`;
}

type PlannerItem = {
  id: string;
  dayTs0: number; // start of day
  title: string;
  timeDigits: string; // "HHMM" digits
  assignedTo: "me" | "all" | "some";
  memberIds: string[];
  createdAt?: number;
};

function Pill(props: { label: string }) {



  return (
    <View style={styles.pill}>
      <View style={styles.pillDot} />
      <Text style={[styles.pillText, TYPO.body]}>{props.label}</Text>
    </View>
  );
}

function Chip(props: { label: string; tone?: "primary" | "neutral" }) {
  const primary = props.tone === "primary";
  return (
    <View style={[styles.chip, primary && styles.chipPrimary]}>
      <Text style={[styles.chipText, TYPO.body, primary && styles.chipTextPrimary]}>{props.label}</Text>
    </View>
  );
}

function RowIconTile(props: { icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.rowIconTile}>
      <Ionicons name={props.icon} size={18} color={theme.colors.primary} />
    </View>
  );
}

function SkeletonRow() {
  return (
    <View style={styles.skelRow}>
      <View style={styles.skelIcon} />
      <View style={{ flex: 1 }}>
        <View style={styles.skelLine1} />
        <View style={styles.skelLine2} />
      </View>
    </View>
  );
}

function PressableFilter(props: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={() => { try { Haptics?.selectionAsync?.(); } catch {} props.onPress(); }}
      style={({ pressed }) => [
        styles.segmentBtn,
        props.active && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
        pressed && { opacity: 0.9 },
      ]}
    >
      <Text style={[styles.segmentText, TYPO.body, props.active && { color: "#fff" }]}>{props.label}</Text>
    </Pressable>
  );
}

function SectionHeader(props: { title: string; art?: any; icon?: any; rightSlot?: React.ReactNode }) {
  return (
    <View style={styles.sectionHeaderRow}>
      {/* floating illustration (subtle) */}
      {props.art ? <Image source={props.art} style={styles.sectionArtFloat} resizeMode="contain" /> : null}

      <View style={styles.sectionHeaderLeft}>
        {props.icon ? (
          <View style={styles.sectionIcon}>
            <Ionicons name={props.icon} size={16} color={theme.colors.primary} />
          </View>
        ) : (
          <View style={styles.sectionDot} />
        )}

        <Text style={[styles.sectionTitle, TYPO.title]} numberOfLines={1}>
          {props.title}
        </Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {props.rightSlot ? props.rightSlot : null}
      </View>
    </View>
  );
}

function CardMore(props: { label: string; onPress: () => void }) {
  return (
    <View style={styles.cardFooter}>
      <Pressable
        onPress={props.onPress}
        hitSlop={10}
        style={({ pressed }) => [
          styles.moreBtn,
          pressed && { opacity: 0.92, backgroundColor: "rgba(47,107,255,0.10)" },
        ]}
      >
        <Text style={[styles.moreText, TYPO.body]}>{props.label}</Text>
        <Ionicons name="chevron-forward" size={16} color={theme.colors.muted} />
      </Pressable>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();

  const t = getT();
  function tr(key: string, fallback: string, params?: Record<string, any>) {
    const v = t?.(key, params);

    // Only allow strings to reach <Text/>. Some i18n libs can return objects
    // (e.g., pluralization maps like { none: "", one: ""}), which crashes RN rendering.
    const base =
      typeof v === "string" && v && !v.startsWith("[missing")
        ? v
        : fallback;

    if (params && Object.keys(params).length) {
      let out = base;
      for (const [k, val] of Object.entries(params)) out = out.split(`{{${k}}}`).join(String(val));
      return out;
    }

    return base;
  }

  const viewMoreLabel = tr("home.viewMore", tr("home.viewMore", "View more"));


  const membersHook = useMembers() as any;
  const { familyId, inFamily, myId, members } = membersHook;

  const tasksHook = useTasks() as any;
  const tasks = tasksHook?.tasks ?? [];

  const shoppingHook = useShopping(familyId, { includeBought: true } as any) as any;
  const items = shoppingHook?.items ?? [];

  const tasksLoading = Boolean(tasksHook?.loading ?? tasksHook?.isLoading ?? false);
  const membersLoading = Boolean(membersHook?.loading ?? membersHook?.isLoading ?? false);
  const shoppingLoading = Boolean(shoppingHook?.loading ?? shoppingHook?.isLoading ?? false);

  const [scope, setScope] = useState<"family" | "me" | "kids">("me");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      // Re-read Planner (family mode uses Supabase, local mode uses AsyncStorage)
      await readPlannerIntoState(() => true);

      // Best-effort refetch for other sources (depends on hook implementation)
      await Promise.allSettled([
        membersHook?.refresh?.(),
        membersHook?.refetch?.(),
        membersHook?.reload?.(),
        tasksHook?.refresh?.(),
        tasksHook?.refetch?.(),
        tasksHook?.reload?.(),
        shoppingHook?.refresh?.(),
        shoppingHook?.refetch?.(),
        shoppingHook?.reload?.(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [membersHook, tasksHook, shoppingHook, inFamily, familyId]);



  // --- Planner: load from AsyncStorage (best-effort) ---
  const [plannerItems, setPlannerItems] = useState<PlannerItem[]>([]);
  const [plannerLoading, setPlannerLoading] = useState(true);
  // Load planner into state (single source of truth):
  // - If user is in a family: fetch from Supabase planner_items
  // - Otherwise: read from AsyncStorage (legacy/local mode)
  async function readPlannerIntoState(aliveCheck: () => boolean) {
    try {
      if (!aliveCheck()) return;
      setPlannerLoading(true);

      // ✅ FAMILY MODE → Supabase
      if (inFamily && familyId) {
        const { data, error } = await supabase
          .from("planner_items")
          .select("*")
          .eq("family_id", familyId);

        if (!aliveCheck()) return;
        if (error) throw error;

        const fromYMDLocal = (ymd: string) => {
          const [y, m, d] = String(ymd).split("-").map((x) => Number(x));
          const dt = new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
          dt.setHours(0, 0, 0, 0);
          return dt.getTime();
        };

        const mapped = (Array.isArray(data) ? data : []).map((row: any) => {
          const plannedDate = String(row?.planned_date ?? row?.plannedDate ?? "");
          const dayTs0 = plannedDate ? fromYMDLocal(plannedDate) : startOfDay(Date.now());

          const timeRaw =
            row?.planned_time ??
            row?.plannedTime ??
            row?.time_digits ??
            row?.timeDigits ??
            row?.time ??
            row?.planned_at ??
            row?.plannedAt ??
            "";

          const timeDigits = String(timeRaw ?? "").replace(/[^0-9]/g, "").slice(0, 4);

          const memberIdsRaw = row?.member_ids ?? row?.memberIds ?? [];
          const memberIds = Array.isArray(memberIdsRaw) ? memberIdsRaw.map((x: any) => String(x)) : [];

          const assignedTo = String(row?.assigned_to ?? row?.assignedTo ?? "me") as any;

          const createdAt =
            Number(row?.created_at ? new Date(row.created_at).getTime() : row?.createdAt ?? Date.now()) || Date.now();

          return {
            id: String(row?.id ?? `${Math.random()}`),
            dayTs0,
            title: String(row?.title ?? ""),
            timeDigits,
            assignedTo,
            memberIds,
            createdAt,
          };
        });

        if (aliveCheck()) setPlannerItems(mapped as any);
        return;
      }

      // ✅ LOCAL MODE → AsyncStorage
      if (!AsyncStorage) {
        if (aliveCheck()) setPlannerItems([]);
        return;
      }

      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!aliveCheck()) return;

      if (!raw) {
        setPlannerItems([]);
        return;
      }

      const parsed = JSON.parse(raw);
      // Support both legacy formats:
      //  - Array<PlannerItem>
      //  - { items: Array<PlannerItem> }
      const arr = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.items) ? parsed.items : [];
      setPlannerItems(arr as any);
    } catch (e) {
      // best-effort
      try { console.warn("HOME planner load failed", e); } catch {}
    } finally {
      if (aliveCheck()) setPlannerLoading(false);
    }
  }

useEffect(() => {
  let alive = true;
  readPlannerIntoState(() => alive);
  return () => {
    alive = false;
  };
}, []);

useFocusEffect(
  React.useCallback(() => {
    let alive = true;
    readPlannerIntoState(() => alive);
    return () => {
      alive = false;
    };
  }, [inFamily, familyId])
);
// --- Derived: kids ids ---
  const kidIds = useMemo(() => {
    const list = Array.isArray(members) ? members : [];
    return list
      .filter((m: any) => (m?.role === "child" || m?.role === "kid") && String(m?.id ?? "") !== "")
      .map((m: any) => String(m.id));
  }, [members]);

  // --- Planner: today's items, apply scope ---
  const today0 = useMemo(() => startOfDay(Date.now()), []);
  const plannerToday = useMemo(() => {
    const list = (plannerItems ?? []).filter((it: any) => Number(it?.dayTs0) === today0);

    const visible = list.filter((it: any) => {
      const assignedTo = String(it?.assignedTo ?? "me");
      const memberIds = Array.isArray(it?.memberIds) ? it.memberIds.map((x: any) => String(x)) : [];

      if (scope === "family") return assignedTo === "all";


      if (scope === "me") {
        if (!myId) return assignedTo === "me";
        if (assignedTo === "all") return true;
        if (assignedTo === "me") return true;
        if (assignedTo === "some") return memberIds.includes(String(myId));
        return false;
      }

      // kids
      if (assignedTo === "all") return true;
      if (!kidIds.length) return false;
      if (assignedTo === "some") return memberIds.some((id: any) => kidIds.includes(String(id)));
      return false;
    });

    // sort by timeDigits then createdAt
    return visible
      .slice()
      .sort((a: any, b: any) => {
        const ta = Number(String(a?.timeDigits ?? "0").replace(/[^0-9]/g, "") || 0);
        const tb = Number(String(b?.timeDigits ?? "0").replace(/[^0-9]/g, "") || 0);
        if (ta !== tb) return ta - tb;
        return Number(b?.createdAt ?? 0) - Number(a?.createdAt ?? 0);
      })
      .slice(0, 3);
  }, [plannerItems, today0, scope, myId, kidIds]);

  // --- Tasks: newest 3 (not urgent, just newest), apply scope ---
  const latestTasks = useMemo(() => {
    const list = (tasks ?? []).filter((tk: any) => {
      const status = String(tk?.status ?? (tk?.done ? "done" : "open"));
      if (status === "done") return false;

     const assignedToId = String(
  tk?.assignedToId ?? tk?.assigned_to_id ?? tk?.assignedTo ?? tk?.claimedById ?? ""
);

// što smatramo "family / shared" taskom
const isFamilyTask =
  !assignedToId ||                    // npr. null / ""
  assignedToId === "family" ||
  assignedToId === "all";

// FAMILY → samo obiteljski (ne privatni "me")
if (scope === "family") {
  if (!myId) return true;
  if (isFamilyTask) return true; // "", null, "all", "family"
  return assignedToId !== String(myId);
}

// ME → moji + family
if (scope === "me") {
  if (!myId) return true;
  return assignedToId === String(myId) || isFamilyTask;
}

// KIDS → kids + family
if (isFamilyTask) return true;
return kidIds.includes(assignedToId);

    });

    const withMs = list.map((tk: any) => {
      const ms =
        Number(tk?.createdAt ?? 0) ||
        (tk?.created_at ? new Date(tk.created_at).getTime() : 0) ||
        (tk?.inserted_at ? new Date(tk.inserted_at).getTime() : 0) ||
        0;
      return { tk, ms };
    });

    return withMs
      .sort((a, b) => (b.ms ?? 0) - (a.ms ?? 0))
      .slice(0, 3)
      .map((x) => x.tk);
  }, [tasks, scope, myId, kidIds]);


  // --- Shopping: open count ---
  const shoppingOpenCount = useMemo(() => {
    const list = (items ?? []).filter((it: any) => !it?.bought);
    return list.length;
  }, [items]);

  const shoppingPreview = useMemo(() => {
    const list = (items ?? []).filter((it: any) => !it?.bought);
    return list
      .slice(0, 3)
      .map((it: any) => ({
        id: String(it?.id ?? `${it?.name ?? it?.title ?? it?.text ?? ""}-${Math.random()}`),
        name: String(it?.name ?? it?.title ?? it?.text ?? "").trim(),
      }))
      .filter((x: any) => Boolean(x?.name));
  }, [items]);

  const segFamilyLabel = tr("planner.family", tr("planner.family", "Family"));
  const segMeLabel = tr("common.me", tr("common.me", "Me"));
  const segKidsLabel = tr("members.stats.kids", tr("members.stats.kids", "Kids"));

  return (
    <Screen noPadding>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* HERO */}
<View style={{ padding: 16 }}>
  <View style={[styles.heroOuter, styles.heroShadow]}>
    <View style={styles.heroCardClip}>
      {/* soft playful background */}
      <View pointerEvents="none" style={styles.heroDecor}>
        <View style={styles.heroBubble1} />
        <View style={styles.heroBubble2} />
      </View>

      <View style={styles.heroTopRow}>
        <View style={styles.heroLeft}>
          <Text style={[styles.heroTitle, TYPO.title]}>{tr("home.title", tr("home.title", tr("home.title", "Daily tasks")))}</Text>
          <Text style={[styles.heroSub, TYPO.body]}>{tr("home.subtitle", "Planner, tasks, family & shopping — overview")}</Text>
        </View>

        <Image
          source={HOME_HEADER_IMG}
          style={styles.heroArt}
          resizeMode="contain"
          onError={(e) => console.log("HOME LOGO ERROR", e?.nativeEvent)}
        />
      </View>

      {/* SEGMENT: Family | Me | Kids */}
      <View style={styles.heroSegmentWrap}>
        <PressableFilter active={scope === "family"} label={segFamilyLabel} onPress={() => setScope("family")} />
        <PressableFilter active={scope === "me"} label={segMeLabel} onPress={() => setScope("me")} />
        <PressableFilter active={scope === "kids"} label={segKidsLabel} onPress={() => setScope("kids")} />
      </View>

      <View style={styles.heroAccentBg}>
        <View style={[styles.heroAccent, { backgroundColor: theme.colors.primary }]} />
      </View>
    </View>
  </View>
</View>

<View style={{ paddingHorizontal: 16 }}>

          {/* 1) PLANNER */}
          <Card style={[styles.card, styles.cardShadow]}>
            <View style={styles.cardAccent} />
            <SectionHeader art={PLANNER_HEADER_IMG} title={tr("home.plannerToday", tr("home.plannerToday", "Planner — today"))} rightSlot={<Pill label={String(plannerToday.length)} />} />

            <View style={styles.sectionDivider} />

            {plannerLoading ? (
              <View style={{ marginTop: 2 }}>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </View>
            ) : plannerToday.length === 0 ? (
              <View style={styles.inlineEmpty}>
                <Text style={[styles.inlineEmptyTitle, TYPO.title]}>
                  {scope === "me"
                    ? tr("home.plannerEmptyMe", "Nothing planned today")
                    : scope === "kids"
                      ? tr("home.plannerEmptyKids", "Nothing planned for kids")
                      : tr("home.plannerEmptyFamily", "Nothing planned today")}
                </Text>
                <Text style={[styles.inlineEmptySub, TYPO.body]}>
                  {scope === "family"
                    ? tr("home.plannerEmptyFamilySub", "Plan one small thing ✨")
                    : tr("home.plannerEmptySub", "All clear 🙂")}
                </Text>
              </View>
            ) : (
              <View style={{ marginTop: 2 }}>
                {plannerToday.map((p: any, idx: number) => {
                  const timeLabel = formatTimeFromDigits(String(p.timeDigits ?? "")) || tr("home.noTime", "Any time");
                  return (
                    <View key={String(p.id)} style={[styles.plannerRow, idx !== 0 && styles.plannerRowDivider]}>
                      <View style={styles.plannerRowLeft}>
                        <Text style={[styles.plannerTitle, TYPO.body]} numberOfLines={1}>
                          {String(p.title ?? "")}
                        </Text>
                      </View>

                      <View style={styles.plannerRowRight}>
                        <View style={styles.timePill}>
                          <Ionicons name="time-outline" size={14} color={theme.colors.muted} />
                          <Text style={[styles.timePillText, TYPO.body]}>{timeLabel}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {!AsyncStorage ? (
              <Text style={[styles.noteText, TYPO.body]}>
                {tr("planner.noStorage", "Note: AsyncStorage is not installed, so plans will reset when the app reloads.")}
              </Text>
            ) : null}

            <CardMore label={viewMoreLabel} onPress={() => router.push("/(tabs)/planner")} />
          </Card>

          {/* 2) TASKS */}
          <Card style={[styles.card, styles.cardShadow]}>
            <View style={styles.cardAccent} />
            <SectionHeader art={TASKS_HEADER_IMG} title={tr("home.tasksLatest", tr("home.tasksLatest", "Tasks — newest"))} rightSlot={<Pill label={String(latestTasks.length)} />} />

            <View style={styles.sectionDivider} />

            {tasksLoading ? (
              <View style={{ marginTop: 2 }}>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </View>
            ) : latestTasks.length === 0 ? (
              <View style={styles.inlineEmpty}>
                <Text style={[styles.inlineEmptyTitle, TYPO.title]}>
                  {scope === "me"
                    ? tr("home.tasksEmptyMe", "No tasks for you")
                    : scope === "kids"
                      ? tr("home.tasksEmptyKids", "Kids have no tasks")
                      : tr("home.tasksEmptyFamily", "No open tasks")}
                </Text>
                <Text style={[styles.inlineEmptySub, TYPO.body]}>{tr("home.tasksEmptySub", "Looks clean. Keep it that way 😄")}</Text>
              </View>
            ) : (
              <View style={{ marginTop: 2 }}>
                {latestTasks.map((task: any, idx: number) => (
                  <View key={String(task.id)} style={[styles.row, idx !== 0 && styles.rowDivider]}>
                    <View style={styles.rowIcon}>
                      <Ionicons name="checkbox" size={18} color={theme.colors.primary} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={[styles.rowTitle, TYPO.body]} numberOfLines={1}>
                        {String(task.title ?? "")}
                      </Text>
                      {task?.dueAt ? (
                        <Text style={[styles.rowMeta, TYPO.body]}>
                          {tr("tasks.due", "Due")}:{" "}
                          {new Date(task.dueAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </Text>
                      ) : (
                        <Text style={[styles.rowMeta, TYPO.body]}>{tr("tasks.noDue", "No due time")}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            <CardMore label={viewMoreLabel} onPress={() => router.push("/(tabs)/tasks")} />
          </Card>

          {/* 4) SHOPPING */}
          <Card style={[styles.card, styles.cardShadow]}>
            <View style={styles.cardAccent} />
            <SectionHeader art={SHOPPING_HEADER_IMG} title={tr("home.shopping", tr("home.shopping", "Shopping"))} rightSlot={<Pill label={String(shoppingOpenCount)} />} />

            <View style={styles.sectionDivider} />

            {shoppingLoading ? (
              <View style={{ marginTop: 2 }}>
                <SkeletonRow />
              </View>
            ) : !inFamily ? (
              <Text style={[styles.simpleText, TYPO.body]}>
                {tr("home.noFamilyShopping", "Join or create a family to use shared shopping list.")}
              </Text>
            ) : shoppingOpenCount <= 0 ? (
              <Text style={[styles.simpleText, TYPO.body]}>{tr("home.shoppingEmpty", "Shopping list is empty")}</Text>
            ) : (
              <View style={{ paddingVertical: 6 }}>
                <Text style={[styles.simpleText, TYPO.body]}>
                  {tr("home.shoppingCartCount", "You have {{count}} items in the cart", { count: shoppingOpenCount })}
                </Text>

                {shoppingPreview.length ? (
                  <View style={{ marginTop: 6 }}>
                    {shoppingPreview.map((it: any, idx: number) => (
                      <View key={it.id} style={[styles.row, idx !== 0 && styles.rowDivider]}>
                        <View style={styles.rowIcon}>
                          <Ionicons name="cart-outline" size={18} color={theme.colors.primary} />
                        </View>

                        <View style={{ flex: 1 }}>
                          <Text style={[styles.rowTitle, TYPO.body]} numberOfLines={1}>
                            {it.name}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            )}

            <CardMore label={viewMoreLabel} onPress={() => router.push("/(tabs)/shopping")} />
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { padding: 12, marginBottom: 12 },
  cardAccent: { height: 4, width: "55%", borderRadius: 999, backgroundColor: "rgba(37, 99, 235, 0.18)", marginBottom: 10 },

  heroOuter: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    borderRadius: 18,
    overflow: "visible",
  },
  heroCardClip: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: theme.colors.card,
    padding: 14,
  },
  heroTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

heroDecor: {
  position: "absolute",
  left: -40,
  right: -40,
  top: -40,
  bottom: -40,
},
heroBubble1: {
  position: "absolute",
  width: 220,
  height: 220,
  borderRadius: 999,
  right: -110,
  top: -120,
  backgroundColor: "rgba(47,107,255,0.10)",
},
heroBubble2: {
  position: "absolute",
  width: 180,
  height: 180,
  borderRadius: 999,
  left: -90,
  bottom: -110,
  backgroundColor: "rgba(255,199,0,0.12)",
},

heroSegmentWrap: {
  flexDirection: "row",
  gap: 8,
  marginTop: 12,
  padding: 5,
  borderRadius: 16,
  backgroundColor: "rgba(37, 99, 235, 0.08)",
},

  // Left text reserves space for the logo on the right
  heroLeft: { flex: 1, minWidth: 0, paddingRight: 92 },

  // Right logo (soft watermark)
  heroArt: {
    position: "absolute",
    right: -6,
    top: -55,
    width: 140,
    height: 140,
    opacity: 0.82,
    pointerEvents: "none",
  },

  heroRow: { flexDirection: "row", alignItems: "flex-start" },

    heroTitle: { fontSize: 22, lineHeight: 24, fontWeight: "900", color: theme.colors.text },
  heroSub: { marginTop: 4, fontSize: 13, lineHeight: 16, fontWeight: "700", color: theme.colors.muted },

  heroMetaRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  heroMetaPill: {
    height: 24,
    paddingHorizontal: 10,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  heroMetaDot: { width: 7, height: 7, borderRadius: 999, backgroundColor: theme.colors.primary },
  heroMetaText: { fontSize: 12, fontWeight: "900", color: theme.colors.text },

  heroAccentBg: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 6,
    backgroundColor: "#f1f5f9",
  },
  heroAccent: { height: 6, width: "55%", borderTopRightRadius: 999, borderBottomRightRadius: 999 },

  segmentWrap: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    padding: 5,
    borderRadius: 16,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  segmentBtn: {
    flex: 1,
    height: 34,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  segmentText: { fontSize: 12, fontWeight: "900", color: theme.colors.text },

  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 8,
    paddingRight: 54, // leave room for floating art
    position: "relative",
    overflow: "visible",
  },
  sectionDivider: {
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(17,17,17,0.06)",
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  sectionHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1, minWidth: 0 },

  sectionIcon: {
    width: 30,
    height: 30,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(37, 99, 235, 0.08)",
  },
  sectionDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(37, 99, 235, 0.55)",
  },

  // subtle "floating" header illustration
  sectionArtFloat: {
    position: "absolute",
    right: 2,
    top: -16,
    width: 46,
    height: 46,
    opacity: 0.85,
    pointerEvents: "none",
  },

  sectionTitle: { fontSize: 16, fontWeight: "900", color: theme.colors.text },
  moreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  moreText: { fontSize: 12, fontWeight: "900", color: theme.colors.muted },

  morePill: {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  morePillText: { fontSize: 12, fontWeight: "900", color: theme.colors.muted },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    height: 24,
    borderRadius: 999,
    backgroundColor: "rgba(47,107,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(47,107,255,0.22)",
  },
  pillDot: { width: 6, height: 6, borderRadius: 99, backgroundColor: theme.colors.primary },
  pillText: { fontSize: 12, fontWeight: "900", color: theme.colors.primary },

  plannerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  plannerRowDivider: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  plannerRowLeft: { flex: 1, minWidth: 0, paddingRight: 10 },
  plannerRowRight: { alignItems: "flex-end" },
  plannerTitle: { fontSize: 15, fontWeight: "900", color: theme.colors.text },
  timePill: {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(37, 99, 235, 0.08)",
  },
  timePillText: { fontSize: 12, fontWeight: "900", color: theme.colors.muted },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: "rgba(17,17,17,0.06)",
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rowTitle: { color: theme.colors.text, fontWeight: "900", fontSize: 14 },
  rowMeta: { marginTop: 2, color: theme.colors.muted, fontWeight: "700", fontSize: 12 },

  skelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  skelIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.06)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  skelLine1: {
    height: 12,
    borderRadius: 8,
    width: "72%",
    backgroundColor: "rgba(0,0,0,0.06)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  skelLine2: {
    marginTop: 6,
    height: 10,
    borderRadius: 8,
    width: "48%",
    backgroundColor: "rgba(0,0,0,0.06)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  noteText: { marginTop: 10, color: theme.colors.muted, fontWeight: "700", fontSize: 11 },

  simpleText: { color: theme.colors.text, fontWeight: "800", paddingVertical: 6 },

  inlineEmpty: {
    paddingVertical: 10,
    paddingHorizontal: 2,
  },
  inlineEmptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: theme.colors.text,
    letterSpacing: 0.1,
  },
  inlineEmptySub: {
    marginTop: 6,
    color: theme.colors.muted,
    fontWeight: "800",
  },

});
