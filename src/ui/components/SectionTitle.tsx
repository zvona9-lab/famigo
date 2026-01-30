import React from "react";
import { Text, View, ViewStyle } from "react-native";
import { theme } from "../theme";

type Props = {
  title: string;
  subtitle?: string;
  style?: ViewStyle | ViewStyle[];
  right?: React.ReactNode;
};

export function SectionTitle({ title, subtitle, style, right }: Props) {
  return (
    <View
      style={[
        {
          marginBottom: theme.spacing.s,
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-between",
        },
        style,
      ]}
    >
      <View style={{ flex: 1, paddingRight: theme.spacing.s }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: theme.colors.text }}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={{ marginTop: 2, color: theme.colors.muted }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}
