import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import "./checkmates.css";
import ThemeToggle from "./ThemeToggle";
import SocialFeed from "./SocialFeed";
import ChessArena from "./ChessArena";
import ChessTutorLoader from "./ChessTutorLoader";
import { getInitialTheme, applyTheme } from "./theme";

const TABS = [
  { key: "feed", label: "Social Feed" }
];

/**
 * PUBLIC_INTERFACE
 * ChessSocialHub App: main container. Contains logic for activeTab and rendering SocialFeed and ChessArena.
 */
function App() {
  // Main tab state: 'feed' or 'chess'
  const [tab, setTab] = useState("feed");

  useEffect(() => {
    applyTheme(getInitialTheme());
  }, []);

  // Remove unused helpers; instead, define the handler for ChessInvite:
  const handleArenaTab = useCallback(() => setTab("chess"), []);

  return (
    <div className="app">
      <nav className="checkmates-navbar">
        <div className="checkmates-logo" tabIndex={0}>
          <span style={{ fontSize: "1.42em" }} role="img" aria-label="chess">
            ♟️
          </span>
          CheckMates
        </div>
        {/* Tabs UI is hidden, but Social Feed can trigger Chess Arena */}
        <div className="checkmates-tabs" role="tablist" style={{ display: "none" }}>
          <button
            key="feed"
            className={tab === "feed" ? "checkmates-tab active" : "checkmates-tab"}
            onClick={() => setTab("feed")}
            role="tab"
            aria-selected={tab === "feed"}
            tabIndex={0}
            style={{
              fontWeight: 700,
              fontSize: "1.07rem"
            }}
          >
            Social Feed
          </button>
          <button
            key="chess"
            className={tab === "chess" ? "checkmates-tab active" : "checkmates-tab"}
            onClick={() => setTab("chess")}
            role="tab"
            aria-selected={tab === "chess"}
            tabIndex={0}
            style={{
              fontWeight: 700,
              fontSize: "1.07rem"
            }}
          >
            Chess Arena
          </button>
        </div>
        <span className="theme-toggle">
          <ThemeToggle />
        </span>
      </nav>
      <main>
        <div className="checkmates-container">
          {/* Conditional rendering: show feed or Chess Arena */}
          {tab === "feed" && (
            <SocialFeed
              setActiveTab={setTab}
              onArenaPortal={handleArenaTab}
            />
          )}
          {tab === "chess" && (
            <ChessArena />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;