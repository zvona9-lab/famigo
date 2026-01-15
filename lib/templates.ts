// /lib/templates.ts
// Centralized Templates storage (AsyncStorage) so Tasks screen and Templates screen stay in sync.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { randomUUID } from "expo-crypto";
import type { Task } from "./tasks";

export type TaskTemplate = {
  id: string;
  name: string;

  // minimal fields for prefill (as your Templates screen already expects)
  title: string;
  repeatDays?: string;
  timeDigits?: string;
  autoComplete?: boolean;
};

export const TEMPLATES_KEY = "famigo_task_templates_v1";

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function getTemplates(): Promise<TaskTemplate[]> {
  const raw = await AsyncStorage.getItem(TEMPLATES_KEY);
  const list = safeJsonParse<TaskTemplate[]>(raw, []);
  return Array.isArray(list) ? list : [];
}

export async function setTemplates(next: TaskTemplate[]): Promise<void> {
  await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(next ?? []));
}

export async function deleteTemplate(id: string): Promise<TaskTemplate[]> {
  const list = await getTemplates();
  const next = list.filter((t) => t.id !== id);
  await setTemplates(next);
  return next;
}

export function templateFromTask(task: Task, name?: string): TaskTemplate {
  // Keep it intentionally minimal: only what Templates -> Tasks prefill currently supports.
  const baseName = (name || "").trim();
  return {
    id: randomUUID(),
    name: baseName || (task.title || "Template").slice(0, 40),
    title: (task.title || "").trim() || "Untitled",
  };
}

export async function addTemplate(tpl: TaskTemplate): Promise<TaskTemplate[]> {
  const list = await getTemplates();
  const next = [tpl, ...list];
  await setTemplates(next);
  return next;
}

export async function saveTaskAsTemplate(task: Task, name?: string): Promise<TaskTemplate> {
  const tpl = templateFromTask(task, name);
  await addTemplate(tpl);
  return tpl;
}
