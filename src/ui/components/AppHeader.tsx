import React from "react";
import { View, Text, ViewStyle } from "react-native";
import { theme } from "../theme";

type Props = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  style?: ViewStyle;
};

export function AppHeader({ title, subtitle, right, style }: Props) {
  return (
    <View
      style={[
        {
          paddingTop: 8,        // ⬅ malo, kontrolirano
          paddingBottom: 8,
          paddingHorizontal: 16,

          backgroundColor: theme.colors.bg,

          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        style,
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: theme.colors.text,
            }}
            numberOfLines={1}
          >
            {title}
          </Text>

          {!!subtitle && (
            <Text
              style={{
                marginTop: 2,
                fontSize: 12,
                color: theme.colors.muted,
              }}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {!!right && <View style={{ marginLeft: 12 }}>{right}</View>}
      </View>
    </View>
  );
}
