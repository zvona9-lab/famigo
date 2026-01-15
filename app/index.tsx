import { useEffect, useState } from "react";
import {
  View,
  TextInput,
  Button,
  Alert,
  Text,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase";
import { useT } from "../lib/useT";

const inputStyle = {
  borderWidth: 1,
  borderColor: "#666",
  borderRadius: 10,
  paddingHorizontal: 12,
  paddingVertical: 10,
  color: "#fff",
  backgroundColor: "#222",
};

export default function LoginScreen() {
  const tt = useT();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // ako je već ulogiran, odmah u app
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/(tabs)/home");
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) router.replace("/(tabs)/home");
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    const e = email.trim();
    const p = password;

    if (!e || !p) {
      return Alert.alert(
        tt("common.error"),
        tt("auth.required")
      );
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: e,
        password: p,
      });

      if (error) {
        Alert.alert(
          tt("auth.alerts.loginErrorTitle"),
          error.message
        );
      }
    } finally {
      setBusy(false);
    }
  };

  const signUp = async () => {
    const e = email.trim();
    const p = password;

    if (!e || !p) {
      return Alert.alert(
        tt("common.error"),
        tt("auth.required")
      );
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: e,
        password: p,
      });

      if (error) {
        Alert.alert(
          tt("auth.alerts.registerErrorTitle"),
          error.message
        );
      } else {
        Alert.alert(
          tt("common.ok"),
          tt("auth.checkEmail")
        );
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Famigo</Text>
      <Text style={{ opacity: 0.8 }}>{tt("auth.title")}</Text>

      <TextInput
        style={inputStyle}
        placeholder={tt("auth.placeholders.email")}
        placeholderTextColor="#aaa"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        editable={!busy}
      />

      <TextInput
        style={inputStyle}
        placeholder={tt("auth.placeholders.password")}
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!busy}
      />

      {busy && <ActivityIndicator size="large" />}

      <Button
        title={tt("auth.login")}
        onPress={signIn}
        disabled={busy}
      />
      <Button
        title={tt("auth.register")}
        onPress={signUp}
        disabled={busy}
      />
    </View>
  );
}
