import React, { useState, useEffect } from "react";

// Icon SVG components for consistent style
const icons = {
  openings: (
    <svg width="38" height="38" style={{marginBottom:6}} viewBox="0 0 38 38" fill="none">
      <rect x="2" y="7" width="8" height="22" rx="2.7" fill="#4F46E5"/>
      <rect x="14" y="3" width="10" height="30" rx="3" fill="#F59E0B"/>
      <rect x="28" y="11" width="8" height="14" rx="2.6" fill="#10B981"/>
    </svg>
  ),
  tactics: (
    <svg width="38" height="38" style={{marginBottom:6}} viewBox="0 0 38 38" fill="none">
      <circle cx="19" cy="19" r="13" fill="#F59E0B"/>
      <rect x="16.2" y="8" width="5.6" height="21" rx="2.7" fill="#4F46E5"/>
      <rect x="8" y="16.3" width="21" height="5.6" rx="2.8" fill="#10B981"/>
    </svg>
  ),
  checkmate: (
    <svg width="34" height="38" style={{marginBottom:6}} viewBox="0 0 34 38" fill="none">
      <ellipse cx="17" cy="29" rx="14" ry="7.2" fill="#4F46E5" opacity="0.12"/>
      <path d="M17 7.8l4 11.2h11l-8.9 6.4 3.5 11-9.6-7-9.6 7 3.5-11L2 19h11L17 7.8z" fill="#F59E0B"/>
      <circle cx="17" cy="7" r="2.5" fill="#10B981"/>
    </svg>
  )
};

// Soft glowing card shadow and hover effect, adjust with global CSS vars for accessibility.
// Custom fade-in/fade-out for loader/content state.

const CARD_DATA = [
  {
    key: "openings",
    title: "Basic Openings",
    desc: "Begin with classic chess openers.",
    icon: icons.openings
  },
  {
    key: "tactics",
    title: "Common Tactics",
    desc: "Boost skills with tactical exercises.",
    icon: icons.tactics
  },
  {
    key: "checkmate",
    title: "Checkmate Patterns",
    desc: "Learn essential mating nets.",
    icon: icons.checkmate
  }
];

// PUBLIC_INTERFACE
/**
 * ChessTutorLoader controls the loader state. For 1.5s, show dot animation; then fade to Tutor Mode.
 * After loader disappears, shows:
 *   - Welcome message
 *   - Three glowing card sections: Basic Openings, Common Tactics, Checkmate Patterns
 * Cards gently glow on hover/tap. Fade is animated but minimal JS; transition is driven by class.
 * All styling is in-line or uses checkmates.css variables to match app.
 */
export default function ChessTutorLoader() {
  const [showLoader, setShowLoader] = useState(true);
  const [dots, setDots] = useState(".");
  const [fadeOut, setFadeOut] = useState(false);

  // Dot animation for loader
  useEffect(() => {
    if (!showLoader) return;
    let active = true;
    function animate() {
      setDots((d) => (d === "..." ? "." : d + "."));
      if (active) setTimeout(animate, 510);
    }
    animate();
    return () => { active = false; };
  }, [showLoader]);

  // Loader display management
  useEffect(() => {
    let t1 = setTimeout(() => {
      setFadeOut(true); // start fade
      setTimeout(() => setShowLoader(false), 450); // after fade, hide
    }, 1500);
    return () => clearTimeout(t1);
  }, []);

  // Loader markup
  if (showLoader) {
    return (
      <div
        className={"tutor-mode-loader"}
        style={{
          opacity: fadeOut ? 0 : 1,
          transition: "opacity 440ms cubic-bezier(.81,.12,.29,.95)"
        }}
      >
        <span
          role="img"
          aria-label="brain"
          style={{ fontSize: "2.1rem", marginBottom: 8 }}
        >
          🧠
        </span>
        Loading Neural Chess Tutor
        <span className="tutor-dot-dance">
          <span className="dot">{dots.length > 0 ? "." : ""}</span>
          <span className="dot">{dots.length > 1 ? "." : ""}</span>
          <span className="dot">{dots.length > 2 ? "." : ""}</span>
        </span>
      </div>
    );
  }

  // Tutor Mode Content after loader
  return (
    <div
      className="tutor-mode-content"
      style={{
        width: "100%",
        maxWidth: 540,
        margin: "0 auto",
        textAlign: "center",
        animation: "fadeInArena 1.12s",
        minHeight: 320,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 32
      }}
      tabIndex={0}
      aria-label="Tutor Mode"
    >
      <div
        style={{
          color: "var(--primary)",
          fontWeight: 700,
          fontSize: "2.1rem",
          marginBottom: 10,
          letterSpacing: "-.01em",
          textShadow: "0 2px 16px var(--dropGlow)"
        }}
        className="tutor-mode-welcome"
      >
        Welcome to Tutor Mode!
      </div>

      <div
        style={{
          display: "flex",
          gap: 24,
          flexWrap: "wrap",
          width: "100%",
          justifyContent: "center"
        }}
        className="tutor-mode-cards-container"
      >
        {CARD_DATA.map((card) => (
          <div
            key={card.key}
            tabIndex={0}
            className="tutor-mode-card"
            style={{
              background: "var(--cardBg)",
              borderRadius: 18,
              boxShadow: "0 5px 28px -10px var(--postGlow), 0 2px 12px -6px var(--accent)",
              border: "1.5px solid var(--accent)",
              padding: "22px 22px 18px 22px",
              margin: "0 0 0 0",
              minWidth: 130,
              flex: "1 1 160px",
              maxWidth: 173,
              minHeight: 144,
              cursor: "pointer",
              transition: "transform 0.15s, box-shadow 0.21s, border-color 0.14s, background 0.22s",
              color: "var(--primary)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "scale(1.052)";
              e.currentTarget.style.boxShadow =
                "0 0 38px 0 var(--accent), 0 0 13px 1.5px var(--accent)";
              e.currentTarget.style.borderColor = "var(--primary)";
              e.currentTarget.style.background = "rgba(245,234,200,0.13)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "scale(1.0)";
              e.currentTarget.style.boxShadow =
                "0 5px 28px -10px var(--postGlow), 0 2px 12px -6px var(--accent)";
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.background = "var(--cardBg)";
            }}
            onFocus={e => e.currentTarget.dispatchEvent(new Event('mouseenter'))}
            onBlur={e => e.currentTarget.dispatchEvent(new Event('mouseleave'))}
            aria-label={card.title}
          >
            <div style={{minHeight:38}}>{card.icon}</div>
            <div
              style={{
                fontWeight: 700,
                fontSize: "1.25rem",
                color: "var(--primary)"
              }}
            >
              {card.title}
            </div>
            <div
              style={{
                color: "var(--accent)",
                fontWeight: 500,
                fontSize: "0.99rem",
                marginTop: 7,
                opacity: .91
              }}
            >
              {card.desc}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 33,
          color: "var(--text-secondary)",
          fontWeight: 500,
          fontSize: "1.09rem"
        }}
        aria-hidden="true"
      >
        <span role="img" aria-label="bulb">💡</span>
        More interactive lessons coming soon.
      </div>
    </div>
  );
}
