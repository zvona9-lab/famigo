// app/(tabs)/planner.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  RefreshControl,
  StyleSheet,
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
import { FONT, LETTER_SPACING } from "../../lib/typography";

import { useT } from "../../lib/useT";
import { useMembers } from "../../lib/members";
import { useLocale } from "../../lib/locale";
import { supabase } from "../../lib/supabase";

// Reuse an existing header illustration you already have in assets.
// (You can later replace it with a dedicated header-planner.png if you want.)
const PLANNER_HEADER_IMG = require("../../assets/avatars/stats/planner.png");

// Optional Calendar component (if installed)
let Calendar: any = null;
let LocaleConfig: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const cal = require("react-native-calendars");
  Calendar = cal.Calendar;
  LocaleConfig = cal.LocaleConfig;
} catch {
  Calendar = null;
  LocaleConfig = null;
}

// Optional AsyncStorage (if installed) – Planner will still work without persistence.
let AsyncStorage: any = null;
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

function pad2(n: number) {
  return String(n).padStart(2, "0");
}


function timeValueToDigits(v: any): string {
  if (!v) return "";
  const s = String(v);

  // ISO datetime like 2026-01-29T11:00:00.000Z
  const isoTimeMatch = s.match(/T(\d{2}):(\d{2})/);
  if (isoTimeMatch) return `${isoTimeMatch[1]}${isoTimeMatch[2]}`;

  // time strings like 11:00 or 11:00:00
  const hmMatch = s.match(/^(\d{1,2}):(\d{2})/);
  if (hmMatch) {
    const hh = pad2(hmMatch[1]);
    const mm = pad2(hmMatch[2]);
    return `${hh}${mm}`;
  }

  // fallback: strip to digits, but keep only HHMM if longer (e.g. 110000 -> 1100)
  const d = digitsOnly(s);
  if (d.length >= 4) return d.slice(0, 4);
  return d;
}

function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function toYMD(ts0: number) {
  const d = new Date(ts0);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function fromYMD(ymd: string) {
  const [y, m, d] = String(ymd).split("-").map((x) => Number(x));
  const dt = new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
  return dt.getTime();
}


function toBcp47Locale(appLocale?: string) {
  const l = String(appLocale || "").trim().toLowerCase();
  if (!l) return "en-GB";
  // Your app uses short locale codes (en, hr, de, fr, it, es, sl, sr)
  if (l === "hr") return "hr-HR";
  if (l === "en") return "en-GB";
  if (l === "de") return "de-DE";
  if (l === "fr") return "fr-FR";
  if (l === "it") return "it-IT";
  if (l === "es") return "es-ES";
  if (l === "sl") return "sl-SI";
  if (l === "sr") return "sr-RS";
  // Fallback: try to use it as-is
  return appLocale as string;
}

function buildCalendarLocale(bcp47: string) {
  const fmtMonthLong = new Intl.DateTimeFormat(bcp47, { month: "long" });
  const fmtMonthShort = new Intl.DateTimeFormat(bcp47, { month: "short" });
  const fmtWeekdayLong = new Intl.DateTimeFormat(bcp47, { weekday: "long" });
  const fmtWeekdayShort = new Intl.DateTimeFormat(bcp47, { weekday: "short" });

  // 2024-01-01 is Monday; react-native-calendars expects Sunday-first arrays.
  const baseSun = new Date(2023, 11, 31); // Sunday
  const dayNames = Array.from({ length: 7 }, (_, i) => fmtWeekdayLong.format(new Date(baseSun.getFullYear(), baseSun.getMonth(), baseSun.getDate() + i)));
  const dayNamesShort = Array.from({ length: 7 }, (_, i) => fmtWeekdayShort.format(new Date(baseSun.getFullYear(), baseSun.getMonth(), baseSun.getDate() + i)));
  const dayNamesMin = dayNamesShort.map((s) => String(s).slice(0, 2));

  const monthNames = Array.from({ length: 12 }, (_, i) => fmtMonthLong.format(new Date(2024, i, 1)));
  const monthNamesShort = Array.from({ length: 12 }, (_, i) => fmtMonthShort.format(new Date(2024, i, 1)));

  return { monthNames, monthNamesShort, dayNames, dayNamesShort, dayNamesMin };
}

function fmtDayLabel(ts0: number, locale: string) {
  const loc = toBcp47Locale(locale);
  const d = new Date(ts0);
  try {
    return d.toLocaleDateString(loc, { weekday: "short", day: "2-digit", month: "2-digit" });
  } catch {
    return d.toDateString();
  }
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


function hmToTimeString(digits: string): string | null {
  const hm = parseDigitsToHM(digits);
  if (!hm) return null;
  return `${pad2(hm.h)}:${pad2(hm.m)}:00`;
}

type PlannerItem = {
  id: string;
  dayTs0: number; // start of day
  title: string;
  timeDigits: string; // "HHMM" digits
  memberIds: string[]; // assignees; [] = private (creator only)
  createdAt: number;
  createdBy: string; // author
};

const STORAGE_KEY = "famigo_planner_v2";

const TYPO = {
  title: { fontFamily: FONT.title, letterSpacing: LETTER_SPACING.title },
  body: { fontFamily: FONT.body, letterSpacing: LETTER_SPACING.body },
};


function uuid() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

function BottomSheet(props: { visible: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <Modal visible={props.visible} transparent animationType="slide" onRequestClose={props.onClose}>
      <View style={styles.modalRoot}>
        <Pressable
          style={styles.sheetBackdrop}
          onPress={() => {
            Keyboard.dismiss();
            props.onClose();
          }}
        />
        <KeyboardAvoidingView
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


function filterVisibleForMe(list: PlannerItem[], myId?: string) {
  const meId = String(myId ?? "").trim();

  // while myId is loading, don't hide anything
  if (!meId) return list ?? [];

  return (list ?? []).filter((it) => {
    if (!it) return false;
    const createdBy = String((it as any).createdBy ?? "").trim();
    const memberIds = Array.isArray((it as any).memberIds) ? (it as any).memberIds.map(String) : [];

    // If something is missing (shouldn't happen anymore), don't hide it.
    if (!createdBy) return true;

    return createdBy === meId || memberIds.includes(meId);
  });
}


export default function PlannerScreen() {
  const t = getT();
  const { locale } = useLocale();

  // Make react-native-calendars month names follow the app language
  useEffect(() => {
    if (!LocaleConfig) return;
    const bcp47 = toBcp47Locale(locale);
    const key = bcp47; // use bcp47 string as LocaleConfig key
    try {
      LocaleConfig.locales[key] = buildCalendarLocale(bcp47);
      LocaleConfig.defaultLocale = key;
    } catch {
      // ignore
    }
  }, [locale]);
  const { inFamily, myId, me, members, familyId: familyIdFromHook, family_id: familyIdFromHook2 } = useMembers() as any;
  const familyId: string | null = familyIdFromHook ?? familyIdFromHook2 ?? null;

  function tr(key: string, fallback: string, params?: Record<string, any>) {
    const v = t?.(key, params);
    if (!v) return fallback;
    if (typeof v === "string" && v.startsWith("[missing")) return fallback;
    return v as string;
  }

  const meName = String(me?.name ?? tr("common.me", "Me"));

  const [selectedDay0, setSelectedDay0] = useState(() => startOfDay(Date.now()));
  const [visibleMonthYMD, setVisibleMonthYMD] = useState(() => {
    const d = new Date(selectedDay0);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    return `${y}-${pad2(m)}-01`;
  });
  const [items, setItems] = useState<PlannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // New/edit sheet
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<PlannerItem | null>(null);

  const [draftTitle, setDraftTitle] = useState("");
  const [draftTimeDigits, setDraftTimeDigits] = useState("");
  const [draftAssign, setDraftAssign] = useState<"me" | "all" | "some">("me");
  const [draftMemberIds, setDraftMemberIds] = useState<string[]>([]);

  
// Load (best-effort)
useEffect(() => {
  let alive = true;
  (async () => {
    try {
      // If user is in a family, Planner is backed by Supabase (so notifications can be generated).
      if (inFamily && familyId) {
        await reloadFromDb({ showLoading: true });
        if (!alive) return;
        return;
      }

      // Otherwise: local planner (AsyncStorage)
      if (AsyncStorage) {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!alive) return;
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setItems(parsed);
        }
      }
    } catch {
      // ignore
    } finally {
      if (alive) setLoading(false);
    }
  })();
  return () => {
    alive = false;
  };
}, [inFamily, familyId]);

  
async function persist(next: PlannerItem[]) {
  setItems(next);

  // Local-only planner (no family): keep AsyncStorage like before.
  if (!inFamily || !familyId) {
    try {
      if (AsyncStorage) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }
}



async function reloadFromDb(opts?: { showLoading?: boolean }) {
  if (!inFamily || !familyId) return;
  if (opts?.showLoading) setLoading(true);
  try {
    const { data, error } = await supabase
      .from("planner_items")
      .select("*")
      .eq("family_id", familyId)
      .order("planned_date", { ascending: true });

    if (error) throw error;

    const list = Array.isArray(data) ? data : [];
    const mapped: PlannerItem[] = list.map((row: any) => {
      const id = String(row?.id ?? "");
      const title = String(row?.title ?? "");
      const planned = String(row?.planned_date ?? row?.plannedDate ?? "");
      const dayTs0 = planned ? startOfDay(fromYMD(planned)) : startOfDay(Date.now());

      const timeDigitsRaw =
        row?.planned_time ??
        row?.plannedTime ??
        row?.time_digits ??
        row?.timeDigits ??
        row?.time ??
        row?.planned_at ??
        row?.plannedAt ??
        "";
      const timeDigits = timeValueToDigits(timeDigitsRaw);

      const memberIdsRaw = row?.member_ids ?? row?.memberIds ?? [];
      const memberIds = Array.isArray(memberIdsRaw) ? memberIdsRaw.map((x: any) => String(x)) : [];

      const createdAt =
        Number(row?.created_at ? new Date(row.created_at).getTime() : row?.createdAt ?? Date.now()) || Date.now();

      return {
        id: id || uuid(),
        dayTs0,
        title,
        timeDigits: digitsOnly(timeDigits),
        memberIds,
        createdAt,
        createdBy: String(row?.created_by ?? row?.createdBy ?? ""),
      };
    });

    setItems(filterVisibleForMe(mapped, myId));
  } catch {
    // ignore
  } finally {
    if (opts?.showLoading) setLoading(false);
  }
}

async function onRefresh() {
  setRefreshing(true);
  try {
    await reloadFromDb();
  } finally {
    setRefreshing(false);
  }
}

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    // dots for days with items
    for (const it of items ?? []) {
      const key = toYMD(Number(it.dayTs0));
      marks[key] = { ...(marks[key] ?? {}), marked: true, dotColor: theme.colors.primary };
    }

    // today: thin outline
    const todayKey = toYMD(startOfDay(Date.now()));
    marks[todayKey] = {
      ...(marks[todayKey] ?? {}),
      customStyles: {
        ...(marks[todayKey]?.customStyles ?? {}),
        container: {
          borderWidth: 1.5,
          borderColor: theme.colors.primary,
          borderRadius: 999,
        },
      },
    };


    // weekends in the visible month
    const vm = new Date(fromYMD(visibleMonthYMD));
    const y = vm.getFullYear();
    const m0 = vm.getMonth(); // 0-based
    const daysInMonth = new Date(y, m0 + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(y, m0, d);
      const dow = dt.getDay(); // 0=Sun ... 6=Sat
      if (dow !== 0) continue;

      const key = toYMD(startOfDay(dt));
      const isSelected = key === toYMD(selectedDay0);

      // don't override selected day's white text
      if (isSelected) continue;

      const color = "#E53935";

      marks[key] = {
        ...(marks[key] ?? {}),
        customStyles: {
          ...(marks[key]?.customStyles ?? {}),
          text: {
            ...(marks[key]?.customStyles?.text ?? {}),
            color,
            fontWeight: "900",
          },
        },
      };
    }

    // selected day stays filled
    const selectedKey = toYMD(selectedDay0);
    marks[selectedKey] = {
      ...(marks[selectedKey] ?? {}),
      selected: true,
      selectedColor: theme.colors.primary,
      selectedTextColor: "#fff",
    };

    return marks;
  }, [items, selectedDay0, visibleMonthYMD]);


  const weekdayShort = useMemo(() => {
    // Monday-first labels (because firstDay={1})
    const fmt = new Intl.DateTimeFormat(toBcp47Locale(locale) || "en-GB", { weekday: "short" });
    const base = new Date(2024, 0, 1); // 2024-01-01 is a Monday
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(base.getFullYear(), base.getMonth(), base.getDate() + i)));
  }, [locale]);

  const dayItems = useMemo(() => {
    const list = (items ?? []).filter((x) => Number(x.dayTs0) === Number(selectedDay0));
    // sort by time, then createdAt
    const score = (x: PlannerItem) => {
      const hm = parseDigitsToHM(x.timeDigits);
      const minutes = hm ? hm.h * 60 + hm.m : 24 * 60 + 1; // no time => last
      return minutes * 1_000_000 + (x.createdAt ?? 0);
    };
    return list.slice().sort((a, b) => score(a) - score(b));
  }, [items, selectedDay0]);

  // Smart default if today has none: jump to the first upcoming day that has items
  useEffect(() => {
    if (loading) return;
    const today0 = startOfDay(Date.now());
    const hasToday = (items ?? []).some((x) => Number(x.dayTs0) === Number(today0));
    if (Number(selectedDay0) === Number(today0) && !hasToday) {
      const next = (items ?? [])
        .map((x) => Number(x.dayTs0))
        .filter((x) => x >= today0)
        .sort((a, b) => a - b)[0];
      if (next) setSelectedDay0(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  function openNew() {
    setSelected(null);
    setDraftTitle("");
    setDraftTimeDigits("");
    setDraftAssign("me");
    setDraftMemberIds([]);
    setEditOpen(true);
  }

  function openEdit(it: PlannerItem) {
    setSelected(it);
    setDraftTitle(String(it.title ?? ""));
    setDraftTimeDigits(String(it.timeDigits ?? ""));

    const meId = String(myId ?? "");
    const memberIds = Array.isArray(it.memberIds) ? it.memberIds.map(String).filter(Boolean) : [];

    const allOtherIds = (Array.isArray(members) ? members : [])
      .map((m: any) => String(m?.id ?? ""))
      .filter((id: string) => id && id !== meId);

    const isFamily =
      allOtherIds.length > 0 &&
      memberIds.length === allOtherIds.length &&
      allOtherIds.every((id) => memberIds.includes(id));

    if (memberIds.length === 0) {
      setDraftAssign("me");
      setDraftMemberIds([]);
    } else if (isFamily) {
      setDraftAssign("all");
      setDraftMemberIds([]);
    } else {
      setDraftAssign("some");
      setDraftMemberIds(memberIds);
    }

    setEditOpen(true);
  }

  function resolveAssigneesLabel(it: PlannerItem) {
    if (!inFamily) return meName;

    const meId = String(myId ?? "");
    const memberIds = Array.isArray(it.memberIds) ? it.memberIds.map(String).filter(Boolean) : [];

    // Private plan (assignees empty) – only creator can see it anyway
    if (memberIds.length === 0) {
      const authorId = String((it as any).createdBy ?? "");
      if (authorId && authorId === meId) return meName;
      const map = new Map<string, string>();
      for (const m of members ?? []) {
        if (m?.id) map.set(String(m.id), String(m?.name ?? ""));
      }
      return map.get(authorId) || meName || tr("planner.member", "Member");
    }

    const allOtherIds = (Array.isArray(members) ? members : [])
      .map((m: any) => String(m?.id ?? ""))
      .filter((id: string) => id && id !== meId);

    const isFamily =
      allOtherIds.length > 0 &&
      memberIds.length === allOtherIds.length &&
      allOtherIds.every((id) => memberIds.includes(id));

    if (isFamily) return tr("planner.assigned.all", "Family");

    const map = new Map<string, string>();
    for (const m of members ?? []) {
      if (m?.id) map.set(String(m.id), String(m?.name ?? ""));
    }
    const names = memberIds.map((id) => map.get(id)).filter((x) => x && String(x).trim().length) as string[];
    if (!names.length) return tr("planner.assigned.some", "Selected");
    if (names.length === 1) return names[0];
    return `${names[0]} +${names.length - 1}`;
  }


  
async function onSave() {
  const title = String(draftTitle ?? "").trim();
  if (!title) {
    Alert.alert(tr("common.error", "Error"), tr("planner.titleRequired", "Title is required."));
    return;
  }

  const timeDigits = digitsOnly(draftTimeDigits);
  if (timeDigits) {
    const hm = parseDigitsToHM(timeDigits);
    if (!hm) {
      Alert.alert(tr("common.error", "Error"), tr("planner.timeInvalid", "Time must be HH:MM (e.g. 1630)."));
      return;
    }
  }

  if (draftAssign === "some" && inFamily) {
    const ids = (draftMemberIds ?? []).map(String).filter(Boolean);
    if (!ids.length) {
      Alert.alert(tr("common.error", "Error"), tr("planner.pickSomeone", "Choose at least one member."));
      return;
    }
  }

  // Local object (UI)
  const allOtherIds = (Array.isArray(members) ? members : [])
    .map((m: any) => String(m?.id ?? ""))
    .filter((id: string) => id && id !== String(myId ?? ""));

  const memberIdsForSave =
    inFamily && familyId
      ? draftAssign === "all"
        ? allOtherIds
        : draftAssign === "some"
          ? (draftMemberIds ?? []).map(String).filter((id) => id && id !== String(myId ?? ""))
          : [] // "me" => private
      : [];

  // Local object (UI)
  const base: PlannerItem = {
    id: selected?.id ?? uuid(),
    dayTs0: selectedDay0,
    title,
    timeDigits,
    memberIds: memberIdsForSave,
    createdAt: selected?.createdAt ?? Date.now(),
    createdBy: selected?.createdBy ?? String(myId ?? ""),
  };

  // If we are in a family, persist to Supabase (so server-side reminders can see it)
  if (inFamily && familyId) {
    const plannedDate = toYMD(selectedDay0);
    const plannedTime = base.timeDigits ? hmToTimeString(base.timeDigits) : null;
    const hm = base.timeDigits ? parseDigitsToHM(base.timeDigits) : null;
    const timeStr = hm ? `${pad2(hm.h)}:${pad2(hm.m)}:00` : null;
    const plannedAt = timeStr ? `${plannedDate}T${timeStr}` : null;

    // Prefer richer columns if they exist; if not, gracefully retry with minimal columns.
const memberIdsToSave = base.memberIds ?? [];

    const assignedToValue: "me" | "all" | "some" =
      memberIdsToSave.length === 0
        ? "me"
        : (memberIdsToSave.length === allOtherIds.length && allOtherIds.length > 0 ? "all" : "some");

const fullInsert: any = {
  family_id: familyId,
  title,
  planned_date: plannedDate,
  assigned_to: assignedToValue,
  planned_time: plannedTime,
  created_by: myId,
  member_ids: memberIdsToSave,
};

const minimalInsert: any = {
  family_id: familyId,
  title,
  planned_date: plannedDate,
  assigned_to: assignedToValue,
  planned_time: plannedTime,
  created_by: myId,
  member_ids: memberIdsToSave,
};

    try {
      if (selected?.id) {
        const fullPatch: any = {
      title,
      planned_date: plannedDate,
      assigned_to: assignedToValue,
      planned_time: plannedTime,
      member_ids: memberIdsToSave,
    };

        const minimalPatch: any = {
      title,
      planned_date: plannedDate,
      assigned_to: assignedToValue,
      planned_time: plannedTime,
      member_ids: memberIdsToSave,
    };

        const { error } = await supabase.from("planner_items").update(fullPatch).eq("id", selected.id);
        if (error) {
          const { error: e2 } = await supabase.from("planner_items").update(minimalPatch).eq("id", selected.id);
          if (e2) throw e2;
        }
      } else {
        const { error } = await supabase.from("planner_items").insert(fullInsert);
        if (error) {
          const { error: e2 } = await supabase.from("planner_items").insert(minimalInsert);
          if (e2) throw e2;
        }
      }
    } catch (e: any) {
      Alert.alert(tr("common.error", "Error"), String(e?.message ?? e));
      return;
    }

    // Refresh local state from DB (single source of truth)
    await reloadFromDb({ showLoading: true });

    setEditOpen(false);
    setSelected(null);
    return;
  }

  // Local-only mode
  const next = selected?.id
    ? (items ?? []).map((x) => (x.id === selected.id ? base : x))
    : [base, ...(items ?? [])];

  await persist(next);
  setEditOpen(false);
  setSelected(null);
}



  
async function onDelete(it: PlannerItem) {
  Alert.alert(tr("common.delete", "Delete"), tr("planner.deleteConfirm", "Delete this item?"), [
    { text: tr("common.cancel", "Cancel"), style: "cancel" },
    {
      text: tr("common.delete", "Delete"),
      style: "destructive",
      onPress: async () => {
        try {
          // Family mode: delete from Supabase
          if (inFamily && familyId) {
            const { error } = await supabase.from("planner_items").delete().eq("id", it.id);
            if (error) throw error;

            // Refresh from DB
            await reloadFromDb();
            return;
          }

          // Local-only mode
          const next = (items ?? []).filter((x) => x.id !== it.id);
          await persist(next);
        } catch (e: any) {
          Alert.alert(tr("common.error", "Error"), String(e?.message ?? e));
        }
      },
    },
  ]);
}



  function renderRow({ item }: { item: PlannerItem }) {
    const time = item.timeDigits ? formatTimeMasked(item.timeDigits) : null;
    const who = resolveAssigneesLabel(item);

    return (
      <Pressable
        onPress={() => openEdit(item)}
        onLongPress={() => onDelete(item)}
        delayLongPress={260}
        style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
      >
        <Card style={{ marginBottom: 10, padding: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={styles.timePill}>
              <Text style={[styles.timePillText, TYPO.body]}>{time ?? tr("planner.anytime", "Any")}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[{ color: theme.colors.text, fontWeight: "900", fontSize: 15 }, TYPO.title]} numberOfLines={2}>
                {String(item.title ?? "")}
              </Text>
              <Text style={[{ color: theme.colors.muted, marginTop: 2, fontSize: 12, fontWeight: "700" }, TYPO.body]} >
                {tr("planner.for", "For")}: {who}
                {(() => {
                  const meId = String(myId ?? "");
                  const memberIds = Array.isArray(item.memberIds) ? item.memberIds.map(String).filter(Boolean) : [];
                  const allOtherIds = (Array.isArray(members) ? members : [])
                    .map((m: any) => String(m?.id ?? ""))
                    .filter((id: string) => id && id !== meId);
                  const isFamily =
                    allOtherIds.length > 0 &&
                    memberIds.length === allOtherIds.length &&
                    allOtherIds.every((id) => memberIds.includes(id));
                  return isFamily ? `  ·  ${tr("planner.shared", "Shared")}` : "";
                })()}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} />
          </View>
        </Card>
      </Pressable>
    );
  }

  return (
    <Screen noPadding>
      <View style={{ flex: 1, width: "100%", alignSelf: "stretch" }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false} refreshControl={inFamily && familyId ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined}>
          <View style={{ padding: 16 }}>
            {/* HERO */}
            <View style={styles.heroOuter}>
              <View style={styles.heroClip}>
                <View style={styles.heroRow}>
                  <View style={styles.heroLeft}>
                    <Text style={[styles.heroTitle, TYPO.title]}>{tr("planner.title", "Planner")}</Text>
                    <Text style={[styles.heroSub, TYPO.body]}>{tr("planner.subtitle", "Your simple daily plan (private or shared).")}</Text>

                    <View style={{ height: 12 }} />
                  </View>
                </View>

                <View style={styles.heroAccentBg}>
                  <View style={[styles.heroAccent, { backgroundColor: theme.colors.primary }]} />
                </View>
              </View>

              <Image source={PLANNER_HEADER_IMG} style={styles.heroArt} resizeMode="contain" />
            </View>

            {/* MONTH CALENDAR */}
            <View style={{ height: 12 }} />
            <Card style={{ padding: 10 }}>
              

              {Calendar ? (
                <>
                  {/* Custom weekday header (per-day colors) */}
                  <View style={{ flexDirection: "row", paddingHorizontal: 6, paddingBottom: 6 }}>
                    {weekdayShort.map((label, i) => {
                      const isSun = i === 6;
                      const color = isSun ? "#E53935" : "rgba(17,17,17,0.65)";
                      const bg = isSun ? "rgba(229,57,53,0.10)" : "transparent";
                      return (
                        <View key={String(i)} style={{ flex: 1, alignItems: "center" }}>
                          <Text
                            style={{
                              fontSize: 11,
                              fontFamily: FONT.body,
                              letterSpacing: LETTER_SPACING.body,
                              fontWeight: "900",
                              color,
                              backgroundColor: bg,
                              paddingVertical: 2,
                              paddingHorizontal: 6,
                              borderRadius: 8,
                              overflow: "hidden",
                            }}
                          >
                            {label}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  <Calendar
                  style={{ marginLeft: -6, marginRight: -6 }}
                  calendarStyle={{ paddingLeft: 0, paddingRight: 0 }}
                  current={toYMD(selectedDay0)}
                  hideDayNames
                  onMonthChange={(m: any) => {
                    const y = Number(m?.year);
                    const mo = Number(m?.month);
                    if (Number.isFinite(y) && Number.isFinite(mo) && mo >= 1 && mo <= 12) {
                      setVisibleMonthYMD(`${y}-${pad2(mo)}-01`);
                    }
                  }}
                  markedDates={markedDates}
                  markingType="custom"
                  onDayPress={(day: any) => {
                    const ymd = String(day?.dateString ?? "");
                    if (!ymd) return;
                    setSelectedDay0(startOfDay(fromYMD(ymd)));
                  }}
                  theme={{
                    textSectionTitleColor: "rgba(17,17,17,0.65)",
                    todayTextColor: theme.colors.primary,
                    arrowColor: theme.colors.primary,
                    monthTextColor: theme.colors.text,
                    textMonthFontSize: 15,
                    textDayFontSize: 12,
                    textDayHeaderFontSize: 11,
                    textMonthFontWeight: "900",
                    textDayFontWeight: "800",
                    textDayHeaderFontWeight: "800",
                    selectedDayBackgroundColor: theme.colors.primary,
                    selectedDayTextColor: "#fff",
                    dotColor: theme.colors.primary,
                    selectedDotColor: "#fff",
                    stylesheet: {
                      calendar: {
                        header: {
                          dayTextAtIndex6: { color: "#E53935", fontWeight: "900" },
                          dayTextAtIndex5: { color: "rgba(17,17,17,0.45)", fontWeight: "900" },
                        },
                      },
                      day: {
                        basic: {
                          base: { width: 34, height: 30, alignItems: "center", justifyContent: "center" },
                        },
                      },
                      calendar: {
                        main: { paddingLeft: 0, paddingRight: 0 },
                        week: { marginTop: 0, marginBottom: 0 },
                      },
                    },
                  }}
                  enableSwipeMonths
                  firstDay={1}
                />
                </>
              ) : (
                <Text style={{ color: theme.colors.muted, fontWeight: "700" }}>
                  {tr(
                    "planner.calendarMissing",
                    "Calendar component is not installed. If you want this month view, install react-native-calendars."
                  )}
                </Text>
              )}

              <View style={{ height: 4 }} />
              <Text style={[{ color: theme.colors.muted, fontWeight: "800", fontSize: 13 }, TYPO.body]}>
                {tr("planner.selectedDay", "Selected")}: {fmtDayLabel(selectedDay0, locale)}
              </Text>

              {!inFamily ? (
                <Text style={[{ marginTop: 6, color: theme.colors.muted, fontSize: 12, fontWeight: "700" }, TYPO.body]}>
                  {tr("planner.noFamilyHint", "Tip: join a family to share a plan with a member.")}
                </Text>
              ) : null}

              {!AsyncStorage ? (
                <Text style={[{ marginTop: 10, color: theme.colors.muted, fontSize: 11, fontWeight: "700" }, TYPO.body]}>
                  {tr("planner.noStorage", "Note: AsyncStorage is not installed, so plans will reset when the app reloads.")}
                </Text>
              ) : null}
            </Card>
            <View style={{ height: 10 }} />

            {/* Hint + New (Tasks style, single row) */}
            <View style={styles.hintRow}>
              <Text style={[styles.hintRowText, TYPO.body]} >
                {tr("planner.hintPickDay", "Pick a day on the calendar, then tap + New")}
              </Text>

              <Button
                title={tr("planner.newBtn", "+ New")}
                onPress={openNew}
                style={styles.newTaskBtn}
                textStyle={[styles.newTaskBtnText, TYPO.title]}
              />
            </View>

            {/* List */}
            <View style={{ height: 10 }} />
            {loading ? (
              <View style={{ paddingVertical: 20, alignItems: "center" }}>
                <Text style={[{ color: theme.colors.muted, fontWeight: "800" }, TYPO.body]}>{tr("common.loading", "Loading...")}</Text>
              </View>
            ) : dayItems.length ? (
              <FlatList
                data={dayItems}
                keyExtractor={(x) => String(x.id)}
                renderItem={renderRow}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: 60 }}
              />
            ) : (
              <View style={{ paddingVertical: 8 }}>
                <EmptyState
                  title={tr("planner.emptyTitle", "No plans yet")}
                  subtitle={tr("planner.emptyBody", "Tap + New and add your first plan for this day.")}
                />
              </View>
            )}
          </View>
        </ScrollView>

        {/* EDIT SHEET */}
        <BottomSheet
          visible={editOpen}
          onClose={() => {
            setEditOpen(false);
          }}
        >
          <Card>
            <Text style={[{ fontSize: 18, fontWeight: "900", color: theme.colors.text }, TYPO.title]}>
              {selected ? tr("planner.editTitle", "Edit plan") : tr("planner.newTitle", "New plan")}
            </Text>

            <Text style={[{ marginTop: 6, color: theme.colors.muted, fontWeight: "700" }, TYPO.body]}>
              {fmtDayLabel(selectedDay0, locale)}
            </Text>

            <ScrollView style={{ maxHeight: 620 }} contentContainerStyle={{ paddingBottom: 36 }} keyboardShouldPersistTaps="handled">
              <TextInput
                value={draftTitle}
                onChangeText={setDraftTitle}
                placeholder={tr("planner.placeholder.title", "e.g. Doctor, pay bills, call grandma")}
                placeholderTextColor={theme.colors.muted}
                autoCapitalize="sentences"
                style={[styles.input, { fontSize: 14, fontWeight: "800", paddingVertical: 10 }]}
              />

              <View style={{ marginTop: 10 }}>
                <Text style={[{ fontSize: 12, fontWeight: "800", color: theme.colors.muted }, TYPO.body]}>
                  {tr("planner.timeLabel", "Time (optional)")}
                </Text>

                <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      value={formatTimeMasked(draftTimeDigits)}
                      onChangeText={(txt) => setDraftTimeDigits(digitsOnly(txt))}
                      placeholder={tr("planner.timePlaceholder", "HHMM")}
                      placeholderTextColor={theme.colors.muted}
                      keyboardType="number-pad"
                      style={[styles.input, { marginTop: 0, fontSize: 14, fontWeight: "900" }]}
                    />
                  </View>
                  <Pressable
                    onPress={() => setDraftTimeDigits("")}
                    style={({ pressed }) => [styles.clearBtn, pressed ? { opacity: 0.9 } : null]}
                  >
                    <Ionicons name="close" size={18} color={theme.colors.muted} />
                    <Text style={[{ color: theme.colors.muted, fontWeight: "900", fontSize: 12 }, TYPO.body]}>
                      {tr("common.clear", "Clear")}
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View style={{ marginTop: 12 }}>
                <Text style={[{ fontSize: 12, fontWeight: "800", color: theme.colors.muted }, TYPO.body]}>
                  {tr("planner.forWho", "For who?")}
                </Text>

                <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                  <Pressable
                    onPress={() => {
                      setDraftAssign("me");
                      setDraftMemberIds([]);
                    }}
                    style={[styles.segPill, draftAssign === "me" ? styles.segOn : styles.segOff]}
                  >
                    <Text style={[draftAssign === "me" ? styles.segTextOn : styles.segTextOff, TYPO.body]}>
                      {tr("common.me", "Me")}
                    </Text>
                  </Pressable>

                  <Pressable
                    disabled={!inFamily}
                    onPress={() => {
                      if (!inFamily) return;
                      setDraftAssign("all");
                      setDraftMemberIds([]);
                    }}
                    style={[
                      styles.segPill,
                      !inFamily ? { opacity: 0.5 } : null,
                      draftAssign === "all" ? styles.segOn : styles.segOff,
                    ]}
                  >
                    <Text style={[draftAssign === "all" ? styles.segTextOn : styles.segTextOff, TYPO.body]}>
                      {tr("planner.family", "Family")}
                    </Text>
                  </Pressable>

                  <Pressable
                    disabled={!inFamily}
                    onPress={() => {
                      if (!inFamily) return;
                      setDraftAssign("some");
                      if (!draftMemberIds.length) setDraftMemberIds([]);
                    }}
                    style={[
                      styles.segPill,
                      !inFamily ? { opacity: 0.5 } : null,
                      draftAssign === "some" ? styles.segOn : styles.segOff,
                    ]}
                  >
                    <Text style={[draftAssign === "some" ? styles.segTextOn : styles.segTextOff, TYPO.body]}>
                      {tr("planner.someone", "Someone")}
                    </Text>
                  </Pressable>
                </View>

                {draftAssign === "some" && inFamily ? (
                  <View style={{ marginTop: 10, gap: 8 }}>
                    {(Array.isArray(members) ? members : [])
                      .filter((m: any) => String(m?.id ?? "") !== "" && String(m?.id) !== String(myId ?? ""))
                      .map((m: any) => {
                        const id = String(m.id);
                        const name = String(m.name ?? "");
                        const active = draftMemberIds.includes(id);
                        return (
                          <Pressable
                            key={id}
                            onPress={() => {
                              setDraftMemberIds((prev) => {
                                const set = new Set(prev);
                                if (set.has(id)) set.delete(id);
                                else set.add(id);
                                return Array.from(set);
                              });
                            }}
                            style={({ pressed }) => [
                              styles.memberRow,
                              active ? styles.memberRowOn : styles.memberRowOff,
                              pressed ? { opacity: 0.92 } : null,
                            ]}
                          >
                            <Text style={[{ color: theme.colors.text, fontWeight: "900" }, TYPO.title]} >
                              {name || tr("shopping.member", "Member")}
                            </Text>
                            {active ? (
                              <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />
                            ) : (
                              <Ionicons name="ellipse-outline" size={22} color={theme.colors.muted} />
                            )}
                          </Pressable>
                        );
                      })}
                    <Text style={{ color: theme.colors.muted, fontSize: 12, fontWeight: "700" }}>
                      {tr("planner.someHint", "Tip: pick one or more members. (Long-press items to delete)")}
                    </Text>
                  </View>
                ) : null}
              </View>

              <View style={{ flexDirection: "row", gap: 10, marginTop: 14, justifyContent: "flex-end" }}>
                <Button
                  title={tr("common.cancel", "Cancel")}
                  variant="secondary"
                  onPress={() => setEditOpen(false)}
                  style={{ height: 36, paddingHorizontal: 14, borderRadius: 12 }}
                  textStyle={{ fontSize: 12, fontWeight: "900" }}
                />
                <Button
                  title={tr("common.save", "Save")}
                  onPress={onSave}
                  style={{ height: 36, paddingHorizontal: 14, borderRadius: 12 }}
                  textStyle={{ fontSize: 12, fontWeight: "900" }}
                />
              </View>
            </ScrollView>
          </Card>
        </BottomSheet>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroOuter: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    borderRadius: 18,
    overflow: "visible",
    ...Platform.select({
      android: { elevation: 1 },
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
      },
      default: {},
    }),
  },
  heroClip: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: theme.colors.card,
    padding: 14,
  },
  heroRow: { flexDirection: "row", alignItems: "flex-start" },
  heroLeft: { flex: 1, minWidth: 0, paddingRight: 130 },

  heroTitle: { fontSize: 22, fontWeight: "900", color: theme.colors.text, letterSpacing: 0.2 },
  heroSub: { marginTop: 4, fontSize: 13, fontWeight: "700", color: theme.colors.muted },

  heroArt: {
    position: "absolute",
    right: 24,
    top: -22,
    width: 110,
    height: 110,
    pointerEvents: "none",
  },

  heroAccentBg: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 6,
    backgroundColor: "#f1f5f9",
  },
  heroAccent: { height: 6, width: "42%", borderTopRightRadius: 999, borderBottomRightRadius: 999 },

  timePill: {
    width: 56,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(47,107,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(47,107,255,0.25)",
  },
  timePillText: {
    color: theme.colors.primary,
    fontWeight: "900",
    fontSize: 12,
  },

  input: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "#fff",
    color: theme.colors.text,
  },

  clearBtn: {
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  segPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  segOn: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  segOff: {
    backgroundColor: "#fff",
    borderColor: theme.colors.border,
  },
  segTextOn: { color: "#fff", fontWeight: "900" },
  segTextOff: { color: theme.colors.text, fontWeight: "900" },

  memberRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  memberRowOn: {
    backgroundColor: "rgba(47,107,255,0.10)",
    borderColor: "rgba(47,107,255,0.30)",
  },
  memberRowOff: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
  },

  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
    marginBottom: 0,
  },
  hintRowText: {
    flex: 1,
    marginRight: 12,
    color: theme.colors.muted,
    fontWeight: "700",
    fontSize: 12,
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

  modalRoot: { flex: 1, justifyContent: "flex-end" },
  sheetBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  sheetWrap: { flex: 1, justifyContent: "flex-end", padding: 14 },
  sheetInner: { width: "100%" },
});
