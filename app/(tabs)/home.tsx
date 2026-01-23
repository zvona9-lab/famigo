// /app/(tabs)/home.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  View,
  Image,
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

function formatDueInline(ts: number) {
  const d = new Date(ts);
  const date = d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit" });
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${date} ${time}`;
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


function getStatusBarStyle(status: string, isLate: boolean) {
  if (isLate && status !== "done") return { backgroundColor: theme.colors.danger };
  if (status === "done") return { backgroundColor: "#22c55e" };
  if (status === "review") return { backgroundColor: "#8b5cf6" };
  if (status === "claimed") return { backgroundColor: "#f59e0b" };
  return { backgroundColor: theme.colors.primary };
}


function TaskTimeline({
  status,
  hintText,
}: {
  status: string;
  hintText: string;
}) {
  const s = String(status ?? "open");

  // 3-step timeline: Created/Assigned -> Done -> Approved
  const step1Done = true;
  const step2Done = s === "review" || s === "done";
  const step2Active = !step2Done && (s === "open" || s === "claimed");
  const step3Done = s === "done";
  const step3Active = !step3Done && s === "review";

  function dotStyle(done: boolean, active: boolean) {
    if (done) return [styles.tlDot, styles.tlDotDone];
    if (active) return [styles.tlDot, styles.tlDotActive];
    return [styles.tlDot, styles.tlDotPending];
  }
  function lineStyle(done: boolean) {
    return [styles.tlLine, done ? styles.tlLineDone : styles.tlLinePending];
  }

  const line12Done = step2Done;
  const line23Done = step3Done;

  return (
    <View style={styles.tlWrap} accessibilityLabel="Task progress">
      <View style={styles.tlRow}>
        <View style={dotStyle(step1Done, false)} />
        <View style={lineStyle(line12Done)} />
        <View style={dotStyle(step2Done, step2Active)} />
        <View style={lineStyle(line23Done)} />
        <View style={dotStyle(step3Done, step3Active)} />
      </View>

    </View>
  );
}


function InfoButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => [styles.infoBtn, pressed ? { opacity: 0.75, transform: [{ scale: 0.98 }] } : null]}
    >
      <Text style={styles.infoBtnText}>i</Text>
    </Pressable>
  );
}

function InfoSheet({
  visible,
  title,
  body,
  okLabel,
  onClose,
}: {
  visible: boolean;
  title: string;
  body: string;
  okLabel: string;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.infoBackdrop} onPress={onClose}>
        <Pressable style={styles.infoCard} onPress={() => {}}>
          <Text style={styles.infoTitle}>{title}</Text>
          <Text style={styles.infoBody}>{body}</Text>
          <View style={{ height: 12 }} />
          <Button title={okLabel} onPress={onClose} style={styles.infoOkBtn} textStyle={styles.infoOkText} />
        </Pressable>
      </Pressable>
    </Modal>
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

  // Small, on-demand help overlays (opened via "i" buttons)
  const [infoVisible, setInfoVisible] = useState(false);
  const [infoTitle, setInfoTitle] = useState("");
  const [infoBody, setInfoBody] = useState("");

  function openInfo(title: string, body: string) {
    setInfoTitle(title);
    setInfoBody(body);
    setInfoVisible(true);
  }

  const today0 = useMemo(() => startOfDay(now.getTime()), [now]);
  const todayEnd = useMemo(() => endOfDay(now.getTime()), [now]);
  const upcomingEnd = useMemo(() => endOfDay(addDays(today0, 7)), [today0]);

  const subtitle = useMemo(() => formatLongDate(now, locale), [now, locale]);

  // Default scope for everyone (parents + kids) is "me".
  // Users can switch to Family / Kids, but Home always starts focused on their own tasks.
  const [scope3, setScope3] = useState<"family" | "me" | "kids">("me");
  useEffect(() => {
    setScope3("me");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId]);

  const scopeHint = useMemo(() => {
    if (scope3 === "me") return tr("home.scopeHint.me", "Tasks that are for you");
    if (scope3 === "kids") return tr("home.scopeHint.kids", "Tasks for all kids");
    return tr("home.scopeHint.family", "All family tasks");
  }, [scope3, t, myId]);

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
          (aId && String(aId) === String(myId)) ||
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
            {/* Hero logo (overlaps the card) */}
            <View style={styles.heroHeader}>
              <View style={styles.heroLogoWrap}>
                <Image
                  source={require("../../assets/avatars/stats/home-logo.png")}
                  style={styles.heroLogo}
                  resizeMode="contain"
                />
              </View>
            </View>

            <View style={{ height: 10 }} />

            <View style={styles.scopeRow}>
              <View style={{ flex: 1 }}>
                <Segmented3
                  a={tr("home.scope.family", "Family")}
                  b={myName}
                  c={tr("home.scope.kids", "Kids")}
                  value={scope3}
                  onChange={setScope3}
                />
              </View>
            </View>

            <View style={{ height: 8 }} />
            <View style={styles.hintRow}>
              <Text style={styles.sectionHint} numberOfLines={1}>
                {scopeHint}
              </Text>

              <View style={styles.infoSlot}>
              <InfoButton
                onPress={() =>
                  openInfo(
                    tr("home.info.scope.title", "Views"),
                    tr(
                      "home.info.scope.body",
                      "Me shows tasks that are for you. Family shows all tasks in your family. Kids shows tasks for all kids.\n\nTip: Home starts on Me so you can focus on what you need to do first."
                    )
                  )
                }
              />
            </View>
            </View>

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
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.sectionTitle}>
                {item.title} <Text style={{ color: theme.colors.muted }}>({item.count})</Text>
              </Text>
              {item.hint ? (
                <Text style={styles.sectionHint} numberOfLines={1}>
                  {item.hint}
                </Text>
              ) : null}
            </View>

            <View style={styles.infoSlot}>
              {item.key === "review" ? (
              <InfoButton
                onPress={() =>
                  openInfo(
                    tr("home.info.review.title", "Waiting for approval"),
                    isParent
                      ? tr(
                          "home.info.review.body.parent",
                          "These tasks were completed by children and are waiting for your confirmation.\n\nTap Approve to mark them as done, or Not done to ask for changes."
                        )
                      : tr(
                          "home.info.review.body.child",
                          "You marked these tasks as done. They are waiting for a parent to confirm."
                        )
                  )
                }
              />
            ) : null}
            </View>
          </View>
        </View>
      );
    }
const task = item.item;
const status = getStatus(task);

const dueAt = (task as any)?.dueAt ? Number((task as any).dueAt) : null;
const dueText = dueAt ? formatDueInline(dueAt) : "";
const isOverdue = !!(dueAt && status !== "done" && dueAt < now.getTime());

const assignedToId = (task as any)?.assignedToId ?? null;
const assignedToName = (task as any)?.assignedToName ?? null;

const hasAssignee = Boolean(assignedToId || assignedToName);
const isUnassigned = !Boolean(assignedToId);

const isMine = Boolean(myId && (task as any)?.claimedById && String((task as any).claimedById) === String(myId));
const isAssignee = Boolean(myId && assignedToId && String(assignedToId) === String(myId));

// Simplified UX (same as Tasks tab):
// - "I'll do it" only for open+unassigned
// - "Mark done" for assignee when open (auto-claim+request), and for claimer when claimed
// - Parent review: Approve / Not done
// - Leave only for claimed+unassigned tasks (so someone else can take it)
const canTake = status === "open" && isUnassigned;
const canLeave = status === "claimed" && isMine && isUnassigned;

const canMarkDone = (status === "open" && isAssignee) || (status === "claimed" && isMine);
const canApprove = status === "review" && isParent;

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

const actionInfo = (() => {
  if (status === "open") {
    return {
      title: tr("home.info.actions.title", "Buttons"),
      body: tr(
        "home.info.actions.open",
        "I'll do it: take this task if it has no assigned person.\n\nA task can be taken by only one person at a time."
      ),
    };
  }
  if (status === "claimed") {
    return {
      title: tr("home.info.actions.title", "Buttons"),
      body: tr(
        "home.info.actions.claimed",
        "Mark done: send the task for approval.\n\nLeave: put it back so someone else can take it."
      ),
    };
  }
  if (status === "review") {
    return {
      title: tr("home.info.actions.title", "Buttons"),
      body: isParent
        ? tr(
            "home.info.actions.review.parent",
            "Approve: confirm the task is done.\n\nNot done: send it back for changes."
          )
        : tr("home.info.actions.review.child", "This task is waiting for a parent to confirm it."),
    };
  }
  return null;
})();

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

          <TaskTimeline
            status={status}
            hintText={
              hasAssignee
                ? tr("tasks.timelineHint.assigned", "Assigned → Done → Approved")
                : tr("tasks.timelineHint.created", "Created → Done → Approved")
            }
          />
        </View>

        {(canAutoDone || canTake || canLeave || canMarkDone || canApprove) ? (
          <View style={styles.actionsRow}>
            <View style={styles.actionsLeft}>
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

              {canTake ? (
                <Button
                  title={tr("tasks.action.illDoIt", "I'll do it")}
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

              {canMarkDone ? (
                <Button
                  title={tr("tasks.action.markDone", "Mark done")}
                  onPress={() => {
                    if (!myId) return;
                    runAction(task, async () => {
                      // One-tap flow:
                      // - If open: auto-claim then request done
                      // - If claimed: request done
                      if (String((task as any)?.status ?? "open") === "open") {
                        await claimTask(String((task as any).id), myId, myName);
                      }
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
                  <Button
                    title={tr("tasks.action.notDone", "Not done")}
                    variant="secondary"
                    onPress={() =>
                      runAction(task, async () => {
                        await rejectDone(String((task as any).id));
                      })
                    }
                    style={[styles.actionBtn, { opacity: 0.92 }]}
                    textStyle={styles.actionBtnText}
                    disabled={busy || !myId}
                  />
                </>
              ) : null}

              {canLeave ? (
                <Button
                  title={tr("tasks.action.leave", "Leave")}
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

            <View style={styles.infoSlot}>
              {actionInfo ? <InfoButton onPress={() => openInfo(actionInfo.title, actionInfo.body)} /> : null}
            </View>
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

        <InfoSheet
          visible={infoVisible}
          title={infoTitle}
          body={infoBody}
          okLabel={tr("common.ok", "OK")}
          onClose={() => setInfoVisible(false)}
        />
      </View>
    </Screen>
  );
}

const PALETTE = {
  text: "#0B1220",
  muted: "#667085",
  primary: "#2F6BFF",
  card: "rgba(255,255,255,0.94)",
  cardStrong: "rgba(255,255,255,0.96)",
  border: "rgba(140,160,190,0.18)",
  borderBlue: "rgba(47,107,255,0.30)",
};

const FROST = {
  bg: PALETTE.card,
  bgStrong: PALETTE.cardStrong,
  borderSoft: PALETTE.border,
  shadow:
    Platform.OS === "android"
      ? { elevation: 5 }
      : {
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
        },
};

const styles: any = {
  heroCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 14,
    overflow: "visible",
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

  // Hero logo header (replaces old title + clock/date)
  heroHeader: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6,
    paddingBottom: 10,
  },
  heroLogoWrap: {
    marginTop: -45, // 👈 overlaps outside the card for a “wow” effect
    alignItems: "center",
    justifyContent: "center",
  },
  heroLogo: {
    width: 230,
    height: 150,
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

  scopeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  infoSlot: {
    width: 28,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  infoBtn: {
    // Smaller + softer blue so it doesn't steal focus
    height: 22,
    width: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#60A5FA",
    backgroundColor: "#60A5FA",
    alignItems: "center",
    justifyContent: "center",
  },
  infoBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#fff",
    marginTop: -0.5,
  },

  infoBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  infoCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    padding: 14,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: theme.colors.text,
  },
  infoBody: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.muted,
    lineHeight: 18,
  },
  infoOkBtn: {
    height: 34,
    borderRadius: 12,
    paddingHorizontal: 14,
    alignSelf: "flex-end",
  },
  infoOkText: {
    fontSize: 12,
    fontWeight: "900",
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
    justifyContent: "space-between",
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
  marginBottom: 12,
  padding: 14,
  borderWidth: 1,
  borderColor: FROST.borderSoft,
  backgroundColor: FROST.bg,
  borderRadius: 22,
  ...FROST.shadow,
},
taskRow: {
  flexDirection: "row",
  alignItems: "stretch",
},
statusBar: {
  width: 5,
  marginLeft: -14,
  marginRight: 14,
  marginTop: 12,
  marginBottom: 12,
  borderTopRightRadius: 4,
  borderBottomRightRadius: 4,
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
  fontWeight: "800",
  fontSize: 17,
  color: PALETTE.text,
  letterSpacing: -0.2,
},
taskMeta: {
  color: PALETTE.muted,
  fontWeight: "700",
  fontSize: 12,
},

// Timeline (replaces status badge)
tlWrap: {
  alignSelf: "flex-start",
  alignItems: "flex-end",
  minWidth: 120,
},
tlRow: {
  flexDirection: "row",
  alignItems: "center",
},
tlDot: {
  width: 10,
  height: 10,
  borderRadius: 999,
  borderWidth: 2,
},
tlDotDone: {
  backgroundColor: PALETTE.primary,
  borderColor: PALETTE.primary,
},
tlDotActive: {
  backgroundColor: "transparent",
  borderColor: PALETTE.primary,
},
tlDotPending: {
  backgroundColor: "transparent",
  borderColor: PALETTE.border,
},
tlLine: {
  height: 2,
  width: 18,
  marginHorizontal: 4,
  borderRadius: 999,
},
tlLineDone: {
  backgroundColor: PALETTE.primary,
  opacity: 0.9,
},
tlLinePending: {
  backgroundColor: PALETTE.border,
  opacity: 0.9,
},
tlHint: {
  marginTop: 4,
  fontSize: 10,
  fontWeight: "800",
  color: PALETTE.muted,
},

actionsRow: {
  marginTop: 12,
  flexDirection: "row",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 10,
},
actionsLeft: {
  flex: 1,
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
  alignItems: "flex-start",
},
actionBtn: {
  height: 34,
  borderRadius: 14,
  paddingHorizontal: 12,
  minWidth: 86,
  alignSelf: "flex-start",
},
actionBtnText: {
  fontSize: 12,
  fontWeight: "900",
},
};
