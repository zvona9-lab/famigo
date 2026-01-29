// /lib/typography.ts
// Centralized typography so all tabs feel consistent.
// Keep it dependency-free (no theme import) to avoid circular deps.

import { Platform } from "react-native";

export const FONT = {
  title: Platform.OS === "ios" ? "AvenirNext-Heavy" : "sans-serif",
  body: Platform.OS === "ios" ? "AvenirNext-Regular" : "sans-serif",
};

export const LETTER_SPACING = {
  // Slightly tighter title for a polished "hero" feel
  title: Platform.OS === "ios" ? -0.6 : -0.3,
  sub: Platform.OS === "ios" ? -0.2 : 0,
  body: 0,
};
