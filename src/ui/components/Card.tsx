import React from "react";
import { View, ViewStyle } from "react-native";
import { theme } from "../theme";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  padded?: boolean;
  border?: boolean;

  /** Suptilniji “frosted” look (malo više family-friendly) */
  frosted?: boolean;
};

export function Card({ children, style, padded = true, border = true, frosted = false }: Props) {
  const shadow = (theme as any)?.shadow?.card ?? {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  };

  return (
    <View
      style={[
        {
          backgroundColor: frosted ? theme.colors.frostStrong : theme.colors.card,
          borderRadius: theme.radius.card,
          padding: padded ? theme.spacing.l : 0,
          borderWidth: border ? 1 : 0,
          borderColor: border ? theme.colors.border : "transparent",
          ...shadow,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
