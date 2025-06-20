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

// PUBLIC_INTERFACE
function App() {
  // Only one tab now: 'feed'
  const [tab, setTab] = useState(TABS[0].key);

  useEffect(() => {
    applyTheme(getInitialTheme());
  }, []);

  // These are now unused but kept just in case SocialFeed calls onArenaPortal/notifyArenaPortal in future
  // They will only set the existing tab (which is 'feed'), so do nothing disruptive
  const handlePortalTab = useCallback(() => {}, []);
  const notifyArenaPortal = () => {};

  return (
    <div className="app">
      <nav className="checkmates-navbar">
        <div className="checkmates-logo" tabIndex={0}>
          <span style={{ fontSize: "1.42em" }} role="img" aria-label="chess">
            ♟️
          </span>
          CheckMates
        </div>
        <div className="checkmates-tabs" role="tablist">
          <button
            key={"feed"}
            className={"checkmates-tab active"}
            onClick={() => setTab("feed")}
            role="tab"
            aria-selected={true}
            tabIndex={0}
            style={{
              fontWeight: 700,
              fontSize: "1.07rem"
            }}
          >
            Social Feed
          </button>
        </div>
        <span className="theme-toggle">
          <ThemeToggle />
        </span>
      </nav>
      <main>
        <div className="checkmates-container">
          {/* Only Social Feed tab remains */}
          <SocialFeed
            onArenaPortal={handlePortalTab}
            notifyArenaPortal={notifyArenaPortal}
          />
        </div>
      </main>
    </div>
  );
}

export default App;