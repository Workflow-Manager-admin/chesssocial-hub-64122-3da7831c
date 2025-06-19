import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import "./checkmates.css";
import ThemeToggle from "./ThemeToggle";
import SocialFeed from "./SocialFeed";
import ChessArena from "./ChessArena";
import ChessTutorLoader from "./ChessTutorLoader";
import { getInitialTheme, applyTheme } from "./theme";

const TABS = [
  { key: "feed", label: "Social Feed" },
  { key: "arena", label: "Chess Arena" },
  { key: "tutor", label: "Tutor" }
];

// PUBLIC_INTERFACE
function App() {
  const [tab, setTab] = useState(TABS[0].key);
  // Focus-based/sticky nav, persistent theme preference
  useEffect(() => {
    applyTheme(getInitialTheme());
  }, []);
  // Portal tab triggers
  const handlePortalTab = useCallback(() => setTab("arena"), []);
  const [arenaPortalNotified, setArenaPortalNotified] = useState(false);

  // Easter egg: auto-focus arena after clicking portal invite
  function notifyArenaPortal() {
    setArenaPortalNotified(true);
    setTimeout(() => setArenaPortalNotified(false), 2200);
  }

  return (
    <div className="app">
      <nav className="checkmates-navbar">
        <div className="checkmates-logo" tabIndex={0}>
          <span style={{fontSize:"1.42em"}} role="img" aria-label="chess">
            ♟️
          </span>
          CheckMates
        </div>
        <div className="checkmates-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={"checkmates-tab" + (tab === t.key ? " active" : "")}
              onClick={() => setTab(t.key)}
              role="tab"
              aria-selected={tab === t.key}
              tabIndex={0}
              style={{
                fontWeight: tab === t.key ? 700 : 500,
                fontSize: "1.07rem"
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <span className="theme-toggle">
          <ThemeToggle />
        </span>
      </nav>
      <main>
        <div className="checkmates-container">
          {/* Tab content */}
          {tab === "feed" && (
            <SocialFeed onArenaPortal={handlePortalTab} notifyArenaPortal={notifyArenaPortal} />
          )}
          {tab === "arena" && (
            <ChessArena key={arenaPortalNotified ? "arena-notified" : "arena"} />
          )}
          {tab === "tutor" && (
            <ChessTutorLoader />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;