import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { FONT, LETTER_SPACING } from "../../lib/typography";

import { Screen } from "../../src/ui/components/Screen";
import { Card } from "../../src/ui/components/Card";
import { Button } from "../../src/ui/components/Button";
import { SectionTitle } from "../../src/ui/components/SectionTitle";
import { EmptyState } from "../../src/ui/components/EmptyState";
import { theme } from "../../src/ui/theme";

import { useT } from "../../lib/useT";
import { useMembers, MemberRole } from "../../lib/members";
import { useTasks } from "../../lib/tasks";
import { useLocale } from "../../lib/locale";

type MemberRow = {
  id: string;
  name: string;
  role: "parent" | "child";
  gender?: "male" | "female" | null;
  avatarKey?: "mom" | "dad" | "girl" | "boy" | null;
  tasksDoneToday: number;
};

/**
 * AVATARI (4 kom)
 *
 * Preporučena putanja (u rootu projekta):
 *  /assets/avatars/mom.png
 *  /assets/avatars/dad.png
 *  /assets/avatars/girl.png
 *  /assets/avatars/boy.png
 *
 * Ako ti je folder drugačiji, samo promijeni require() putanje ispod.
 */
const AVATARS: Record<string, any> = {
  mom: require("../../assets/avatars/mom.png"),
  dad: require("../../assets/avatars/dad.png"),
  girl: require("../../assets/avatars/girl.png"),
  boy: require("../../assets/avatars/boy.png"),
};

const TYPO = {
  title: { fontFamily: FONT.title, letterSpacing: LETTER_SPACING.title },
  body: { fontFamily: FONT.body, letterSpacing: LETTER_SPACING.body },
};


function resolveAvatarKey(m: { role?: string; gender?: string; avatarKey?: string }): "mom" | "dad" | "girl" | "boy" {
  const role = m?.role === "child" ? "child" : "parent";
  const g = m?.gender === "female" ? "female" : m?.gender === "male" ? "male" : null;
  const key = m?.avatarKey;
  if (key === "mom" || key === "dad" || key === "girl" || key === "boy") return key;

  if (role === "parent") {
    if (g === "female") return "mom";
    return "dad";
  }
  if (g === "female") return "girl";
  return "boy";
}

function AvatarStack({
  avatarKeys,
  size = 18,
}: {
  avatarKeys: string[];
  size?: number;
}) {
  const overlap = Math.round(size * 0.35);

  return (
    <View style={[styles.avatarStack, { height: size }]}>
      {avatarKeys.map((k, i) => {
        const src = (AVATARS as any)[k] ?? (AVATARS as any).boy;
        return (
          <View
            key={`${k}-${i}`}
            style={[
              styles.avatarMiniWrap,
              {
                width: size,
                height: size,
                marginLeft: i === 0 ? 0 : -overlap,
                borderRadius: size / 2,
              },
            ]}
          >
            <Image source={src} style={{ width: size, height: size, borderRadius: size / 2 }} resizeMode="cover" />
          </View>
        );
      })}
    </View>
  );
}

function StatPill({
  image,
  label,
  value,
  tint,
}: {
  image: any;
  label: string;
  value: number | string;
  tint: "blue" | "green" | "gray";
}) {
  const primary = (theme as any)?.colors?.primary ?? "#2563eb";
  const tintStyle =
    tint === "green"
      ? {
          bg: "#ECFDF3",
          border: "#86efac",
          text: "#166534",
        }
      : tint === "gray"
      ? {
          bg: "#F3F4F6",
          border: "#E5E7EB",
          text: "#374151",
        }
      : {
          bg: primary + "14",
          border: primary + "35",
          text: primary,
        };

  return (
    <View style={[styles.statCard, { backgroundColor: tintStyle.bg, borderColor: tintStyle.border }]}>
      <View style={styles.statAvatarWrap}>
        <Image source={image} style={styles.statAvatarImg} resizeMode="contain" />
      </View>
      <Text style={[styles.statCardValue, TYPO.title]} numberOfLines={1}>
        {String(value)}
      </Text>
      <Text style={[styles.statCardLabel, TYPO.body]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function getT() {
  const tx = useT() as any;
  return typeof tx === "function" ? tx : tx?.t;
}

function formatHHMM(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatLongDate(d: Date, locale: "hr" | "en") {
  const loc = locale === "hr" ? "hr-HR" : "en-GB";
  try {
    return d.toLocaleDateString(loc, { weekday: "long", day: "numeric", month: "numeric" });
  } catch {
    return d.toLocaleDateString();
  }
}

function BottomSheet({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }} onPress={onClose}>
        <Pressable onPress={() => {}} style={{ marginTop: "auto", padding: 16 }}>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function RolePill({
  active,
  icon,
  label,
  onPress,
}: {
  active: boolean;
  icon: any;
  label: string;
  onPress: () => void;
}) {
  const primary = (theme as any)?.colors?.primary ?? "#2563eb";

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: active }}>
      <View
        style={[
          styles.rolePill,
          active ? { borderColor: primary, backgroundColor: "#EEF2FF" } : null,
        ]}
      >
        <Ionicons name={icon} size={16} color={active ? primary : theme.colors.muted} />
        <Text style={[styles.rolePillText, TYPO.body, active ? { color: primary } : null]}>{label}</Text>
      </View>
    </Pressable>
  );
}

export default function MembersScreen() {
  const t = getT();
  const { locale } = useLocale();

  // ✅ FIX 1: osiguraj interpolaciju (ako i18n ne odradi params, mi ćemo)
  function tr(key: string, fallback: string, params?: Record<string, any>) {
    let v = t?.(key, params);
    if (!v) v = fallback;
    if (typeof v === "string" && v.startsWith("[missing")) v = fallback;

    if (typeof v === "string" && params && Object.keys(params).length) {
      // manual interpolation fallback: "{{n}}", "{{name}}", etc.
      let out = v;
      for (const [k, val] of Object.entries(params)) {
        const token = `{{${k}}}`;
        out = out.split(token).join(String(val));
      }
      return out;
    }

    return v as string;
  }

  const {
    ready,
    inFamily,
    familyName,
    members: storeMembers,
    myId,
    isParent,

    renameMember,
    setMemberRole,
    removeMember,
    getParentsCount,
    refreshMembers,
  } = useMembers() as any;

  const tasksHook = useTasks() as any;
  const tasks = tasksHook?.tasks ?? [];
  const unassignByMemberId = tasksHook?.unassignByMemberId;
  const syncMemberName = tasksHook?.syncMemberName;

  // live clock
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  const members: MemberRow[] = useMemo(() => {
    const list = Array.isArray(storeMembers) ? storeMembers : [];

    return list.map((m: any) => {
      const doneToday =
        (tasks ?? []).filter((tk: any) => {
          const doneFlag = tk?.status ? tk.status === "done" : !!tk?.done;
          const completedAt = tk?.completedAt ?? 0;
          const assignedId = tk?.claimedById ?? tk?.assignedTo ?? tk?.assigned_to ?? null;

          return (
            doneFlag &&
            String(assignedId ?? "") === String(m?.id ?? "") &&
            Number(completedAt) >= todayStart
          );
        }).length;

      return {
        id: String(m?.id ?? ""),
        name:
          String(m?.name ?? "").trim() ||
          (m?.role === "child" ? tr("members.defaultChild", "Child") : tr("members.defaultParent", "Parent")),
        role: m?.role === "child" ? "child" : "parent",
        gender: m?.gender === "female" ? "female" : m?.gender === "male" ? "male" : null,
        avatarKey:
          m?.avatar_key === "mom" || m?.avatar_key === "dad" || m?.avatar_key === "girl" || m?.avatar_key === "boy"
            ? m.avatar_key
            : m?.avatarKey === "mom" || m?.avatarKey === "dad" || m?.avatarKey === "girl" || m?.avatarKey === "boy"
              ? m.avatarKey
              : null,
        tasksDoneToday: doneToday,
      };
    });
  }, [storeMembers, tasks, todayStart]);

  const stats = useMemo(() => {
    const parents = members.filter((m) => m.role === "parent").length;
    const kids = members.filter((m) => m.role === "child").length;
    return { parents, kids, total: members.length };
  }, [members]);

  const myName = useMemo(() => {
    const me = (Array.isArray(storeMembers) ? storeMembers : []).find(
      (m: any) => String(m?.id ?? "") === String(myId ?? "")
    );
    const nm = String(me?.name ?? "").trim();
    return nm || tr("common.me", "Me");
  }, [storeMembers, myId]);

  const [filter, setFilter] = useState<"all" | "parents" | "kids">("all");
  const filtered = useMemo(() => {
    if (filter === "parents") return members.filter((m) => m.role === "parent");
    if (filter === "kids") return members.filter((m) => m.role === "child");
    return members;
  }, [members, filter]);

  const [refreshing, setRefreshing] = useState(false);
  async function onRefresh() {
    setRefreshing(true);
    try {
      await refreshMembers?.();
    } finally {
      setRefreshing(false);
    }
  }

  const resolvedFamilyName = familyName ?? tr("members.familyNameFallback", "My Family");
  const primary = (theme as any)?.colors?.primary ?? "#2563eb";

  // ✅ FIX 2: "Done today" predugačko -> "Done" (jedan ključ)

  // ===== ACTIONS SHEET =====
  const [actionsOpen, setActionsOpen] = useState(false);
  const [selected, setSelected] = useState<MemberRow | null>(null);

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameDraft, setRenameDraft] = useState("");

  function openActions(m: MemberRow) {
    if (!isParent) return;
    setSelected(m);
    setActionsOpen(true);
  }

  const parentsCount = typeof getParentsCount === "function" ? getParentsCount() : stats.parents;
  const isSelectedSelf = !!selected && String(selected.id) === String(myId);

  const selectedIsLastParent = !!selected && selected.role === "parent" && parentsCount <= 1;

  function startRename() {
    if (!selected) return;

    if (isSelectedSelf) {
      setActionsOpen(false);
      Alert.alert(
        tr("common.info", "Info"),
        tr("members.changeOwnNameHint", "Change your own name in Settings → Profile.")
      );
      return;
    }

    setRenameDraft(selected.name);
    setActionsOpen(false);
    setRenameOpen(true);
  }

  async function saveRename() {
    if (!selected) return;
    const clean = String(renameDraft ?? "").trim();
    if (!clean) return;

    try {
      const ok = await renameMember?.(selected.id, clean);
      if (!ok) return;

      try {
        await syncMemberName?.(selected.id, clean);
      } catch {}

      setRenameOpen(false);
      setRenameDraft("");
      await refreshMembers?.();
    } catch (e: any) {
      Alert.alert(tr("common.error", "Error"), String(e?.message ?? e));
    }
  }

  async function trySetRole(nextRole: MemberRole) {
    if (!selected) return;

    if (selected.role === "parent" && nextRole === "child" && selectedIsLastParent) {
      setActionsOpen(false);
      Alert.alert(
        tr("common.info", "Info"),
        tr(
          "members.lastParentCantChangeRole",
          "You cannot change the role of the last parent. Add another parent first."
        )
      );
      return;
    }

    try {
      const ok = await setMemberRole?.(selected.id, nextRole);
      setActionsOpen(false);
      if (!ok) return;

      await refreshMembers?.();
    } catch (e: any) {
      Alert.alert(tr("common.error", "Error"), String(e?.message ?? e));
    }
  }

  function confirmRemoveSelected() {
    if (!selected) return;
    if (isSelectedSelf) return;

    if (selected.role === "parent" && selectedIsLastParent) {
      setActionsOpen(false);
      Alert.alert(
        tr("common.info", "Info"),
        tr("members.lastParentCantRemove", "You cannot remove the last parent. Add another parent first.")
      );
      return;
    }

    setActionsOpen(false);

    Alert.alert(
      tr("members.removeTitle", "Remove member?"),
      tr("members.removeBody", "Tasks remain, but the member is removed and any assignments to them are cleared."),
      [
        { text: tr("common.cancel", "Cancel"), style: "cancel" },
        {
          text: tr("common.delete", "Delete"),
          style: "destructive",
          onPress: async () => {
            try {
              try {
                await unassignByMemberId?.(selected.id);
              } catch {}

              const ok = await removeMember?.(selected.id);
              if (!ok) return;

              await refreshMembers?.();
            } catch (e: any) {
              Alert.alert(tr("common.error", "Error"), String(e?.message ?? e));
            }
          },
        },
      ]
    );
  }

  const useGrid = filtered.length > 0 && filtered.length <= 6;

  if (!ready) {
    return (
      <Screen>
        <View style={{ padding: 16 }}>
          <EmptyState title={tr("common.loading", "Loading...")} />
        </View>
      </Screen>
    );
  }

  if (!inFamily) {
    return (
      <Screen>
        <View style={{ padding: 16 }}>
          <EmptyState
            title={tr("members.noFamilyTitle", "You are not in a family yet.")}
            subtitle={tr("members.noFamilyBody", "Join/create a family in Settings → Family.")}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ flex: 1 }}>
        {/* TOP */}
        <View style={styles.fixedTop}>
          <View style={styles.heroWrap}>
            <View style={styles.heroCard}>
              <Text style={[styles.heroHello, TYPO.title]} numberOfLines={1}>
                {tr("members.hello", "Hello")}, {myName}! 👋
              </Text>
              <Text style={[styles.heroSub, TYPO.body]}>
                {tr("members.overview", "Here's an overview of your family activities.")}
              </Text>

              <View style={styles.statsPillsRow}>
                <StatPill
                  image={require("../../assets/avatars/stats/parents.png")}
                  label={tr("members.stats.parents", "Parents")}
                  value={stats.parents}
                  tint="blue"
                />
                <StatPill
                  image={require("../../assets/avatars/stats/kids.png")}
                  label={tr("members.stats.kids", "Kids")}
                  value={stats.kids}
                  tint="green"
                />
                <StatPill
                  image={require("../../assets/avatars/stats/family.png")}
                  label={tr("members.stats.family", "Family")}
                  value={stats.total}
                  tint="gray"
                />
              </View>
            </View>
          </View>

          <SectionTitle title={tr("tabs.members", "Members")} style={{ marginTop: 10 }} />

          <View style={styles.segmentWrap}>
            <PressableFilter active={filter === "all"} label={tr("common.all", "All")} onPress={() => setFilter("all")} />
            <PressableFilter
              active={filter === "parents"}
              label={tr("members.stats.parents", "Parents")}
              onPress={() => setFilter("parents")}
            />
            <PressableFilter
              active={filter === "kids"}
              label={tr("members.stats.kids", "Kids")}
              onPress={() => setFilter("kids")}
            />
          </View>

          {isParent ? (
            <Text style={[styles.editHint, TYPO.body]}>
              {tr("members.editHintLongPress", "To edit a member, press and hold their card.")}
            </Text>
          ) : null}
        </View>

        {/* LIST */}
        <FlatList
          data={filtered}
          key={useGrid ? "grid2" : "list1"}
          numColumns={useGrid ? 2 : 1}
          columnWrapperStyle={useGrid ? { gap: 8 } : undefined}
          keyExtractor={(m) => m.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: 28, gap: 10 }}
          ListEmptyComponent={
            <View style={{ paddingTop: 8 }}>
              <EmptyState title={tr("members.noMembers", "No members yet.")} />
            </View>
          }
          renderItem={({ item: m }) => {
            const avatarKey = resolveAvatarKey(m);
            const roleLabel =
              m.role === "parent"
                ? avatarKey === "mom"
                  ? tr("members.role.mom", "Mom")
                  : tr("members.role.dad", "Dad")
                : tr("members.role.child", "Child");

            return (
              <Pressable
                onLongPress={() => {
                  if (isParent) openActions(m);
                }}
                delayLongPress={350}
                disabled={!isParent}
                accessibilityRole={isParent ? "button" : undefined}
                style={({ pressed }) => [
                  useGrid ? { flex: 1 } : null,
                  pressed && isParent ? { opacity: 0.96, transform: [{ scale: 0.99 }] } : null,
                ]}
              >
                <Card style={[styles.memberCard, useGrid ? styles.memberCardGrid : styles.memberCardList]}>
                  <View style={styles.memberRow}>
                    <View style={styles.avatarWrap}>
                      <Image source={AVATARS[avatarKey]} style={styles.avatarImg} resizeMode="cover" />
                    </View>

                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={[styles.memberName, TYPO.title]} numberOfLines={2}>
                        {m.name}
                      </Text>
                      <Text style={[styles.memberRole, TYPO.body]} numberOfLines={1}>
                        {roleLabel}
                      </Text>
                    </View>
                  </View>
                </Card>
              </Pressable>
            );
          }}
        />


        {/* Actions bottom sheet */}
        <BottomSheet visible={actionsOpen} onClose={() => setActionsOpen(false)}>
          <Card>
            <Text style={[{ fontSize: 18, fontWeight: "900", color: theme.colors.text }, TYPO.title]}>
              {selected?.name ?? tr("members.memberFallback", "Member")}
            </Text>
            <Text style={[{ color: theme.colors.muted, marginTop: 6 }, TYPO.body]}>
              {tr("members.editMember", "Edit member")}
            </Text>

            {isParent ? (
              <View style={{ marginTop: 12 }}>
                <Text style={[{ fontWeight: "900", color: theme.colors.text, marginBottom: 8 }, TYPO.title]}>
                  {tr("members.roleTitle", "Role")}
                </Text>

                <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
                  <RolePill
                    active={selected?.role === "child"}
                    icon="happy-outline"
                    label={tr("members.role.child", "Child")}
                    onPress={() => {
                      if (!selected) return;
                      if (selected.role === "child") return;
                      trySetRole("child");
                    }}
                  />

                  <RolePill
                    active={selected?.role === "parent"}
                    icon="people-outline"
                    label={tr("members.role.parent", "Parent")}
                    onPress={() => {
                      if (!selected) return;
                      if (selected.role === "parent") return;
                      trySetRole("parent");
                    }}
                  />
                </View>

                {selectedIsLastParent && selected?.role === "parent" ? (
                  <Text style={[{ marginTop: 10, color: theme.colors.muted, fontSize: 12, fontWeight: "700" }, TYPO.body]}>
                    {tr("members.lastParentNotice", "This is the last parent, so you cannot change their role or remove them.")}
                  </Text>
                ) : null}
              </View>
            ) : null}

            <View style={{ marginTop: 14, gap: 10 }}>
              {isParent ? (
                <>
                  <Button
                    title={tr("common.rename", "Rename")}
                    onPress={startRename}
                    disabled={!selected || isSelectedSelf}
                  />
                  <Button
                    title={tr("common.remove", "Remove")}
                    variant="ghost"
                    onPress={confirmRemoveSelected}
                    disabled={!selected || isSelectedSelf || (selected?.role === "parent" && selectedIsLastParent)}
                  />
                </>
              ) : null}

              <Button
                title={tr("common.cancel", "Cancel")}
                variant="ghost"
                onPress={() => setActionsOpen(false)}
              />
            </View>
          </Card>
        </BottomSheet>

        {/* Rename modal */}
        <Modal visible={renameOpen} transparent animationType="slide" onRequestClose={() => setRenameOpen(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
            <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }} onPress={() => setRenameOpen(false)}>
              <Pressable onPress={() => {}} style={{ marginTop: "auto", padding: 16 }}>
                <Card>
                  <Text style={[{ fontSize: 18, fontWeight: "900", color: theme.colors.text }, TYPO.title]}>
                    {tr("common.rename", "Rename")}
                  </Text>

                  <TextInput
                    value={renameDraft}
                    onChangeText={setRenameDraft}
                    placeholder={tr("members.newNamePlaceholder", "New name")}
                    placeholderTextColor={theme.colors.muted}
                    autoCapitalize="words"
                    style={[styles.input, TYPO.body]}
                  />

                  <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
                    <Button
                      title={tr("common.cancel", "Cancel")}
                      variant="ghost"
                      onPress={() => setRenameOpen(false)}
                      style={{ flex: 1 }}
                    />
                    <Button
                      title={tr("common.save", "Save")}
                      onPress={saveRename}
                      disabled={!String(renameDraft ?? "").trim()}
                      style={{ flex: 1 }}
                    />
                  </View>
                </Card>
              </Pressable>
            </Pressable>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </Screen>
  );
}

function PressableFilter({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  const primary = (theme as any)?.colors?.primary ?? "#2563eb";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.segItem,
        active ? { backgroundColor: primary } : null,
        pressed ? { opacity: 0.92 } : null,
      ]}
    >
      <Text style={[styles.segText, TYPO.body, active ? { color: "#fff" } : null]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = {
  fixedTop: { paddingBottom: 10 },

  heroWrap: { paddingTop: 4, paddingBottom: 8 },
  heroCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    overflow: "hidden" as const,
    ...Platform.select({
      android: { elevation: 1 },
      ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } },
      default: {},
    }),
  },
  heroHello: { fontSize: 22, fontWeight: "900" as const, color: theme.colors.text, letterSpacing: 0.2 },
  heroSub: { marginTop: 6, fontSize: 13, fontWeight: "700" as const, color: theme.colors.muted },

  statsPillsRow: { flexDirection: "row" as const, gap: 10, marginTop: 14 },
  statCard: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  statAvatarWrap: {
    width: 56,
    height: 56,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 6,
  },
  statAvatarImg: {
    width: 56,
    height: 56,
  },
  statCardValue: {
    fontSize: 18,
    fontWeight: "900" as const,
    color: theme.colors.text,
    marginBottom: 2,
  },
  statCardLabel: { fontSize: 12, fontWeight: "600" as const, color: "#6b7280" },
  statCardValue: { fontSize: 13, fontWeight: "900" as const },

  avatarStack: { flexDirection: "row" as const, alignItems: "center" as const },
  avatarMiniWrap: {
    borderWidth: 2,
    borderColor: "#fff",
    overflow: "hidden" as const,
  },

  segmentWrap: {
    marginTop: 10,
    flexDirection: "row" as const,
    gap: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 6,
  },
  segItem: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "transparent",
  },
  segText: { fontSize: 14, fontWeight: "900" as const, color: theme.colors.muted },

  editHint: { marginTop: 10, color: theme.colors.muted, fontSize: 12, fontWeight: "700" as const },

  memberCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 12,
    minHeight: 78,
    overflow: "hidden" as const,
    ...Platform.select({
      android: { elevation: 2 },
      ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
      default: {},
    }),
  },
  // Grid: 2 kartice u redu (fiksno, bez "skupljanja" oko avatara)
  memberCardGrid: { width: "100%" as const },
  memberCardList: { width: "100%" as const },

  memberRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 12 },

  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 999,
    overflow: "hidden" as const,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  avatarImg: { width: "100%", height: "100%" },

  memberName: { fontWeight: "900" as const, color: theme.colors.text, fontSize: 16, lineHeight: 19 },
  memberRole: { marginTop: 4, color: theme.colors.muted, fontSize: 12, fontWeight: "500" as const, lineHeight: 16 },



  rolePill: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  rolePillText: { fontWeight: "900" as const, color: theme.colors.text },

  input: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: (theme as any)?.radius?.input ?? 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "800" as const,
  },
};
