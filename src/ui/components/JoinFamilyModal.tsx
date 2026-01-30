// /src/ui/components/JoinFamilyModal.tsx
import React, { useState } from "react";
import { Alert, Modal, Pressable, Text, TextInput, View } from "react-native";
import { theme } from "../theme";
import { Button } from "./Button";

type Props = {
  visible: boolean;
  onClose: () => void;
  onJoin: (code: string) => Promise<void>;
};

export function JoinFamilyModal({ visible, onClose, onJoin }: Props) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleJoin() {
    const clean = code.trim().replace(/\s+/g, "");
    if (clean.length < 4) {
      Alert.alert("Greška", "Upiši važeći kod.");
      return;
    }

    setBusy(true);
    try {
      await onJoin(clean);
      setCode("");
      onClose();
      Alert.alert("Uspjeh", "Ušao si u obitelj.");
    } catch (e: any) {
      const msg =
        e?.message === "INVALID_CODE"
          ? "Kod nije ispravan."
          : e?.message === "EXPIRED_CODE"
          ? "Kod je istekao."
          : e?.message || "Nešto je pošlo po zlu.";
      Alert.alert("Ne mogu ući", msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)", padding: 16, justifyContent: "center" }}>
        <Pressable onPress={() => {}} style={{ backgroundColor: "#fff", borderRadius: 18, padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "800", color: theme.text }}>Join family</Text>
          <Text style={{ marginTop: 6, color: theme.muted }}>Upiši invite kod (npr. 6 znamenki).</Text>

          <TextInput
            value={code}
            onChangeText={setCode}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Kod (npr. 123456)"
            keyboardType="number-pad"
            style={{
              marginTop: 12,
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 12,
              fontSize: 16,
            }}
          />

          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
            <View style={{ flex: 1 }}>
              <Button title="Odustani" variant="secondary" onPress={onClose} />
            </View>
            <View style={{ flex: 1 }}>
              <Button title={busy ? "Ulazim..." : "Join"} onPress={handleJoin} disabled={busy} />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
