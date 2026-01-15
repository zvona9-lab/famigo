// /src/ui/components/Screen.tsx
import React from "react";
import { View, ViewStyle } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../theme";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;

  /** Ako želiš da ekran ide “full bleed” gore (rijetko) */
  unsafeTop?: boolean;

  /** Ako želiš kontrolirati padding (npr. screens s vlastitim layoutom) */
  noPadding?: boolean;

  /**
   * Safe area bottom.
   * ✅ U TAB screens najčešće treba biti FALSE, jer tab bar već “jede” safe area pa dobiješ dupli razmak.
   * Ako imaš screen bez tab bara (npr. modal/stack), tada stavi true.
   */
  safeBottom?: boolean; // default false
};

export function Screen({
  children,
  style,
  unsafeTop,
  noPadding,
  safeBottom = false, // ✅ default je false
}: Props) {
  const insets = useSafeAreaInsets();

  // ✅ KLJUČ: u tabovima NE želimo left/right safe-area jer može “sužavati” sadržaj
  const edges: Array<"top" | "bottom"> = [
    ...(unsafeTop ? [] : ["top" as const]),
    ...(safeBottom ? ["bottom" as const] : []),
  ];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.bg }}
      edges={edges}
    >
      {/* ===== TOP SCRIM (iza sata / status bara) ===== */}
      {!unsafeTop && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: insets.top + 6,
            backgroundColor: "rgba(0,0,0,0.18)",
            zIndex: 5,
          }}
        />
      )}

      <View
        style={[
          {
            flex: 1,
            backgroundColor: theme.colors.bg,
            width: "100%",
            alignSelf: "stretch",

            paddingHorizontal: noPadding ? 0 : 16,
            paddingTop: noPadding ? 0 : 10,

            // ✅ nema paddingBottom ovdje
            // ✅ bottom safe area kontrolira SafeAreaView preko edges (i defaultno je ugašen na tabovima)
          },
          style,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
