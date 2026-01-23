// /lib/tasks.tsx
import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

/**
 * NOTE
 * ----
 * This file is intentionally self-contained and conservative.
 * It implements the simplified Famigo task workflow:
 *
 * - Statuses: "open" | "done"
 * - Accept:
 *    - if reminderOffsetMinutes is set (15/30/60) -> accept = "preuzeo sam" (acceptedAt set, stays OPEN)
 *    - if reminderOffsetMinutes is null -> accept = DONE immediately
 * - Reject:
 *    - unassign (assignedToId/name -> null) + acceptedAt null, stays OPEN
 *
 * It does NOT depend on any push-notification helper imports, to avoid build breaks.
 * (You can later add push notifications server-side / in edge functions.)
 */

/**
 * Adjust this import path ONLY if your supabase client lives elsewhere.
 * Common alternatives:
 *   - import { supabase } from "./supabase";
 *   - import { supabase } from "../lib/supabase";
 */
import { supabase } from "./supabase";

/**
 * Optional: if you already have useMembers and a familyId, we can filter by it.
 * If this import path doesn't exist in your project, you can safely remove these
 * few lines and the family filtering (search for "familyId").
 */
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

  // timestamps are stored as epoch ms in the app layer
  createdAt?: number | null;
  dueAt?: number | null;
  completedAt?: number | null;

  // assignee is an auth user id in this implementation
  assignedToId?: string | null;
  assignedToName?: string | null;

  // who created the task (auth user id)
  createdById?: string | null;

  // accept tracking
  acceptedAt?: number | null;

  // reminders
  reminderOffsetMinutes?: ReminderOffset | null;

  // repeat (kept for compatibility with your existing UI)
  repeatRule?: string | null;

  // optional: familyId if your schema supports it
  familyId?: string | null;

  // legacy fields (kept optional to avoid breaking older UI)
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

  addTask: (title: string, opts?: Partial<{ dueAt: number | null; repeatRule: string | null; reminderOffsetMinutes: ReminderOffset | null; assignedToId: string | null; assignedToName: string | null }>) => Promise<void>;
  updateTask: (id: string, patch: TaskPatch) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  setAssignee: (id: string, assignedToId: string | null, assignedToName: string | null) => Promise<void>;

  acceptTask: (id: string) => Promise<void>;
  rejectTask: (id: string) => Promise<void>;

  // legacy exports (optional): kept so other screens don't explode if they still import these
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

    // legacy (optional)
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
    // If your schema has family_id, we filter by it. If not, we simply load all tasks visible to the user via RLS.
    let q = supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

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
        accepted_at: null, // changing assignee clears acceptance
      })
      .eq("id", id);

    if (error) throw error;
    setRefreshNonce((x) => x + 1);
  };

  /**
   * ACCEPT (new simplified workflow)
   * - if reminder is OFF (null) => DONE immediately
   * - if reminder is set => accepted_at set, stays OPEN (auto-close handled server-side at dueAt if accepted)
   */
  const acceptTask: TasksContextValue["acceptTask"] = async (id) => {
    const local = tasks.find((t) => t.id === id);
    if (!local) return;

    const sess = await supabase.auth.getSession();
    const uid = sess.data.session?.user?.id ?? null;
    if (!uid || String(local.assignedToId ?? "") !== String(uid)) {
      throw new Error("Not allowed");
    }

    const nowIso = new Date().toISOString();
    const hasReminder = local.reminderOffsetMinutes === 15 || local.reminderOffsetMinutes === 30 || local.reminderOffsetMinutes === 60;

    if (!hasReminder) {
      const { error } = await supabase
        .from("tasks")
        .update({ status: "done", completed_at: nowIso, accepted_at: nowIso })
        .eq("id", id)
        .eq("assigned_to_id", uid);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("tasks")
        .update({ status: "open", accepted_at: nowIso })
        .eq("id", id)
        .eq("assigned_to_id", uid);

      if (error) throw error;
    }

    setRefreshNonce((x) => x + 1);
  };

  /**
   * REJECT
   * - unassign + clear accepted_at, stays OPEN
   */
  const rejectTask: TasksContextValue["rejectTask"] = async (id) => {
    const local = tasks.find((t) => t.id === id);
    if (!local) return;

    const sess = await supabase.auth.getSession();
    const uid = sess.data.session?.user?.id ?? null;
    if (!uid || String(local.assignedToId ?? "") !== String(uid)) {
      throw new Error("Not allowed");
    }

    const { error } = await supabase
      .from("tasks")
      .update({
        status: "open",
        assigned_to_id: null,
        assigned_to_name: null,
        accepted_at: null,
        completed_at: null,
      })
      .eq("id", id)
      .eq("assigned_to_id", uid);

    if (error) throw error;
    setRefreshNonce((x) => x + 1);
  };

  // Legacy wrappers (optional): keep old calls from older UI from crashing
  const claimTask: TasksContextValue["claimTask"] = async (id, claimerId, claimerName) => {
    // Legacy: we treat "claim" as "set assignee to myself"
    await setAssignee(id, claimerId, claimerName);
  };
  const unclaimTask: TasksContextValue["unclaimTask"] = async (id) => {
    // Legacy: unassign
    await setAssignee(id, null, null);
  };
  const requestDone: TasksContextValue["requestDone"] = async (id) => {
    // Legacy: mark done immediately
    await updateTask(id, { status: "done", completedAt: Date.now() });
  };
  const approveDone: TasksContextValue["approveDone"] = async () => {
    // No-op in simplified flow
    return;
  };
  const rejectDone: TasksContextValue["rejectDone"] = async () => {
    // No-op in simplified flow
    return;
  };
  const completeAuto: TasksContextValue["completeAuto"] = async (id) => {
    // Legacy: done
    await updateTask(id, { status: "done", completedAt: Date.now() });
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
