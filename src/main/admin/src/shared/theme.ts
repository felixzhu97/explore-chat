export type ThemeMode = "light" | "dark";

export const primaryHex = "#0095f6";

export const theme = {
  bg: "var(--admin-bg)",
  surface: "var(--admin-surface)",
  surfaceAlt: "var(--admin-surface-alt)",
  border: "var(--admin-border)",
  borderLight: "var(--admin-border-light)",
  text: "var(--admin-text)",
  textSecondary: "var(--admin-text-secondary)",
  primary: "var(--admin-primary)",
  primaryHover: "var(--admin-primary-hover)",
  danger: "var(--admin-danger)",
  dangerHover: "var(--admin-danger-hover)",
  inputBg: "var(--admin-input-bg)",
  chartGrid: "var(--admin-chart-grid)",
  iconMuted: "var(--admin-icon-muted)",
  shadow: "var(--admin-shadow)",
} as const;

export const lightColors = {
  bg: "#fafafa",
  surface: "#ffffff",
  border: "#dbdbdb",
  text: "#262626",
  textSecondary: "#8e8e8e",
  primary: "#0095f6",
} as const;

export const darkColors = {
  bg: "#000000",
  surface: "#121212",
  border: "#2f2f2f",
  text: "#f5f5f5",
  textSecondary: "#a8a8a8",
  primary: "#4cb5f9",
} as const;
