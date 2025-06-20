import React, { useState, useEffect } from "react";

// PUBLIC_INTERFACE
/** 
 * ThemeToggle: Animated minimal toggle to switch light/dark mode by setting [data-theme] on <html>.
 * Remembers user choice in localStorage. Supports initial sync with system preference.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    // Prefer localStorage, otherwise system preference
    const saved = typeof window !== "undefined" && window.localStorage.getItem("theme");
    if (saved) return saved;
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return "dark";
    return "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(cur => (cur === "light" ? "dark" : "light"));
  }

  return (
    <button
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      onClick={toggleTheme}
      className="theme-toggle"
      tabIndex={0}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        marginLeft: 16,
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        outline: "none"
      }}
    >
      <span
        className="theme-toggle-thumb"
        aria-hidden="true"
        style={{
          width: 36,
          height: 24,
          borderRadius: 13,
          border: "2px solid var(--border)",
          background: theme === "dark" ? "var(--surface)" : "var(--card-bg)",
          boxShadow: theme === "dark" ? "0 1.5px 13px -1px #a9a3fa55" : "0 1.5px 10px -3px #edebfc",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          position: "relative",
          transition: "background 0.2s, box-shadow 0.2s",
        }}
      >
        <span
          style={{
            display: "block",
            width: 17,
            height: 17,
            borderRadius: "50%",
            background: theme === "dark" ? "var(--primary)" : "var(--accent)",
            boxShadow: "0 1.5px 7px -3px var(--primary)",
            marginLeft: theme === "dark" ? 14 : 3,
            marginRight: theme === "dark" ? 3 : 14,
            transition: "margin 0.23s cubic-bezier(.44,.12,.52,1.04), background 0.16s",
          }}
        >
          {theme === "dark" 
            ? <span style={{display:"block",fontSize:"1.01em",color:"#fff",margin:"0 0",lineHeight:"17px",textAlign:"center"}} role="img" aria-label="moon">🌙</span>
            : <span style={{display:"block",fontSize:"1em",color:"#C77100",margin:"0 0",lineHeight:"17px",textAlign:"center"}} role="img" aria-label="sun">☀️</span>
          }
        </span>
      </span>
    </button>
  );
}
