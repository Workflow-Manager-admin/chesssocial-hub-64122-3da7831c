import React, { useState, useEffect } from "react";
import { getInitialTheme, setTheme, applyTheme, getThemeKey } from "./theme";

const THEMES = [
  {
    key: "light",
    label: "Light",
    icon: "☀️",
    className: ""
  },
  {
    key: "dark",
    label: "Dark",
    icon: "🌙",
    className: "dark"
  },
  {
    key: "auto",
    label: "Auto",
    icon: "🖥️",
    className: "auto"
  }
];

// PUBLIC_INTERFACE
export default function ThemeToggle() {
  const [theme, setThemeState] = useState(getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
    // eslint-disable-next-line
  }, [theme]);

  function handleToggle() {
    // Light → dark → auto → light
    const idx = THEMES.findIndex((t) => t.key === theme);
    const next = THEMES[(idx + 1) % THEMES.length];
    setThemeState(next.key);
    setTheme(next.key);
  }

  return (
    <button
      className={
        "theme-toggle-switch " +
        THEMES.find((t) => t.key === theme)?.className
      }
      onClick={handleToggle}
      title={`Theme: ${THEMES.find((t) => t.key === theme)?.label || ""}`}
      aria-label="Toggle theme"
    >
      <span className="slider" aria-hidden="true">
        {THEMES.find((t) => t.key === theme)?.icon || "🔄"}
      </span>
    </button>
  );
}
