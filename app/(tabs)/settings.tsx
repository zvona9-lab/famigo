// /app/(tabs)/settings.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
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

import { Screen } from "../../src/ui/components/Screen";
import { Card } from "../../src/ui/components/Card";
import { Button } from "../../src/ui/components/Button";
import { SectionTitle } from "../../src/ui/components/SectionTitle";
import { theme } from "../../src/ui/theme";

import { useT } from "../../lib/useT";
import { useMembers } from "../../lib/members";
import { useLocale } from "../../lib/locale";
import { useTasks } from "../../lib/tasks";
import { useAuth } from "../../lib/auth";

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
  return (
    <Modal visible={props.visible} transparent animationType="slide" onRequestClose={props.onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={props.onClose} />
      <View style={styles.sheetWrap}>
        <View style={styles.sheetInner}>{props.children}</View>
      </View>
    </Modal>
  );
}

export default function SettingsScreen() {
  const t = getT();
  const { locale, setLocale } = useLocale();

  const {
    ready: membersReady,
    inFamily,
    familyName,
    familyId,
    inviteCode,
    isParent,
    myMember,
    refresh: refreshMembers,
  } = useMembers() as any;

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
    return v as string;
  }

  const version = Application.nativeApplicationVersion ?? Application.applicationVersion ?? "1.0.0";

  const [langOpen, setLangOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameDraft, setRenameDraft] = useState("");
  const [nameOpen, setNameOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [emailDraft, setEmailDraft] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);

  const localeLabel = useMemo(() => {
    const map: Record<string, string> = {
      hr: tr("settings.croatian", "Hrvatski"),
      en: tr("settings.english", "English"),
      it: tr("settings.italian", "Italiano"),
      sl: tr("settings.slovenian", "Slovenščina"),
      fr: tr("settings.french", "Français"),
      de: tr("settings.german", "Deutsch"),
      es: tr("settings.spanish", "Español"),
      rs: tr("settings.serbian", "Srpski"),
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

  const familyStatusLine = useMemo(() => {
    if (!membersReady) return tr("common.loading", "Loading...");
    if (!inFamily) return tr("settings.family.notInFamily", "You are not in a family.");
    const name = String(familyName ?? "").trim() || tr("members.familyNameFallback", "My Family");
    const masked = maskInvite(inviteCode ?? "");
    return tr("settings.family.statusLine", "Family: {{name}} (Invite: {{code}})", { name, code: masked });
  }, [membersReady, inFamily, familyName, inviteCode, t]);

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

    try {
      const { error } = await supabase.rpc("rename_me", { new_name: newName });
      if (error) throw error;

      setNameOpen(false);
      setNameDraft("");
      Alert.alert(tr("common.ok", "OK"), tr("settings.saved", "Saved."));
      await refreshMembers?.();
      await refreshTasks?.();
    } catch (e: any) {
      Alert.alert(tr("common.error", "Error"), String(e?.message ?? e));
    }
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
          </View>

          <View style={{ paddingHorizontal: 16, width: "100%", alignSelf: "stretch" }}>
            {/* LANGUAGE */}
            <SectionTitle title={tr("settings.language", "Language")} />
            <Card style={{ padding: 12 }}>
              <Text style={{ color: theme.colors.muted, marginBottom: 10 }}>
                {tr("settings.languageHint", "Choose the interface language.")}
              </Text>

              <Button
                title={tr("settings.btn.changeLanguage", "Change language ({{lang}})", { lang: localeLabel })}
                variant="ghost"
                onPress={() => setLangOpen(true)}
              />

              <Text style={{ color: theme.colors.muted, marginTop: 8, fontSize: 12, fontWeight: "700" }}>
                {tr("settings.languageNote", "This change applies to the whole app.")}
              </Text>

              <View style={{ height: 12 }} />
              <Button
                title={tr("settings.btn.editName", "Edit name")}
                variant="ghost"
                onPress={() => {
                  setNameDraft(String(myMember?.name ?? "").trim());
                  setNameOpen(true);
                }}
              />
            </Card>

            {/* FAMILY */}
            <SectionTitle title={tr("settings.family.title", "Family")} style={{ marginTop: theme.spacing.l }} />

            <Card style={{ padding: 12 }}>
              <Text style={{ color: theme.colors.muted, fontWeight: "700" }}>{familyStatusLine}</Text>

              {inFamily ? (
                <>
                  <View style={{ height: 10 }} />

                  {/* Family name row */}
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      borderRadius: theme.radius.input,
                      padding: 12,
                      backgroundColor: "#fff",
                    }}
                  >
                    <Text style={{ color: theme.colors.muted, fontSize: 12, fontWeight: "800" }}>
                      {tr("settings.labels.family", "Family")}
                    </Text>

                    <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "900", marginTop: 6 }}>
                      {String(familyName ?? "").trim() || tr("members.familyNameFallback", "My Family")}
                    </Text>

                    {isParent ? (
                      <>
                        <View style={{ height: 12 }} />
                        <Button
                          title={tr("settings.btn.renameFamily", "Rename")}
                          variant="ghost"
                          onPress={() => {
                            setRenameDraft(String(familyName ?? "").trim());
                            setRenameOpen(true);
                          }}
                        />
                      </>
                    ) : null}
                  </View>

                  <View style={{ height: 10 }} />

                  {/* Invite code */}
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      borderRadius: theme.radius.input,
                      padding: 12,
                      backgroundColor: "#fff",
                    }}
                  >
                    <Text style={{ color: theme.colors.muted, fontSize: 12, fontWeight: "800" }}>
                      {tr("settings.labels.inviteCode", "Invite code")}
                    </Text>

                    <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "900", marginTop: 6 }}>
                      {String(inviteCode ?? "—")}
                    </Text>

                    <View style={{ height: 12 }} />
                    <Button title={tr("settings.btn.copy", "Copy")} variant="ghost" onPress={copyInvite} />
                  </View>
                </>
              ) : null}
            </Card>

            {/* ACCOUNT */}
            <SectionTitle title={tr("settings.account", "Account")} style={{ marginTop: theme.spacing.l }} />
            <Card style={{ padding: 12 }}>
              {!authReady ? (
                <Text style={{ color: theme.colors.muted, fontWeight: "700" }}>{tr("common.loading", "Loading...")}</Text>
              ) : isSignedIn ? (
                <>
                  <Text style={{ color: theme.colors.text, fontWeight: "900", marginBottom: 10 }}>
                    {tr("auth.signedInAs", "Signed in as:")} {authEmail ?? "—"}
                  </Text>

                  <Button title={tr("auth.logout", "Logout")} variant="ghost" onPress={() => signOut?.()} />
                </>
              ) : (
                <>
                  <Button title={tr("auth.loginMagicLink", "Login (magic link)")} onPress={() => setLoginOpen(true)} />
                  <Text style={{ color: theme.colors.muted, marginTop: 8, fontSize: 12, fontWeight: "700" }}>
                    {tr("auth.magicLinkHelp", "We’ll email you a sign-in link.")}
                  </Text>
                </>
              )}
            </Card>

            {/* ABOUT */}
            <SectionTitle title={tr("settings.about", "About")} style={{ marginTop: theme.spacing.l }} />
            <Card style={{ padding: 12 }}>
              <Text style={{ color: theme.colors.muted, fontWeight: "700" }}>
                {tr("settings.aboutLine", "Family app for tasks and organization.")}
              </Text>
              <View style={{ height: 10 }} />
              <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                {tr("settings.version", "Version")}: {version}
              </Text>
            </Card>
          </View>
        </ScrollView>

        {/* LANGUAGE SHEET */}
        <BottomSheet visible={langOpen} onClose={() => setLangOpen(false)}>
          <Card>
            <Text style={{ fontSize: 18, fontWeight: "900", color: theme.colors.text }}>
              {tr("settings.language", "Language")}
            </Text>
            <Text style={{ color: theme.colors.muted, marginTop: 6 }}>
              {tr("settings.languageHint", "Choose the interface language.")}
            </Text>

            <View style={{ marginTop: 12, gap: 10 }}>
              <Button title={tr("settings.croatian", "Hrvatski")} variant={locale === "hr" ? "success" : "ghost"} onPress={() => pickLocale("hr")} />
              <Button title={tr("settings.english", "English")} variant={locale === "en" ? "success" : "ghost"} onPress={() => pickLocale("en")} />
              <Button title={tr("settings.italian", "Italiano")} variant={locale === "it" ? "success" : "ghost"} onPress={() => pickLocale("it")} />
              <Button title={tr("settings.slovenian", "Slovenščina")} variant={locale === "sl" ? "success" : "ghost"} onPress={() => pickLocale("sl")} />
              <Button title={tr("settings.french", "Français")} variant={locale === "fr" ? "success" : "ghost"} onPress={() => pickLocale("fr")} />
              <Button title={tr("settings.german", "Deutsch")} variant={locale === "de" ? "success" : "ghost"} onPress={() => pickLocale("de")} />
              <Button title={tr("settings.spanish", "Español")} variant={locale === "es" ? "success" : "ghost"} onPress={() => pickLocale("es")} />
              <Button title={tr("settings.serbian", "Srpski")} variant={locale === "rs" ? "success" : "ghost"} onPress={() => pickLocale("rs")} />

              <Button title={tr("common.cancel", "Cancel")} variant="ghost" onPress={() => setLangOpen(false)} />
            </View>
          </Card>
        </BottomSheet>

        {/* RENAME FAMILY SHEET */}
        <BottomSheet visible={renameOpen} onClose={() => setRenameOpen(false)}>
          <Card>
            <Text style={{ fontSize: 18, fontWeight: "900", color: theme.colors.text }}>
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
            <Text style={{ fontSize: 18, fontWeight: "900", color: theme.colors.text }}>
              {tr("settings.myName", "My name")}
            </Text>

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

        {/* LOGIN SHEET */}
        <BottomSheet visible={loginOpen} onClose={() => setLoginOpen(false)}>
          <Card>
            <Text style={{ fontSize: 18, fontWeight: "900", color: theme.colors.text }}>
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
    fontSize: 24,
    fontWeight: "900",
    color: theme.colors.text,
    letterSpacing: 0.2,
  },
  heroSub: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.muted,
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

  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheetWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
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
  },
});
