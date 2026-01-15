import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type PushReq = {
  // Direct recipients
  to_user_id?: string;
  to_user_ids?: string[];

  // Or: send to a group in a family (requires service role)
  family_id?: string;
  to_role?: "parent" | "child" | "all";
  exclude_user_id?: string;

  // Message
  title: string;
  body?: string;
  data?: Record<string, unknown>;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr.filter(Boolean)));
}

async function sendExpo(tokens: string[], title: string, body?: string, data?: Record<string, unknown>) {
  if (!tokens.length) return { sent: 0, expo: null };

  // Expo push endpoint accepts an array; keep it simple (most families are small)
  const messages = tokens.map((token) => ({
    to: token,
    sound: "default",
    title,
    body: body ?? "",
    data: data ?? {},
  }));

  const expoRes = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(messages),
  });

  const expoJson = await expoRes.json().catch(() => null);
  return { sent: tokens.length, expo: expoJson };
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const payload = (await req.json()) as Partial<PushReq>;
    const title = String(payload?.title ?? "").trim();
    if (!title) return json({ error: "Missing title" }, 400);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      return json({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1) Determine recipients (user ids)
    let userIds: string[] = [];

    if (payload.to_user_id) userIds.push(String(payload.to_user_id));
    if (Array.isArray(payload.to_user_ids)) userIds.push(...payload.to_user_ids.map((x) => String(x)));

    // If family group targeting used:
    if (!userIds.length && payload.family_id) {
      const familyId = String(payload.family_id);
      const role = (payload.to_role ?? "all") as "parent" | "child" | "all";

      let q = supabase.from("family_members").select("user_id").eq("family_id", familyId);

      if (role !== "all") q = q.eq("role", role);

      if (payload.exclude_user_id) q = q.neq("user_id", String(payload.exclude_user_id));

      const { data: famRows, error: famErr } = await q;
      if (famErr) throw famErr;

      userIds = (famRows ?? []).map((r: any) => r.user_id).filter(Boolean);
    }

    userIds = uniq(userIds);

    if (!userIds.length) {
      return json({ ok: true, sent: 0, reason: "No recipients" });
    }

    // 2) Fetch tokens for all recipients
    const { data: tokenRows, error: tokErr } = await supabase
      .from("user_push_tokens")
      .select("token")
      .in("user_id", userIds);

    if (tokErr) throw tokErr;

    const tokens = uniq((tokenRows ?? []).map((r: any) => r.token).filter(Boolean));

    if (!tokens.length) {
      return json({ ok: true, sent: 0, recipients: userIds.length, reason: "No tokens" });
    }

    // 3) Send through Expo
    const result = await sendExpo(tokens, title, payload.body, (payload.data as any) ?? {});

    return json({ ok: true, recipients: userIds.length, tokens: tokens.length, ...result });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
