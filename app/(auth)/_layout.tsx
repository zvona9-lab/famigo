import React, { useEffect } from "react";
import { Platform } from "react-native";
import { Stack } from "expo-router";
import * as NavigationBar from "expo-navigation-bar";

// NOTE: Keep this layout lightweight.
// Auth/session gating and global providers should live in app/_layout.tsx (root).
export default function AuthLayout() {
  // Android navigation bar styling (optional, safe)
  useEffect(() => {
    if (Platform.OS !== "android") return;

    (async () => {
      try {
        await NavigationBar.setBackgroundColorAsync("#111111");
        await NavigationBar.setButtonStyleAsync("light");
        await NavigationBar.setBehaviorAsync("inset-swipe");
      } catch {
        // ignore
      }
    })();
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
