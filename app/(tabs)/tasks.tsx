// /app/(tabs)/tasks.tsx
import React, { useMemo, useState, useEffect } from "react";
import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  Image,
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

const TASKS_HEADER_IMG = require("../../assets/avatars/stats/header-tasks.png");


// Optional native date picker (if installed)
let DateTimePicker: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  DateTimePicker = require("@react-native-community/datetimepicker").default;
} catch {
  DateTimePicker = null;
}

// Optional gradient (if installed)
let LinearGradient: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  LinearGradient = require("expo-linear-gradient").LinearGradient;
} catch {
  LinearGradient = null;
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
  // We currently don't expose auto-complete without approval in UI (user requested to remove it).
  // Keep the schema stable, but always store autoComplete=false.
  return JSON.stringify({ preset: "interval", days: Math.floor(d), autoComplete: false });
}

function BottomSheet(props: { visible: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <Modal visible={props.visible} transparent animationType="slide" onRequestClose={props.onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.sheetBackdrop} onPress={props.onClose} />

        <KeyboardAvoidingView
          // In standalone Android builds the window may not resize like Expo Go,
          // so we must lift the sheet ourselves on BOTH platforms.
          behavior={Platform.OS === "ios" ? "padding" : "padding"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
          style={styles.sheetWrap}
        >
          <View style={styles.sheetInner}>{props.children}</View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
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
    setAssignee,
    acceptTask,
    rejectTask,
    completeAuto,
  } = useTasks() as any;

  const { ready: membersReady, myId, me, isParent, members } = useMembers() as any;
  const myName = String(me?.name ?? tr("common.me", "Me"));

  const [filter, setFilter] = useState<"all" | "active" | "done">("all");
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

  // ✅ reminder offset (minutes before dueAt)
  const [draftReminderOffset, setDraftReminderOffset] = useState<null | 15 | 30 | 60>(null);

  // ✅ repeat (interval days) + auto-complete (no approval)
  const [draftRepeatDays, setDraftRepeatDays] = useState<string>("");
  const [repeatEnabled, setRepeatEnabled] = useState<boolean>(false);

  // ✅ assign (family member)
  const [draftAssigneeId, setDraftAssigneeId] = useState<string | null>(null);
  const [draftAssigneeName, setDraftAssigneeName] = useState<string | null>(null);
  const [assigneeOpen, setAssigneeOpen] = useState(false);

  // Track keyboard height so the assignee modal can sit ABOVE the keyboard.
  const [kbH, setKbH] = useState(0);
  useEffect(() => {
    const onShow = (e: any) => setKbH(Number(e?.endCoordinates?.height ?? 0));
    const onHide = () => setKbH(0);
    const s1 = Keyboard.addListener("keyboardDidShow", onShow);
    const s2 = Keyboard.addListener("keyboardDidHide", onHide);
    return () => {
      // @ts-ignore
      s1?.remove?.();
      // @ts-ignore
      s2?.remove?.();
    };
  }, []);

  const [selected, setSelected] = useState<Task | null>(null);

  // ✅ prevent double taps on action buttons
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const list: Task[] = Array.isArray(tasks) ? tasks : [];
    let out = list;
    if (filter === "active") out = out.filter((x) => x.status !== "done");
        if (filter === "done") out = out.filter((x) => x.status === "done");
    return out;
  }, [tasks, filter]);

  const menuCounts = useMemo(() => {
    const list: Task[] = Array.isArray(tasks) ? tasks : [];
    const all = list.length;
    const done = list.filter((x) => x.status === "done").length;
    const active = list.filter((x) => x.status !== "done").length;
    return { all, active, done };
  }, [tasks]);

  function openNew() {
    setSelected(null);
    setDraftTitle("");
    setDraftDateMode("today");
    const today0 = startOfDay(Date.now());
    setDraftDateDDMM(ddmmFromTs(today0));
    setDraftCalendarTs(today0);
    setDraftTimeDigits("");
    setDraftReminderOffset(null);
    setDraftAssigneeId(null);
    setDraftAssigneeName(null);
    setDraftRepeatDays("");
    setRepeatEnabled(false);
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
        const today0b = startOfDay(Date.now());
        setDraftDateDDMM(ddmmFromTs(today0b));
        setDraftCalendarTs(today0b);
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
      const today0b = startOfDay(Date.now());
      setDraftDateDDMM(ddmmFromTs(today0b));
      setDraftCalendarTs(today0b);
      setDraftTimeDigits("");
      setDraftReminderOffset(null);
    }

    // reminder (minutes before dueAt)
    const ro = Number((task as any)?.reminderOffsetMinutes ?? (task as any)?.reminder_offset_minutes ?? NaN);
    if (ro === 15 || ro === 30 || ro === 60) setDraftReminderOffset(ro as any);
    else setDraftReminderOffset(null);

    setDraftAssigneeId((task as any)?.assignedToId ?? null);
    setDraftAssigneeName((task as any)?.assignedToName ?? null);

    const rr = parseRepeatRule((task as any)?.repeatRule ?? null);
    setDraftRepeatDays(rr.days ? String(rr.days) : "");
    setRepeatEnabled(!!rr.days);

    setEditOpen(true);
  }

  async function onSave() {
    const title = String(draftTitle ?? "").trim();
    if (!title) {
      Alert.alert(tr("common.error", "Error"), tr("tasks.titleRequired", "Title is required."));
      return;
    }

    let dueAt: number | null = null;
    const reminderOffsetMinutes: null | 15 | 30 | 60 = digitsOnly(draftTimeDigits) ? (draftReminderOffset as any) : null;

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
        Alert.alert(tr("common.error", "Error"), tr("tasks.timeInvalid", "Time must be HH:MM (e.g. 16:30)."));
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

        const repeatRule = repeatEnabled ? buildRepeatRule(draftRepeatDays, false) : null;
        await updateTask(selected.id, { title, dueAt, repeatRule, reminderOffsetMinutes });

        // ✅ assignment change
        if (isParent && (prevAId !== aId || String(prevAName ?? "") !== String(aName ?? ""))) {
          await setAssignee?.(selected.id, aId, aName);
        }
      } else {
        const repeatRule = repeatEnabled ? buildRepeatRule(draftRepeatDays, false) : null;
        // Allow ALL family members (including kids) to assign tasks.
        // Backend/RLS now enforces that assignee must be in the same family.
        await addTask(title, { dueAt, repeatRule, reminderOffsetMinutes, assignedToId: aId, assignedToName: aName });
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

  function getStatusBarStyle(status: string, isLate: boolean) {
    // Late overrides (unless done)
    if (isLate && status !== "done") return { backgroundColor: theme.colors.danger };
    if (status === "done") return { backgroundColor: "#22c55e" };
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

    const isUnassigned = !Boolean((item as any)?.assignedToId);
    const isAssignee = Boolean(myId && (item as any)?.assignedToId && String((item as any).assignedToId) === String(myId));

    const rr = parseRepeatRule((item as any)?.repeatRule ?? null);
    const isAuto = !!rr.days && rr.autoComplete === true;
    const canAutoDone = isAuto && status !== "done";

    const canAcceptReject = status === "open" && isAssignee;
    const busy = actionBusyId === item.id;
    const canTake = status === "open" && isUnassigned && !!myId;

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
                    {dueAt
                      ? isAuto
                        ? `${tr("tasks.nextDue", "Next due")}: ${dueText}`
                        : `${isLate ? "⚠️ " : ""}⏰ ${dueText}`
                      : tr("tasks.due.none", "No due time")}
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

                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText}>
                    {status === "done" ? tr("tasks.badge.done", "Done") : tr("tasks.badge.open", "Open")}
                  </Text>
                </View>
              </View>

              {(canAutoDone || canTake || canAcceptReject) ? (
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

                  {canAcceptReject ? (
                    <>
                      <Button
                        title={tr("tasks.action.accept", "Accept")}
                        onPress={() => {
                          runAction(item, async () => {
                            await acceptTask?.(item.id);
                          });
                        }}
                        style={styles.actionBtn}
                        disabled={busy}
                      />
                      <Button
                        title={tr("tasks.action.reject", "Reject")}
                        variant="secondary"
                        onPress={() => {
                          runAction(item, async () => {
                            await rejectTask?.(item.id);
                          });
                        }}
                        style={styles.actionBtn}
                        disabled={busy}
                      />
                    </>
                  ) : null}

                  {canTake ? (
                    <Button
                      title={tr("tasks.action.take", "Take")}
                      onPress={() => {
                        if (!myId) {
                          Alert.alert(tr("common.error", "Error"), tr("auth.missingUid", "You are not signed in (member id missing)."));
                          return;
                        }
                        runAction(item, async () => {
                          await setAssignee?.(item.id, myId, myName);
                        });
                      }}
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
            {/* Header card (Title + subtitle + +New) */}
            <View style={styles.headerOuter}>
              <View style={styles.headerClip}>
                {LinearGradient ? (
                  <LinearGradient
                    pointerEvents="none"
                    colors={["rgba(255,255,255,0.98)", "rgba(235,244,255,0.96)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.heroGradientFill}
                  />
                ) : (
                  <View pointerEvents="none" style={styles.heroGradientFillFallback} />
                )}

                <View style={styles.heroTopRow}>
                  <View style={styles.heroLeft}>
                    <Text style={styles.heroTitle}>{tr("tasks.title", "Tasks")}</Text>
                    <Text style={styles.heroSub}>{tr("tasks.heroSub", "Quick filters and overview")}</Text>

                    <View style={{ height: 10 }} />
                  </View>
                </View>

                <View style={styles.heroAccentBg}>
                  <View style={styles.heroAccent} />
                </View>
              </View>

              <Image source={TASKS_HEADER_IMG} style={styles.heroArt} resizeMode="contain" />

            </View>

            {/* Separate stats card (All/Active/Needs approval/Done) */}
            <View style={{ height: 12 }} />
            <View style={styles.statsOuter}>
              <View style={styles.statsClip}>
              {LinearGradient ? (
                <LinearGradient
                  pointerEvents="none"
                  colors={["rgba(255,255,255,0.96)", "rgba(240,247,255,0.95)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.heroGradientFill}
                />
              ) : (
                <View pointerEvents="none" style={styles.heroGradientFillFallback} />
              )}

              <View style={styles.statsPanel}>
                <View style={styles.statsGrid}>
                  <MenuPill big={String(menuCounts.all)} small={tr("tasks.filter.all", "All")} active={filter === "all"} onPress={() => setFilter("all")} />
                  <MenuPill big={String(menuCounts.active)} small={tr("tasks.filter.active", "Active")} active={filter === "active"} onPress={() => setFilter("active")} />
                  <MenuPill big={String(menuCounts.done)} small={tr("tasks.filter.done", "Done")} active={filter === "done"} onPress={() => setFilter("done")} />
                </View>
              </View>

              <View style={styles.heroAccentBg}>
                <View style={styles.heroAccent} />
              </View>
            </View>
            </View>

            {/* + New button (between filters and list) */}
            <View style={styles.newTaskWrapper}>
              <Button
                title={tr("tasks.newBtn", "+ New")}
                onPress={openNew}
                style={styles.newTaskBtn}
                textStyle={styles.newTaskBtnText}
              />
            </View>

          <View style={{ paddingHorizontal: 0 }}>
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
          </View>
        </ScrollView>

        <BottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)}>
          <Card>
            <Text style={{ fontSize: 16, fontWeight: "900", color: PALETTE.text }}>
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
            <Text style={{ fontSize: 18, fontWeight: "900", color: PALETTE.text }}>
              {selected ? tr("tasks.editTitle", "Edit task") : ""}
            </Text>
            <ScrollView style={{ maxHeight: 620 }} contentContainerStyle={{ paddingBottom: 36 }} keyboardShouldPersistTaps="always">
              {!selected ? (
                <Text style={{ marginTop: 2, fontSize: 13, fontWeight: "800", color: PALETTE.muted }}>
                  {tr("tasks.new.title", "Create a new task for a family member")}
                </Text>
              ) : null}

              <TextInput
                value={draftTitle}
                onChangeText={setDraftTitle}
                placeholder={tr("tasks.new.placeholder.title", "e.g. Take Luka to soccer practice")}
                placeholderTextColor={theme.colors.muted}
                autoCapitalize="sentences"
                style={[styles.input, { fontSize: 14, fontWeight: "800", paddingVertical: 10 }]}
              />

              <View style={{ marginTop: 12 }}>
                <Text style={{ fontSize: 13, fontWeight: "800", color: PALETTE.muted }}>{tr("tasks.when", "When?")}</Text>
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
                value={formatDisplayDateFromDDMM(draftDateDDMM)}
                onChangeText={(v) => {
                  const digits = String(v || "").replace(/[^0-9]/g, "").slice(0, 4);
                  setDraftDateDDMM(digits);
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
                placeholder={tr("tasks.new.placeholder.time", "e.g. 16:30")}
                placeholderTextColor={theme.colors.muted}
                keyboardType="number-pad"
                style={[styles.input, { fontSize: 14, fontWeight: "800", paddingVertical: 10 }]}
              />

              {/* Reminder (minutes before due time) */}
              <View style={{ marginTop: 10 }}>
                <Text style={{ fontSize: 12, fontWeight: "800", color: PALETTE.muted }}>{tr("tasks.reminder.label", "Reminder")}</Text>

                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                  <Button
                    title={tr("common.off", "OFF")}
                    variant={draftReminderOffset === null ? "primary" : "secondary"}
                    onPress={() => setDraftReminderOffset(null)}
                    style={{ height: 30, paddingHorizontal: 12, borderRadius: 10 }}
                    textStyle={{ fontSize: 12, fontWeight: "800" }}
                  />

                  {[15, 30, 60].map((m) => (
                    <Button
                      key={m}
                      title={`${m}m`}
                      variant={draftReminderOffset === (m as any) ? "primary" : "secondary"}
                      onPress={() => setDraftReminderOffset(m as any)}
                      style={{ height: 30, paddingHorizontal: 12, borderRadius: 10 }}
                      textStyle={{ fontSize: 12, fontWeight: "800" }}
                    />
                  ))}
                </View>

                {!digitsOnly(draftTimeDigits) && draftReminderOffset ? (
                  <Text style={{ marginTop: 6, fontSize: 12, fontWeight: "800", color: PALETTE.muted }}>
                    {tr("tasks.reminder.requiresTime", "Set a time to enable reminders.")}
                  </Text>
                ) : null}
              </View>

              {/* Repeat (interval days) */}
              <View style={{ marginTop: 12 }}>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.card,
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ fontSize: 13, fontWeight: "800", color: PALETTE.muted }}>{tr("tasks.new.repeatEveryDays", "Repeat every")}</Text>

                    <TextInput
                      value={repeatEnabled ? draftRepeatDays : ""}
                      onChangeText={(v) => {
                        const digits = String(v || "").replace(/[^0-9]/g, "").slice(0, 3);
                        setDraftRepeatDays(digits);
                        setRepeatEnabled(!!digits);
                      }}
                      placeholder={tr("tasks.repeatDaysPlaceholder", "___")}
                      placeholderTextColor={theme.colors.muted}
                      keyboardType="number-pad"
                      maxLength={3}
                      style={{
                        marginLeft: 10,
                        marginRight: 10,
                        width: 54,
                        textAlign: "center",
                        paddingVertical: 6,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: "900",
                        color: PALETTE.text,
                        backgroundColor: theme.colors.background,
                      }}
                    />

                    <Text style={{ fontSize: 13, fontWeight: "800", color: PALETTE.muted, marginRight: 10 }}>{tr("tasks.repeat.days", "days")}</Text>

                    <View style={{ flex: 1 }} />

                    <Text style={{ fontSize: 13, fontWeight: "800", color: PALETTE.muted, marginRight: 8 }}>
                      {repeatEnabled ? tr("common.on", "On") : tr("common.off", "Off")}
                    </Text>
                    <Switch
                      value={repeatEnabled}
                      onValueChange={(v) => {
                        setRepeatEnabled(!!v);
                        if (!v) {
                          setDraftRepeatDays("");
                        } else {
                          if (!draftRepeatDays) setDraftRepeatDays("7");
                        }
                      }}
                    />
                  </View>
                </View>
              </View>

              {/* Assignee picker overlay modal */}
              {assigneeOpen ? (
                <Modal visible transparent animationType="fade" onRequestClose={() => setAssigneeOpen(false)}>
                  <Pressable style={styles.dropdownBackdrop} onPress={() => setAssigneeOpen(false)} />
                  <View style={[styles.dropdownPanel, { bottom: Math.max(16, kbH + 16) }]}>
                    <View style={styles.assigneePickerHeader}>
                      <Text style={styles.assigneePickerTitle}>{tr("tasks.new.assignTo", "Who should do this?")}</Text>
                      <Pressable onPress={() => setAssigneeOpen(false)} hitSlop={12} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, padding: 4 })}>
                        <Ionicons name="close" size={18} color={theme.colors.muted} />
                      </Pressable>
                    </View>

                    <ScrollView style={{ maxHeight: 320 }} contentContainerStyle={{ gap: 10, paddingBottom: 6 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator>
                      <Button
                        title={tr("tasks.assign.clear", "Clear selection")}
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
                    </ScrollView>
                  </View>
                </Modal>
              ) : null}

              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  setCalendarOpen(false);
                  setAssigneeOpen((v) => !v);
                }}
                style={styles.assigneeRow}
              >
                <Text style={styles.assigneeLabel} numberOfLines={1}>
                  {tr("tasks.new.assignTo", "Who should do this?")}
                </Text>

                <View style={styles.assigneeRight}>
                  <Text style={styles.assigneeValue} numberOfLines={1} ellipsizeMode="tail">
                    {draftAssigneeName ? String(draftAssigneeName) : tr("tasks.assign.selectCta", "Select")}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} />
                </View>
              </Pressable>
            </ScrollView>

            <View
              style={{
                flexDirection: "row",
                gap: 10,
                marginTop: -45,
                justifyContent: "flex-end",
                paddingTop: Platform.OS === "android" ? 60 : 10,
                paddingHorizontal: 14,
                paddingBottom: Platform.OS === "android" ? 10 : 10,
              }}
            >
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

        <BottomSheet visible={calendarOpen} onClose={() => setCalendarOpen(false)}>
          <Card>
            <Text style={{ fontSize: 18, fontWeight: "900", color: PALETTE.text }}>{tr("tasks.calendar", "Calendar")}</Text>

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
                        <Button title={tr("common.cancel", "Cancel")} variant="secondary" onPress={() => setCalendarOpen(false)} style={{ flex: 1 }} />
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
                  <Text style={{ color: PALETTE.muted, fontWeight: "700" }}>
                    {tr("tasks.calendarMissing", "Calendar picker not installed. Enter DDMM; calendar is optional.")}
                  </Text>

                  <TextInput
                    value={formatDisplayDateFromDDMM(draftDateDDMM)}
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

const FONT = {
  title: (theme as any)?.fonts?.title ?? (Platform.OS === "ios" ? "AvenirNext-Heavy" : "sans-serif"),
  body: (theme as any)?.fonts?.body ?? (Platform.OS === "ios" ? "AvenirNext-Regular" : "sans-serif"),
};

const PALETTE = {
  text: "#0B1220",
  muted: "#667085",
  primary: "#2F6BFF",
  card: "rgba(255,255,255,0.94)",
  cardSoft: "rgba(242,248,255,0.92)",
  border: "rgba(140,160,190,0.18)",
  borderBlue: "rgba(47,107,255,0.30)",
};

const FROST = {
  bg: PALETTE.card,
  bgStrong: "rgba(255,255,255,0.96)",
  border: "rgba(255,255,255,0.95)",
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
  // Promo-like frosted cards
  heroCard: {
    borderWidth: 1,
    borderColor: FROST.borderSoft,
    backgroundColor: FROST.bg,
    borderRadius: 26,
    padding: 16,
    overflow: "hidden",
    ...FROST.shadow,
  },

  // Split: header card and stats card
  headerOuter: {
    width: "100%",
    alignSelf: "stretch",
    borderWidth: 1,
    borderColor: FROST.borderSoft,
    backgroundColor: FROST.bgStrong,
    borderRadius: 26,
    overflow: "visible",
    ...FROST.shadow,
  },
  headerClip: {
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: FROST.bgStrong,
    padding: 16,
  },
  statsOuter: {
    width: "100%",
    alignSelf: "stretch",
    borderWidth: 1,
    borderColor: FROST.borderSoft,
    backgroundColor: FROST.bg,
    borderRadius: 26,
    overflow: "visible",
    ...FROST.shadow,
  },
  statsClip: {
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: FROST.bg,
    padding: 14,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  heroLeft: { flex: 1, minWidth: 0, paddingRight: 150 },
  heroArt: {
    position: "absolute",
    right: 16,
    top: -20,
    width: 110,
    height: 110,
    pointerEvents: "none",
  },

  newTaskWrapper: {
    marginTop: 10,
    paddingHorizontal: 2,
    marginBottom: 10,
  },
  newTaskBtn: {
    height: 44,
    borderRadius: 18,
    paddingHorizontal: 16,
    alignSelf: "flex-end",
  },
  newTaskBtnText: {
    fontSize: 15,
    fontWeight: "900",
  },

  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    fontFamily: FONT.title,
    color: PALETTE.text,
    letterSpacing: -0.7,
  },
  heroSub: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "800",
    fontFamily: FONT.body,
    color: "#556377",
  },

  statsPanel: {
    padding: 10,
  },

statsGrid: {
  flexDirection: "row",
  flexWrap: "nowrap",        // ⬅️ VAŽNO: jedan red
  justifyContent: "space-between",
  gap: 8,
},

menuPill: {
  flex: 1,                   // ⬅️ sve tri dijele širinu
  maxWidth: "32%",           // ⬅️ 3 u jedan red
  borderWidth: 1,
  borderColor: FROST.borderSoft,
  backgroundColor: "#ffffff",
  borderRadius: 16,
  paddingVertical: 8,        // ⬅️ malo niže
  paddingHorizontal: 6,
  alignItems: "center",
  justifyContent: "center",
},

  menuPillActive: {
    backgroundColor: "rgba(47,107,255,0.10)",
    borderColor: PALETTE.borderBlue,
  },
  menuBig: {
    fontSize: 18,
    fontWeight: "800",
    fontFamily: FONT.title,
    textAlign: "center",
    color: PALETTE.text,
  },
  menuSmall: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
    fontFamily: FONT.body,
    textAlign: "center",
    color: PALETTE.muted,
  },

  heroAccentBg: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 6,
    backgroundColor: "rgba(210,225,255,0.55)",
  },
  heroAccent: {
    height: 6,
    width: "52%",
    borderTopRightRadius: 999,
    borderBottomRightRadius: 999,
    backgroundColor: PALETTE.primary,
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
    fontFamily: FONT.title,
    color: PALETTE.text,
  },
  taskMeta: {
    color: PALETTE.muted,
    fontWeight: "700",
    fontSize: 12,
    fontFamily: FONT.body,
  },

  statusPill: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: "rgba(47,107,255,0.10)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "900",
    color: PALETTE.primary,
    fontFamily: FONT.body,
  },

  // Timeline (replaces the status badge)
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

  actionsRow: {
    marginTop: 12,
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
    fontSize: 13,
    fontWeight: "700",
    fontFamily: FONT.body,
  },

  assigneeRow: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: FROST.borderSoft,
    backgroundColor: FROST.bg,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  assigneePicker: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: FROST.borderSoft,
    backgroundColor: FROST.bg,
    borderRadius: 16,
    padding: 12,
  },
  assigneePickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  assigneePickerTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: PALETTE.text,
  },
  assigneeLabel: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: FONT.body,
    color: PALETTE.muted,
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
    color: PALETTE.text,
    maxWidth: "85%",
  },
  assigneeChevron: {
    marginLeft: 10,
    fontSize: 22,
    lineHeight: 22,
    fontWeight: "900",
    color: PALETTE.muted,
  },

  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,23,42,0.35)",
  },

  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },

  dropdownBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15,23,42,0.18)",
  },
  dropdownPanel: {
    position: "absolute",
    left: 14,
    right: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: FROST.borderSoft,
    backgroundColor: FROST.bg,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 22,
  },
  sheetWrap: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 14,
  },
  sheetInner: {
    width: "100%",
  },

  input: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: FROST.borderSoft,
    borderRadius: 16,
    padding: 12,
    backgroundColor: FROST.bgStrong,
    color: PALETTE.text,
  },
};