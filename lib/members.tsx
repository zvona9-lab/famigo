// /lib/members.tsx
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";

// NOTE: Members is used very early in app boot. Avoid hard dependency on locale hooks.
// Use safe fallbacks here so Settings/Join doesn't crash if locale module shape changes.
function trSafe(key: string): string {
  if (key === "members.defaultFamilyName") return "Family";
  if (key === "members.errorTitle") return "Error";
  return "";
}

const MEMBERS_KEY_V3 = "famigo.members.v3";

export type MemberRole = "parent" | "child";

export type Member = {
  // In-app member id is the auth user_id (so we can compare with session.user.id)
  id: string;
  name: string;
  role: MemberRole;

  // New: profile fields used for avatars & Settings UI
  gender?: "male" | "female" | null;
  avatarKey?: string | null;

  createdAt: number;
};

type FamilyInfo = {
  // ✅ keep both for compatibility
  id: string;
  familyId: string;
  familyName: string;
  
  inviteCode: string;
};;

type SnapshotV3 = {
  family: FamilyInfo | null;
  members: Member[];
  myId: string | null;
  me: Member | null;
};

type MembersContextValue = {
  ready: boolean;

  inFamily: boolean;
  // ✅ canonical family id for the rest of the app (Tasks, etc.)
  familyId: string | null;
  familyName: string | null;
  inviteCode: string | null;

  // ✅ optional full family info
  family: FamilyInfo | null;

  myId: string | null;
  me: Member | null;

  isParent: boolean;
  members: Member[];

  refreshMembers: (force?: boolean) => Promise<void>;

  createFamily: (familyName: string) => Promise<boolean>;
  joinFamilyWithCode: (code: string) => Promise<boolean>;
  leaveFamily: () => Promise<boolean>;
  deleteFamily: () => Promise<boolean>;

  setMyName: (newName: string) => Promise<boolean>;
  renameMember: (memberId: string, newName: string) => Promise<boolean>;
  setMemberRole: (memberId: string, newRole: MemberRole) => Promise<boolean>;
  removeMember: (memberId: string) => Promise<boolean>;

  getParentsCount: () => number;
};

const MembersContext = createContext<MembersContextValue | null>(null);

const safeName = (v: string) => String(v ?? "").trim().replace(/\s+/g, " ").slice(0, 40);
const cleanInviteCode = (v: string) => String(v ?? "").trim().toUpperCase().replace(/\s+/g, "");

async function persistSnapshot(s: SnapshotV3) {
  try {
    await AsyncStorage.setItem(MEMBERS_KEY_V3, JSON.stringify(s));
  } catch {
    // ignore
  }
}

async function clearSnapshot() {
  try {
    await AsyncStorage.removeItem(MEMBERS_KEY_V3);
  } catch {
    // ignore
  }
}

async function loadSnapshot(): Promise<SnapshotV3 | null> {
  try {
    const raw = await AsyncStorage.getItem(MEMBERS_KEY_V3);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function loadFamilyAndMembers(): Promise<{ family: FamilyInfo | null; members: Member[] }> {
  const { data: fid, error: fidErr } = await supabase.rpc("my_family");
  if (fidErr) throw fidErr;

  if (!fid) return { family: null, members: [] };

  const { data: fam, error: famErr } = await supabase
    .from("families")
    .select("id,name,invite_code")
    .eq("id", fid)
    .maybeSingle();

  if (famErr) throw famErr;
  if (!fam) return { family: null, members: [] };

  const { data: rows, error: memErr } = await supabase.rpc("family_members");
  if (memErr) throw memErr;

  const members: Member[] = (rows ?? []).map((r: any) => ({
    id: String(r.user_id),
    name: safeName(r.display_name),
    role: r.role === "parent" ? "parent" : "child",

    gender: r.gender === "female" ? "female" : r.gender === "male" ? "male" : null,
    avatarKey: r.avatar_key ? String(r.avatar_key) : null,

    createdAt: typeof r.created_at === "string" ? Date.parse(r.created_at) : Date.now(),
  }));

  const famId = String(fam.id);
  return {
    family: {
      id: famId,
      familyId: famId,
      familyName: String(fam.name ?? "").trim() || trSafe("members.defaultFamilyName"),
      inviteCode: String(fam.invite_code ?? "").trim(),
    },
    members,
  };
}

export function MembersProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  const [family, setFamily] = useState<FamilyInfo | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [me, setMe] = useState<Member | null>(null);

  const loading = useRef(false);
  const snapshotMyIdRef = useRef<string | null>(null);

  const refreshMembers = async (force?: boolean) => {
    if (loading.current && !force) return;
    loading.current = true;

    try {
      const { data: s, error: sessErr } = await supabase.auth.getSession();
      if (sessErr) throw sessErr;

      const uid = s.session?.user?.id ?? null;
      setMyId(uid);

      // If we loaded a cached snapshot for a different user, clear it to avoid wrong routing (stale family/me).
      if (uid && snapshotMyIdRef.current && snapshotMyIdRef.current !== uid) {
        snapshotMyIdRef.current = uid;
        setFamily(null);
        setMembers([]);
        setMe(null);
        await clearSnapshot();
      } else if (!uid) {
        snapshotMyIdRef.current = null;
      }

      if (!uid) {
        setFamily(null);
        setMembers([]);
        setMe(null);
        await clearSnapshot();
        setReady(true);
        return;
      }

      const { family: f, members: list } = await loadFamilyAndMembers();
      const my = list.find((m) => m.id === uid) ?? null;

      // SAFETY: treat as "not in family" unless the current user is actually present in the members list.
      // This prevents accidental routing to Home due to a buggy my_family() or stale server data.
      const effectiveFamily = my ? f : null;

      setFamily(effectiveFamily);
      setMembers(list);
      setMe(my);

      if (f) {
        await persistSnapshot({ family: f, members: list, myId: uid, me: my });
      } else {
        await clearSnapshot();
      }

      setReady(true);
    } catch (e: any) {
      console.log("[members] refreshMembers error", e);
      // IMPORTANT: on error, clear cached state so we don't route user to the wrong place (stale snapshot).
      setFamily(null);
      setMembers([]);
      setMe(null);
      await clearSnapshot();
      Alert.alert(trSafe("members.errorTitle"), String(e?.message ?? e));
      setReady(true);

    } finally {
      loading.current = false;
    }
  };

  useEffect(() => {
    loadSnapshot().then((s) => {
      if (s) {
        snapshotMyIdRef.current = s.myId ?? null;
        setFamily(s.family);
        setMembers(s.members);
        setMyId(s.myId);
        setMe(s.me);
      }
      refreshMembers();
    });

    const { data } = supabase.auth.onAuthStateChange(() => {
      refreshMembers();
    });

    return () => data.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<MembersContextValue>(
    () => ({
      ready,

      inFamily: !!family,
      familyId: family?.familyId ?? null,
      familyName: family?.familyName ?? null,
      inviteCode: family?.inviteCode ?? null,
      family: family ?? null,

      myId,
      me,

      isParent: me?.role === "parent",
      members,

      refreshMembers,

      createFamily: async (n) => {
        try {
          const { error } = await supabase.rpc("create_family", {
            family_name: safeName(n),
            display_name: me?.name ?? null,
          });
          if (error) {
            Alert.alert(trSafe("members.errorTitle"), error.message);
            return false;
          }
          await refreshMembers();
          return true;
        } catch (e: any) {
          Alert.alert(trSafe("members.errorTitle"), String(e?.message ?? e));
          return false;
        }
      },

      joinFamilyWithCode: async (c) => {
        try {
          const { error } = await supabase.rpc("join_family", {
            invite: cleanInviteCode(c),
            display_name: me?.name ?? null,
          });
          if (error) {
            Alert.alert(trSafe("members.errorTitle"), error.message);
            return false;
          }
          await refreshMembers();
          return true;
        } catch (e: any) {
          Alert.alert(trSafe("members.errorTitle"), String(e?.message ?? e));
          return false;
        }
      },

      leaveFamily: async () => {
        try {
          const { error } = await supabase.rpc("leave_family");
          if (error) {
            Alert.alert(trSafe("members.errorTitle"), error.message);
            return false;
          }
          await refreshMembers();
          return true;
        } catch (e: any) {
          Alert.alert(trSafe("members.errorTitle"), String(e?.message ?? e));
          return false;
        }
      },

      deleteFamily: async () => {
        try {
          const { error } = await supabase.rpc("delete_family");
          if (error) {
            Alert.alert(trSafe("members.errorTitle"), error.message);
            return false;
          }
          await refreshMembers();
          return true;
        } catch (e: any) {
          Alert.alert(trSafe("members.errorTitle"), String(e?.message ?? e));
          return false;
        }
      },

      setMyName: async (n) => {
        try {
          const { error } = await supabase.rpc("rename_me", { new_name: safeName(n) });
          if (error) {
            Alert.alert(trSafe("members.errorTitle"), error.message);
            return false;
          }
          await refreshMembers();
          return true;
        } catch (e: any) {
          Alert.alert(trSafe("members.errorTitle"), String(e?.message ?? e));
          return false;
        }
      },

      renameMember: async (id, n) => {
        try {
          const { error } = await supabase.rpc("rename_member", {
            member_id: id,
            new_name: safeName(n),
          });
          if (error) {
            Alert.alert(trSafe("members.errorTitle"), error.message);
            return false;
          }
          await refreshMembers();
          return true;
        } catch (e: any) {
          Alert.alert(trSafe("members.errorTitle"), String(e?.message ?? e));
          return false;
        }
      },

      setMemberRole: async (id, role) => {
        try {
          const { error } = await supabase.rpc("set_member_role", {
            member_id: id,
            new_role: role,
          });
          if (error) {
            Alert.alert(trSafe("members.errorTitle"), error.message);
            return false;
          }
          await refreshMembers();
          return true;
        } catch (e: any) {
          Alert.alert(trSafe("members.errorTitle"), String(e?.message ?? e));
          return false;
        }
      },

      removeMember: async (id) => {
        try {
          const { error } = await supabase.rpc("remove_member", { member_id: id });
          if (error) {
            Alert.alert(trSafe("members.errorTitle"), error.message);
            return false;
          }
          await refreshMembers();
          return true;
        } catch (e: any) {
          Alert.alert(trSafe("members.errorTitle"), String(e?.message ?? e));
          return false;
        }
      },

      getParentsCount: () => members.filter((m) => m.role === "parent").length,
    }),
    [ready, family, members, myId, me]
  );

  return <MembersContext.Provider value={value}>{children}</MembersContext.Provider>;
}

export function useMembers() {
  const ctx = useContext(MembersContext);
  if (!ctx) throw new Error("useMembers must be used inside MembersProvider");
  return ctx;
}
