// /lib/tasks.tsx
import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

/**
 * Simplified Famigo workflow (as requested):
 *
 * - User actions:
 *    1) "Označi gotovo"  -> status = "done"
 *    2) "Odbij"          -> task becomes available for others (assigned_to_id/name -> NULL), status stays "open"
 *
 * - We keep the existing function names for compatibility:
 *    - acceptTask(id) now behaves as "Označi gotovo" (DONE)
 *      (so old UI that still calls acceptTask won't break)
 *
 * - Reject uses an RPC because it must set assigned_to_id = NULL (RLS-safe).
 * - Done can be done either via direct update (if your RLS already allows it) or via RPC.
 *   Here we use RPC for consistency and to avoid silent RLS issues.
 */

import { supabase } from "./supabase";

let useMembers: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  useMembers = require("./members").useMembers;
} catch {
  useMembers = null;
}

export type TaskStatus = "open" | "done";
export type ReminderOffset = 15 | 30 | 60;

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;

  createdAt?: number | null;
  dueAt?: number | null;
  completedAt?: number | null;

  assignedToId?: string | null;
  assignedToName?: string | null;

  createdById?: string | null;

  acceptedAt?: number | null;

  reminderOffsetMinutes?: ReminderOffset | null;
  repeatRule?: string | null;
  familyId?: string | null;

  // legacy
  claimedById?: string | null;
  claimedByName?: string | null;
};

export type TaskPatch = Partial<{
  title: string;
  status: TaskStatus;
  dueAt: number | null;
  repeatRule: string | null;
  reminderOffsetMinutes: ReminderOffset | null;

  assignedToId: string | null;
  assignedToName: string | null;

  acceptedAt: number | null;
  createdById: string | null;

  completedAt: number | null;
}>;

type TasksContextValue = {
  ready: boolean;
  tasks: Task[];
  refresh: () => Promise<void>;

  addTask: (
    title: string,
    opts?: Partial<{
      dueAt: number | null;
      repeatRule: string | null;
      reminderOffsetMinutes: ReminderOffset | null;
      assignedToId: string | null;
      assignedToName: string | null;
    }>
  ) => Promise<void>;
  updateTask: (id: string, patch: TaskPatch) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  setAssignee: (id: string, assignedToId: string | null, assignedToName: string | null) => Promise<void>;

  // Compatibility: acceptTask == mark done
  acceptTask: (id: string) => Promise<void>;
  rejectTask: (id: string) => Promise<void>;

  // legacy exports
  claimTask?: (id: string, claimerId: string, claimerName: string) => Promise<void>;
  unclaimTask?: (id: string) => Promise<void>;
  requestDone?: (id: string, memberId: string, memberName: string) => Promise<void>;
  approveDone?: (id: string) => Promise<void>;
  rejectDone?: (id: string) => Promise<void>;
  completeAuto?: (id: string, memberId: string, memberName: string) => Promise<void>;
};

const TasksContext = createContext<TasksContextValue | null>(null);

function isoFromMs(ms: number) {
  return new Date(ms).toISOString();
}
function msFromIso(iso: any): number | null {
  if (!iso) return null;
  const t = new Date(String(iso)).getTime();
  return Number.isFinite(t) ? t : null;
}
function normalizeReminder(v: any): ReminderOffset | null {
  const n = Number(v);
  return n === 15 || n === 30 || n === 60 ? (n as ReminderOffset) : null;
}

function mapRow(row: any): Task {
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    status: row.status === "done" ? "done" : "open",

    createdAt: msFromIso(row.created_at),
    dueAt: msFromIso(row.due_at),
    completedAt: msFromIso(row.completed_at),

    assignedToId: row.assigned_to_id ?? null,
    assignedToName: row.assigned_to_name ?? null,

    createdById: row.created_by ?? null,
    acceptedAt: msFromIso(row.accepted_at),

    reminderOffsetMinutes: normalizeReminder(row.reminder_offset_minutes),

    repeatRule: row.repeat_rule ?? null,
    familyId: row.family_id ?? null,

    claimedById: row.claimed_by_id ?? null,
    claimedByName: row.claimed_by_name ?? null,
  };
}

function patchToDb(patch: TaskPatch): any {
  const out: any = {};
  if (patch.title !== undefined) out.title = patch.title;
  if (patch.status !== undefined) out.status = patch.status;
  if (patch.dueAt !== undefined) out.due_at = patch.dueAt ? isoFromMs(patch.dueAt) : null;
  if (patch.repeatRule !== undefined) out.repeat_rule = patch.repeatRule ?? null;

  if (patch.reminderOffsetMinutes !== undefined) out.reminder_offset_minutes = patch.reminderOffsetMinutes ?? null;

  if (patch.assignedToId !== undefined) out.assigned_to_id = patch.assignedToId ?? null;
  if (patch.assignedToName !== undefined) out.assigned_to_name = patch.assignedToName ?? null;

  if (patch.acceptedAt !== undefined) out.accepted_at = patch.acceptedAt ? isoFromMs(patch.acceptedAt) : null;
  if (patch.createdById !== undefined) out.created_by = patch.createdById ?? null;

  if (patch.completedAt !== undefined) out.completed_at = patch.completedAt ? isoFromMs(patch.completedAt) : null;

  return out;
}

export function TasksProvider(props: { children: ReactNode }) {
  const membersHook = useMembers ? useMembers() : null;
  const familyId: string | null = membersHook?.familyId ?? membersHook?.family_id ?? null;

  const [ready, setReady] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [refreshNonce, setRefreshNonce] = useState(0);

  async function refresh() {
    let q = supabase.from("tasks").select("*").order("created_at", { ascending: false });
    if (familyId) q = q.eq("family_id", familyId);

    const { data, error } = await q;
    if (error) throw error;
    setTasks((Array.isArray(data) ? data : []).map(mapRow));
    setReady(true);
  }

  useEffect(() => {
    refresh().catch(() => setReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familyId, refreshNonce]);

  // CRUD
  const addTask: TasksContextValue["addTask"] = async (title, opts) => {
    const dueAt = opts?.dueAt ?? null;
    const repeatRule = opts?.repeatRule ?? null;
    const reminderOffsetMinutes = opts?.reminderOffsetMinutes ?? null;
    const assignedToId = opts?.assignedToId ?? null;
    const assignedToName = opts?.assignedToName ?? null;

    const sess = await supabase.auth.getSession();
    const uid = sess.data.session?.user?.id ?? null;

    const insert: any = {
      title,
      status: "open",
      due_at: dueAt ? isoFromMs(dueAt) : null,
      repeat_rule: repeatRule ?? null,
      reminder_offset_minutes: reminderOffsetMinutes ?? null,
      assigned_to_id: assignedToId,
      assigned_to_name: assignedToName,
      created_by: uid,
      accepted_at: null,
    };

    if (familyId) insert.family_id = familyId;

    const { error } = await supabase.from("tasks").insert(insert);
    if (error) throw error;
    setRefreshNonce((x) => x + 1);
  };

  const updateTask: TasksContextValue["updateTask"] = async (id, patch) => {
    const { error } = await supabase.from("tasks").update(patchToDb(patch)).eq("id", id);
    if (error) throw error;
    setRefreshNonce((x) => x + 1);
  };

  const deleteTask: TasksContextValue["deleteTask"] = async (id) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw error;
    setRefreshNonce((x) => x + 1);
  };

  const setAssignee: TasksContextValue["setAssignee"] = async (id, assignedToId, assignedToName) => {
    const { error } = await supabase
      .from("tasks")
      .update({
        assigned_to_id: assignedToId,
        assigned_to_name: assignedToName,
        accepted_at: null,
        completed_at: null,
        status: "open",
      })
      .eq("id", id);

    if (error) throw error;
    setRefreshNonce((x) => x + 1);
  };

  /**
   * "Označi gotovo"
   * Implemented as RPC for consistency (and to avoid silent RLS failures).
   *
   * RPC: complete_task(p_task_id uuid)
   */
  const acceptTask: TasksContextValue["acceptTask"] = async (id) => {
    const local = tasks.find((t) => t.id === id);
    if (!local) return;

    const sess = await supabase.auth.getSession();
    const uid = sess.data.session?.user?.id ?? null;
    if (!uid || String(local.assignedToId ?? "") !== String(uid)) {
      throw new Error("Not allowed");
    }

    const { error } = await supabase.rpc("complete_task", { p_task_id: id });
    if (error) throw error;

    setRefreshNonce((x) => x + 1);
  };

  /**
   * "Odbij" -> free task for others
   *
   * RPC: reject_task(p_task_id uuid)
   */
  const rejectTask: TasksContextValue["rejectTask"] = async (id) => {
    const local = tasks.find((t) => t.id === id);
    if (!local) return;

    const sess = await supabase.auth.getSession();
    const uid = sess.data.session?.user?.id ?? null;
    if (!uid || String(local.assignedToId ?? "") !== String(uid)) {
      throw new Error("Not allowed");
    }

    const { error } = await supabase.rpc("reject_task", { p_task_id: id });
    if (error) throw error;

    setRefreshNonce((x) => x + 1);
  };

  // Legacy wrappers
  const claimTask: TasksContextValue["claimTask"] = async (id, claimerId, claimerName) => {
    await setAssignee(id, claimerId, claimerName);
  };
  const unclaimTask: TasksContextValue["unclaimTask"] = async (id) => {
    await setAssignee(id, null, null);
  };
  const requestDone: TasksContextValue["requestDone"] = async (id) => {
    await acceptTask(id);
  };
  const approveDone: TasksContextValue["approveDone"] = async () => {
    return;
  };
  const rejectDone: TasksContextValue["rejectDone"] = async () => {
    return;
  };
  const completeAuto: TasksContextValue["completeAuto"] = async (id) => {
    await acceptTask(id);
  };

  const value = useMemo<TasksContextValue>(
    () => ({
      ready,
      tasks,
      refresh,
      addTask,
      updateTask,
      deleteTask,
      setAssignee,
      acceptTask,
      rejectTask,

      claimTask,
      unclaimTask,
      requestDone,
      approveDone,
      rejectDone,
      completeAuto,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ready, tasks, familyId]
  );

  return <TasksContext.Provider value={value}>{props.children}</TasksContext.Provider>;
}

export function useTasks(): TasksContextValue {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used within <TasksProvider>");
  return ctx;
}
