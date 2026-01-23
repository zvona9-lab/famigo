// /src/ui/theme.ts
export const theme = {
  colors: {
    // Brand
    primary: "#2563EB",
    primaryDark: "#1E40AF",

    // Accents (family friendly)
    success: "#22C55E",
    danger: "#EF4444",
    warning: "#F59E0B",
    purple: "#8B5CF6",

    // Text
    text: "#0B1220",
    muted: "#6B7280",

    // Surfaces
    background: "#F5F7FB",
    // Back-compat alias used in some screens
    bg: "#F5F7FB",

    card: "#FFFFFF",
    frost: "rgba(255,255,255,0.78)",
    frostStrong: "rgba(255,255,255,0.88)",

    // Lines
    border: "rgba(148,163,184,0.35)",
  },

  radius: {
    card: 22,
    sheet: 22,
    input: 16,
    pill: 999,
    button: 16,
  },

  spacing: {
    xs: 6,
    s: 10,
    m: 12,
    l: 14,
    xl: 16,
    xxl: 20,
  },

  // iOS shadow + Android elevation (soft)
  shadow: {
    card: {
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 3,
    },
    soft: {
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 2,
    },
  },

  // Optional fonts (screens may override)
  fonts: {
    title: undefined as unknown as string | undefined,
    body: undefined as unknown as string | undefined,
  },
} as const;

export type Theme = typeof theme;
