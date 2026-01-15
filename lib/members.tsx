// /lib/members.tsx
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";
import { tr } from "./locale";

const MEMBERS_KEY_V2 = "famigo.members.v2";

export type MemberRole = "parent" | "child";

export type Member = {
  id: string;
  name: string;
  role: MemberRole;
  createdAt: number;
};

type FamilyInfo = {
  // ✅ keep both for compatibility
  id: string;
  familyId: string;
  familyName: string;
  
  inviteCode: string;
};;

type SnapshotV2 = {
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

  refreshMembers: () => Promise<void>;

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

async function persistSnapshot(s: SnapshotV2) {
  try {
    await AsyncStorage.setItem(MEMBERS_KEY_V2, JSON.stringify(s));
  } catch {
    // ignore
  }
}

async function clearSnapshot() {
  try {
    await AsyncStorage.removeItem(MEMBERS_KEY_V2);
  } catch {
    // ignore
  }
}

async function loadSnapshot(): Promise<SnapshotV2 | null> {
  try {
    const raw = await AsyncStorage.getItem(MEMBERS_KEY_V2);
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
    createdAt: typeof r.created_at === "string" ? Date.parse(r.created_at) : Date.now(),
  }));

  const famId = String(fam.id);
  return {
    family: {
      id: famId,
      familyId: famId,
      familyName: String(fam.name ?? "").trim() || tr("members.defaultFamilyName"),
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

  const refreshMembers = async () => {
    if (loading.current) return;
    loading.current = true;

    try {
      const { data: s, error: sessErr } = await supabase.auth.getSession();
      if (sessErr) throw sessErr;

      const uid = s.session?.user?.id ?? null;
      setMyId(uid);

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

      setFamily(f);
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
      Alert.alert(tr("members.errorTitle"), String(e?.message ?? e));
      setReady(true);
    } finally {
      loading.current = false;
    }
  };

  useEffect(() => {
    loadSnapshot().then((s) => {
      if (s) {
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
            Alert.alert(tr("members.errorTitle"), error.message);
            return false;
          }
          await refreshMembers();
          return true;
        } catch (e: any) {
          Alert.alert(tr("members.errorTitle"), String(e?.message ?? e));
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
            Alert.alert(tr("members.errorTitle"), error.message);
            return false;
          }
          await refreshMembers();
          return true;
        } catch (e: any) {
          Alert.alert(tr("members.errorTitle"), String(e?.message ?? e));
          return false;
        }
      },

      leaveFamily: async () => {
        try {
          const { error } = await supabase.rpc("leave_family");
          if (error) {
            Alert.alert(tr("members.errorTitle"), error.message);
            return false;
          }
          await refreshMembers();
          return true;
        } catch (e: any) {
          Alert.alert(tr("members.errorTitle"), String(e?.message ?? e));
          return false;
        }
      },

      deleteFamily: async () => {
        try {
          const { error } = await supabase.rpc("delete_family");
          if (error) {
            Alert.alert(tr("members.errorTitle"), error.message);
            return false;
          }
          await refreshMembers();
          return true;
        } catch (e: any) {
          Alert.alert(tr("members.errorTitle"), String(e?.message ?? e));
          return false;
        }
      },

      setMyName: async (n) => {
        try {
          const { error } = await supabase.rpc("rename_me", { new_name: safeName(n) });
          if (error) {
            Alert.alert(tr("members.errorTitle"), error.message);
            return false;
          }
          await refreshMembers();
          return true;
        } catch (e: any) {
          Alert.alert(tr("members.errorTitle"), String(e?.message ?? e));
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
            Alert.alert(tr("members.errorTitle"), error.message);
            return false;
          }
          await refreshMembers();
          return true;
        } catch (e: any) {
          Alert.alert(tr("members.errorTitle"), String(e?.message ?? e));
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
            Alert.alert(tr("members.errorTitle"), error.message);
            return false;
          }
          await refreshMembers();
          return true;
        } catch (e: any) {
          Alert.alert(tr("members.errorTitle"), String(e?.message ?? e));
          return false;
        }
      },

      removeMember: async (id) => {
        try {
          const { error } = await supabase.rpc("remove_member", { member_id: id });
          if (error) {
            Alert.alert(tr("members.errorTitle"), error.message);
            return false;
          }
          await refreshMembers();
          return true;
        } catch (e: any) {
          Alert.alert(tr("members.errorTitle"), String(e?.message ?? e));
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
