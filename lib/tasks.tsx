// /lib/tasks.tsx
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import { supabase } from "./supabase";
import { useMembers } from "./members";
import { registerForPushAndSaveToken } from "./push";
import { i18n } from "./i18n";

export type TaskStatus = "open" | "claimed" | "review" | "done";

/**
 * Helper used by UI (e.g. /app/(tabs)/tasks.tsx) to render a human label for status.
 * Pass translation function `t` from useT()/i18n. If a key is missing it falls back to English.
 */
export function getStatusLabel(
  t: ((key: string, params?: any) => string) | undefined,
  status: TaskStatus
): string {
  const key = `tasks.status.${status}`;
  try {
    const v = typeof t === "function" ? t(key) : "";
    if (v && v !== key) return v;
  } catch {}
  switch (status) {
    case "open":
      return "Open";
    case "claimed":
      return "Claimed";
    case "review":
      return "Needs approval";
    case "done":
      return "Done";
    default:
      return String(status);
  }
}



export type Task = {
  id: string;
  family_id: string;

  title: string;
  status: TaskStatus;

  assignedToId?: string | null;
  assignedToName?: string | null;

  claimedById?: string | null;
  claimedByName?: string | null;

  requestedDoneAt?: number | null;
  requestedDoneById?: string | null;
  requestedDoneByName?: string | null;

  dueAt?: number | null;
  createdAt: number;
  completedAt?: number | null;

  points?: number;

  // stored in DB as tasks.repeat_rule
  repeatRule?: string | null;
};

export type TaskPatch = Partial<{
  title: string;
  status: TaskStatus;

  assignedToId: string | null;
  assignedToName: string | null;

  claimedById: string | null;
  claimedByName: string | null;

  requestedDoneAt: number | null;
  requestedDoneById: string | null;
  requestedDoneByName: string | null;

  dueAt: number | null;
  completedAt: number | null;

  points: number;

  repeatRule: string | null;
}>;

type TasksContextValue = {
  ready: boolean;
  tasks: Task[];
  familyId: string | null;

  refresh: () => Promise<void>;

  addTask: (title: string, meta?: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  claimTask: (id: string, memberId: string, memberName: string) => Promise<void>;
  requestDone: (id: string, memberId: string, memberName: string) => Promise<void>;

  approveDone: (id: string) => Promise<void>;
  rejectDone: (id: string) => Promise<void>;
  resetTask: (id: string) => Promise<void>;

  updateTask: (id: string, patch: TaskPatch) => Promise<void>;
  setAssignee: (id: string, memberId: string | null, memberName: string | null) => Promise<void>;
  setDueAt: (id: string, dueAt: number | null) => Promise<void>;
  setPoints: (id: string, points: number) => Promise<void>;

  setStatus: (id: string, status: TaskStatus, meta?: Partial<Task> & { done?: boolean | null }) => Promise<void>;

  toggleDone: (id: string) => Promise<void>;
  unclaimTask: (id: string) => Promise<void>;

  // ✅ one-tap done for auto-complete repeating tasks (e.g. trash pickup)
  completeAuto: (id: string, memberId: string, memberName: string) => Promise<void>;
};

const TasksContext = createContext<TasksContextValue | null>(null);

function mapRow(row: any): Task {
  return {
    id: row.id,
    family_id: row.family_id,
    title: row.title,
    status: row.status,

    assignedToId: row.assigned_to_id ?? null,
    assignedToName: row.assigned_to_name ?? null,

    claimedById: row.claimed_by_id ?? null,
    claimedByName: row.claimed_by_name ?? null,

    requestedDoneAt: row.requested_done_at ? new Date(row.requested_done_at).getTime() : null,
    requestedDoneById: row.requested_done_by_id ?? null,
    requestedDoneByName: row.requested_done_by_name ?? null,

    dueAt: row.due_at ? new Date(row.due_at).getTime() : null,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    completedAt: row.completed_at ? new Date(row.completed_at).getTime() : null,

    points: typeof row.points === "number" ? row.points : 1,

    repeatRule: row.repeat_rule ?? null,
  };
}

function pickFamilyIdFromMembers(membersCtx: any): string | null {
  return (
    membersCtx?.family?.id ??
    membersCtx?.familyId ??
    membersCtx?.family_id ??
    membersCtx?.currentFamilyId ??
    membersCtx?.current_family_id ??
    null
  );
}

function patchToDb(patch: TaskPatch) {
  const out: any = {};

  if (patch.title !== undefined) out.title = patch.title;
  if (patch.status !== undefined) out.status = patch.status;

  if (patch.assignedToId !== undefined) out.assigned_to_id = patch.assignedToId;
  if (patch.assignedToName !== undefined) out.assigned_to_name = patch.assignedToName;

  if (patch.claimedById !== undefined) out.claimed_by_id = patch.claimedById;
  if (patch.claimedByName !== undefined) out.claimed_by_name = patch.claimedByName;

  if (patch.requestedDoneAt !== undefined)
    out.requested_done_at = patch.requestedDoneAt ? new Date(patch.requestedDoneAt).toISOString() : null;
  if (patch.requestedDoneById !== undefined) out.requested_done_by_id = patch.requestedDoneById;
  if (patch.requestedDoneByName !== undefined) out.requested_done_by_name = patch.requestedDoneByName;

  if (patch.dueAt !== undefined) out.due_at = patch.dueAt ? new Date(patch.dueAt).toISOString() : null;

  if (patch.completedAt !== undefined)
    out.completed_at = patch.completedAt ? new Date(patch.completedAt).toISOString() : null;

  if (patch.points !== undefined) out.points = patch.points;

  if (patch.repeatRule !== undefined) out.repeat_rule = patch.repeatRule;

  return out;
}

async function sendPush(toUserId: string, title: string, body?: string, data?: any) {
  try {
    await supabase.functions.invoke("push", { body: { to_user_id: toUserId, title, body, data } });
  } catch {
    // ignore
  }
}

function metaToPatch(meta?: Partial<Task> & { done?: boolean | null }): TaskPatch {
  const patch: TaskPatch = {};
  if (!meta) return patch;

  if (meta.title !== undefined) patch.title = meta.title;

  if (meta.assignedToId !== undefined) patch.assignedToId = meta.assignedToId ?? null;
  if (meta.assignedToName !== undefined) patch.assignedToName = meta.assignedToName ?? null;

  if (meta.claimedById !== undefined) patch.claimedById = meta.claimedById ?? null;
  if (meta.claimedByName !== undefined) patch.claimedByName = meta.claimedByName ?? null;

  if (meta.requestedDoneAt !== undefined) patch.requestedDoneAt = meta.requestedDoneAt ?? null;
  if (meta.requestedDoneById !== undefined) patch.requestedDoneById = meta.requestedDoneById ?? null;
  if (meta.requestedDoneByName !== undefined) patch.requestedDoneByName = meta.requestedDoneByName ?? null;

  if (meta.dueAt !== undefined) patch.dueAt = meta.dueAt ?? null;
  if (meta.completedAt !== undefined) patch.completedAt = meta.completedAt ?? null;

  if (meta.points !== undefined && typeof meta.points === "number") patch.points = meta.points;

  if ((meta as any).repeatRule !== undefined) patch.repeatRule = (meta as any).repeatRule ?? null;

  if (meta.done === true) {
    patch.status = "done";
    patch.completedAt = patch.completedAt ?? Date.now();
  }

  return patch;
}

type RepeatRule =
  | { preset: "daily" }
  | { preset: "weekly" }
  | { preset: "custom"; byWeekdays?: number[] }
  | { preset: "interval"; days: number; autoComplete?: boolean }
  | {
      // ✅ planned explicit schedule (list of due datetimes)
      preset: "planned";
      dates: string[]; // ISO datetime strings
      repeat?: "yearly" | "none"; // default yearly
    };

function safeParseRepeat(raw: any): RepeatRule | null {
  if (!raw) return null;
  try {
    const obj = typeof raw === "string" ? JSON.parse(raw) : raw;
    const preset = String(obj?.preset ?? obj?.kind ?? "").toLowerCase();

    if (preset === "daily") return { preset: "daily" };
    if (preset === "weekly") return { preset: "weekly" };

    if (preset === "custom") {
      const daysRaw = Array.isArray(obj?.byWeekdays) ? obj.byWeekdays : Array.isArray(obj?.days) ? obj.days : [];
      const byWeekdays = (daysRaw || [])
        .map((x: any) => Number(x))
        .filter((n: number) => Number.isFinite(n) && n >= 1 && n <= 7);
      const uniq = Array.from(new Set(byWeekdays)).sort((a, b) => a - b);
      return { preset: "custom", byWeekdays: uniq };
    }


    if (preset === "interval") {
      const days = Number(obj?.days ?? obj?.everyDays ?? obj?.intervalDays ?? null);
      if (!Number.isFinite(days) || days <= 0) return null;
      const autoComplete = Boolean(obj?.autoComplete ?? obj?.noApproval ?? false);
      return { preset: "interval", days: Math.floor(days), autoComplete };
    }

    if (preset === "planned") {
      const rawDates = Array.isArray(obj?.dates) ? obj.dates : [];
      const dates = (rawDates || [])
        .map((x: any) => (typeof x === "string" ? x : null))
        .filter(Boolean) as string[];

      const repeat = String(obj?.repeat ?? "yearly").toLowerCase();
      return {
        preset: "planned",
        dates,
        repeat: repeat === "none" ? "none" : "yearly",
      };
    }

    return null;
  } catch {
    return null;
  }
}

function addYearsIso(iso: string, years: number) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const before = d.getTime();
  d.setFullYear(d.getFullYear() + years);
  // keep time; if invalid (Feb 29), JS will normalize; accept that
  const after = d.getTime();
  if (!Number.isFinite(after) || after === before) return d.toISOString();
  return d.toISOString();
}

function isoWeekdayFromDate(d: Date) {
  const js = d.getDay(); // 0=Sun..6=Sat
  return js === 0 ? 7 : js; // Sun->7
}

function addDaysKeepTime(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function computeNextDueAt(rule: RepeatRule, fromTs: number): number | null {
  const base = new Date(fromTs);

  if (rule.preset === "daily") return addDaysKeepTime(base, 1).getTime();
  if (rule.preset === "weekly") return addDaysKeepTime(base, 7).getTime();
  if (rule.preset === "interval") return addDaysKeepTime(base, Math.max(1, Math.floor(rule.days))).getTime();

  if (rule.preset === "custom") {
    const days = (rule.byWeekdays ?? []).slice().sort((a, b) => a - b);
    if (!days.length) return addDaysKeepTime(base, 7).getTime();

    for (let i = 1; i <= 14; i++) {
      const cand = addDaysKeepTime(base, i);
      const iso = isoWeekdayFromDate(cand);
      if (days.includes(iso)) return cand.getTime();
    }
    return addDaysKeepTime(base, 7).getTime();
  }

  if (rule.preset === "planned") {
    const list = (rule.dates ?? [])
      .map((iso) => new Date(iso).getTime())
      .filter((t) => Number.isFinite(t))
      .sort((a, b) => a - b);

    if (!list.length) return null;

    // 1) try next within current list
    const next = list.find((t) => t > fromTs + 500); // small epsilon
    if (next) return next;

    // 2) repeat yearly (default) -> shift by +1 year until we find next
    if ((rule.repeat ?? "yearly") === "yearly") {
      // try up to 5 years ahead (safe guard)
      for (let y = 1; y <= 5; y++) {
        const shifted = (rule.dates ?? [])
          .map((iso) => addYearsIso(iso, y))
          .filter(Boolean)
          .map((iso) => new Date(iso as string).getTime())
          .filter((t) => Number.isFinite(t))
          .sort((a, b) => a - b);

        const nxt = shifted.find((t) => t > fromTs + 500);
        if (nxt) return nxt;
      }
    }

    return null;
  }

  return null;
}

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const membersCtx = useMembers() as any;
  const hintedFamilyId = pickFamilyIdFromMembers(membersCtx);

  const [familyId, setFamilyId] = useState<string | null>(hintedFamilyId ?? null);
  const [ready, setReady] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const channelRef = useRef<any>(null);
  const pushRegisteredOnce = useRef(false);

  useEffect(() => {
    if (pushRegisteredOnce.current) return;
    pushRegisteredOnce.current = true;
    registerForPushAndSaveToken().catch(() => {});
  }, []);

  useEffect(() => {
    if (hintedFamilyId && hintedFamilyId !== familyId) setFamilyId(hintedFamilyId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hintedFamilyId]);

  // If members provider is ready but we still don't have a familyId (not in family yet),
  // mark tasks as ready to avoid blocking UI/spamming alerts.
  useEffect(() => {
    if ((membersCtx as any)?.ready && !familyId) {
      setTasks([]);
      setReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [(membersCtx as any)?.ready, familyId]);


  const refresh = async () => {
    // If members/family isn't ready yet, don't throw alerts — just wait.
    if (!familyId) {
      setTasks([]);
      setReady(Boolean((membersCtx as any)?.ready));
      return;
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("family_id", familyId)
      .order("created_at", { ascending: false });

    if (error) {
      setReady(true);
      Alert.alert("Tasks error", error.message);
      return;
    }

    setTasks((data || []).map(mapRow));
    setReady(true);
  };

  useEffect(() => {
    setReady(false);
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familyId]);

  useEffect(() => {
    if (!familyId) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const ch = supabase
      .channel(`tasks:${familyId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks", filter: `family_id=eq.${familyId}` }, () =>
        refresh()
      )
      .subscribe();

    channelRef.current = ch;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familyId]);

  const addTask = async (title: string, meta?: Partial<Task>) => {
    const t = (title || "").trim();
    if (!t) return;
    if (!familyId) throw new Error("Missing familyId");

    const due_at = meta?.dueAt ? new Date(meta.dueAt).toISOString() : null;
    const points = typeof meta?.points === "number" && meta.points > 0 ? Math.floor(meta.points) : 1;

    const assigned_to_id = meta?.assignedToId ?? null;
    const assigned_to_name = meta?.assignedToName ?? null;

    const repeat_rule = (meta as any)?.repeatRule ?? null;

    const { error } = await supabase.from("tasks").insert({
      family_id: familyId,
      title: t,
      status: "open",
      due_at,
      points,
      assigned_to_id,
      assigned_to_name,
      repeat_rule,

      claimed_by_id: null,
      claimed_by_name: null,
      requested_done_at: null,
      requested_done_by_id: null,
      requested_done_by_name: null,
      completed_at: null,
    });

    if (error) throw error;

    if (assigned_to_id) {
      await sendPush(assigned_to_id, "Dodijeljen zadatak 📌", t, { kind: "task_assigned", family_id: familyId });
    }

    await refresh();
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw error;
    await refresh();
  };

  const claimTask = async (id: string, memberId: string, memberName: string) => {
    const { error } = await supabase
      .from("tasks")
      .update({ status: "claimed", claimed_by_id: memberId, claimed_by_name: memberName })
      .eq("id", id)
      .neq("status", "done");

    if (error) throw error;
    await refresh();
  };

  const requestDone = async (id: string, memberId: string, memberName: string) => {
    const local = tasks.find((t) => t.id === id);
    const taskTitle = local?.title ?? "Zadatak";

    const { error } = await supabase
      .from("tasks")
      .update({
        status: "review",
        requested_done_at: new Date().toISOString(),
        requested_done_by_id: memberId,
        requested_done_by_name: memberName,
      })
      .eq("id", id)
      .eq("claimed_by_id", memberId);

    if (error) throw error;

    if (familyId) {
      const parentsRes = await supabase
        .from("family_members")
        .select("user_id")
        .eq("family_id", familyId)
        .eq("role", "parent");

      const parentIds = (parentsRes.data || []).map((r: any) => r.user_id).filter(Boolean);
      for (const pid of parentIds) {
        await sendPush(pid, "Traži potvrdu ✅", `${memberName}: ${taskTitle}`, {
          kind: "task_review",
          task_id: id,
          family_id: familyId,
        });
      }
    }

    await refresh();
  };

  const approveDone = async (id: string) => {
    const taskRes = await supabase.from("tasks").select("*").eq("id", id).maybeSingle();
    const taskRow = taskRes.data;

    const { error } = await supabase
      .from("tasks")
      .update({ status: "done", completed_at: new Date().toISOString() })
      .eq("id", id)
      .eq("status", "review");

    if (error) throw error;

    try {
      const family_id = taskRow?.family_id ?? familyId;
      const user_id = taskRow?.claimed_by_id ?? null;
      const points = typeof taskRow?.points === "number" ? taskRow.points : 1;
      const title = taskRow?.title ?? "Zadatak";

      if (family_id && user_id) {
        await supabase.from("points_ledger").insert({ family_id, user_id, task_id: id, points });

        await sendPush(user_id, "Odobreno ✅", `${title} (+${points})`, {
          kind: "task_approved",
          task_id: id,
          family_id,
          points,
        });
      }
    } catch {}

    // ✅ recurring: spawn next by resetting same row
    try {
      const repeatRaw = taskRow?.repeat_rule ?? null;
      const rule = safeParseRepeat(repeatRaw);

      if (rule) {
        // use current due_at as anchor if exists (best behavior)
        const anchorTs = taskRow?.due_at
          ? new Date(taskRow.due_at).getTime()
          : taskRow?.completed_at
          ? new Date(taskRow.completed_at).getTime()
          : Date.now();

        const nextDueAt = computeNextDueAt(rule, anchorTs);

        if (nextDueAt) {
          const { error: recurErr } = await supabase
            .from("tasks")
            .update({
              status: "open",
              due_at: new Date(nextDueAt).toISOString(),

              claimed_by_id: null,
              claimed_by_name: null,

              requested_done_at: null,
              requested_done_by_id: null,
              requested_done_by_name: null,

              completed_at: null,
            })
            .eq("id", id);

          if (recurErr) throw recurErr;
        }
      }
    } catch {
      // ignore recurring failures
    }

    await refresh();
  };

  const rejectDone = async (id: string) => {
    const taskRes = await supabase.from("tasks").select("claimed_by_id,title,family_id").eq("id", id).maybeSingle();

    const claimedById = taskRes.data?.claimed_by_id ?? null;
    const title = taskRes.data?.title ?? "Zadatak";
    const fam = taskRes.data?.family_id ?? familyId;

    const { error } = await supabase
      .from("tasks")
      .update({
        status: "claimed",
        requested_done_at: null,
        requested_done_by_id: null,
        requested_done_by_name: null,
      })
      .eq("id", id)
      .eq("status", "review");

    if (error) throw error;

    if (claimedById) {
      await sendPush(claimedById, "Odbijeno ❌", `Pokušaj ponovno: ${title}`, {
        kind: "task_rejected",
        task_id: id,
        family_id: fam,
      });
    }

    await refresh();
  };

  const resetTask = async (id: string) => {
    const { error } = await supabase
      .from("tasks")
      .update({
        status: "open",
        claimed_by_id: null,
        claimed_by_name: null,
        requested_done_at: null,
        requested_done_by_id: null,
        requested_done_by_name: null,
        completed_at: null,
      })
      .eq("id", id);

    if (error) throw error;
    await refresh();
  };

  const updateTask = async (id: string, patch: TaskPatch) => {
    const payload = patchToDb(patch);
    if (!Object.keys(payload).length) return;
    const { error } = await supabase.from("tasks").update(payload).eq("id", id);
    if (error) throw error;
    await refresh();
  };

  const setAssignee = async (id: string, memberId: string | null, memberName: string | null) => {
    await updateTask(id, { assignedToId: memberId, assignedToName: memberName });
    if (memberId) {
      const task = tasks.find((t) => t.id === id);
      await sendPush(memberId, "Dodijeljen zadatak 📌", task?.title ?? "Imaš novi zadatak", {
        kind: "task_assigned",
        task_id: id,
        family_id: familyId,
      });
    }
  };

  const setDueAt = async (id: string, dueAt: number | null) => {
    await updateTask(id, { dueAt });
  };

  const setPoints = async (id: string, points: number) => {
    const p = Math.max(1, Math.floor(points));
    await updateTask(id, { points: p });
  };

  const setStatus = async (id: string, status: TaskStatus, meta?: Partial<Task> & { done?: boolean | null }) => {
    const patch = metaToPatch(meta);
    patch.status = patch.status ?? status;

    if (patch.status === "done" && (patch.completedAt === undefined || patch.completedAt === null)) {
      patch.completedAt = Date.now();
    }

    await updateTask(id, patch);
  };

  const toggleDone = async (id: string) => {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;

    if (t.status === "done") {
      await updateTask(id, { status: "open", completedAt: null });
    } else {
      await updateTask(id, { status: "done", completedAt: Date.now() });
    }
  };

  const unclaimTask = async (id: string) => {
    await updateTask(id, {
      status: "open",
      claimedById: null,
      claimedByName: null,
      requestedDoneAt: null,
      requestedDoneById: null,
      requestedDoneByName: null,
      completedAt: null,
    });
  };


  const completeAuto = async (id: string, memberId: string, memberName: string) => {
    // ✅ For auto-complete repeating tasks: immediately move next due date without approval flow.
    const taskRes = await supabase.from("tasks").select("*").eq("id", id).maybeSingle();
    const row: any = taskRes.data;

    if (!row) {
      // fallback: just refresh
      await refresh();
      return;
    }

    const rule = safeParseRepeat(row.repeat_rule ?? null);

    // If it's not repeating, just mark done.
    if (!rule || rule.preset !== "interval" || !(rule as any).autoComplete) {
      const { error } = await supabase
        .from("tasks")
        .update({ status: "done", completed_at: new Date().toISOString() })
        .eq("id", id)
        .neq("status", "done");

      if (error) throw error;
      await refresh();
      return;
    }


    // Anchor: due_at if exists, else now
    const anchorTs = row.due_at ? new Date(row.due_at).getTime() : Date.now();
    const nextDueAt = computeNextDueAt(rule as any, anchorTs);

    if (!nextDueAt) {
      // if for some reason can't compute next, fallback mark done
      const { error } = await supabase
        .from("tasks")
        .update({ status: "done", completed_at: new Date().toISOString() })
        .eq("id", id)
        .neq("status", "done");
      if (error) throw error;
      await refresh();
      return;
    }

    // Move to next occurrence and clear workflow fields
    const { error } = await supabase
      .from("tasks")
      .update({
        status: "open",
        due_at: new Date(nextDueAt).toISOString(),

        claimed_by_id: null,
        claimed_by_name: null,

        requested_done_at: null,
        requested_done_by_id: null,
        requested_done_by_name: null,

        completed_at: null,
      })
      .eq("id", id);

    if (error) throw error;

    await refresh();
  };

  const value = useMemo(
    () => ({
      ready,
      tasks,
      familyId,
      refresh,
      addTask,
      deleteTask,
      claimTask,
      requestDone,
      approveDone,
      rejectDone,
      resetTask,
      updateTask,
      setAssignee,
      setDueAt,
      setPoints,
      setStatus,
      toggleDone,
      unclaimTask,
      completeAuto,
    }),
    [ready, tasks, familyId]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used within TasksProvider");
  return ctx;
}
