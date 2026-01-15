export const theme = {
  colors: {
    primary: "#2563EB",
    success: "#22C55E",
    background: "#F9FAFB",
    card: "#FFFFFF",
    text: "#111827",
    muted: "#6B7280",
    border: "#E5E7EB",
    danger: "#EF4444",
  },
  radius: {
    card: 16,
    button: 14,
    input: 14,
    chip: 999,
  },
  spacing: {
    xs: 6,
    s: 10,
    m: 14,
    l: 20,
    xl: 28,
  },
  shadow: {
    // iOS shadow + Android elevation (soft)
    card: {
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 2,
    },
  },
} as const;

export type Theme = typeof theme;
