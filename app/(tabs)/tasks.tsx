// /app/(tabs)/tasks.tsx
import React, { useMemo, useState, useEffect } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";


import { Screen } from "../../src/ui/components/Screen";
import { Card } from "../../src/ui/components/Card";
import { Button } from "../../src/ui/components/Button";
import { EmptyState } from "../../src/ui/components/EmptyState";
import { theme } from "../../src/ui/theme";

import { useT } from "../../lib/useT";
import { useTasks, Task } from "../../lib/tasks";
import { useMembers } from "../../lib/members";

// Optional native date picker (if installed)
let DateTimePicker: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  DateTimePicker = require("@react-native-community/datetimepicker").default;
} catch {
  DateTimePicker = null;
}

function getT() {
  const tx = useT() as any;
  return typeof tx === "function" ? tx : tx?.t;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
function addDays(ts: number, days: number) {
  const d = new Date(ts);
  d.setDate(d.getDate() + days);
  return d.getTime();
}
function ddmmFromTs(ts: number) {
  const d = new Date(ts);
  return `${pad2(d.getDate())}${pad2(d.getMonth() + 1)}`;
}
function tsFromDDMM(ddmm: string, nowBase: number): number | null {
  const raw = String(ddmm ?? "").replace(/[^0-9]/g, "").slice(0, 4);
  if (raw.length !== 4) return null;
  const da = Number(raw.slice(0, 2));
  const mo = Number(raw.slice(2, 4));
  if (mo < 1 || mo > 12 || da < 1 || da > 31) return null;

  const today0 = startOfDay(nowBase);
  const y = new Date(today0).getFullYear();

  const d0 = new Date();
  d0.setFullYear(y, mo - 1, da);
  d0.setHours(0, 0, 0, 0);

  if (d0.getFullYear() != y || d0.getMonth() !== mo - 1 || d0.getDate() !== da) return null;

  // if past in current year -> next year
  if (d0.getTime() < today0) {
    const d1 = new Date(d0);
    d1.setFullYear(y + 1);
    if (d1.getMonth() !== mo - 1 || d1.getDate() !== da) return null;
    return d1.getTime();
  }

  return d0.getTime();
}

function digitsOnly(s: string) {
  return String(s || "").replace(/[^0-9]/g, "").slice(0, 4);
}
function formatTimeMasked(digits: string) {
  const d = digitsOnly(digits);
  if (!d) return "";
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}:${d.slice(2)}`;
}
function parseDigitsToHM(digits: string): { h: number; m: number } | null {
  const d = digitsOnly(digits);
  if (!d) return { h: 0, m: 0 };

  if (d.length <= 2) {
    const h = Number(d);
    if (Number.isNaN(h) || h < 0 || h > 23) return null;
    return { h, m: 0 };
  }
  if (d.length === 3) {
    const h = Number(d[0]);
    const m = Number(d.slice(1));
    if (Number.isNaN(h) || Number.isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;
    return { h, m };
  }
  const h = Number(d.slice(0, 2));
  const m = Number(d.slice(2));
  if (Number.isNaN(h) || Number.isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;
  return { h, m };
}
function combineDateAndTime(dateStart: number, digits: string) {
  const hm = parseDigitsToHM(digits);
  if (!hm) return null;
  const d = new Date(dateStart);
  d.setHours(hm.h, hm.m, 0, 0);
  return d.getTime();
}
function formatDueInline(ts: number) {
  const d = new Date(ts);
  const date = d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit" });
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${date} ${time}`;
}


function parseRepeatRule(raw: any): { days: number | null; autoComplete: boolean } {
  if (!raw) return { days: null, autoComplete: false };
  try {
    const obj = typeof raw === "string" ? JSON.parse(raw) : raw;
    const preset = String(obj?.preset ?? obj?.kind ?? "").toLowerCase();
    if (preset !== "interval") return { days: null, autoComplete: false };
    const days = Number(obj?.days ?? obj?.everyDays ?? null);
    const autoComplete = Boolean(obj?.autoComplete ?? obj?.noApproval ?? false);
    if (!Number.isFinite(days) || days <= 0) return { days: null, autoComplete };
    return { days: Math.floor(days), autoComplete };
  } catch {
    return { days: null, autoComplete: false };
  }
}

function buildRepeatRule(daysStr: string, autoComplete: boolean): string | null {
  const d = Number(String(daysStr || "").replace(/[^0-9]/g, ""));
  if (!Number.isFinite(d) || d <= 0) return null;
  return JSON.stringify({ preset: "interval", days: Math.floor(d), autoComplete: !!autoComplete });
}


function BottomSheet(props: { visible: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <Modal visible={props.visible} transparent animationType="slide" onRequestClose={props.onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={props.onClose} />
      <View style={styles.sheetWrap}>
        <View style={styles.sheetInner}>{props.children}</View>
      </View>
    </Modal>
  );
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

function MenuPill(props: { big: string; small: string; active?: boolean; onPress?: () => void }) {
  const isActive = !!props.active;
  return (
    <Pressable
      onPress={props.onPress}
      style={({ pressed }) => [
        styles.menuPill,
        isActive ? styles.menuPillActive : null,
        pressed ? { opacity: 0.92, transform: [{ scale: 0.99 }] } : null,
      ]}
    >
      <Text style={[styles.menuBig, isActive ? { color: theme.colors.primary } : null]} numberOfLines={1}>
        {props.big}
      </Text>
      <Text style={[styles.menuSmall, isActive ? { color: theme.colors.primary } : null]} numberOfLines={1}>
        {props.small}
      </Text>
    </Pressable>
  );
}

export default function TasksScreen() {
  const t = getT();
  function tr(key: string, fallback: string, params?: Record<string, any>) {
    const v = t?.(key, params);
    if (!v) return fallback;
    if (typeof v === "string" && v.startsWith("[missing")) return fallback;
    return v as string;
  }

  const {
    tasks,
    ready,
    refresh,
    addTask,
    updateTask,
    deleteTask,
    claimTask,
    unclaimTask,
    requestDone,
    approveDone,
    rejectDone,
    setAssignee,
    completeAuto,
  } = useTasks() as any;

  const { ready: membersReady, myId, me, isParent, members } = useMembers() as any;
const myName = String(me?.name ?? tr("common.me", "Me"));

  const [filter, setFilter] = useState<"all" | "active" | "review" | "done">("all");
  const [nowTs, setNowTs] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowTs(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [draftTitle, setDraftTitle] = useState("");
  const [draftDateMode, setDraftDateMode] = useState<"today" | "tomorrow" | "custom" | "calendar">("today");
  const [draftDateDDMM, setDraftDateDDMM] = useState("");
  const [draftCalendarTs, setDraftCalendarTs] = useState<number | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarTemp, setCalendarTemp] = useState<Date>(new Date());

  const [draftTimeDigits, setDraftTimeDigits] = useState("");

  // ✅ repeat (interval days) + auto-complete (no approval)
  const [draftRepeatDays, setDraftRepeatDays] = useState<string>("");
  const [draftAutoComplete, setDraftAutoComplete] = useState<boolean>(false);
  const [repeatOpen, setRepeatOpen] = useState<boolean>(false);

  // ✅ assign (parent only)
  const [draftAssigneeId, setDraftAssigneeId] = useState<string | null>(null);
  const [draftAssigneeName, setDraftAssigneeName] = useState<string | null>(null);
  const [assigneeOpen, setAssigneeOpen] = useState(false);

  const [selected, setSelected] = useState<Task | null>(null);

  // ✅ prevent double taps on action buttons
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const list: Task[] = Array.isArray(tasks) ? tasks : [];
    let out = list;
    if (filter === "active") out = out.filter((x) => x.status !== "done");
    if (filter === "review") out = out.filter((x) => x.status === "review");
    if (filter === "done") out = out.filter((x) => x.status === "done");
    return out;
  }, [tasks, filter]);

  const menuCounts = useMemo(() => {
    const list: Task[] = Array.isArray(tasks) ? tasks : [];
    const all = list.length;
    const done = list.filter((x) => x.status === "done").length;
    const review = list.filter((x) => x.status === "review").length;
    const active = list.filter((x) => x.status !== "done").length;
    return { all, active, review, done };
  }, [tasks]);

  function openNew() {
    setSelected(null);
    setDraftTitle("");
    setDraftDateMode("today");
    const today0 = startOfDay(Date.now());
    setDraftDateDDMM(ddmmFromTs(today0));
    setDraftCalendarTs(today0);
    setDraftTimeDigits("");
    setDraftAssigneeId(null);
    setDraftAssigneeName(null);
    setDraftRepeatDays("");
    setDraftAutoComplete(false);
    setRepeatOpen(false);
    setEditOpen(true);
  }

  function openEdit(task: Task) {
    setSelected(task);
    setDraftTitle(String(task.title ?? ""));

    const hasDue = Boolean(task.dueAt);
    if (hasDue) {
      const dueTs = Number(task.dueAt);
      const today0 = startOfDay(Date.now());
      const tomorrow0 = addDays(today0, 1);
      const due0 = startOfDay(dueTs);

      if (due0 === today0) {
        setDraftDateMode("today");
    const today0 = startOfDay(Date.now());
    setDraftDateDDMM(ddmmFromTs(today0));
    setDraftCalendarTs(today0);
      } else if (due0 === tomorrow0) {
        const base0 = startOfDay(Date.now());
                  const tomo0 = addDays(base0, 1);
                  setDraftDateMode("tomorrow");
                  setDraftDateDDMM(ddmmFromTs(tomo0));
                  setDraftCalendarTs(tomo0);
      } else {
        const y = new Date(dueTs).getFullYear();
        const thisY = new Date().getFullYear();
        if (y !== thisY) {
          setDraftDateMode("calendar");
          setDraftCalendarTs(due0);
          setDraftDateDDMM(ddmmFromTs(dueTs));
        } else {
          setDraftDateMode("custom");
          setDraftDateDDMM(ddmmFromTs(dueTs));
          setDraftCalendarTs(null);
        }
      }

      setDraftTimeDigits(digitsOnly(new Date(dueTs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })));
    } else {
      setDraftDateMode("today");
    const today0 = startOfDay(Date.now());
    setDraftDateDDMM(ddmmFromTs(today0));
    setDraftCalendarTs(today0);
      setDraftTimeDigits("");
    }

    setDraftAssigneeId((task as any)?.assignedToId ?? null);
    setDraftAssigneeName((task as any)?.assignedToName ?? null);

    const rr = parseRepeatRule((task as any)?.repeatRule ?? null);
    setDraftRepeatDays(rr.days ? String(rr.days) : "");
    setDraftAutoComplete(!!rr.autoComplete);
    setRepeatOpen(!!rr.days);

    setEditOpen(true);
  }

  async function onSave() {
    const title = String(draftTitle ?? "").trim();
    if (!title) {
      Alert.alert(tr("common.error", "Error"), tr("tasks.titleRequired", "Title is required."));
      return;
    }

    let dueAt: number | null = null;

    // ✅ due is optional: if time empty -> no dueAt
    const hasTime = !!digitsOnly(draftTimeDigits);
    if (hasTime) {
      const base0 = startOfDay(Date.now());
      let date0 = base0;

      if (draftDateMode === "tomorrow") date0 = addDays(base0, 1);
      if (draftDateMode === "calendar") {
        if (!draftCalendarTs) {
          Alert.alert(tr("common.error", "Error"), tr("tasks.dateInvalid", "Pick a date."));
          return;
        }
        date0 = draftCalendarTs;
      }
      if (draftDateMode === "custom") {
        const custom0 = tsFromDDMM(draftDateDDMM, Date.now());
        if (!custom0) {
          Alert.alert(tr("common.error", "Error"), tr("tasks.dateInvalid", "Date must be DDMM (e.g. 2503)."));
          return;
        }
        date0 = custom0;
      }

      const combined = combineDateAndTime(date0, draftTimeDigits);
      if (combined === null) {
        Alert.alert(tr("common.error", "Error"), tr("tasks.timeInvalid", "Time must be HHMM (e.g. 1630)."));
        return;
      }
      dueAt = combined;
    }

    try {
      const aId = draftAssigneeId ?? null;
      const aName = draftAssigneeName ?? null;

      if (selected?.id) {
        const prevAId = (selected as any)?.assignedToId ?? null;
        const prevAName = (selected as any)?.assignedToName ?? null;

        const repeatRule = buildRepeatRule(draftRepeatDays, draftAutoComplete);
        await updateTask(selected.id, { title, dueAt, repeatRule });

        // ✅ assignment change
        if (isParent && (prevAId !== aId || String(prevAName ?? "") !== String(aName ?? ""))) {
          await setAssignee?.(selected.id, aId, aName);
        }
      } else {
        const repeatRule = buildRepeatRule(draftRepeatDays, draftAutoComplete);
        await addTask(title, { dueAt, repeatRule, assignedToId: isParent ? aId : null, assignedToName: isParent ? aName : null });
      }

      setEditOpen(false);
      setSelected(null);
      await refresh?.();
    } catch (e: any) {
      Alert.alert(tr("common.error", "Error"), e?.message ?? tr("tasks.errors.saveFailed", "Save failed"));
    }
  }

  async function onDelete(task: Task) {
    Alert.alert(
      tr("common.delete", "Delete"),
      tr("tasks.deleteConfirm", "Delete this task?"),
      [
        { text: tr("common.cancel", "Cancel"), style: "cancel" },
        {
          text: tr("common.delete", "Delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTask(task.id);
              setSheetOpen(false);
              setSelected(null);
              await refresh?.();
            } catch (e: any) {
              Alert.alert(tr("common.error", "Error"), e?.message ?? tr("tasks.errors.deleteFailed", "Delete failed"));
            }
          },
        },
      ],
      { cancelable: true }
    );
  }

  async function runAction(task: Task, fn: () => Promise<void>) {
    if (actionBusyId) return;
    setActionBusyId(task.id);
    try {
      await fn();
      await refresh?.();
    } catch (e: any) {
      Alert.alert(tr("common.error", "Error"), e?.message ?? tr("tasks.errors.actionFailed", "Action failed"));
    } finally {
      setActionBusyId(null);
    }
  }

  function getStatusLabel(s: string) {
    if (s === "open") return tr("tasks.status.open", "Open");
    if (s === "claimed") return tr("tasks.status.claimed", "Claimed");
    if (s === "review") return tr("tasks.status.review", tr("tasks.needsApproval", "Needs approval"));
    if (s === "done") return tr("tasks.status.done", "Done");
    return s;
  }
  function getStatusBarStyle(status: string, isLate: boolean) {
    // Late overrides (unless done)
    if (isLate && status !== "done") return { backgroundColor: theme.colors.danger };
    if (status === "done") return { backgroundColor: "#22c55e" };
    if (status === "review") return { backgroundColor: "#8b5cf6" };
    if (status === "claimed") return { backgroundColor: "#f59e0b" };
    // open / default
    return { backgroundColor: theme.colors.primary };
  }

  function formatFullDate(ts: number) {
    const d = new Date(ts);
    const dd = pad2(d.getDate());
    const mm = pad2(d.getMonth() + 1);
    const yyyy = d.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  }

  function getSelectedDateTs(): number | null {
    const base0 = startOfDay(Date.now());
    if (draftDateMode === "today") return base0;
    if (draftDateMode === "tomorrow") return addDays(base0, 1);
    if (draftDateMode === "calendar") return draftCalendarTs ?? null;
    // custom typed
    const ts0 = tsFromDDMM(draftDateDDMM, Date.now());
    return ts0 ?? null;
  }

  const selectedDateTs = getSelectedDateTs();

  function formatDisplayDateFromDDMM(ddmm: string): string {
    const raw = String(ddmm || "").replace(/[^0-9]/g, "").slice(0, 4);
    if (!raw.length) return "";
    const dd = raw.slice(0, 2);
    const mm = raw.slice(2, 4);
    if (raw.length <= 2) return dd; // typing
    if (raw.length < 4) return `${dd}.${mm}`; // typing
    const ts0 = tsFromDDMM(raw, Date.now());
    if (!ts0) return `${dd}.${mm}`;
    return formatFullDate(ts0);
  }

  const selectedDateLabel = selectedDateTs ? formatFullDate(selectedDateTs) : "";

  const dateInputDisplay = formatDisplayDateFromDDMM(draftDateDDMM) || selectedDateLabel;


  function renderRow({ item }: { item: Task }) {
    const status = String(item.status ?? "open");
    const dueAt = item.dueAt ? (item.dueAt as any as number) : null;
    const dueText = dueAt ? formatDueInline(dueAt) : "";
    const isLate = !!(dueAt && status !== "done" && dueAt < nowTs);
    const statusLabel = getStatusLabel(status);

    const isMine = Boolean(myId && item.claimedById && String(item.claimedById) === String(myId));
    const canClaim = status === "open" && (!item.assignedToId || String(item.assignedToId) === String(myId));
    const canUnclaim = status === "claimed" && isMine;
    const canRequest = status === "claimed" && isMine;
    const canApprove = status === "review" && isParent;
    const canReject = status === "review" && isParent;

    const busy = actionBusyId === item.id;

    const rr = parseRepeatRule((item as any)?.repeatRule ?? null);
    const isAuto = !!rr.days && rr.autoComplete === true;
    const canAutoDone = isAuto && status !== "done" && status !== "review";

    return (
      <Pressable
        onLongPress={() => {
          setSelected(item);
          setSheetOpen(true);
        }}
        delayLongPress={250}
      >
        <Card style={styles.taskCard}>
          <View style={styles.taskRow}>
          <View style={[styles.statusBar, getStatusBarStyle(status, isLate)]} />
          <View style={styles.taskContent}>
            <View style={styles.taskHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.taskTitle} numberOfLines={2}>
                {String(item.title ?? "")}
              </Text>

              <View style={{ height: 6 }} />

              <Text style={styles.taskMeta} numberOfLines={1}>
                {dueAt ? (isAuto ? `${tr("tasks.nextDue", "Next due")}: ${dueText}` : `${isLate ? "⚠️ " : ""}⏰ ${dueText}`) : tr("tasks.due.none", "No due time")}
              </Text>

              {item.assignedToName ? (
                <>
                  <View style={{ height: 4 }} />
                  <Text style={styles.taskMeta} numberOfLines={1}>
                    {`${tr("tasks.assignedTo", "Assigned to")}: ${String(item.assignedToName)}`}
                  </Text>
                </>
              ) : null}
            </View>

            <StatusBadge label={statusLabel} />
          </View>

          {(canAutoDone || canClaim || canUnclaim || canRequest || canApprove || canReject) ? (
            <View style={styles.actionsRow}>
              {canAutoDone ? (
                <Button
                  title={tr("tasks.action.doneAuto", "Done")}
                  onPress={() => {
                    runAction(item, async () => {
                      await (completeAuto as any)?.(item.id, myId ?? "", myName);
                    });
                  }}
                  style={styles.actionBtn}
                  disabled={busy}
                />
              ) : null}

              {canClaim ? (
                <Button
                  title={tr("tasks.action.claim", "Claim")}
                  onPress={() => {
                    if (!myId) {
                      Alert.alert(tr("common.error", "Error"), tr("auth.missingUid", "You are not signed in (member id missing)."));
                      return;
                    }
                    runAction(item, async () => {
                      await claimTask(item.id, myId, myName);
                    });
                  }}
                  style={styles.actionBtn}
                  disabled={busy}
                />
              ) : null}

              {canRequest ? (
                <Button
                  title={tr("tasks.action.requestDone", "Request done")}
                  onPress={() => {
                    if (!myId) {
                      Alert.alert(tr("common.error", "Error"), tr("auth.missingUid", "You are not signed in (member id missing)."));
                      return;
                    }
                    runAction(item, async () => {
                      await requestDone(item.id, myId, myName);
                    });
                  }}
                  style={styles.actionBtn}
                  disabled={busy}
                />
              ) : null}

              {canApprove ? (
                <>
                  <Button
                    title={tr("tasks.action.approve", "Approve")}
                    onPress={() =>
                      runAction(item, async () => {
                        await approveDone(item.id);
                      })
                    }
                    style={styles.actionBtn}
                    disabled={busy}
                  />
                  <Button
                    title={tr("tasks.action.reject", "Reject")}
                    onPress={() =>
                      runAction(item, async () => {
                        await rejectDone(item.id);
                      })
                    }
                    // ✅ user traži plavo/bijelo -> i reject je primary
                    style={[styles.actionBtn, { opacity: 0.92 }]}
                    disabled={busy}
                  />
                </>
              ) : null}

              {canUnclaim ? (
                <Button
                  title={tr("tasks.action.unclaim", "Vrati")}
                  variant="secondary"
                  onPress={() =>
                    runAction(item, async () => {
                      await unclaimTask(item.id);
                    })
                  }
                  style={styles.actionBtn}
                  disabled={busy}
                />
              ) : null}
            </View>
          ) : null}
                  </View>
                </View>
              </Card>
      </Pressable>
    );
  }

  const showEmpty = ready && membersReady && filtered.length === 0;

  return (
    <Screen noPadding>
      <View style={{ flex: 1, width: "100%", alignSelf: "stretch" }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
          <View style={{ padding: 16 }}>
            <View style={styles.heroCard}>
              <View style={styles.heroTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.heroTitle}>{tr("tasks.title", "Tasks")}</Text>
                  <Text style={styles.heroSub}>{tr("tasks.heroSub", "Quick filters and overview")}</Text>
                </View>

                <Button
                  title={tr("tasks.new", "+ New")}
                  onPress={openNew}
                  style={{ height: 40, paddingHorizontal: 14, borderRadius: 14 }}
                  textStyle={{ fontSize: 14, fontWeight: "800" }}
                />
              </View>

              <View style={{ height: 12 }} />

              <View style={styles.menuRow}>
                <MenuPill big={String(menuCounts.all)} small={tr("tasks.filter.all", "All")} active={filter === "all"} onPress={() => setFilter("all")} />
                <MenuPill big={String(menuCounts.active)} small={tr("tasks.filter.active", "Active")} active={filter === "active"} onPress={() => setFilter("active")} />
                <MenuPill big={String(menuCounts.review)} small={tr("tasks.filter.review", tr("tasks.needsApproval", "Needs approval"))} active={filter === "review"} onPress={() => setFilter("review")} />
                <MenuPill big={String(menuCounts.done)} small={tr("tasks.filter.done", "Done")} active={filter === "done"} onPress={() => setFilter("done")} />
              </View>

              <View style={styles.heroAccentBg}>
                <View style={styles.heroAccent} />
              </View>
            </View>
          </View>

          <View style={{ paddingHorizontal: 16 }}>
            {showEmpty ? (
              <EmptyState title={tr("tasks.emptyTitle", "No tasks")} subtitle={tr("tasks.emptySubtitle", "Create the first task with + New")} />
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={(x: any) => String(x.id)}
                renderItem={renderRow}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: 24 }}
              />
            )}
          </View>
        </ScrollView>

        <BottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)}>
          <Card>
            <Text style={{ fontSize:  16, fontWeight: "900", color: theme.colors.text }}>
              {tr("tasks.actionsTitle", "Task actions")}
            </Text>

            <ScrollView style={{ marginTop: 12, maxHeight: 360 }} contentContainerStyle={{ gap: 10, paddingBottom: 6 }} showsVerticalScrollIndicator={true}>
              <Button
                title={tr("tasks.edit", "Edit")}
                variant="secondary"
                onPress={() => {
                  if (selected) openEdit(selected);
                  setSheetOpen(false);
                }}
              />
              <Button
                title={tr("common.delete", "Delete")}
                variant="secondary"
                onPress={() => {
                  if (selected) onDelete(selected);
                }}
              />
              <Button title={tr("common.cancel", "Cancel")} variant="secondary" onPress={() => setSheetOpen(false)} />
            </ScrollView>
          </Card>
        </BottomSheet>

        <BottomSheet
          visible={editOpen}
          onClose={() => {
            setEditOpen(false);
            setAssigneeOpen(false);
            setCalendarOpen(false);
          }}
        >
          <Card>
            <Text style={{ fontSize: 18, fontWeight: "900", color: theme.colors.text }}>
              {selected ? tr("tasks.editTitle", "Edit task") : ""}
            </Text>
            {!selected ? (
              <Text style={{ marginTop: 2, fontSize: 13, fontWeight: "800", color: theme.colors.muted }}>
                {tr("tasks.newPrompt", "What can you do today?")}
              </Text>
            ) : null}
            <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ paddingBottom: 12 }} keyboardShouldPersistTaps="handled">

            <TextInput
              value={draftTitle}
              onChangeText={setDraftTitle}
              placeholder={tr("tasks.titlePlaceholder", "e.g. Take Emma to practice.")}
              placeholderTextColor={theme.colors.muted}
              autoCapitalize="sentences"
              style={[styles.input, { fontSize: 14, fontWeight: "800", paddingVertical: 10 }]}
            />

            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: "800", color: theme.colors.muted }}>
                {tr("tasks.when", "When?")}
              </Text>
            </View>

            <View style={styles.dateButtonsRow}>
              <Button
                title={tr("tasks.today", "Today")}
                variant={draftDateMode === "today" ? "primary" : "secondary"}
                onPress={() => {
                  setDraftDateMode("today");
    const today0 = startOfDay(Date.now());
    setDraftDateDDMM(ddmmFromTs(today0));
    setDraftCalendarTs(today0);
                }}
                style={styles.dateBtn}
                textStyle={styles.dateBtnText}
              />
              <Button
                title={tr("tasks.tomorrow", "Tomorrow")}
                variant={draftDateMode === "tomorrow" ? "primary" : "secondary"}
                onPress={() => {
                  const base0 = startOfDay(Date.now());
                  const tomo0 = addDays(base0, 1);
                  setDraftDateMode("tomorrow");
                  setDraftDateDDMM(ddmmFromTs(tomo0));
                  setDraftCalendarTs(tomo0);
                }}
                style={styles.dateBtn}
                textStyle={styles.dateBtnText}
              />
<Button
                title={tr("tasks.calendar", "Calendar")}
                variant={draftDateMode === "calendar" ? "primary" : "secondary"}
                onPress={() => {
                  // ✅ zatvori druge sheetove prije otvaranja kalendara
                  setAssigneeOpen(false);
                  const base = draftCalendarTs ?? startOfDay(Date.now());
                  setDraftDateMode("calendar");
                  setDraftCalendarTs(base);
                  setCalendarTemp(new Date(base));
                  setCalendarOpen(true);
                }}
                style={styles.dateBtn}
                textStyle={styles.dateBtnText}
              />
            </View>

            <TextInput
                value={formatDisplayDateFromDDMM(draftDateDDMM, Date.now())}
                onChangeText={(v) => {
                  const digits = String(v || "").replace(/[^0-9]/g, "").slice(0, 4);
                  setDraftDateDDMM(digits);
                  // typing implies custom date
                  if (digits.length) {
                    setDraftDateMode("custom");
                    setDraftCalendarTs(null);
                  }
                }}
                placeholder={tr("tasks.datePlaceholder", "DDMM")}
                placeholderTextColor={theme.colors.muted}
                autoCapitalize="none"
                keyboardType="number-pad"
                maxLength={10}
                style={[styles.input, { fontSize: 14, fontWeight: "800", paddingVertical: 10, marginTop: 10 }]}
              />

            <TextInput
              value={formatTimeMasked(draftTimeDigits)}
              onChangeText={(txt) => setDraftTimeDigits(digitsOnly(txt))}
              placeholder={tr("tasks.timePlaceholder", "Type (HHMM) e.g. 16:30")}
              placeholderTextColor={theme.colors.muted}
              keyboardType="number-pad"
              style={[styles.input, { fontSize: 14, fontWeight: "800", paddingVertical: 10 }]}
            />

            <Pressable
              onPress={() => setRepeatOpen((x) => !x)}
              style={{
                marginTop: 12,
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.card,
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "800", color: theme.colors.muted }}>
                {tr("tasks.repeat.label", "Repeat")}
              </Text>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1, justifyContent: "flex-end" }}>
                <Text style={{ fontSize: 15, fontWeight: "900", color: theme.colors.text }} numberOfLines={1}>
                  {draftRepeatDays ? `${draftRepeatDays} ${tr("tasks.repeat.days", "days")}${draftAutoComplete ? ` • ${tr("tasks.repeat.auto", "Auto")}` : ""}` : tr("tasks.repeat.none", "Off")}
                </Text>
                <Ionicons name={repeatOpen ? "chevron-down" : "chevron-forward"} size={18} color={theme.colors.muted} />
              </View>
            </Pressable>

            {repeatOpen ? (
              <View style={{ marginTop: 10 }}>
                <TextInput
                  value={draftRepeatDays}
                  onChangeText={(v) => setDraftRepeatDays(String(v || "").replace(/[^0-9]/g, "").slice(0, 3))}
                  placeholder={tr("tasks.repeatEveryPlaceholder", "Repeat every ___ days (numbers only)")}
                  placeholderTextColor={theme.colors.muted}
                  keyboardType="number-pad"
                  style={[styles.input, { marginTop: 10, fontSize: 14, fontWeight: "900", paddingVertical: 10 }]}
                />

                {isParent && draftRepeatDays ? (
                  <View style={{ marginTop: 10 }}>
                    <Button
                      title={
                        draftAutoComplete
                          ? tr("tasks.repeat.autoOn", "Auto (no approval): ON")
                          : tr("tasks.repeat.autoOff", "Auto (no approval): OFF")
                      }
                      variant={draftAutoComplete ? "primary" : "secondary"}
                      onPress={() => setDraftAutoComplete((x) => !x)}
                      style={{ height: 38, borderRadius: 12 }}
                      textStyle={{ fontSize: 12, fontWeight: "800" }}
                    />
                    <Text style={{ marginTop: 6, color: theme.colors.muted, fontWeight: "700", fontSize: 12 }}>
                      {tr(
                        "tasks.repeat.autoHint",
                        "Auto: one tap 'Done' will move the next due date automatically (great for trash pickup)."
                      )}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}


            {isParent ? (
              <Pressable
                onPress={() => {
                  // ✅ zatvori kalendar prije otvaranja assignee-a
                  setCalendarOpen(false);
                  setAssigneeOpen(true);
                }}
                style={styles.assigneeRow}
              >
                <Text style={styles.assigneeLabel} numberOfLines={1}>
                  {tr("tasks.assignTo", "Assign to")}
                </Text>

                <View style={styles.assigneeRight}>
                  <Text style={styles.assigneeValue} numberOfLines={1} ellipsizeMode="tail">
                    {draftAssigneeName ? String(draftAssigneeName) : tr("tasks.assign.none", "Not assigned")}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} />
                </View>
              </Pressable>
            ) : null}</ScrollView>


            <View style={{ flexDirection: "row", gap: 10, marginTop: 12, justifyContent: "flex-end" }}>
              <Button
                title={tr("common.cancel", "Cancel")}
                variant="secondary"
                onPress={() => {
                  setEditOpen(false);
                  setAssigneeOpen(false);
                  setCalendarOpen(false);
                }}
                style={{ height: 36, paddingHorizontal: 14, borderRadius: 12 }}
                textStyle={{ fontSize: 12, fontWeight: "800" }}
              />
              <Button
                title={tr("common.save", "Save")}
                onPress={onSave}
                style={{ height: 36, paddingHorizontal: 14, borderRadius: 12 }}
                textStyle={{ fontSize: 12, fontWeight: "800" }}
              />
            </View>
          </Card>
        </BottomSheet>

        <BottomSheet visible={assigneeOpen} onClose={() => setAssigneeOpen(false)}>
          <Card>
            <Text style={{ fontSize: 18, fontWeight: "900", color: theme.colors.text }}>
              {tr("tasks.assignTo", "Assign to")}
            </Text>

            <View style={{ marginTop: 12, gap: 10 }}>
              <Button
                title={tr("tasks.assign.none", "Not assigned")}
                variant="secondary"
                onPress={() => {
                  setDraftAssigneeId(null);
                  setDraftAssigneeName(null);
                  setAssigneeOpen(false);
                }}
              />

              {(Array.isArray(members) ? members : [])
                .filter((m: any) => String(m?.id ?? "") !== "")
                .map((m: any) => (
                  <Button
                    key={String(m.id)}
                    title={String(m.name ?? "")}
                    variant={String(draftAssigneeId) === String(m.id) ? "primary" : "secondary"}
                    onPress={() => {
                      setDraftAssigneeId(String(m.id));
                      setDraftAssigneeName(String(m.name ?? ""));
                      setAssigneeOpen(false);
                    }}
                  />
                ))}

              <Button title={tr("common.cancel", "Cancel")} variant="secondary" onPress={() => setAssigneeOpen(false)} />
            </View>
          </Card>
        </BottomSheet>

        <BottomSheet visible={calendarOpen} onClose={() => setCalendarOpen(false)}>
          <Card>
            <Text style={{ fontSize: 18, fontWeight: "900", color: theme.colors.text }}>
              {tr("tasks.calendar", "Calendar")}
            </Text>

            <View style={{ marginTop: 12 }}>
              {DateTimePicker ? (
                <>
                  {Platform.OS === "ios" ? (
                    <>
                      <View style={{ marginBottom: 12 }}>
                        <DateTimePicker
                          value={calendarTemp}
                          mode="date"
                          display="spinner"
                          onChange={(_: any, d: any) => {
                            if (d) setCalendarTemp(new Date(d));
                          }}
                        />
                      </View>

                      <View style={{ flexDirection: "row", gap: 10 }}>
                        <Button
                          title={tr("common.cancel", "Cancel")}
                          variant="secondary"
                          onPress={() => setCalendarOpen(false)}
                          style={{ flex: 1 }}
                        />
                        <Button
                          title={tr("common.save", "Save")}
                          onPress={() => {
                            const ts0 = startOfDay(calendarTemp.getTime());
                            setDraftCalendarTs(ts0);
                            setDraftDateMode("calendar");
                            setDraftDateDDMM(ddmmFromTs(ts0));
                            setCalendarOpen(false);
                          }}
                          style={{ flex: 1 }}
                        />
                      </View>
                    </>
                  ) : (
                    <DateTimePicker
                      value={calendarTemp}
                      mode="date"
                      display="default"
                      onChange={(e: any, d: any) => {
                        if (e?.type === "dismissed") {
                          setCalendarOpen(false);
                          return;
                        }
                        const picked = d ? new Date(d) : calendarTemp;
                        const ts0 = startOfDay(picked.getTime());
                        setDraftCalendarTs(ts0);
                        setDraftDateMode("calendar");
                        setDraftDateDDMM(ddmmFromTs(ts0));
                        setCalendarOpen(false);
                      }}
                    />
                  )}
                </>
              ) : (
                <>
                  <Text style={{ color: theme.colors.muted, fontWeight: "700" }}>
                    {tr("tasks.calendarMissing", "Calendar picker not installed. Enter DDMM; calendar is optional.")}
                  </Text>

                  <TextInput
                    value={formatDisplayDateFromDDMM(draftDateDDMM, Date.now())}
                    onChangeText={(v) => {
                      const digits = String(v || "").replace(/[^0-9]/g, "").slice(0, 4);
                      setDraftDateDDMM(digits);
                    }}
                    placeholder={tr("tasks.datePlaceholder", "DDMM")}
                    placeholderTextColor={theme.colors.muted}
                    keyboardType="number-pad"
                    style={[styles.input, { marginTop: 10, fontSize: 16, fontWeight: "800" }]}
                  />

                  <Button
                    title={tr("common.save", "Save")}
                    onPress={() => {
                      const ts0 = tsFromDDMM(draftDateDDMM, Date.now());
                      if (!ts0) {
                        Alert.alert(tr("common.error", "Error"), tr("tasks.dateInvalid", "Date must be DDMM (e.g. 2503)."));
                        return;
                      }
                      setDraftCalendarTs(ts0);
                      setDraftDateMode("calendar");
                      setCalendarOpen(false);
                    }}
                    style={{ marginTop: 10 }}
                  />
                </>
              )}
            </View>
          </Card>
        </BottomSheet>
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
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: theme.colors.text,
    letterSpacing: 0.2,
  },
  heroSub: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.muted,
  },

  menuRow: {
    marginTop: 6,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  menuPill: {
    flexGrow: 1,
    flexBasis: "48%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f8fafc",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      android: { elevation: 1 },
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.03,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      default: {},
    }),
  },
  menuPillActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  menuBig: {
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
    color: theme.colors.text,
  },
  menuSmall: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    color: theme.colors.muted,
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
    // Pull to the very left edge of the card (taskCard has padding: 12)
    marginLeft: -12,
    marginRight: 12,
    // Not full height: leave top/bottom breathing room
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
    alignSelf: "flex-start",
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

  dateButtonsRow: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dateBtn: {
    flexGrow: 1,
    flexBasis: "31%",
    height: 36,
    borderRadius: 12,
    paddingHorizontal: 0,
  },
  dateBtnText: {
    fontSize: 12,
    fontWeight: "800",
  },

  assigneeRow: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  assigneeLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: theme.colors.muted,
    marginRight: 10,
  },
  assigneeRight: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  assigneeValue: {
    fontSize: 15,
    fontWeight: "900",
    color: theme.colors.text,
    maxWidth: "85%",
  },
  assigneeChevron: {
    marginLeft: 10,
    fontSize: 22,
    lineHeight: 22,
    fontWeight: "900",
    color: theme.colors.muted,
  },

  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheetWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 14,
  },
  sheetInner: {
    width: "100%",
  },

  input: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.input,
    padding: 12,
    backgroundColor: "#fff",
    color: theme.colors.text,
  },
};
