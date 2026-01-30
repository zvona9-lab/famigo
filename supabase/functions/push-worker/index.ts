import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type QueueRow = {
  id: string;
  type: string;
  user_id: string;
  task_id: string | null;
  family_id: string | null;
  payload: any;
  processed: boolean;
  created_at: string;
};

function extractExpoToken(row: any): string | null {
  if (!row || typeof row !== "object") return null;

  const candidates = [
    (row as any).expo_push_token,
    (row as any).push_token,
    (row as any).token,
    (row as any).expoToken,
    (row as any).expo_token,
  ].filter((x: any) => typeof x === "string");

  const anyStrings = Object.values(row).filter((v) => typeof v === "string") as string[];
  const all = [...candidates, ...anyStrings];

  return (
    all.find(
      (s) =>
        s.startsWith("ExponentPushToken[") ||
        s.startsWith("ExpoPushToken[")
    ) ?? null
  );
}

function buildShoppingBody(payload: any): { title: string; body: string } {
  const from = String(payload?.from_name ?? "").trim();
  const titles: string[] = Array.isArray(payload?.titles)
    ? payload.titles.map((x: any) => String(x)).filter(Boolean)
    : [];

  const max = 8;
  const head = titles.slice(0, max);
  const more = titles.length - head.length;

  const list = head.join(", ");
  const bodyFromPayload = typeof payload?.body === "string" ? payload.body : null;

  const body =
    bodyFromPayload ??
    (more > 0 ? `${list} +${more} more` : list || "Open the app");

  const title = from ? `${from} shared a shopping list` : "Shopping list";
  return { title, body };
}

function buildTaskReminderBody(payload: any): { title: string; body: string } {
  // payload from enqueue_due_task_reminders includes: title, due_at, reminder_at, etc.
  const taskTitle = String(payload?.title ?? "").trim();
  const dueAt = payload?.due_at ? String(payload.due_at) : "";
  const title = taskTitle || "Task reminder";
  const body = dueAt ? `Due: ${dueAt}` : "Open the app";
  return { title, body };
}

async function sendExpoPush(messages: any[]) {
  const res = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(messages),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Expo push failed: ${text}`);
  }
}

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  const authHeader = req?.headers?.get("authorization") ?? req?.headers?.get("Authorization") ?? "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : authHeader.trim();
  const serviceKey = serviceRole || bearer || null;

  if (!supabaseUrl || !serviceKey) {
    return new Response("Missing env vars", { status: 500 });
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: rows, error } = await admin
    .from("notification_queue")
    .select("*")
    .eq("processed", false)
    .order("created_at", { ascending: true })
    .limit(10);

  if (error || !rows?.length) {
    return new Response(
      JSON.stringify({ ok: true, processed: 0, note: "No queue items" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  let processedCount = 0;

  for (const item of rows as QueueRow[]) {
    const supported =
      item.type === "task_assigned" ||
      item.type === "task_reminder" ||
      item.type === "shopping_list_sent" ||
      item.type === "planner_evening_reminder";

    // Mark unsupported items as processed to avoid clogging the queue
    if (!supported) {
      await admin.from("notification_queue").update({ processed: true }).eq("id", item.id);
      processedCount++;
      continue;
    }

    const { data: tokenRows } = await admin
      .from("user_push_tokens")
      .select("*")
      .eq("user_id", item.user_id);

    const tokens =
      tokenRows
        ?.map(extractExpoToken)
        .filter((t): t is string => Boolean(t)) ?? [];

    // If user has no valid tokens, consider it processed to avoid retry loops
    if (!tokens.length) {
      await admin.from("notification_queue").update({ processed: true }).eq("id", item.id);
      processedCount++;
      continue;
    }

    if (item.type === "task_assigned") {
      const title = item.payload?.title ?? "You have a new task";
      const body = item.payload?.task_title ?? "Open the app";

      await sendExpoPush(
        tokens.map((to) => ({
          to,
          title,
          body,
          data: {
            kind: "task_assigned",
            task_id: item.task_id,
            family_id: item.family_id,
          },
        }))
      );

      await admin.from("notification_queue").update({ processed: true }).eq("id", item.id);
      processedCount++;
      continue;
    }

    if (item.type === "task_reminder") {
      const tb = buildTaskReminderBody(item.payload);

      await sendExpoPush(
        tokens.map((to) => ({
          to,
          title: tb.title,
          body: tb.body,
          data: {
            kind: "task_reminder",
            task_id: item.task_id,
            family_id: item.family_id,
          },
        }))
      );

      await admin.from("notification_queue").update({ processed: true }).eq("id", item.id);
      processedCount++;
      continue;
    }


    if (item.type === "planner_evening_reminder") {
      const count = Number(item.payload?.count ?? 0);

      const title = "🗓️ Sutra imate plan";
      const body =
        count > 1
          ? `Imate ${count} planirane obaveze za sutra`
          : "Imate 1 planiranu obavezu za sutra";

      await sendExpoPush(
        tokens.map((to) => ({
          to,
          title,
          body,
          data: {
            kind: "planner",
            family_id: item.family_id,
          },
        }))
      );

      await admin.from("notification_queue").update({ processed: true }).eq("id", item.id);
      processedCount++;
      continue;
    }

    // shopping_list_sent
    const sb = buildShoppingBody(item.payload);
    await sendExpoPush(
      tokens.map((to) => ({
        to,
        title: sb.title,
        body: sb.body,
        data: {
          kind: "shopping_list",
          family_id: item.family_id,
        },
      }))
    );

    await admin.from("notification_queue").update({ processed: true }).eq("id", item.id);
    processedCount++;
  }

  return new Response(
    JSON.stringify({ ok: true, processed: processedCount }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
