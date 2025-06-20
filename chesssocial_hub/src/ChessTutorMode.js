import React from "react";
import LessonHub from "./components/tutor/LessonHub";

// PUBLIC_INTERFACE
/**
 * ChessTutorMode displays the enhanced lesson hub (UI grid of interactive lessons as animated popups).
 */
export default function ChessTutorMode() {
  return (
    <div style={{
      width: "100%",
      minHeight: 380,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <LessonHub />
    </div>
  );
}
