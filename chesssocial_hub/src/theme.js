//
// Theme utility for reading, setting and applying user/system theme.
// Persists theme in localStorage.
//
const THEME_KEY = "checkmates-theme";
const THEME_LIGHT = "light";
const THEME_DARK = "dark";
const THEME_AUTO = "auto";

// CSS variables for the two color themes (light/dark)
const THEME_COLORS = {
  light: {
    "--primary": "#4F46E5",
    "--secondary": "#F9FAFB",
    "--accent": "#F59E0B",
    "--text": "#111827",
    "--cardBg": "#FFFFFF",
    "--highlight": "#10B981",
    "--error": "#EF4444",
    "--bodyBg": "#F9FAFB",
    "--boardBg": "#E0E3EA",
    "--dropGlow": "#C7D3FF",
    "--postGlow": "#FDE68A"
  },
  dark: {
    "--primary": "#4F46E5",
    "--secondary": "#1A1832",
    "--accent": "#F59E0B",
    // Update the main text color for dark mode to a lighter blue for better readability
    "--text": "#818CF8", // Light Indigo-Blue
    "--cardBg": "#232136",
    "--highlight": "#10B981",
    "--error": "#EF4444",
    "--bodyBg": "#18112B",
    "--boardBg": "#292657",
    "--dropGlow": "#3A3686",
    "--postGlow": "#724607"
  }
};

// PUBLIC_INTERFACE
export function getInitialTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored) return stored;
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) return THEME_DARK;
  return THEME_LIGHT;
}

// PUBLIC_INTERFACE
export function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
}

// PUBLIC_INTERFACE
export function applyTheme(theme) {
  const colors =
    theme === THEME_DARK
      ? THEME_COLORS.dark
      : theme === THEME_LIGHT
      ? THEME_COLORS.light
      : window.matchMedia("(prefers-color-scheme: dark)").matches
      ? THEME_COLORS.dark
      : THEME_COLORS.light;
  for (const k in colors) {
    document.documentElement.style.setProperty(k, colors[k]);
  }
  document.body.style.background = colors["--bodyBg"];
}

// PUBLIC_INTERFACE
export function getThemeKey() {
  return THEME_KEY;
}
