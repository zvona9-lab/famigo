// /app/(tabs)/members.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
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
  tasksDoneToday: number;
};

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
        <Text style={[styles.rolePillText, active ? { color: primary } : null]}>{label}</Text>
      </View>
    </Pressable>
  );
}

export default function MembersScreen() {
  const t = getT();
  const { locale } = useLocale();

  function tr(key: string, fallback: string, params?: Record<string, any>) {
    const v = t?.(key, params);
    if (!v) return fallback;
    if (typeof v === "string" && v.startsWith("[missing")) return fallback;
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
        name: String(m?.name ?? "").trim() || (m?.role === "child" ? tr("members.defaultChild", "Child") : tr("members.defaultParent", "Parent")),
        role: m?.role === "child" ? "child" : "parent",
        tasksDoneToday: doneToday,
      };
    });
  }, [storeMembers, tasks, todayStart]);

  const stats = useMemo(() => {
    const parents = members.filter((m) => m.role === "parent").length;
    const kids = members.filter((m) => m.role === "child").length;
    const doneToday = members.reduce((sum, m) => sum + m.tasksDoneToday, 0);
    return { parents, kids, doneToday, total: members.length };
  }, [members]);

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

  const resolvedFamilyName = familyName ?? tr("members.familyNameFallback", locale === "hr" ? "Obitelj" : "Family");
  const primary = (theme as any)?.colors?.primary ?? "#2563eb";

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
        locale === "hr"
          ? "Moje ime mijenjaš u Postavke → Profil."
          : "Change your own name in Settings → Profile."
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

      // optional: keep tasks metadata in sync (if you store claimedByName locally)
      try {
        await syncMemberName?.(selected.id, clean);
      } catch {
        // ignore
      }

      setRenameOpen(false);
      setRenameDraft("");
      await refreshMembers?.();
    } catch (e: any) {
      Alert.alert(tr("common.error", locale === "hr" ? "Greška" : "Error"), String(e?.message ?? e));
    }
  }

  async function trySetRole(nextRole: MemberRole) {
    if (!selected) return;

    // Block demoting the last parent
    if (selected.role === "parent" && nextRole === "child" && selectedIsLastParent) {
      setActionsOpen(false);
      Alert.alert(
        tr("common.info", "Info"),
        locale === "hr"
          ? "Ne možeš promijeniti ulogu zadnjeg roditelja. Dodaj još jednog roditelja pa pokušaj opet."
          : "You cannot change the role of the last parent. Add another parent first."
      );
      return;
    }

    try {
      const ok = await setMemberRole?.(selected.id, nextRole);
      setActionsOpen(false);
      if (!ok) return;

      await refreshMembers?.();
    } catch (e: any) {
      Alert.alert(tr("common.error", locale === "hr" ? "Greška" : "Error"), String(e?.message ?? e));
    }
  }

  function confirmRemoveSelected() {
    if (!selected) return;
    if (isSelectedSelf) return;

    // Block removing the last parent
    if (selected.role === "parent" && selectedIsLastParent) {
      setActionsOpen(false);
      Alert.alert(
        tr("common.info", "Info"),
        locale === "hr"
          ? "Ne možeš obrisati zadnjeg roditelja. Dodaj još jednog roditelja pa pokušaj opet."
          : "You cannot remove the last parent. Add another parent first."
      );
      return;
    }

    setActionsOpen(false);

    Alert.alert(
      locale === "hr" ? "Obrisati člana?" : "Remove member?",
      locale === "hr"
        ? "Zadaci ostaju, ali se uklanja član i sve dodjele tom članu."
        : "Tasks remain, but the member is removed and any assignments to them are cleared.",
      [
        { text: tr("common.cancel", locale === "hr" ? "Odustani" : "Cancel"), style: "cancel" },
        {
          text: tr("common.delete", locale === "hr" ? "Obriši" : "Delete"),
          style: "destructive",
          onPress: async () => {
            try {
              // optional: local tasks cleanup first (if you have it)
              try {
                await unassignByMemberId?.(selected.id);
              } catch {
                // ignore
              }

              const ok = await removeMember?.(selected.id);
              if (!ok) return;

              await refreshMembers?.();
            } catch (e: any) {
              Alert.alert(tr("common.error", locale === "hr" ? "Greška" : "Error"), String(e?.message ?? e));
            }
          },
        },
      ]
    );
  }

  // UI helpers
  function roleIcon(role: "parent" | "child") {
    return role === "parent" ? "people-outline" : "happy-outline";
  }
  function roleIconBg(role: "parent" | "child") {
    return role === "parent" ? styles.roleIconParent : styles.roleIconChild;
  }
  function roleIconColor(role: "parent" | "child") {
    return role === "parent" ? primary : "#166534";
  }

  const useGrid = filtered.length > 0 && filtered.length <= 6;

  if (!ready) {
    return (
      <Screen>
        <View style={{ padding: 16 }}>
          <EmptyState title={tr("common.loading", locale === "hr" ? "Učitavam..." : "Loading...")} />
        </View>
      </Screen>
    );
  }

  if (!inFamily) {
    return (
      <Screen>
        <View style={{ padding: 16 }}>
          <EmptyState
            title={locale === "hr" ? "Nisi još u obitelji." : "You are not in a family yet."}
            subtitle={locale === "hr" ? "Uđi u obitelj u Postavke → Obitelj." : "Join/create a family in Settings → Family."}
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
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.heroTitle}>{tr("tabs.members", locale === "hr" ? "Članovi" : "Members")}</Text>
                  <Text style={styles.heroSub}>
                    {resolvedFamilyName} •{" "}
                    {locale === "hr" ? `${stats.total} članova` : `${stats.total} members`}
                  </Text>
                </View>

                <View style={styles.heroRight}>
                  <Text style={styles.heroTime}>{formatHHMM(now.getTime())}</Text>
                  <Text style={styles.heroDate}>{formatLongDate(now, locale)}</Text>
                </View>
              </View>

              <View style={styles.heroAccentBg}>
                <View style={[styles.heroAccent, { backgroundColor: primary }]} />
              </View>
            </View>
          </View>

          <Card style={{ marginTop: 10, padding: 12 }}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>{tr("members.stats.parents", "Parents")}</Text>
                <Text style={styles.statValue}>{stats.parents}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>{tr("members.stats.kids", "Kids")}</Text>
                <Text style={styles.statValue}>{stats.kids}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>{tr("members.doneToday", "Done today")}</Text>
                <Text style={styles.statValue}>{stats.doneToday}</Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <PressableFilter active={filter === "all"} label={tr("common.all", "All")} onPress={() => setFilter("all")} />
              <PressableFilter active={filter === "parents"} label={tr("members.stats.parents", "Parents")} onPress={() => setFilter("parents")} />
              <PressableFilter active={filter === "kids"} label={tr("members.stats.kids", "Kids")} onPress={() => setFilter("kids")} />
            </View>

            {isParent ? (
              <Text style={{ marginTop: 10, color: theme.colors.muted, fontSize: 12, fontWeight: "700" }}>
                {tr("members.editHint", "To edit a member, tap ⋮ on their card.")}
              </Text>
            ) : null}
          </Card>

          <SectionTitle title={tr("members.listTitle", locale === "hr" ? "Popis članova" : "Members list")} style={{ marginTop: 14 }} />
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
              <EmptyState title={tr("members.noMembers", locale === "hr" ? "Još nema članova." : "No members yet.")} />
            </View>
          }
          renderItem={({ item: m }) => (
            <Card style={[styles.memberCard, useGrid ? { flex: 1 } : null]}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={styles.memberTopRow}>
                    <Text style={styles.memberName} numberOfLines={1}>
                      {m.name}
                    </Text>

                    <View style={[styles.roleIconBadge, roleIconBg(m.role)]}>
                      <Ionicons name={roleIcon(m.role) as any} size={16} color={roleIconColor(m.role)} />
                    </View>
                  </View>

                  <Text style={styles.memberMeta} numberOfLines={1}>
                    {(m.role === "parent" ? tr("members.role.parent", "Parent") : tr("members.role.child", "Child"))} •{" "}
                    {tr("members.doneToday", "Done today")}: {m.tasksDoneToday}
                  </Text>
                </View>

                {isParent ? (
                  <Pressable onPress={() => openActions(m)} hitSlop={12} style={{ paddingLeft: 10, paddingVertical: 6 }}>
                    <Ionicons name="ellipsis-vertical" size={18} color={theme.colors.muted} />
                  </Pressable>
                ) : null}
              </View>
            </Card>
          )}
        />

        {/* Actions bottom sheet */}
        <BottomSheet visible={actionsOpen} onClose={() => setActionsOpen(false)}>
          <Card>
            <Text style={{ fontSize: 18, fontWeight: "900", color: theme.colors.text }}>
              {selected?.name ?? (locale === "hr" ? "Član" : "Member")}
            </Text>
            <Text style={{ color: theme.colors.muted, marginTop: 6 }}>
              {locale === "hr" ? "Uredi člana" : "Edit member"}
            </Text>

            {isParent ? (
              <View style={{ marginTop: 12 }}>
                <Text style={{ fontWeight: "900", color: theme.colors.text, marginBottom: 8 }}>
                  {locale === "hr" ? "Uloga" : "Role"}
                </Text>

                <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
                  <RolePill
                    active={selected?.role === "child"}
                    icon="happy-outline"
                    label={locale === "hr" ? "Dijete" : "Child"}
                    onPress={() => {
                      if (!selected) return;
                      if (selected.role === "child") return;
                      trySetRole("child");
                    }}
                  />

                  <RolePill
                    active={selected?.role === "parent"}
                    icon="people-outline"
                    label={locale === "hr" ? "Roditelj" : "Parent"}
                    onPress={() => {
                      if (!selected) return;
                      if (selected.role === "parent") return;
                      trySetRole("parent");
                    }}
                  />
                </View>

                {selectedIsLastParent && selected?.role === "parent" ? (
                  <Text style={{ marginTop: 10, color: theme.colors.muted, fontSize: 12, fontWeight: "700" }}>
                    {locale === "hr"
                      ? "Ovo je zadnji roditelj pa mu ne možeš promijeniti ulogu niti ga obrisati."
                      : "This is the last parent, so you cannot change their role or remove them."}
                  </Text>
                ) : null}
              </View>
            ) : null}

            <View style={{ marginTop: 14, gap: 10 }}>
              {isParent ? (
                <>
                  <Button
                    title={locale === "hr" ? "Preimenuj" : "Rename"}
                    onPress={startRename}
                    disabled={!selected || isSelectedSelf}
                  />
                  <Button
                    title={locale === "hr" ? "Obriši" : "Remove"}
                    variant="ghost"
                    onPress={confirmRemoveSelected}
                    disabled={!selected || isSelectedSelf || (selected?.role === "parent" && selectedIsLastParent)}
                  />
                </>
              ) : null}

              <Button
                title={locale === "hr" ? "Odustani" : "Cancel"}
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
                  <Text style={{ fontSize: 18, fontWeight: "900", color: theme.colors.text }}>
                    {locale === "hr" ? "Preimenuj" : "Rename"}
                  </Text>

                  <TextInput
                    value={renameDraft}
                    onChangeText={setRenameDraft}
                    placeholder={locale === "hr" ? "Novo ime" : "New name"}
                    placeholderTextColor={theme.colors.muted}
                    autoCapitalize="words"
                    style={styles.input}
                  />

                  <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
                    <Button
                      title={locale === "hr" ? "Odustani" : "Cancel"}
                      variant="ghost"
                      onPress={() => setRenameOpen(false)}
                      style={{ flex: 1 }}
                    />
                    <Button
                      title={locale === "hr" ? "Spremi" : "Save"}
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
    <View style={{ flex: 1 }}>
      <Text
        onPress={onPress}
        style={[
          styles.filterBtn,
          active ? { borderColor: primary, backgroundColor: "#EEF2FF", color: primary } : null,
        ]}
      >
        {label}
      </Text>
    </View>
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
  heroTitle: { fontSize: 22, fontWeight: "900" as const, color: theme.colors.text, letterSpacing: 0.2 },
  heroSub: { marginTop: 4, fontSize: 13, fontWeight: "700" as const, color: theme.colors.muted },
  heroRight: { alignItems: "flex-end" as const, minWidth: 96 },
  heroTime: { fontSize: 20, fontWeight: "900" as const, color: theme.colors.text },
  heroDate: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "800" as const,
    color: theme.colors.muted,
    textTransform: "capitalize" as const,
  },
  heroAccentBg: {
    position: "absolute" as const,
    left: 0,
    right: 0,
    bottom: 0,
    height: 6,
    backgroundColor: "#f1f5f9",
  },
  heroAccent: { height: 6, width: "42%", borderTopRightRadius: 999, borderBottomRightRadius: 999 },

  statBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 10,
  },
  statLabel: { color: theme.colors.muted, fontSize: 12, fontWeight: "800" as const },
  statValue: { marginTop: 6, color: theme.colors.text, fontSize: 18, fontWeight: "900" as const },

  filterBtn: {
    textAlign: "center" as const,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    paddingVertical: 10,
    fontWeight: "900" as const,
    color: theme.colors.text,
    backgroundColor: "#fff",
  },

  memberCard: { padding: 12 },
  memberTopRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 10 },
  memberName: { fontWeight: "900" as const, color: theme.colors.text, flex: 1, minWidth: 0 },
  memberMeta: { color: theme.colors.muted, marginTop: 4, fontSize: 12, fontWeight: "700" as const },

  roleIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    flexShrink: 0,
  },
  roleIconParent: { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" },
  roleIconChild: { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" },

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
    borderRadius: theme.radius.input,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "800" as const,
  },
};
