// /lib/family.ts
import { supabase } from "../src/supabase";

export async function leaveFamily_profileFamilyId(userId: string) {
  const { error } = await supabase
    .from("profiles")
    .update({ family_id: null })
    .eq("id", userId);

  if (error) throw error;
}

export async function joinFamilyWithCode_profileFamilyId(userId: string, code: string) {
  // OVDJE pretpostavljam da imaš tablicu "family_invites" ili slično
  // sa stupcima: code, family_id, expires_at
  const { data: invite, error: invErr } = await supabase
    .from("family_invites")
    .select("family_id, expires_at")
    .eq("code", code)
    .maybeSingle();

  if (invErr) throw invErr;
  if (!invite?.family_id) throw new Error("INVALID_CODE");

  if (invite.expires_at && new Date(invite.expires_at).getTime() < Date.now()) {
    throw new Error("EXPIRED_CODE");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ family_id: invite.family_id })
    .eq("id", userId);

  if (error) throw error;
}
