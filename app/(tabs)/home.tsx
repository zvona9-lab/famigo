// /app/(tabs)/home.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

import { Screen } from "../../src/ui/components/Screen";
import { Card } from "../../src/ui/components/Card";
import { Button } from "../../src/ui/components/Button";
import { EmptyState } from "../../src/ui/components/EmptyState";
import { theme } from "../../src/ui/theme";

import { useT } from "../../lib/useT";
import { useTasks, Task } from "../../lib/tasks";
import { useMembers } from "../../lib/members";
import { useLocale } from "../../lib/locale";

function getT() {
  const tx = useT() as any;
  return typeof tx === "function" ? tx : tx?.t;
}

function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
function endOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}
function addDays(ts: number, days: number) {
  const d = new Date(ts);
  d.setDate(d.getDate() + days);
  return d.getTime();
}
function toHHMM(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function formatLongDate(d: Date, locale?: string) {
  try {
    return d.toLocaleDateString(locale || undefined, {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return d.toLocaleDateString(undefined, {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
}

type TaskStatus = "open" | "claimed" | "review" | "done";
function getStatus(t: Task): TaskStatus {
  return (((t as any)?.status as TaskStatus) || "open") as TaskStatus;
}

function getStatusLabel(tr: (k: string, fb: string, p?: any) => string, s: string) {
  if (s === "open") return tr("tasks.status.open", "Open");
  if (s === "claimed") return tr("tasks.status.claimed", "Claimed");
  if (s === "review") return tr("tasks.status.review", "Needs approval");
  if (s === "done") return tr("tasks.status.done", "Done");
  return s;
}


function getStatusBarStyle(status: string, isLate: boolean) {
  if (isLate && status !== "done") return { backgroundColor: theme.colors.danger };
  if (status === "done") return { backgroundColor: "#22c55e" };
  if (status === "review") return { backgroundColor: "#8b5cf6" };
  if (status === "claimed") return { backgroundColor: "#f59e0b" };
  return { backgroundColor: theme.colors.primary };
}

function StatusBadge({ label }: { label: string }) {
  return (
    <View style={styles.statusBadge}>
      <Text style={styles.statusBadgeText} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function Segmented3({
  a,
  b,
  c,
  value,
  onChange,
}: {
  a: string;
  b: string;
  c: string;
  value: "family" | "me" | "kids";
  onChange: (v: "family" | "me" | "kids") => void;
}) {
  return (
    <View style={styles.segmentWrap}>
      <Pressable
        onPress={() => onChange("family")}
        style={[styles.segmentBtn, value === "family" ? styles.segmentOn : styles.segmentOff]}
      >
        <Text style={[styles.segmentText, value === "family" ? styles.segmentTextOn : styles.segmentTextOff]} numberOfLines={1}>
          {a}
        </Text>
      </Pressable>
      <Pressable onPress={() => onChange("me")} style={[styles.segmentBtn, value === "me" ? styles.segmentOn : styles.segmentOff]}>
        <Text style={[styles.segmentText, value === "me" ? styles.segmentTextOn : styles.segmentTextOff]} numberOfLines={1}>
          {b}
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onChange("kids")}
        style={[styles.segmentBtn, value === "kids" ? styles.segmentOn : styles.segmentOff]}
      >
        <Text style={[styles.segmentText, value === "kids" ? styles.segmentTextOn : styles.segmentTextOff]} numberOfLines={1}>
          {c}
        </Text>
      </Pressable>
    </View>
  );
}

type SectionKey = "review" | "today" | "upcoming" | "anytime" | "done";
type HomeFilter = "all" | "active" | "review" | "done";
type HomeRow =
  | { type: "hero"; key: "hero" }
  | { type: "section"; key: SectionKey; title: string; hint?: string; count: number }
  | { type: "task"; key: string; item: Task };

export default function HomeScreen() {
  const t = getT();
  function tr(key: string, fallback: string, params?: Record<string, any>) {
    const v = t?.(key, params);
    if (!v) return fallback;
    if (typeof v === "string" && v.startsWith("[missing")) return fallback;
    return v as string;
  }

  const { locale } = (useLocale() as any) ?? {};
  const { ready: membersReady, myId, me, isParent, familyName, members } = useMembers() as any;

  const {
    tasks,
    ready: tasksReady,
    refresh,
    claimTask,
    unclaimTask,
    requestDone,
    approveDone,
    rejectDone,
    completeAuto,
  } = useTasks() as any;
  const myName = String(me?.name ?? tr("common.me", "Me"));

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const [busyId, setBusyId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const today0 = useMemo(() => startOfDay(now.getTime()), [now]);
  const todayEnd = useMemo(() => endOfDay(now.getTime()), [now]);
  const upcomingEnd = useMemo(() => endOfDay(addDays(today0, 7)), [today0]);

  const subtitle = useMemo(() => formatLongDate(now, locale), [now, locale]);

  const [scope3, setScope3] = useState<"family" | "me" | "kids">(isParent ? "family" : "me");
  useEffect(() => {
    setScope3(isParent ? "family" : "me");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isParent, myId]);

  const [homeFilter, setHomeFilter] = useState<HomeFilter>("all");

  const kidsIds = useMemo(() => {
    const list = Array.isArray(members) ? members : [];
    return list
      .filter((m: any) => {
        const role = String(m?.role ?? m?.type ?? "").toLowerCase();
        if (role) return role.includes("child") || role.includes("kid") || role.includes("kids");
        const isP = Boolean(m?.is_parent ?? m?.isParent);
        return !isP && String(m?.id) !== String(myId);
      })
      .map((m: any) => String(m?.id));
  }, [members, myId]);

  const visibleTasks = useMemo(() => {
    const list: Task[] = Array.isArray(tasks) ? tasks : [];
    if (scope3 === "family") return list;

    if (scope3 === "me") {
      return list.filter((x) => {
        const aId = (x as any)?.assignedToId ?? null;
        const cId = (x as any)?.claimedById ?? null;
        const rId = (x as any)?.requestedDoneById ?? null;
        return (
          !aId ||
          String(aId) === String(myId) ||
          (cId && String(cId) === String(myId)) ||
          (rId && String(rId) === String(myId))
        );
      });
    }

    // kids scope
    return list.filter((x) => {
      const aId = (x as any)?.assignedToId ?? null;
      const cId = (x as any)?.claimedById ?? null;
      const rId = (x as any)?.requestedDoneById ?? null;
      const okA = aId && kidsIds.includes(String(aId));
      const okC = cId && kidsIds.includes(String(cId));
      const okR = rId && kidsIds.includes(String(rId));
      return Boolean(okA || okC || okR);
    });
  }, [tasks, scope3, myId, kidsIds]);

  const derived = useMemo(() => {
    const all: Task[] = Array.isArray(visibleTasks) ? visibleTasks : [];
    const done: Task[] = [];
    const review: Task[] = [];
    const activeNotDone: Task[] = [];

    for (const x of all) {
      const s = getStatus(x);
      if (s === "done") done.push(x);
      else {
        activeNotDone.push(x);
        if (s === "review") review.push(x);
      }
    }

    return { all, done, review, activeNotDone };
  }, [visibleTasks]);

  const buckets = useMemo(() => {
    const review: Task[] = [];
    const today: Task[] = [];
    const upcoming: Task[] = [];
    const anytime: Task[] = [];
    const done: Task[] = [];

    for (const x of derived.all) {
      const s = getStatus(x);
      const due = (x as any)?.dueAt ? Number((x as any).dueAt) : null;

      if (s === "done") {
        done.push(x);
        continue;
      }
      if (s === "review") {
        review.push(x);
        continue;
      }
      if (!due) {
        anytime.push(x);
        continue;
      }
      if (due >= today0 && due <= todayEnd) today.push(x);
      else if (due > todayEnd && due <= upcomingEnd) upcoming.push(x);
      else if (due < today0) today.push(x); // overdue -> today
    }

    const byPriority = (a: Task, b: Task) => {
      const ad = (a as any)?.dueAt ? Number((a as any).dueAt) : 0;
      const bd = (b as any)?.dueAt ? Number((b as any).dueAt) : 0;
      const aOver = ad && ad < today0 ? 1 : 0;
      const bOver = bd && bd < today0 ? 1 : 0;
      if (aOver !== bOver) return bOver - aOver;
      if (!ad && bd) return 1;
      if (ad && !bd) return -1;
      return ad - bd;
    };

    review.sort(byPriority);
    today.sort(byPriority);
    upcoming.sort(byPriority);
    anytime.sort(byPriority);

    const doneSort = (a: Task, b: Task) => {
      const aa = Number((a as any)?.doneAt ?? (a as any)?.updatedAt ?? (a as any)?.dueAt ?? 0);
      const bb = Number((b as any)?.doneAt ?? (b as any)?.updatedAt ?? (b as any)?.dueAt ?? 0);
      return bb - aa;
    };
    done.sort(doneSort);

    return { review, today, upcoming, anytime, done };
  }, [derived, today0, todayEnd, upcomingEnd]);

  const counts = useMemo(() => {
    return { active: derived.activeNotDone.length, review: derived.review.length, done: derived.done.length };
  }, [derived]);

  // Count-up animation
  const animA = useRef(new Animated.Value(counts.active)).current;
  const animR = useRef(new Animated.Value(counts.review)).current;
  const animD = useRef(new Animated.Value(counts.done)).current;

  const [dispA, setDispA] = useState(counts.active);
  const [dispR, setDispR] = useState(counts.review);
  const [dispD, setDispD] = useState(counts.done);

  useEffect(() => {
    const sA = animA.addListener(({ value }) => setDispA(Math.round(value)));
    const sR = animR.addListener(({ value }) => setDispR(Math.round(value)));
    const sD = animD.addListener(({ value }) => setDispD(Math.round(value)));

    Animated.parallel([
      Animated.timing(animA, { toValue: counts.active, duration: 300, useNativeDriver: false }),
      Animated.timing(animR, { toValue: counts.review, duration: 300, useNativeDriver: false }),
      Animated.timing(animD, { toValue: counts.done, duration: 300, useNativeDriver: false }),
    ]).start();

    return () => {
      animA.removeListener(sA);
      animR.removeListener(sR);
      animD.removeListener(sD);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counts.active, counts.review, counts.done]);

  const rows: HomeRow[] = useMemo(() => {
    const out: HomeRow[] = [];
    out.push({ type: "hero", key: "hero" });

    const pushSection = (key: SectionKey, title: string, hint: string, items: Task[]) => {
      if (!items.length) return;
      out.push({ type: "section", key, title, hint, count: items.length });
      for (const it of items) out.push({ type: "task", key: String((it as any).id), item: it });
    };

    if (homeFilter === "done") {
      pushSection("done", tr("home.doneTitle", "Done"), tr("home.doneHint", "Recently completed"), buckets.done);
      return out;
    }

    if (homeFilter === "review") {
      pushSection(
        "review",
        tr("home.reviewTitle", "Needs approval"),
        isParent ? tr("home.reviewHint", "Waiting for your decision") : tr("home.reviewHintChild", "Waiting for parent"),
        buckets.review
      );
      return out;
    }

    if (homeFilter === "all") {
      pushSection(
        "review",
        tr("home.reviewTitle", "Needs approval"),
        isParent ? tr("home.reviewHint", "Waiting for your decision") : tr("home.reviewHintChild", "Waiting for parent"),
        buckets.review
      );
    }

    pushSection("today", tr("home.todayTitle", "Today"), tr("home.todayHint", "Focus"), buckets.today);
    pushSection("upcoming", tr("home.upcomingTitle", "Upcoming"), tr("home.upcomingHint", "Next 7 days"), buckets.upcoming);
    pushSection("anytime", tr("home.anytimeTitle", "Anytime"), tr("home.anytimeHint", "No due date"), buckets.anytime);

    return out;
  }, [buckets, homeFilter, isParent, t]);

  async function onRefresh() {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await refresh?.();
    } finally {
      setRefreshing(false);
    }
  }

  async function runAction(task: Task, fn: () => Promise<void>) {
    if (busyId) return;
    setBusyId(String((task as any).id));
    try {
      await fn();
      await refresh?.();
    } catch (e: any) {
      Alert.alert(tr("common.error", "Error"), e?.message ?? tr("tasks.errors.actionFailed", "Action failed"));
    } finally {
      setBusyId(null);
    }
  }

  function StatCard({
    value,
    label,
    active,
    onPress,
  }: {
    value: number;
    label: string;
    active: boolean;
    onPress: () => void;
  }) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.statBox,
          active ? styles.statBoxOn : null,
          pressed ? { transform: [{ scale: 0.98 }], opacity: 0.92 } : null,
        ]}
      >
        <Text style={[styles.statBig, active ? styles.statBigOn : null]}>{String(value)}</Text>
        <Text style={[styles.statSmall, active ? styles.statSmallOn : null]} numberOfLines={1}>
          {label}
        </Text>
      </Pressable>
    );
  }

  function renderRow({ item }: { item: HomeRow }) {
    if (item.type === "hero") {
      const anyTaskCount = rows.filter((r) => r.type === "task").length;

      return (
        <View style={{ marginBottom: 12 }}>
          <View style={styles.heroCard}>
            {/* Header row */}
            <View style={styles.headerRow}>
              <View style={{ flex: 1, paddingRight: 120 }}>
                <Text style={styles.brandTitle}>FAMIGO</Text>
                <Text style={styles.brandTagline} numberOfLines={1}>
                  {tr("home.tagline", "Family tasks made simple")}
                </Text>
              </View>

              {/* Clock + date aligned to top-right, same top as FAMIGO */}
              <View style={styles.headerRight}>
                <View style={styles.clockPill}>
                  <Text style={styles.clockText}>{toHHMM(now.getTime())}</Text>
                </View>
                <Text style={styles.dateTopRight} numberOfLines={1}>
                  {subtitle}
                </Text>
              </View>
            </View>

            {familyName ? (
              <View style={styles.familyBadgeCenter}>
                <View style={styles.familyBadge}>
                  <Text style={styles.familyBadgeText} numberOfLines={1}>
                    {tr("home.familyPrefix", "Family")} {String(familyName)}
                  </Text>
                </View>
              </View>
            ) : null}

            <View style={{ height: 10 }} />

            {isParent ? (
              <Segmented3
                a={tr("home.scope.family", "Family")}
                b={myName}
                c={tr("home.scope.kids", "Kids")}
                value={scope3}
                onChange={setScope3}
              />
            ) : (
              <View style={styles.segmentWrap}>
                <View style={[styles.segmentBtn, styles.segmentOn, { flex: 1 }]}>
                  <Text style={[styles.segmentText, styles.segmentTextOn]} numberOfLines={1}>
                    {myName}
                  </Text>
                </View>
              </View>
            )}

            <View style={{ height: 14 }} />

            <View style={styles.statsRow}>
              <StatCard
                value={dispA}
                label={tr("home.stats.active", "Active")}
                active={homeFilter === "active"}
                onPress={() => setHomeFilter((p) => (p === "active" ? "all" : "active"))}
              />
              <StatCard
                value={dispR}
                label={tr("home.stats.review", "Needs approval")}
                active={homeFilter === "review"}
                onPress={() => setHomeFilter((p) => (p === "review" ? "all" : "review"))}
              />
              <StatCard
                value={dispD}
                label={tr("home.stats.done", "Done")}
                active={homeFilter === "done"}
                onPress={() => setHomeFilter((p) => (p === "done" ? "all" : "done"))}
              />
            </View>

            {homeFilter !== "all" ? (
              <View style={styles.filterRow}>
                <View style={styles.filterPill}>
                  <Text style={styles.filterText} numberOfLines={1}>
                    {tr("home.filterPrefix", "Filter")}:{" "}
                    {homeFilter === "active"
                      ? tr("home.stats.active", "Active")
                      : homeFilter === "review"
                        ? tr("home.stats.review", "Needs approval")
                        : tr("home.stats.done", "Done")}
                  </Text>
                  <Pressable
                    onPress={() => setHomeFilter("all")}
                    style={({ pressed }) => [
                      styles.filterClear,
                      pressed ? { opacity: 0.75, transform: [{ scale: 0.98 }] } : null,
                    ]}
                  >
                    <Text style={styles.filterClearText}>✕</Text>
                  </Pressable>
                </View>
              </View>
            ) : null}

            <View style={styles.heroAccentBg} pointerEvents="none">
              <View style={styles.heroAccent} />
            </View>
          </View>

          {tasksReady && membersReady && anyTaskCount === 0 ? (
            <View style={{ marginTop: 14 }}>
              <EmptyState
                title={tr("home.emptyTitle", "All clear ✅")}
                subtitle={tr("home.emptySubtitle", "Add tasks in the Tasks tab or via Templates/Shopping.")}
              />
            </View>
          ) : null}
        </View>
      );
    }

    if (item.type === "section") {
      return (
        <View style={{ marginTop: 10, marginBottom: 8 }}>
          <View style={styles.sectionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>
                {item.title} <Text style={{ color: theme.colors.muted }}>({item.count})</Text>
              </Text>
              {item.hint ? (
                <Text style={styles.sectionHint} numberOfLines={1}>
                  {item.hint}
                </Text>
              ) : null}
            </View>

            {item.key === "review" && isParent ? (
              <View style={styles.sectionPill}>
                <Text style={styles.sectionPillText}>{tr("home.badge.attention", "ATTN")}</Text>
              </View>
            ) : null}
          </View>
        </View>
      );
    }

    const task = item.item;
    const status = getStatus(task);
    const statusLabel = getStatusLabel(tr, status);

    const dueAt = (task as any)?.dueAt ? Number((task as any).dueAt) : null;
    const dueText = dueAt ? toHHMM(dueAt) : "";
    const isOverdue = !!(dueAt && status !== "done" && dueAt < today0);

    const assignedToId = (task as any)?.assignedToId ?? null;
    const assignedToName = (task as any)?.assignedToName ?? null;

    const isMine = Boolean(myId && (task as any)?.claimedById && String((task as any).claimedById) === String(myId));

    const canClaim = status === "open" && (!assignedToId || String(assignedToId) === String(myId));
    const canUnclaim = status === "claimed" && isMine;
    const canRequest = status === "claimed" && isMine;
    const canApprove = status === "review" && isParent;
    const canReject = status === "review" && isParent;

    const rrRaw = (task as any)?.repeatRule ?? null;
    let isAuto = false;
    try {
      const obj = typeof rrRaw === "string" ? JSON.parse(rrRaw) : rrRaw;
      const preset = String(obj?.preset ?? obj?.kind ?? "").toLowerCase();
      isAuto = preset === "interval" && !!obj?.days && Boolean(obj?.autoComplete ?? obj?.noApproval ?? false);
    } catch {
      isAuto = false;
    }
    const canAutoDone = isAuto && status !== "done" && status !== "review";

    const busy = busyId === String((task as any).id);

    return (
      <Card style={styles.taskCard}>
        <View style={styles.taskRow}>
          <View style={[styles.statusBar, getStatusBarStyle(status, isOverdue)]} />
          <View style={styles.taskContent}>
            <View style={styles.taskHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.taskTitle} numberOfLines={2}>
                  {String((task as any)?.title ?? "")}
                </Text>

                <View style={{ height: 6 }} />

                <Text style={styles.taskMeta} numberOfLines={2}>
                  {dueAt ? `${isOverdue ? "⚠️ " : ""}⏰ ${dueText}` : tr("tasks.due.none", "No due time")}
                </Text>

                {assignedToName ? (
                  <>
                    <View style={{ height: 4 }} />
                    <Text style={styles.taskMeta} numberOfLines={1}>
                      {`${tr("tasks.assignedTo", "Assigned to")}: ${String(assignedToName)}`}
                    </Text>
                  </>
                ) : null}
              </View>

              <StatusBadge label={statusLabel} />
            </View>

            {(canAutoDone || canClaim || canUnclaim || canRequest || canApprove || canReject) ? (
              <View style={styles.actionsRow}>
                {canClaim ? (
                  <Button
                    title={tr("tasks.action.claim", "Claim")}
                    onPress={() => {
                      if (!myId) return;
                      runAction(task, async () => {
                        await claimTask(String((task as any).id), myId, myName);
                      });
                    }}
                    style={styles.actionBtn}
                    textStyle={styles.actionBtnText}
                    disabled={busy || !myId}
                  />
                ) : null}

                {canAutoDone ? (
                  <Button
                    title={tr("tasks.action.doneAuto", "Done")}
                    onPress={() => {
                      if (!myId) return;
                      runAction(task, async () => {
                        await (completeAuto as any)?.(String((task as any).id), myId ?? "", myName);
                      });
                    }}
                    style={styles.actionBtn}
                    textStyle={styles.actionBtnText}
                    disabled={busy || !myId}
                  />
                ) : null}

                {canRequest ? (
                  <Button
                    title={tr("tasks.action.requestDone", "Request done")}
                    onPress={() => {
                      if (!myId) return;
                      runAction(task, async () => {
                        await requestDone(String((task as any).id), myId, myName);
                      });
                    }}
                    style={styles.actionBtn}
                    textStyle={styles.actionBtnText}
                    disabled={busy || !myId}
                  />
                ) : null}

                {canApprove ? (
                  <>
                    <Button
                      title={tr("tasks.action.approve", "Approve")}
                      onPress={() =>
                        runAction(task, async () => {
                          await approveDone(String((task as any).id));
                        })
                      }
                      style={styles.actionBtn}
                      textStyle={styles.actionBtnText}
                      disabled={busy || !myId}
                    />
                    {canReject ? (
                      <Button
                        title={tr("tasks.action.reject", "Reject")}
                        onPress={() =>
                          runAction(task, async () => {
                            await rejectDone(String((task as any).id));
                          })
                        }
                        style={[styles.actionBtn, { opacity: 0.92 }]}
                        textStyle={styles.actionBtnText}
                        disabled={busy || !myId}
                      />
                    ) : null}
                  </>
                ) : null}

                {canUnclaim ? (
                  <Button
                    title={tr("tasks.action.unclaim", "Unclaim")}
                    variant="secondary"
                    onPress={() =>
                      runAction(task, async () => {
                        await unclaimTask(String((task as any).id));
                      })
                    }
                    style={styles.actionBtn}
                    textStyle={styles.actionBtnText}
                    disabled={busy || !myId}
                  />
                ) : null}
              </View>
            ) : null}
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Screen noPadding>
      <View style={{ flex: 1, width: "100%" }}>
        <FlatList
          data={rows}
          keyExtractor={(r) => {
            if (r.type === "hero") return "hero";
            if (r.type === "section") return `s:${r.key}`;
            return `t:${r.key}`;
          }}
          renderItem={renderRow}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </Screen>
  );
}

const styles: any = {
  heroCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 14,
    overflow: "hidden",
    ...Platform.select({
      android: { elevation: 1 },
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 5 },
      },
      default: {},
    }),
  },

  headerRow: {
    position: "relative",
    minHeight: 44,
  },
  headerRight: {
    position: "absolute",
    top: 0,
    right: 0,
    alignItems: "flex-end",
  },

  brandTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: theme.colors.text,
    letterSpacing: 0.8,
  },
  brandTagline: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "800",
    color: theme.colors.muted,
  },

  clockPill: {
    alignSelf: "flex-end",
    minWidth: 64,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingHorizontal: 12,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  clockText: {
    fontSize: 14,
    fontWeight: "900",
    color: theme.colors.text,
  },
  dateTopRight: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "800",
    color: theme.colors.muted,
    textAlign: "right",
    alignSelf: "flex-end",
  },

  familyBadgeCenter: {
    marginTop: 10,
    alignItems: "center",
  },
  familyBadge: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f8fafc",
    borderRadius: 999,
    paddingHorizontal: 10,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 260,
  },
  familyBadgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: theme.colors.text,
  },

  segmentWrap: {
    flexDirection: "row",
    width: "100%",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f8fafc",
    padding: 4,
    gap: 6,
  },
  segmentBtn: {
    flex: 1,
    height: 34,
    borderRadius: 999,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentOn: {
    backgroundColor: (theme as any)?.colors?.primary ?? "#2563eb",
  },
  segmentOff: {
    backgroundColor: "transparent",
  },
  segmentText: {
    fontSize: 12,
    fontWeight: "900",
  },
  segmentTextOn: {
    color: "#fff",
  },
  segmentTextOff: {
    color: theme.colors.text,
    opacity: 0.9,
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statBoxOn: {
    borderColor: (theme as any)?.colors?.primary ?? "#2563eb",
    backgroundColor: "#fff",
  },
  statBig: {
    fontSize: 18,
    fontWeight: "900",
    color: theme.colors.text,
  },
  statBigOn: {
    color: (theme as any)?.colors?.primary ?? "#2563eb",
  },
  statSmall: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "800",
    color: theme.colors.muted,
  },
  statSmallOn: {
    color: theme.colors.text,
    opacity: 0.9,
  },

  filterRow: {
    marginTop: 10,
    alignItems: "flex-start",
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingLeft: 12,
    paddingRight: 6,
    height: 32,
  },
  filterText: {
    fontSize: 12,
    fontWeight: "900",
    color: theme.colors.text,
  },
  filterClear: {
    height: 24,
    width: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  filterClearText: {
    fontSize: 12,
    fontWeight: "900",
    color: theme.colors.muted,
    marginTop: -1,
  },

  heroAccentBg: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 6,
    backgroundColor: "#f1f5f9",
  },
  heroAccent: {
    height: 6,
    width: "52%",
    borderTopRightRadius: 999,
    borderBottomRightRadius: 999,
    backgroundColor: (theme as any)?.colors?.primary ?? "#2563eb",
  },

  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: theme.colors.text,
    letterSpacing: 0.2,
  },
  sectionHint: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.muted,
  },
  sectionPill: {
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fff1f2",
    borderRadius: 999,
    paddingHorizontal: 10,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionPillText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#be123c",
  },

  taskCard: {
    marginBottom: 10,
    padding: 12,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  statusBar: {
    width: 4,
    marginLeft: -12,
    marginRight: 12,
    marginTop: 10,
    marginBottom: 10,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    opacity: 0.95,
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  taskTitle: {
    fontWeight: "900",
    fontSize: 16,
    color: theme.colors.text,
  },
  taskMeta: {
    color: theme.colors.muted,
    fontWeight: "800",
    fontSize: 12,
  },

  statusBadge: {
    alignSelf: "flex-end",
    paddingHorizontal: 10,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadgeText: {
    fontWeight: "900",
    fontSize: 12,
    color: theme.colors.muted,
  },

  actionsRow: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "flex-start",
  },
  actionBtn: {
    height: 32,
    borderRadius: 12,
    paddingHorizontal: 12,
    minWidth: 82,
    alignSelf: "flex-start",
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "900",
  },
};
