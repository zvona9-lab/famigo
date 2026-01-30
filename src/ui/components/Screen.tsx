// /src/ui/components/Screen.tsx
import React from "react";
import { View, ViewStyle, StyleSheet } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../theme";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;

  /** Ako želiš da ekran ide “full bleed” gore (rijetko) */
  unsafeTop?: boolean;

  /** Ako želiš kontrolirati padding (npr. screens s vlastitim layoutom) */
  noPadding?: boolean;

  /** Isključi dekorativnu podlogu (ako ti negdje smeta) */
  plain?: boolean;
};

export function Screen({ children, style, unsafeTop = false, noPadding = false, plain = false }: Props) {
  useSafeAreaInsets(); // keeps dependency for future tweaks

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      // Tabs: obično ne želimo “safe” na dnu jer tab bar već to radi.
      edges={unsafeTop ? ["left", "right", "bottom"] : ["left", "right", "top"]}
    >
      {/* family-friendly podloga (suptilna, ne smije smetati UI-u) */}
      {!plain ? (
        <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
          {/* veliki “blob” gore lijevo */}
          <View
            style={{
              position: "absolute",
              top: -120,
              left: -120,
              width: 260,
              height: 260,
              borderRadius: 260,
              backgroundColor: theme.colors.primary,
              opacity: 0.08,
            }}
          />
          {/* blob gore desno */}
          <View
            style={{
              position: "absolute",
              top: -90,
              right: -110,
              width: 220,
              height: 220,
              borderRadius: 220,
              backgroundColor: theme.colors.purple,
              opacity: 0.06,
            }}
          />
          {/* blob dolje desno */}
          <View
            style={{
              position: "absolute",
              bottom: -140,
              right: -120,
              width: 280,
              height: 280,
              borderRadius: 280,
              backgroundColor: theme.colors.success,
              opacity: 0.06,
            }}
          />

          {/* par sitnih “točkica” kao konfeti */}
          {Array.from({ length: 10 }).map((_, i) => {
            const size = i % 3 === 0 ? 6 : 4;
            const left = [24, 90, 160, 220, 300, 40, 130, 260, 320, 200][i] ?? 50;
            const top = [160, 120, 210, 80, 180, 320, 360, 260, 310, 420][i] ?? 200;
            const color = [theme.colors.primary, theme.colors.warning, theme.colors.purple][i % 3];
            return (
              <View
                key={i}
                style={{
                  position: "absolute",
                  left,
                  top,
                  width: size,
                  height: size,
                  borderRadius: 999,
                  backgroundColor: color,
                  opacity: 0.10,
                }}
              />
            );
          })}
        </View>
      ) : null}

      <View
        style={[
          {
            flex: 1,
            paddingHorizontal: noPadding ? 0 : 16,
            paddingTop: noPadding ? 0 : 10,
            // ✅ nema paddingBottom ovdje (tab bar + SafeAreaView edges)
          },
          style,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
