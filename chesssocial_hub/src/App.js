import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import SocialFeed from "./SocialFeed";
import ChessArena from "./ChessArena";
import ChessTutorLoader from "./ChessTutorLoader";

// PUBLIC_INTERFACE
/**
 * Returns the visible tabs for the app.
 */
function getTabs() {
  return [
    { key: "feed", label: "Social Feed" },
    { key: "chess", label: "Chess Arena" },
    { key: "tutor", label: "Chess Tutor" },
  ];
}

/**
 * PUBLIC_INTERFACE
 * ChessSocialHub App: main container. Logic for tab switching and rendering all modes (Feed, Arena, Tutor).
 */
function App() {
  // tab can be: 'feed', 'chess', 'tutor'
  const [tab, setTab] = useState("feed");

  // Handler to switch directly to arena from SocialFeed/portal post
  const handleArenaTab = useCallback(() => setTab("chess"), []);
  
  // Handler for switching to Tutor mode from future features (unused but ready)
  const handleTutorTab = useCallback(() => setTab("tutor"), []);

  const TABS = getTabs();

  return (
    <div className="app">
      <nav className="checkmates-navbar">
        <div className="checkmates-logo" tabIndex={0}>
          <span style={{ fontSize: "1.42em" }} role="img" aria-label="chess">♟️</span>
          CheckMates
        </div>
        {/* TABS (visible, modern tab navigation) */}
        <div className="checkmates-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={tab === t.key ? "checkmates-tab active" : "checkmates-tab"}
              onClick={() => setTab(t.key)}
              role="tab"
              aria-selected={tab === t.key}
              tabIndex={0}
              style={{
                fontWeight: 700,
                fontSize: "1.07rem"
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>
      <main>
        <div className="checkmates-container apple-glass apple-fadein">
          {tab === "feed" && (
            <SocialFeed
              setActiveTab={setTab}
              onArenaPortal={handleArenaTab}
            />
          )}
          {tab === "chess" && (
            <ChessArena />
          )}
          {tab === "tutor" && (
            // Enhanced modal-based Chess Tutor with lesson grid & popup
            <div style={{ display: "flex", minHeight: "50vh", alignItems: "center", justifyContent: "center" }}>
              {/* Dynamic ChessTutorMode */}
              {require("./ChessTutorMode").default()}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
