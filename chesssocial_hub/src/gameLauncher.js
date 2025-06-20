import React, { useState, Suspense, lazy } from "react";
import "./gameLauncher.css"; // modular styles for the games modal/loader

const GAME_MODULES = {
  "snakeLadder": {
    label: "Snake & Ladder",
    emoji: "🐍🎲",
    loader: () => import("./snakeLadder"),
  },
  "ludoGame": {
    label: "Ludo",
    emoji: "🧿🎲",
    loader: () => import("./ludoGame"),
  }
  // Poker can be added like:
  // "pokerLite": { label: "Poker (Lite)", emoji: "🃏", loader: () => import("./pokerLite") }
};

// PUBLIC_INTERFACE
/**
 * GameLauncher: Shows modal for "Other Games 🎲", handles dynamic game module loading.
 * Props:
 * - open: show/hide modal
 * - onClose: callback when closed/back to Chess
 */
export default function GameLauncher({ open, onClose }) {
  const [selected, setSelected] = useState(null);
  const [GameComp, setGameComp] = useState(null);
  const [loading, setLoading] = useState(false);

  // Start loading a selected game
  async function handleSelectGame(key) {
    setLoading(true);
    setSelected(key);
    try {
      const mod = await GAME_MODULES[key].loader();
      setGameComp(() => mod.default);
    } catch (e) {
      alert("Failed to load game. Please try again!");
      setSelected(null);
    }
    setLoading(false);
  }

  function handleBack() {
    setSelected(null);
    setGameComp(null);
    setLoading(false);
  }

  function handleClose() {
    setSelected(null);
    setGameComp(null);
    setLoading(false);
    if (onClose) onClose();
  }

  if (!open) return null;

  return (
    <div
      className="game-launcher-modal"
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
      aria-label="Other Games"
      style={{zIndex: 401}}
    >
      <div className="game-launcher-box" tabIndex={0}>
        {/* Close button, always visible */}
        <button className="game-launcher-close" onClick={handleClose} aria-label="Close Modal">
          ✕
        </button>
        {/* Game loader/selection view */}
        {!selected && (
          <>
            <div className="game-launcher-title">
              <span role="img" aria-label="games" style={{fontSize: "1.5em"}}>🎲</span> Other Games
            </div>
            <div className="game-launcher-menu">
              {Object.keys(GAME_MODULES).map((key) =>
                <button
                  key={key}
                  className="game-launcher-gamebtn"
                  onClick={() => handleSelectGame(key)}
                  tabIndex={0}
                  aria-label={`Launch ${GAME_MODULES[key].label}`}
                  style={{
                    boxShadow: "0 0 21px 0 var(--accent, #F59E0B)",
                    fontWeight: 700
                  }}
                >
                  <span style={{fontSize:"1.7em",marginRight:7}}>{GAME_MODULES[key].emoji}</span>
                  {GAME_MODULES[key].label}
                </button>
              )}
            </div>
          </>
        )}
        {selected && (
          <div className="game-launcher-gamearea">
            <button
              className="game-launcher-backbtn"
              onClick={handleBack}
              aria-label="Back to game selection"
              style={{marginBottom: 9, marginLeft: 2}}
            >
              ← Other Games
            </button>
            {loading && (
              <div className="game-launcher-loader">
                <span role="img" aria-label="loading">⏳</span>
                Launching {GAME_MODULES[selected].label}...
              </div>
            )}
            {GameComp && !loading && (
              <Suspense fallback={
                <div className="game-launcher-loader">
                  <span role="img" aria-label="loading">⏳</span> Loading...
                </div>
              }>
                <GameComp onExit={handleBack} />
              </Suspense>
            )}
          </div>
        )}
        <button className="game-launcher-back2chess" onClick={handleClose} style={{marginTop: 22}}>
          ← Back to Chess
        </button>
      </div>
    </div>
  );
}
