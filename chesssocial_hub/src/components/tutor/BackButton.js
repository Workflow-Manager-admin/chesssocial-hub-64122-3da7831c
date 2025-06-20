import React from "react";

// PUBLIC_INTERFACE
/**
 * BackButton
 * A simple or animated "Back" navigation button to return to previous lesson/module/hub.
 */
export default function BackButton({ onClick }) {
  return (
    <button
      type="button"
      className="tutor-back-btn"
      onClick={onClick}
      aria-label="Go back"
    >
      ← Back
    </button>
  );
}
