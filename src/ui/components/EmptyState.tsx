import React from "react";
import { Text, View } from "react-native";
import { Card } from "./Card";
import { Button } from "./Button";
import { theme } from "../theme";

export function EmptyState({
  title,
  subtitle,
  cta,
  onPress,
}: {
  title: string;
  subtitle?: string;
  cta?: string;
  onPress?: () => void;
}) {
  return (
    <Card>
      <Text style={{ fontSize: 18, fontWeight: "900", color: theme.colors.text }}>
        {title}
      </Text>

      {subtitle ? (
        <Text style={{ color: theme.colors.muted, marginTop: 8, lineHeight: 20 }}>
          {subtitle}
        </Text>
      ) : null}

      {cta && onPress ? (
        <View style={{ marginTop: 12 }}>
          <Button title={cta} onPress={onPress} />
        </View>
      ) : null}
    </Card>
  );
}
