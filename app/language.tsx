import { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { useT } from "../lib/useT";
import { useLocale } from "../lib/locale";
import type { AppLocale } from "../lib/i18n";

function Item({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 12,
        padding: 14,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "700" }}>{title}</Text>
    </Pressable>
  );
}

const LANGS: AppLocale[] = ["hr", "en", "it", "sl", "fr", "de", "es", "rs"];

export default function LanguageScreen() {
  const tt = useT() as any;
  const router = useRouter();
  const navigation = useNavigation();
  const { locale, setLocale } = useLocale();

  useEffect(() => {
    navigation.setOptions({ title: tt("language.title") });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = async (next: AppLocale) => {
    await setLocale(next);
    router.back();
  };

  return (
    <View style={{ padding: 20, gap: 12, flex: 1, backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>{tt("language.title")}</Text>
      <Text style={{ fontSize: 13, color: "#6b7280", marginTop: -6 }}>{tt("language.subtitle")}</Text>

      {LANGS.map((code) => (
        <Item
          key={code}
          title={`${tt(`language.languages.${code}`)}${locale === code ? " ✓" : ""}`}
          onPress={() => pick(code)}
        />
      ))}
    </View>
  );
}
