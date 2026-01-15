import { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  TextInput,
  Button,
  Alert,
  Text,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../lib/supabase";

const inputStyle = {
  borderWidth: 1,
  borderColor: "#666",
  borderRadius: 10,
  paddingHorizontal: 12,
  paddingVertical: 10,
  color: "#fff",
  backgroundColor: "#222",
};

type Member = {
  id: string;
  user_id: string;
  role: string;
  display_name: string | null;
};

type FamilyInfo = {
  id: string;
  name: string | null;
  invite_code: string | null;
};

export default function HomeScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loggedIn, setLoggedIn] = useState(false);

  const [familyId, setFamilyId] = useState<string | null>(null);
  const [familyInfo, setFamilyInfo] = useState<FamilyInfo | null>(null);
  const [members, setMembers] = useState<Member[]>([]);

  const [familyName, setFamilyName] = useState("");
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState("");

  const [loading, setLoading] = useState(false);

  /* ===================== SESSION ===================== */

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(!!session);

      if (!session) {
        setFamilyId(null);
        setFamilyInfo(null);
        setMembers([]);
        setInviteCode(null);
        setJoinCode("");
        setFamilyName("");
      } else {
        // kad se user logira, povuci obitelj
        loadMyFamily();
      }
    });

    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===================== LOAD FAMILY ===================== */

  useEffect(() => {
    if (!loggedIn) return;
    loadMyFamily();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn]);

  const loadFamilyInfo = async (fid: string) => {
    // OVDJE pretpostavljamo tablicu: families(id, name, invite_code)
    const { data, error } = await supabase
      .from("families")
      .select("id, name, invite_code")
      .eq("id", fid)
      .maybeSingle();

    if (error) return;
    if (data) setFamilyInfo(data as FamilyInfo);
  };

  const loadMembers = async (fid: string) => {
    const { data, error } = await supabase
      .from("family_members")
      .select("id, user_id, role, display_name")
      .eq("family_id", fid)
      .order("created_at", { ascending: true });

    if (!error && data) setMembers(data as Member[]);
  };

  const loadMyFamily = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.rpc("my_family");
      if (error || !data) {
        setFamilyId(null);
        setFamilyInfo(null);
        setMembers([]);
        return;
      }

      setFamilyId(data);
      await Promise.all([loadFamilyInfo(data), loadMembers(data)]);
    } finally {
      setLoading(false);
    }
  };

  /* ===================== AUTH ===================== */

  const signIn = async () => {
    const e = email.trim();
    const p = password;
    if (!e || !p) return Alert.alert("Greška", "Email i lozinka su obavezni.");

    const { error } = await supabase.auth.signInWithPassword({ email: e, password: p });
    if (error) Alert.alert("Login error", error.message);
  };

  const signUp = async () => {
    const e = email.trim();
    const p = password;
    if (!e || !p) return Alert.alert("Greška", "Email i lozinka su obavezni.");

    const { error } = await supabase.auth.signUp({ email: e, password: p });
    if (error) Alert.alert("Register error", error.message);
    else Alert.alert("OK", "Provjeri email ako je potvrda uključena.");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setFamilyId(null);
    setFamilyInfo(null);
    setMembers([]);
    setInviteCode(null);
    setJoinCode("");
    setFamilyName("");
  };

  /* ===================== CREATE FAMILY ===================== */

  const createFamily = async () => {
    const name = familyName.trim();
    if (!name) return Alert.alert("Greška", "Upiši naziv obitelji.");

    try {
      setLoading(true);

      const { data, error } = await supabase.rpc("create_family", { family_name: name });

      if (error) return Alert.alert("Create family error", error.message);

      const result = Array.isArray(data) ? data[0] : data;
      const code = result?.invite_code ?? null;

      setInviteCode(code);
      setFamilyName("");

      await loadMyFamily();

      Alert.alert("Family created", code ? `Invite code:\n${code}` : "Family created successfully");
    } catch (e: any) {
      Alert.alert("Crash", e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  /* ===================== JOIN FAMILY ===================== */

  const joinFamily = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return Alert.alert("Greška", "Upiši invite code.");

    try {
      setLoading(true);

      const { error } = await supabase.rpc("join_family", { invite: code });
      if (error) return Alert.alert("Join error", error.message);

      setJoinCode("");
      await loadMyFamily();

      Alert.alert("Success", "Joined family!");
    } catch (e: any) {
      Alert.alert("Crash", e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  /* ===================== UI ===================== */

  if (!loggedIn) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#fff" }}>
            Login / Register
          </Text>

          <TextInput
            style={inputStyle}
            placeholder="Email"
            placeholderTextColor="#aaa"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={inputStyle}
            placeholder="Password"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Button title="Login" onPress={signIn} />
          <Button title="Register" onPress={signUp} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const inFamily = !!familyId;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: "600", color: "#fff" }}>Famigo</Text>

        {loading && (
          <View style={{ paddingVertical: 10 }}>
            <ActivityIndicator size="large" />
          </View>
        )}

        <Button title="Refresh" onPress={loadMyFamily} />

        {inFamily ? (
          <View style={{ gap: 10 }}>
            <Text style={{ color: "#fff", marginTop: 10, fontSize: 16, fontWeight: "700" }}>
              Obitelj: {familyInfo?.name ?? "(bez naziva)"}
            </Text>

            <Text style={{ color: "#fff" }}>
              Invite code:{" "}
              <Text style={{ fontWeight: "700" }}>
                {inviteCode ?? familyInfo?.invite_code ?? "(nema)"}
              </Text>
            </Text>

            <Text style={{ color: "#fff", marginTop: 10, fontWeight: "700" }}>
              Members:
            </Text>

            {members.length === 0 ? (
              <Text style={{ color: "#bbb" }}>Nema članova (još).</Text>
            ) : (
              members.map((m) => (
                <Text key={m.id} style={{ color: "#fff" }}>
                  • {m.display_name ?? m.user_id} ({m.role})
                </Text>
              ))
            )}

            <View style={{ marginTop: 10 }}>
              <Button title="Logout" onPress={signOut} />
            </View>
          </View>
        ) : (
          <>
            <Text style={{ color: "#bbb", marginTop: 10 }}>
              Nisi još u obitelji.
            </Text>

            <Text style={{ marginTop: 20, fontSize: 18, fontWeight: "600", color: "#fff" }}>
              Create family
            </Text>

            <TextInput
              style={inputStyle}
              placeholder="Naziv obitelji"
              placeholderTextColor="#aaa"
              value={familyName}
              onChangeText={setFamilyName}
            />

            <Button title="Create family" onPress={createFamily} />

            {inviteCode && (
              <Text style={{ marginTop: 10, color: "#fff" }}>
                Invite code: <Text style={{ fontWeight: "700" }}>{inviteCode}</Text>
              </Text>
            )}

            <Text style={{ marginTop: 30, fontSize: 18, fontWeight: "600", color: "#fff" }}>
              Join family
            </Text>

            <TextInput
              style={inputStyle}
              placeholder="Invite code"
              placeholderTextColor="#aaa"
              autoCapitalize="characters"
              value={joinCode}
              onChangeText={setJoinCode}
            />

            <Button title="Join family" onPress={joinFamily} />
            <Button title="Logout" onPress={signOut} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
