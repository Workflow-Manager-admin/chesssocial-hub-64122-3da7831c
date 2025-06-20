import React from "react";
import ChessTutorLoader from "./ChessTutorLoader";

// PUBLIC_INTERFACE
/**
 * ChessTutorMode is a simple proxy to the loader & minimal Tutor UI.
 * For future expansion, this wrapper can host routing, etc.
 */
export default function ChessTutorMode() {
  return (
    <div style={{ width: "100%", minHeight: 360, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <ChessTutorLoader />
    </div>
  );
}
