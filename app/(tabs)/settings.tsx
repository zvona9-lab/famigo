// /app/(tabs)/settings.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
  Modal,
  Pressable,
  StyleSheet,
} from "react-native";

import * as Application from "expo-application";
import * as Clipboard from "expo-clipboard";
import Constants from "expo-constants";

const SETTINGS_HEADER_IMG = require("../../assets/avatars/stats/header-settings.png");

import { Screen } from "../../src/ui/components/Screen";
import { Card } from "../../src/ui/components/Card";
import { Button } from "../../src/ui/components/Button";
import { SectionTitle } from "../../src/ui/components/SectionTitle";
import { theme } from "../../src/ui/theme";

import { FONT, LETTER_SPACING } from "../../lib/typography";

import { useT } from "../../lib/useT";
import { useMembers } from "../../lib/members";
import { useLocale } from "../../lib/locale";
import { useTasks } from "../../lib/tasks";
import { useAuth } from "../../lib/auth";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { applyLocale, persistLocale, AppLocale } from "../../lib/i18n";
import { supabase } from "../../lib/supabase";

function getT() {
  const tx = useT() as any;
  return typeof tx === "function" ? tx : tx?.t;
}

function maskInvite(invite: string) {
  const s = String(invite ?? "");
  const idx = s.indexOf("-");
  if (idx >= 0) return `${s.slice(0, idx + 1)}••••`;
  return "••••";
}

function cleanEmail(input: string) {
  return String(input ?? "").trim().toLowerCase();
}

function BottomSheet(props: { visible: boolean; onClose: () => void; children: React.ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={props.visible} transparent animationType="slide" onRequestClose={props.onClose}>
      <View style={styles.modalRoot}>
        <Pressable
          style={styles.sheetBackdrop}
          onPress={() => {
            Keyboard.dismiss();
            props.onClose();
          }}
        />

        <KeyboardAvoidingView
          // iOS: padding lifts the sheet. Android: height prevents keyboard covering inputs.
          // In standalone Android builds the window may not resize like Expo Go,
          // so use padding to lift the sheet reliably.
          behavior={Platform.OS === "ios" ? "padding" : "padding"}
          enabled
          // IMPORTANT: smaller offset => more lift. 80 caused inputs to stay under the keyboard on iPhone.
          keyboardVerticalOffset={Platform.OS === "ios" ? Math.max(12, insets.top) : 0}
          style={styles.sheetWrap}
        >
          <View style={styles.sheetInner}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              {props.children}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function SmallActionButton(props: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "ghost" | "danger";
  disabled?: boolean;
}) {
  const primary = (theme as any)?.colors?.primary ?? "#2563eb";
  const v = props.variant ?? "primary";

  const bg =
    v === "primary" ? primary : v === "danger" ? "#ef4444" : "transparent";
  const border = v === "ghost" ? theme.colors.border : "transparent";
  const text = v === "primary" || v === "danger" ? "#fff" : theme.colors.text;

  return (
    <Pressable
      disabled={props.disabled}
      onPress={props.onPress}
      style={({ pressed }) => [
        {
          alignSelf: "flex-end",
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 12,
          backgroundColor: bg,
          borderWidth: v === "ghost" ? 1 : 0,
          borderColor: border,
          opacity: props.disabled ? 0.6 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={{ color: text, fontWeight: "900", fontSize: 13, fontFamily: FONT.body, letterSpacing: LETTER_SPACING.body }}>{props.title}</Text>
    </Pressable>
  );
}



function DestructiveButton(props: { title: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      disabled={props.disabled}
      onPress={props.onPress}
      style={({ pressed }) => [
        {
          width: "100%",
          height: 44,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ef4444",
          opacity: props.disabled ? 0.6 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={{ color: "#fff", fontWeight: "900", fontSize: 14, fontFamily: FONT.body, letterSpacing: LETTER_SPACING.body }}>{props.title}</Text>
    </Pressable>
  );
}


export default function SettingsScreen() {
  const t = getT();
  const { locale, setLocale } = useLocale();

  const membersCtx = useMembers() as any;

  const membersReady = Boolean(membersCtx?.ready);
  const inFamily = Boolean(membersCtx?.inFamily);
  const familyName = membersCtx?.familyName ?? null;
  const familyId = membersCtx?.familyId ?? null;
  const inviteCode = membersCtx?.inviteCode ?? null;
  const isParent = Boolean(membersCtx?.isParent);

  // ✅ compat: older code used myMember/refresh
  const myMember = membersCtx?.myMember ?? membersCtx?.me ?? null;
  const refreshMembers = membersCtx?.refresh ?? membersCtx?.refreshMembers ?? (async () => {});

  const joinFamilyWithCode = membersCtx?.joinFamilyWithCode;
  const leaveFamily = membersCtx?.leaveFamily;

  const createFamily = membersCtx?.createFamily;
  const deleteFamily = membersCtx?.deleteFamily;
  const membersList = (membersCtx?.members ?? []) as any[];
  const canDeleteFamily = Boolean(inFamily && isParent && Array.isArray(membersList) && membersList.length <= 1);

  const { refresh: refreshTasks } = useTasks() as any;

  const auth = useAuth() as any;
  const authReady = Boolean(auth?.ready);
  const isSignedIn = Boolean(auth?.isSignedIn);
  const authEmail = auth?.email ?? null;
  const sendMagicLink = auth?.sendMagicLink;
  const signOut = auth?.signOut;

  function tr(key: string, fallback: string, params?: Record<string, any>) {
    const v = t?.(key, params);
    if (!v) return fallback;
    if (typeof v === "string" && v.startsWith("[missing")) return fallback;
    if (typeof v !== "string") return fallback;
    return v;
  }

  const version = Application.nativeApplicationVersion ??
    (Constants.expoConfig as any)?.version ??
    (Constants.manifest as any)?.version ??
    "—";

  const [langOpen, setLangOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameDraft, setRenameDraft] = useState("");
  const [nameOpen, setNameOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [roleDraft, setRoleDraft] = useState<"parent" | "child">("parent");
  const [genderDraft, setGenderDraft] = useState<"male" | "female">("male");
  const [loginOpen, setLoginOpen] = useState(false);
  const [emailDraft, setEmailDraft] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);

  const [deleteBusy, setDeleteBusy] = useState(false);

  const [joinOpen, setJoinOpen] = useState(false);
  const [joinCodeDraft, setJoinCodeDraft] = useState("");
  const [joinBusy, setJoinBusy] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState("");
  const [createBusy, setCreateBusy] = useState(false);

  const [inviteShown, setInviteShown] = useState(false);

  const localeLabel = useMemo(() => {
    const map: Record<string, string> = {
      hr: tr("settings.croatian", "Croatian"),
      en: tr("settings.english", "English"),
      it: tr("settings.italian", "Italian"),
      sl: tr("settings.slovenian", "Slovenian"),
      fr: tr("settings.french", "French"),
      de: tr("settings.german", "German"),
      es: tr("settings.spanish", "Spanish"),
      rs: tr("settings.serbian", "Serbian"),
    };
    return map[locale] ?? map.en;
  }, [locale, t]);

  async function pickLocale(next: AppLocale) {
    try {
      applyLocale(next);
      await persistLocale(next);
      setLocale(next);
      setLangOpen(false);
    } catch (e: any) {
      setLocale(next);
      setLangOpen(false);
      Alert.alert(tr("common.error", "Error"), String(e?.message ?? e));
    }
  }

  const inviteDisplay = useMemo(() => {
    if (!inviteCode) return "—";
    return inviteShown ? String(inviteCode) : maskInvite(String(inviteCode));
  }, [inviteCode, inviteShown]);

  async function copyInvite() {
    try {
      await Clipboard.setStringAsync(String(inviteCode ?? ""));
      Alert.alert(tr("common.ok", "OK"), tr("common.copied", "Copied."));
    } catch {
      Alert.alert(tr("common.error", "Error"), tr("common.copyFailed", "Could not copy."));
    }
  }

  async function doRenameFamily() {
    const name = String(renameDraft ?? "").trim();
    if (!name) return;

    try {
      const { error } = await supabase.rpc("rename_family", { new_name: name });
      if (error) throw error;

      setRenameOpen(false);
      setRenameDraft("");
      Alert.alert(tr("common.ok", "OK"), tr("settings.msg.familyRenamed", "Family name updated."));
      await refreshMembers?.();
    } catch (e: any) {
      Alert.alert(tr("common.error", "Error"), String(e?.message ?? e));
    }
  }

  
async function doRenameMe() {
  const newName = String(nameDraft ?? "").trim();
  if (!newName) {
    Alert.alert(tr("common.error", "Error"), tr("settings.nameRequired", "Please enter a name."));
    return;
  }

  const role = roleDraft;
  const gender = genderDraft;

  const avatar_key =
    role === "parent" ? (gender === "female" ? "mom" : "dad") : gender === "female" ? "girl" : "boy";

  try {
    // 1) Store profile in auth metadata (used by the _layout gate)
    const { error: metaErr } = await supabase.auth.updateUser({
      data: { name: newName, role, gender },
    });
    if (metaErr) throw metaErr;

    // 2) Best effort: update current family member row (if present)
    if (inFamily && myMember?.id) {
      const { data: fmRow, error: fmErr } = await supabase
        .from("family_members")
        .update({ display_name: newName, role, gender, avatar_key })
        .eq("user_id", myMember.id)
        .select("user_id")
        .maybeSingle();
      // If RLS blocks it (or no row updated), we cannot persist gender/role here.
      if (fmErr || !fmRow) {
        throw fmErr ?? new Error("Profile was saved to auth metadata, but updating family_members was blocked (no row updated).");
      }
    } else {
      // Not in family yet - still keep old RPC behavior harmlessly (may no-op)
      await supabase.rpc("rename_me", { new_name: newName });
    }

    setNameOpen(false);
    setNameDraft("");
    Alert.alert(tr("common.ok", "OK"), tr("settings.saved", "Saved."));
    await refreshMembers?.();
    await refreshTasks?.();
  } catch (e: any) {
    Alert.alert(tr("common.error", "Error"), String(e?.message ?? e));
  }
}

async function doJoinFamily() {
    const code = String(joinCodeDraft ?? "").trim();
    if (!code) {
      Alert.alert(tr("common.error", "Error"), tr("settings.joinFamily.invalidCode", "Enter invite code."));
      return;
    }
    if (joinBusy) return;

    try {
      setJoinBusy(true);
      const ok = await (joinFamilyWithCode?.(code) ?? Promise.resolve(false));
      if (ok) {
        setJoinOpen(false);
        setJoinCodeDraft("");
        Alert.alert(tr("common.success", "Success"), tr("settings.joinFamily.joined", "You are now in the family."));
      }
    } catch (e: any) {
      Alert.alert(tr("common.error", "Error"), String(e?.message ?? e));
    } finally {
      setJoinBusy(false);
    }
  }

  async function doCreateFamily() {
    const name = String(createDraft ?? '').trim();
    if (!name) {
      Alert.alert(tr('common.error', 'Error'), tr('settings.createFamily.nameRequired', 'Enter a family name.'));
      return;
    }
    if (createBusy) return;

    try {
      setCreateBusy(true);
      const ok = await (createFamily?.(name) ?? Promise.resolve(false));
      if (ok) {
        setCreateOpen(false);
        setCreateDraft('');
        Alert.alert(tr('common.success', 'Success'), tr('settings.createFamily.created', 'Family created.'));
      }
    } catch (e: any) {
      Alert.alert(tr('common.error', 'Error'), String(e?.message ?? e));
    } finally {
      setCreateBusy(false);
    }
  }

  async function doDeleteFamily() {
    Alert.alert(
      tr('settings.deleteFamily.title', 'Delete family'),
      tr('settings.deleteFamily.body', 'This will delete the family and all its data. This cannot be undone.'),
      [
        { text: tr('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: tr('settings.deleteFamily.confirm', 'Delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const ok = await (deleteFamily?.() ?? Promise.resolve(false));
              if (ok) {
                Alert.alert(tr('common.ok', 'OK'), tr('settings.deleteFamily.deleted', 'Family deleted.'));
              }
            } catch (e: any) {
              Alert.alert(tr('common.error', 'Error'), String(e?.message ?? e));
            }
          },
        },
      ]
    );
  }

  async function doLeaveFamily() {
    Alert.alert(
      tr("settings.leaveFamily.title", "Leave family"),
      tr("settings.leaveFamily.body", "Are you sure you want to leave the family?"),
      [
        { text: tr("common.cancel", "Cancel"), style: "cancel" },
        {
          text: tr("settings.leaveFamily.confirm", "Leave"),
          style: "destructive",
          onPress: async () => {
            try {
              const ok = await (leaveFamily?.() ?? Promise.resolve(false));
              if (ok) {
                Alert.alert(tr("common.ok", "OK"), tr("settings.leaveFamily.left", "You left the family."));
              }
            } catch (e: any) {
              Alert.alert(tr("common.error", "Error"), String(e?.message ?? e));
            }
          },
        },
      ]
    );
  }

  async function doLoginMagicLink() {
    const email = cleanEmail(emailDraft);
    if (!email || !email.includes("@")) {
      Alert.alert(tr("common.error", "Error"), tr("auth.invalidEmail", "Enter a valid email."));
      return;
    }

    try {
      setLoginBusy(true);
      const ok = await sendMagicLink(email);
      if (ok) {
        setLoginOpen(false);
        setEmailDraft("");
        Alert.alert(tr("common.ok", "OK"), tr("auth.magicLinkSent", "Check your email for the sign-in link."));
      }
    } finally {
      setLoginBusy(false);
    }
  }

  async function doDeleteAccount() {
    if (!isSignedIn || deleteBusy) return;

    Alert.alert(
      "Delete account",
      "This will permanently delete your account. If you are the only member of your family, the family will be deleted too. This action cannot be undone.",
      [
        { text: tr("common.cancel", "Cancel"), style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleteBusy(true);

              // Server-side deletion (SECURITY DEFINER function) – required for App Store Guideline 5.1.1(v)
              const { error } = await supabase.rpc("delete_my_account");
              if (error) throw error;

              // Ensure local session is cleared
              await signOut?.();

              Alert.alert(tr("common.ok", "OK"), "Account deleted.");
            } catch (e: any) {
              Alert.alert(tr("common.error", "Error"), String(e?.message ?? e));
            } finally {
              setDeleteBusy(false);
            }
          },
        },
      ]
    );
  }


  const primary = (theme as any)?.colors?.primary ?? "#2563eb";

  return (
    <Screen noPadding>
      <View style={{ flex: 1, width: "100%", alignSelf: "stretch" }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* HERO */}
          <View style={{ padding: 16 }}>
            <View style={styles.heroCard}>
              <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.heroTitle}>{tr("tabs.settings", "Settings")}</Text>
                  <Text style={styles.heroSub}>{tr("settings.subtitle", "Family, language and profile")}</Text>
                </View>
              </View>

              <View style={styles.heroAccentBg}>
                <View style={[styles.heroAccent, { backgroundColor: primary }]} />
              </View>
            </View>

            <Image source={SETTINGS_HEADER_IMG} style={styles.heroArt} resizeMode="contain" />
          </View>

          <View style={{ paddingHorizontal: 16, width: "100%", alignSelf: "stretch" }}>
            {/* FAMILY */}
            <SectionTitle title={tr("settings.family.title", "Family")} style={{ marginTop: 0 }} />

            <Card style={{ padding: 12 }}>
              {/* Setup guidance + My name */}

              {/* If user is NOT in a family yet: show clear next steps */}
              {!inFamily ? (
                <View style={styles.setupCallout}>
                  <Text style={styles.setupTitle}>{tr("settings.setup.title", "Set up your account")}</Text>
                  <Text style={styles.setupLine}>
                    {tr("settings.setup.step1", "1) Join or create a family")}
                  </Text>
                  <Text style={styles.setupLine}>
                    {tr("settings.setup.step2", "2) Then set your name in Settings → Family")}
                  </Text>
                  <Text style={[styles.setupHint, { marginTop: 6 }]}>
                    {tr("settings.setup.whyName", "Your name is stored as a family member, so it becomes available after you join a family.")}
                  </Text>
                </View>
              ) : null}

              {/* If user IS in a family but has no name yet: prompt them clearly */}
              {inFamily && !(String(myMember?.name ?? "").trim().length > 0) ? (
                <View style={styles.setupCallout}>
                  <Text style={styles.setupTitle}>{tr("settings.setup.next", "Next step")}</Text>
                  <Text style={styles.setupLine}>
                    {tr("settings.setup.setNameNow", "Please set your name so others can recognize you.")}
                  </Text>
                  <View style={{ height: 10 }} />
                  <Button
                    title={tr("settings.btn.setName", "Set your name")}
                    onPress={() => {
                      setNameDraft(String(myMember?.name ?? "").trim());
                      setRoleDraft((myMember?.role === "child" ? "child" : "parent"));
                      setGenderDraft((myMember?.gender === "female" ? "female" : "male"));
                      setNameOpen(true);
                    }}
                    style={{ height: 40, borderRadius: 14 }}
                    textStyle={{ fontSize: 13, fontWeight: "900" }}
                  />
                </View>
              ) : null}

              <View style={{ marginTop: 12 }}>
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>{tr("settings.labels.myName", "Your name")}</Text>
                  <Text style={styles.infoValue}>{String(myMember?.name ?? "").trim() || (inFamily ? tr("settings.notSet", "Not set") : "—")}</Text>

                  {!inFamily ? (
                    <Text style={styles.infoHint}>
                      {tr("settings.nameAfterJoin", "Join or create a family to set your name.")}
                    </Text>
                  ) : null}

                  <View style={{ height: 8 }} />
                  <SmallActionButton
                    title={tr("settings.btn.editName", "Edit name")}
                    variant="ghost"
                    disabled={!inFamily}
                    onPress={() => {
                      setNameDraft(String(myMember?.name ?? "").trim());
                      setRoleDraft((myMember?.role === "child" ? "child" : "parent"));
                      setGenderDraft((myMember?.gender === "female" ? "female" : "male"));
                      setNameOpen(true);
                    }}
                  />
                </View>
              </View>


              {inFamily ? (
                <>
                  <View style={{ height: 12 }} />

                  {/* Family name */}
                  <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}>{tr("settings.labels.family", "Family")}</Text>
                    <Text style={styles.infoValue}>
                      {String(familyName ?? "").trim() || tr("members.familyNameFallback", "My Family")}
                    </Text>

                    <View style={{ height: 8 }} />
                    <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
                      <SmallActionButton
                        title={tr("settings.btn.leaveFamily", "Leave family")}
                        variant="ghost"
                        onPress={doLeaveFamily}
                      />

                      {isParent ? (
                        <SmallActionButton
                          title={tr("settings.btn.renameFamily", "Rename")}
                          onPress={() => {
                            setRenameDraft(String(familyName ?? "").trim());
                            setRenameOpen(true);
                          }}
                        />
                      ) : null}
                    </View>

                    {canDeleteFamily ? (
                      <>
                        <View style={{ height: 8 }} />
                        <SmallActionButton
                          title={tr("settings.btn.deleteFamily", "Delete family")}
                          variant="danger"
                          onPress={doDeleteFamily}
                        />
                        <Text style={styles.helpText}>
                          {tr(
                            "settings.deleteFamily.help",
                            "You can delete the family only when you are the only member."
                          )}
                        </Text>
                      </>
                    ) : null}
                  </View>

                  <View style={{ height: 12 }} />

                  {/* Invite code */}
                  <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}>{tr("settings.labels.inviteCode", "Invite code")}</Text>
                    <Text style={styles.infoValue}>{inviteDisplay}</Text>
                    <View style={{ height: 8 }} />
                    <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
                      <SmallActionButton
                        title={
                          inviteShown
                            ? tr("settings.btn.hideInviteCode", "Hide invite code")
                            : tr("settings.btn.showInviteCode", "Show invite code")
                        }
                        variant="ghost"
                        onPress={() => setInviteShown((s) => !s)}
                      />
                      <SmallActionButton title={tr("settings.btn.copy", "Copy")} onPress={copyInvite} />
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <View style={{ height: 12 }} />
                  <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}>{tr("settings.family.notInFamilyTitle", "No family yet")}</Text>
                    <Text style={styles.helpText}>{tr("settings.family.notInFamily", "You are not in a family.")}</Text>
                    <View style={{ height: 10 }} />
                    <SmallActionButton title={tr("settings.btn.createFamily", "Create family")} onPress={() => setCreateOpen(true)} />
                    <View style={{ height: 10 }} />
                    <SmallActionButton title={tr("settings.btn.joinFamily", "Join family")} variant="ghost" onPress={() => setJoinOpen(true)} />
                    <Text style={styles.helpText}>{tr("settings.joinFamily.help", "Enter an invite code from a family member.")}</Text>
                  </View>
                </>
              )}
            </Card>

            {/* LANGUAGE (moved below Family) */}
            <SectionTitle title={tr("settings.language", "Language")} style={{ marginTop: theme.spacing.l }} />
            <Card style={{ padding: 12 }}>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>{tr("settings.language", "Language")}</Text>
                <Text style={styles.infoValue}>{localeLabel}</Text>
                <Text style={styles.helpText}>{tr("settings.languageNote", "This change applies to the whole app.")}</Text>
                <View style={{ height: 10 }} />
                <SmallActionButton
                  title={tr("settings.btn.changeLanguage", "Change language", { lang: localeLabel })}
                  variant="ghost"
                  onPress={() => setLangOpen(true)}
                />
              </View>
            </Card>

            {/* ACCOUNT */}
            <SectionTitle title={tr("settings.account", "Account")} style={{ marginTop: theme.spacing.l }} />
            <Card style={{ padding: 12 }}>
              {!authReady ? (
                <Text style={{ color: theme.colors.muted, fontWeight: "700", fontFamily: FONT.body, letterSpacing: LETTER_SPACING.body }}>{tr("common.loading", "Loading...")}</Text>
              ) : isSignedIn ? (
                <>
                  <Text style={{ color: theme.colors.text, fontWeight: "900", marginBottom: 10, fontFamily: FONT.body, letterSpacing: LETTER_SPACING.body }}>
                    {tr("auth.signedInAs", "Signed in as:")} {authEmail ?? "—"}
                  </Text>

                  <Button title={tr("auth.logout", "Logout")} variant="ghost" onPress={() => signOut?.()} />

                  <View style={{ height: 12 }} />

                  <DestructiveButton
                    title={deleteBusy ? "Deleting..." : "Delete account"}
                    disabled={deleteBusy}
                    onPress={doDeleteAccount}
                  />

                  <Text style={{ color: theme.colors.muted, marginTop: 8, fontSize: 12, fontWeight: "700", fontFamily: FONT.body, letterSpacing: LETTER_SPACING.body }}>
                    This permanently removes your account and all data.
                  </Text>

                </>
              ) : (
                <>
                  <Button title={tr("auth.loginMagicLink", "Login (magic link)")} onPress={() => setLoginOpen(true)} />
                  <Text style={{ color: theme.colors.muted, marginTop: 8, fontSize: 12, fontWeight: "700", fontFamily: FONT.body, letterSpacing: LETTER_SPACING.body }}>
                    {tr("auth.magicLinkHelp", "We’ll email you a sign-in link.")}
                  </Text>
                </>
              )}
            </Card>

            {/* ABOUT */}
            <SectionTitle title={tr("settings.about", "About")} style={{ marginTop: theme.spacing.l }} />
            <Card style={{ padding: 12 }}>
              <Text style={{ color: theme.colors.muted, fontWeight: "700", fontFamily: FONT.body, letterSpacing: LETTER_SPACING.body }}>
                {tr("settings.aboutLine", "Family app for tasks and organization.")}
              </Text>
              <View style={{ height: 10 }} />
              <Text style={{ color: theme.colors.text, fontWeight: "900", fontFamily: FONT.body, letterSpacing: LETTER_SPACING.body }}>
                {tr("settings.version", "Version")}: {version}
              </Text>
            </Card>
          </View>
        </ScrollView>

        {/* LANGUAGE SHEET */}
        <BottomSheet visible={langOpen} onClose={() => setLangOpen(false)}>
          <Card>
            <Text style={{ fontSize: 18, fontWeight: "900", color: theme.colors.text, fontFamily: FONT.title, letterSpacing: LETTER_SPACING.title }}>
              {tr("settings.language", "Language")}
            </Text>
            <Text style={{ color: theme.colors.muted, marginTop: 6 }}>
              {tr("settings.languageHint", "Choose the interface language.")}
            </Text>

            <View style={{ marginTop: 12, gap: 10 }}>
              <Button title={tr("settings.croatian", "Croatian")} variant={locale === "hr" ? "success" : "ghost"} onPress={() => pickLocale("hr")} />
              <Button title={tr("settings.english", "English")} variant={locale === "en" ? "success" : "ghost"} onPress={() => pickLocale("en")} />
              <Button title={tr("settings.italian", "Italian")} variant={locale === "it" ? "success" : "ghost"} onPress={() => pickLocale("it")} />
              <Button title={tr("settings.slovenian", "Slovenian")} variant={locale === "sl" ? "success" : "ghost"} onPress={() => pickLocale("sl")} />
              <Button title={tr("settings.french", "French")} variant={locale === "fr" ? "success" : "ghost"} onPress={() => pickLocale("fr")} />
              <Button title={tr("settings.german", "German")} variant={locale === "de" ? "success" : "ghost"} onPress={() => pickLocale("de")} />
              <Button title={tr("settings.spanish", "Spanish")} variant={locale === "es" ? "success" : "ghost"} onPress={() => pickLocale("es")} />
              <Button title={tr("settings.serbian", "Serbian")} variant={locale === "rs" ? "success" : "ghost"} onPress={() => pickLocale("rs")} />

              <Button title={tr("common.cancel", "Cancel")} variant="ghost" onPress={() => setLangOpen(false)} />
            </View>
          </Card>
        </BottomSheet>

        {/* RENAME FAMILY SHEET */}
        <BottomSheet visible={renameOpen} onClose={() => setRenameOpen(false)}>
          <Card>
            <Text style={{ fontSize: 18, fontWeight: "900", color: theme.colors.text, fontFamily: FONT.title, letterSpacing: LETTER_SPACING.title }}>
              {tr("settings.renameFamilyTitle", "Rename family")}
            </Text>

            <TextInput
              value={renameDraft}
              onChangeText={setRenameDraft}
              placeholder={tr("settings.renameFamilyPlaceholder", "Family name")}
              placeholderTextColor={theme.colors.muted}
              autoCapitalize="words"
              autoCorrect={false}
              style={[styles.input, { fontSize: 16, fontWeight: "800" }]}
            />

            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <Button title={tr("common.cancel", "Cancel")} variant="ghost" onPress={() => setRenameOpen(false)} style={{ flex: 1 }} />
              <Button title={tr("common.save", "Save")} onPress={doRenameFamily} disabled={!String(renameDraft ?? "").trim()} style={{ flex: 1 }} />
            </View>
          </Card>
        </BottomSheet>

        {/* RENAME ME SHEET */}
        <BottomSheet visible={nameOpen} onClose={() => setNameOpen(false)}>
          <Card>
            <Text style={{ fontSize: 18, fontWeight: "900", color: theme.colors.text, fontFamily: FONT.title, letterSpacing: LETTER_SPACING.title }}>
              {tr("settings.myProfile", "My profile")}
            </Text>


<View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
  <Pressable
    onPress={() => setRoleDraft("parent")}
    style={[
      styles.segPill,
      roleDraft === "parent" ? styles.segPillOn : styles.segPillOff,
    ]}
  >
    <Text style={roleDraft === "parent" ? styles.segTextOn : styles.segTextOff}>
      {tr("members.parent", "Parent")}
    </Text>
  </Pressable>

  <Pressable
    onPress={() => setRoleDraft("child")}
    style={[
      styles.segPill,
      roleDraft === "child" ? styles.segPillOn : styles.segPillOff,
    ]}
  >
    <Text style={roleDraft === "child" ? styles.segTextOn : styles.segTextOff}>
      {tr("members.child", "Child")}
    </Text>
  </Pressable>
</View>

<View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
  <Pressable
    onPress={() => setGenderDraft("male")}
    style={[
      styles.segPill,
      genderDraft === "male" ? styles.segPillOn : styles.segPillOff,
    ]}
  >
    <Text style={genderDraft === "male" ? styles.segTextOn : styles.segTextOff}>
      {tr("common.male", "Male")}
    </Text>
  </Pressable>

  <Pressable
    onPress={() => setGenderDraft("female")}
    style={[
      styles.segPill,
      genderDraft === "female" ? styles.segPillOn : styles.segPillOff,
    ]}
  >
    <Text style={genderDraft === "female" ? styles.segTextOn : styles.segTextOff}>
      {tr("common.female", "Female")}
    </Text>
  </Pressable>
</View>

            <TextInput
              value={nameDraft}
              onChangeText={setNameDraft}
              placeholder={tr("settings.myNamePlaceholder", "e.g. Alex")}
              placeholderTextColor={theme.colors.muted}
              autoCapitalize="words"
              style={[styles.input, { fontSize: 16, fontWeight: "800" }]}
            />

            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <Button title={tr("common.cancel", "Cancel")} variant="ghost" onPress={() => setNameOpen(false)} style={{ flex: 1 }} />
              <Button title={tr("common.save", "Save")} onPress={doRenameMe} disabled={!String(nameDraft ?? "").trim()} style={{ flex: 1 }} />
            </View>
          </Card>
        </BottomSheet>

        {/* JOIN FAMILY SHEET */}

        <BottomSheet visible={createOpen} onClose={() => setCreateOpen(false)}>
          <Card>
            <Text style={{ fontSize: 18, fontWeight: "900", color: theme.colors.text, fontFamily: FONT.title, letterSpacing: LETTER_SPACING.title }}>
              {tr("settings.createFamily.title", "Create family")}
            </Text>

            <Text style={{ color: theme.colors.muted, marginTop: 6 }}>
              {tr("settings.createFamily.desc", "Create a new family to start sharing tasks.")}
            </Text>

            <TextInput
              value={createDraft}
              onChangeText={setCreateDraft}
              placeholder={tr("settings.createFamily.placeholder", "Family name")}
              placeholderTextColor={theme.colors.muted}
              autoCapitalize="words"
              style={[styles.input, { fontSize: 16, fontWeight: "800" }]}
            />

            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <Button
                title={tr("common.cancel", "Cancel")}
                variant="ghost"
                onPress={() => setCreateOpen(false)}
                style={{ flex: 1 }}
              />
              <Button
                title={createBusy ? tr("common.loading", "Loading...") : tr("settings.btn.createFamily", "Create")}
                onPress={doCreateFamily}
                disabled={!String(createDraft ?? "").trim() || createBusy}
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        </BottomSheet>

        <BottomSheet visible={joinOpen} onClose={() => setJoinOpen(false)}>
          <Card>
            <Text style={{ fontSize: 18, fontWeight: "900", color: theme.colors.text, fontFamily: FONT.title, letterSpacing: LETTER_SPACING.title }}>
              {tr("settings.joinFamily.title", "Join family")}
            </Text>

            <TextInput
              value={joinCodeDraft}
              onChangeText={setJoinCodeDraft}
              placeholder={tr("settings.joinFamily.placeholder", "Invite code")}
              placeholderTextColor={theme.colors.muted}
              autoCapitalize="characters"
              autoCorrect={false}
              style={[styles.input, { fontSize: 16, fontWeight: "800" }]}
            />

            <View style={{ height: 14 }} />

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Button
                title={tr("common.cancel", "Cancel")}
                variant="ghost"
                onPress={() => {
                  setJoinOpen(false);
                  setJoinBusy(false);
                }}
                style={{ flex: 1 }}
              />
              <Button
                title={joinBusy ? tr("common.loading", "Loading...") : tr("settings.btn.join", "Join")}
                onPress={doJoinFamily}
                disabled={!String(joinCodeDraft ?? "").trim() || joinBusy}
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        </BottomSheet>

        {/* LOGIN SHEET */}
        <BottomSheet visible={loginOpen} onClose={() => setLoginOpen(false)}>
          <Card>
            <Text style={{ fontSize: 18, fontWeight: "900", color: theme.colors.text, fontFamily: FONT.title, letterSpacing: LETTER_SPACING.title }}>
              {tr("auth.loginMagicLink", "Login (magic link)")}
            </Text>

            <TextInput
              value={emailDraft}
              onChangeText={setEmailDraft}
              placeholder="email@example.com"
              placeholderTextColor={theme.colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={[styles.input, { fontSize: 16, fontWeight: "800" }]}
            />

            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <Button title={tr("common.cancel", "Cancel")} variant="ghost" onPress={() => setLoginOpen(false)} style={{ flex: 1 }} />
              <Button title={tr("auth.sendLink", "Send link")} onPress={doLoginMagicLink} disabled={loginBusy || !cleanEmail(emailDraft)} style={{ flex: 1 }} />
            </View>
          </Card>
        </BottomSheet>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 14,
    overflow: "hidden",
    ...Platform.select({
      android: { elevation: 1 },
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 5 },
      },
      default: {},
    }),
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: theme.colors.text,
    letterSpacing: LETTER_SPACING.title,
    fontFamily: FONT.title,
  },
  heroSub: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.muted,
    fontFamily: FONT.body,
    letterSpacing: LETTER_SPACING.body,
  },
  heroArt: {
    position: "absolute" as const,
    right: 22,
    top: -20,
    width: 130,
    height: 130,
    pointerEvents: "none" as const,
  },
  heroAccentBg: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 6,
    backgroundColor: "#f1f5f9",
  },
  heroAccent: {
    height: 6,
    width: "46%",
    borderTopRightRadius: 999,
    borderBottomRightRadius: 999,
  },

  infoBox: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.input,
    padding: 12,
    backgroundColor: "#fff",
  },
  infoLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "800",
    fontFamily: FONT.body,
    letterSpacing: LETTER_SPACING.body,
  },
  infoValue: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 6,
    fontFamily: FONT.body,
    letterSpacing: LETTER_SPACING.body,
  },
  infoHint: {
    marginTop: 8,
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "700",
    fontFamily: FONT.body,
    letterSpacing: LETTER_SPACING.body,
  },

  setupCallout: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    backgroundColor: "#eff6ff",
    borderRadius: 16,
    padding: 12,
  },
  setupTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 6,
    fontFamily: FONT.body,
    letterSpacing: LETTER_SPACING.body,
  },
  setupLine: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 2,
    fontFamily: FONT.body,
    letterSpacing: LETTER_SPACING.body,
  },
  setupHint: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "700",
    fontFamily: FONT.body,
    letterSpacing: LETTER_SPACING.body,
  },
  helpText: {
    color: theme.colors.muted,
    marginTop: 8,
    fontSize: 12,
    fontWeight: "700",
    fontFamily: FONT.body,
    letterSpacing: LETTER_SPACING.body,
  },

  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },

  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheetWrap: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 14,
  },
  sheetInner: {
    width: "100%",
  },

  input: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.input,
    padding: 12,
    backgroundColor: "#fff",
    color: theme.colors.text,
    fontFamily: FONT.body,
    letterSpacing: LETTER_SPACING.body,
  },

segPill: {
  flex: 1,
  paddingVertical: 10,
  borderRadius: 16,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
},
segPillOn: {
  backgroundColor: theme.colors.primary,
  borderColor: theme.colors.primary,
},
segPillOff: {
  backgroundColor: "#fff",
  borderColor: theme.colors.border,
},
segTextOn: {
  color: "#fff",
  fontWeight: "900",
    fontFamily: FONT.body,
    letterSpacing: LETTER_SPACING.body,
},
segTextOff: {
  color: theme.colors.text,
  fontWeight: "900",
    fontFamily: FONT.body,
    letterSpacing: LETTER_SPACING.body,
},
});
