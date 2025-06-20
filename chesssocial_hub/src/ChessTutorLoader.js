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
    desc: "Start your games right! Learn the foundational moves like the Italian, Spanish, and Queen's Gambit that build strong positions.",
    longer: "Openings are the first 5–10 moves of a chess game. Knowing them helps you develop pieces, control the center, and avoid early traps. Popular openings like the Italian Game (1.e4 e5 2.Nf3 Nc6 3.Bc4) teach principles: quick development and king safety.",
    tip: "Tip: Focus on rapid piece development and control of center squares, not just memorizing moves.",
    icon: icons.openings
  },
  {
    key: "tactics",
    title: "Common Tactics",
    desc: "Unlock the power of forks, pins, skewers, and more to outsmart your opponent and win material.",
    longer: "Tactics are short-term tricks and maneuvers that decide most chess games. Learn staples like forks (double attacks), pins (restraining an enemy piece), skewers, and discovered attacks. Solving puzzles is the fastest way to get better at tactics.",
    tip: "Tip: Always scan the board for checks, captures, and threats on every move.",
    icon: icons.tactics
  },
  {
    key: "checkmate",
    title: "Checkmate Patterns",
    desc: "Master classics like back rank mate and smothered mate to finish games decisively.",
    longer: "Finishing games requires recognizing patterns where the opponent's king has no escape. Key patterns include back rank mate (rook delivers mate behind blocked pawns), smothered mate (a knight mates a boxed-in king), and basic king/queen or king/rook mates.",
    tip: "Tip: When attacking, look for unguarded squares around the enemy king—pattern recognition is key.",
    icon: icons.checkmate
  }
];

/**
 * ChessTutorLoader displays the animated loader then shows interactive Chess Tutor cards.
 */
export default function ChessTutorLoader() {
  const [showLoader, setShowLoader] = useState(true);
  const [dots, setDots] = useState(".");
  const [fadeOut, setFadeOut] = useState(false);
  const [expanded, setExpanded] = useState(null); // currently expanded card
  const [tipModal, setTipModal] = useState({ open: false, idx: null }); // tip modal

  // Animate loader dots for dot dance.
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

  // Loader fadeout and content show management.
  useEffect(() => {
    let t1 = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setShowLoader(false), 450);
    }, 1500);
    return () => clearTimeout(t1);
  }, []);

  // Accessibility: Close tip modal with escape
  useEffect(() => {
    function onKey(e) {
      if (tipModal.open && e.key === "Escape") setTipModal({ open: false, idx: null });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tipModal.open]);

  // Loader markup only
  if (showLoader) {
    return (
      <div
        className="tutor-mode-loader"
        style={{
          opacity: fadeOut ? 0 : 1,
          transition: "opacity 440ms cubic-bezier(.81,.12,.29,.95)"
        }}
      >
        <span role="img" aria-label="brain" style={{ fontSize: "2.1rem", marginBottom: 8 }}>🧠</span>
        Loading Neural Chess Tutor
        <span className="tutor-dot-dance">
          <span className="dot">{dots.length > 0 ? "." : ""}</span>
          <span className="dot">{dots.length > 1 ? "." : ""}</span>
          <span className="dot">{dots.length > 2 ? "." : ""}</span>
        </span>
      </div>
    );
  }

  // Renders one tutor card with interactivity
  function TutorCard({ card, idx }) {
    // Tooltip state for the icon (simple show/hide on hover/focus)
    const [iconHovered, setIconHovered] = useState(false);
    // Animate the icon (rotate) on hover/focus.
    const [iconAnim, setIconAnim] = useState(false);

    return (
      <div
        key={card.key}
        tabIndex={0}
        aria-label={card.title}
        aria-expanded={expanded === idx}
        className="tutor-mode-card"
        style={{
          background: "var(--cardBg)",
          borderRadius: 18,
          boxShadow: expanded === idx
            ? "0 0 38px 0 var(--accent), 0 0 13px 1.5px var(--accent)"
            : "0 5px 28px -10px var(--postGlow), 0 2px 12px -6px var(--accent)",
          border: expanded === idx ? "2.5px solid var(--primary)" : "1.5px solid var(--accent)",
          padding: "22px 22px 18px 22px",
          margin: 0,
          minWidth: 150,
          flex: "1 1 210px",
          maxWidth: 210,
          minHeight: 172,
          cursor: "pointer",
          transition: "transform 0.16s, box-shadow 0.24s, border-color 0.19s, background 0.22s",
          color: "var(--primary)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          outline: expanded === idx ? "2.5px solid var(--highlight)" : "none",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "scale(1.065)";
          setIconAnim(true);
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "scale(1.0)";
          setIconAnim(false);
          setIconHovered(false);
        }}
        onFocus={e => { setIconAnim(true); }}
        onBlur={e => { setIconAnim(false); setIconHovered(false); }}
        onClick={() => setExpanded(expanded === idx ? null : idx)}
        onKeyDown={e => {
          if ((e.key === "Enter" || e.key === " ") && !tipModal.open) {
            e.preventDefault();
            setExpanded(expanded === idx ? null : idx);
          }
        }}
        role="button"
      >
        {/* Card Icon, with tooltip and animated on hover */}
        <div
          aria-label={`${card.title} icon`}
          tabIndex={0}
          style={{
            minHeight: 38,
            marginBottom: 3,
            transition: "transform 0.36s cubic-bezier(.37,.28,.43,1.13)",
            transform: iconAnim ? "rotate(-18deg) scale(1.17)" : "none",
            filter: iconAnim
              ? "drop-shadow(0 0 11px var(--accent)) brightness(1.11)"
              : "drop-shadow(0 2.5px 8px var(--highlight))"
          }}
          onMouseEnter={() => setIconHovered(true)}
          onPointerOver={() => setIconHovered(true)}
          onMouseLeave={() => setIconHovered(false)}
          onFocus={() => setIconHovered(true)}
          onBlur={() => setIconHovered(false)}
        >
          {card.icon}
          {/* Tooltip */}
          <span
            style={{
              display: iconHovered ? "block" : "none",
              position: "absolute",
              left: "50%",
              top: 8,
              transform: "translateX(-50%) translateY(-110%)",
              background: "var(--primary)",
              color: "var(--secondary)",
              fontSize: "0.98rem",
              fontWeight: 500,
              padding: "6px 13px",
              borderRadius: 9,
              boxShadow: "0 4px 18px 0 var(--primary)",
              opacity: 0.97,
              zIndex: 8,
              pointerEvents: "none",
              whiteSpace: "nowrap"
            }}
            role="tooltip"
            aria-live={iconHovered ? "polite" : "off"}
          >
            {card.title} Topic
          </span>
        </div>
        {/* Title */}
        <div
          style={{
            fontWeight: 700,
            fontSize: "1.28rem",
            color: "var(--primary)"
          }}
        >
          {card.title}
        </div>
        {/* Short Desc */}
        <div
          style={{
            color: "var(--accent)",
            fontWeight: 500,
            fontSize: "0.99rem",
            marginTop: 7,
            opacity: .91,
            marginBottom: expanded === idx ? 8 : 2,
            textAlign: "center"
          }}
        >
          {card.desc}
        </div>
        {/* Expand Area */}
        {expanded === idx && (
          <div
            aria-live="polite"
            style={{
              background: "rgba(79,70,229,0.08)",
              color: "var(--text)",
              marginTop: 6,
              marginBottom: 2,
              padding: "10px 7px 7px 7px",
              borderRadius: 11,
              boxShadow: "0 2px 20px -11px var(--primary), 0 1px 5px -1px var(--accent)",
              fontSize: "0.98rem",
              fontWeight: 500,
              textAlign: "left",
              minHeight: 52,
              maxWidth: 185,
              overflow: "visible"
            }}
          >
            <div style={{ lineHeight: 1.45, marginBottom: 9 }}>{card.longer}</div>
            <button
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: "var(--highlight)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "1.01em",
                border: "none",
                borderRadius: 6,
                boxShadow: "0 1px 7px -2px var(--highlight)",
                padding: "5px 12px",
                cursor: "pointer",
                marginTop: 2,
                marginBottom: 1,
                transition: "background 0.15s"
              }}
              onClick={e => {
                e.stopPropagation();
                setTipModal({ open: true, idx });
              }}
              tabIndex={0}
              aria-label="Show learning tip"
            >
              <span role="img" aria-label="bulb">💡</span>
              Learning Tip
            </button>
            <div style={{ fontSize: "0.97em", opacity: 0.73, marginTop: 4 }}>
              <em>(Click outside or press Esc to close tip)</em>
            </div>
          </div>
        )}
        {/* Expand/collapse arrow for accessibility & discoverability */}
        <button
          style={{
            background: "none",
            border: "none",
            color: "var(--primary)",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "1.3em",
            marginTop: expanded === idx ? -5 : 7,
            marginBottom: -4,
            display: "flex",
            alignItems: "center",
            alignSelf: "center",
            transition: "transform 0.17s",
            transform: expanded === idx ? "rotate(90deg) scale(1.13)" : "none"
          }}
          tabIndex={0}
          aria-label={expanded === idx ? "Collapse details" : "Expand for more"}
          aria-expanded={expanded === idx}
          onClick={e => {
            e.stopPropagation();
            setExpanded(expanded === idx ? null : idx);
          }}
        >
          {expanded === idx ? "⮞" : "⮜"}
        </button>
      </div>
    );
  }

  // ARIA modal for "tip"
  function TipModal({ idx }) {
    if (!tipModal.open || typeof idx !== "number") return null;
    const card = CARD_DATA[idx];
    return (
      <div
        tabIndex={0}
        aria-label="Learning Tip"
        aria-modal="true"
        role="dialog"
        style={{
          position: "fixed",
          left: 0, top: 0, width: "100vw", height: "100vh",
          zIndex: 2100,
          background: "rgba(20, 16, 50, 0.21)",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "fadeInInstaModal 0.17s"
        }}
        onClick={() => setTipModal({ open: false, idx: null })}
      >
        <div
          tabIndex={0}
          aria-label={`Tip for ${card.title}`}
          style={{
            background: "var(--cardBg)",
            borderRadius: 14,
            boxShadow: "0 7px 40px -12px var(--primary), 0 1px 11px -2px var(--accent)",
            padding: "32px 30px 23px 30px",
            minWidth: 210,
            maxWidth: 325,
            border: "2.2px solid var(--highlight)",
            outline: "2.5px solid var(--accent)",
            color: "var(--text)",
            position: "relative"
          }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ fontWeight: 600, color: "var(--primary)", fontSize: "1.18em", marginBottom: 7 }}>
            {card.title} – Learning Tip
          </div>
          <div style={{ fontSize: "1.08em", color: "var(--accent)", fontWeight: 500, marginBottom: 13 }}>
            {card.tip}
          </div>
          <button
            aria-label="Close tip"
            onClick={() => setTipModal({ open: false, idx: null })}
            style={{
              position: "absolute",
              top: 9, right: 13,
              background: "none",
              border: "none",
              fontWeight: 900,
              color: "var(--accent)",
              fontSize: "1.3em",
              cursor: "pointer",
              zIndex: 150
            }}
          >✕</button>
        </div>
      </div>
    );
  }

  // Render UI
  return (
    <div
      className="tutor-mode-content"
      style={{
        width: "100%",
        maxWidth: 660,
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
      {/* Welcome */}
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

      {/* Card row */}
      <div
        style={{
          display: "flex",
          gap: 28,
          flexWrap: "wrap",
          width: "100%",
          justifyContent: "center"
        }}
        className="tutor-mode-cards-container"
      >
        {CARD_DATA.map((card, idx) => (
          <TutorCard card={card} idx={idx} key={card.key} />
        ))}
        {TipModal({ idx: tipModal.idx })}
      </div>
      {/* "More lessons coming soon" */}
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
