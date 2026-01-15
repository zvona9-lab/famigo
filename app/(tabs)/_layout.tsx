// /app/(tabs)/_layout.tsx
import React, { useMemo } from "react";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { theme } from "../../src/ui/theme";
import { useTasks } from "../../lib/tasks";
import { useLocale } from "../../lib/locale";
import { useT } from "../../lib/useT";

function TabIcon(props: { name: any; color: string; focused: boolean }) {
  return (
    <Ionicons
      name={props.name}
      size={22}
      color={props.color}
      style={{ opacity: props.focused ? 1 : 0.9 }}
    />
  );
}

function getT() {
  const tx = useT() as any;
  return typeof tx === "function" ? tx : tx?.t;
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  // ✅ re-render / remount Tabs kad se promijeni jezik
  const { locale } = useLocale();

  // ✅ translations
  const t = getT();
  function tr(key: string, fallback: string) {
    const v = t?.(key);
    if (!v) return fallback;
    if (typeof v === "string" && v.startsWith("[missing")) return fallback;
    return v as string;
  }

  // ✅ badge count
  const { tasks } = useTasks() as any;

  const openCount = useMemo(() => {
    const list = (tasks ?? []) as Array<{ done?: boolean }>;
    const n = list.filter((x) => !x.done).length;
    if (n <= 0) return 0;
    if (n > 99) return 99;
    return n;
  }, [tasks]);

  const baseHeight = 62;
  const bottomPad = 10;

  // ✅ “premium” tab bar look
  const TAB_BG = "#111111"; // tamno, da se odvoji od contenta

  return (
    <Tabs
      key={locale}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,

        // ✅ bolja čitljivost na tamnoj traci
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "rgba(255,255,255,0.65)",

        tabBarStyle: {
          backgroundColor: TAB_BG,

          // ✅ jasna separacija od contenta
          borderTopColor: "rgba(255,255,255,0.10)",
          borderTopWidth: 1,

          // ✅ “lift” efekt (iOS shadow + Android elevation)
          shadowColor: "#000",
          shadowOpacity: 0.18,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: -6 },
          elevation: 18,

          height: baseHeight + insets.bottom,
          paddingTop: 8,
          paddingBottom: bottomPad + insets.bottom,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },

        tabBarBadgeStyle: {
          backgroundColor: theme.colors.primary,
          color: "#fff",
          fontSize: 11,
          fontWeight: "800",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: tr("tabs.home", "Home"),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "home" : "home-outline"} color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="members"
        options={{
          title: tr("tabs.members", "Members"),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "people" : "people-outline"}
              color={color}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="tasks"
        options={{
          title: tr("tabs.tasks", "Tasks"),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "checkbox" : "checkbox-outline"}
              color={color}
              focused={focused}
            />
          ),
          tabBarBadge: openCount > 0 ? openCount : undefined,
        }}
      />

      {/* ✅ NEW: Shopping */}
      <Tabs.Screen
        name="shopping"
        options={{
          title: tr("tabs.shopping", "Shopping"),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "cart" : "cart-outline"}
              color={color}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: tr("tabs.settings", "Settings"),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "settings" : "settings-outline"}
              color={color}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
