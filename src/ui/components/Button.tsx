import React from "react";
import { Pressable, Text, TextStyle, ViewStyle } from "react-native";
import { theme } from "../theme";

type Props = {
  title: string;
  onPress?: () => void;
  /**
   * primary = plava tipka (default)
   * secondary = svijetla/outline tipka
   */
  variant?: "primary" | "secondary";
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  disabled?: boolean;
};

export function Button({
  title,
  onPress,
  variant = "primary",
  style,
  textStyle,
  disabled,
}: Props) {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          height: 44,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",

          // ✅ klasična plava tipka s bijelim fontom
          backgroundColor: isPrimary ? theme.colors.primary : theme.colors.card,
          borderWidth: isPrimary ? 0 : 1,
          borderColor: isPrimary ? "transparent" : theme.colors.border,

          // ✅ suptilan shadow (da ne izgleda “jeftino”, ali ni napadno)
          shadowColor: "#000",
          shadowOpacity: isPrimary ? 0.10 : 0.06,
          shadowRadius: isPrimary ? 6 : 4,
          shadowOffset: { width: 0, height: 2 },
          elevation: isPrimary ? 2 : 1,

          // press feedback
          opacity: disabled ? 0.45 : pressed ? 0.88 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        },
        style,
      ]}
    >
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={[
          {
            color: isPrimary ? "#fff" : theme.colors.text,
            fontSize: 14,
            fontWeight: "700",
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}
