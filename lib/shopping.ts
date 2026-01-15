// /lib/shopping.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import { supabase } from "./supabase";

export type ShoppingItem = {
  id: string;
  family_id: string;

  title: string;
  qty: string | null;
  note: string | null;

  bought: boolean;
  bought_at: string | null;
  bought_by: string | null;

  created_by: string;
  created_at: string;
};

function cleanTitle(v: string) {
  return String(v ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

export async function fetchShoppingItems(args: { familyId: string; includeBought?: boolean }) {
  const { familyId, includeBought } = args;

  let q = supabase
    .from("shopping_items")
    .select("*")
    .eq("family_id", familyId)
    .order("created_at", { ascending: false });

  if (!includeBought) q = q.eq("bought", false);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as ShoppingItem[];
}

export async function addShoppingItem(args: {
  familyId: string;
  title: string;
  qty?: string | null;
  note?: string | null;
}) {
  const title = cleanTitle(args.title);
  if (!title) throw new Error("Missing title");

  const { data: s, error: sessErr } = await supabase.auth.getSession();
  if (sessErr) throw sessErr;

  const uid = s.session?.user?.id;
  if (!uid) throw new Error("Not signed in");

  const payload = {
    family_id: args.familyId,
    title,
    qty: args.qty ?? null,
    note: args.note ?? null,
    created_by: uid,
  };

  const { data, error } = await supabase.from("shopping_items").insert(payload).select("*").single();
  if (error) throw error;
  return data as ShoppingItem;
}

/**
 * ✅ Parent action: mark item bought/unbought
 * NOTE: RLS should allow UPDATE only for parents.
 */
export async function markShoppingBought(args: { id: string; bought: boolean }) {
  const { data: s, error: sessErr } = await supabase.auth.getSession();
  if (sessErr) throw sessErr;

  const uid = s.session?.user?.id;
  if (!uid) throw new Error("Not signed in");

  const patch = args.bought
    ? { bought: true, bought_at: new Date().toISOString(), bought_by: uid }
    : { bought: false, bought_at: null, bought_by: null };

  const { data, error } = await supabase
    .from("shopping_items")
    .update(patch)
    .eq("id", args.id)
    .select("*")
    .single();

  if (error) throw error;
  return data as ShoppingItem;
}

export async function deleteShoppingItem(id: string) {
  const { error } = await supabase.from("shopping_items").delete().eq("id", id);
  if (error) throw error;
  return true;
}

/**
 * Hook:
 * - auto refresh
 * - realtime refresh on changes (same family_id)
 */
export function useShopping(familyId: string | null, opts?: { includeBought?: boolean }) {
  const includeBought = !!opts?.includeBought;

  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(false);

  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    if (!familyId) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchShoppingItems({ familyId, includeBought });
      if (mounted.current) setItems(data);
    } catch (e: any) {
      console.log("[shopping] refresh error", e);
      if (mounted.current) Alert.alert("Shopping", String(e?.message ?? e));
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [familyId, includeBought]);

  useEffect(() => {
    mounted.current = true;
    refresh();
    return () => {
      mounted.current = false;
    };
  }, [refresh]);

  useEffect(() => {
    if (!familyId) return;

    const ch = supabase
      .channel(`shopping_items:${familyId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shopping_items", filter: `family_id=eq.${familyId}` },
        () => refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [familyId, refresh]);

  const openCount = useMemo(() => items.filter((x) => !x.bought).length, [items]);

  return { items, loading, refresh, openCount };
}
