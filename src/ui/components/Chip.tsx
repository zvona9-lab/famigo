import React from "react";
import { Pressable, Text, View } from "react-native";
import { theme } from "../theme";

type Props = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

export function Chip({ label, active, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        height: 36,
        paddingHorizontal: 14,
        borderRadius: 18,
        backgroundColor: active
          ? theme.colors.primary
          : theme.colors.surface,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",

        shadowColor: "#000",
        shadowOpacity: active ? 0.18 : 0.08,
        shadowRadius: active ? 10 : 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: active ? 4 : 2,

        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      {/* overlay highlight */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "50%",
          backgroundColor: "rgba(255,255,255,0.08)",
        }}
      />

      <Text
        style={{
          color: active
            ? theme.colors.onPrimary
            : theme.colors.text,
          fontSize: 14,
          fontWeight: "500",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
