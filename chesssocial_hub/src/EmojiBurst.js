import React from "react";

// PUBLIC_INTERFACE
export default function EmojiBurst({ emoji, show }) {
  if (!show) return null;
  return (
    <span className="emoji-burst">{emoji}</span>
  );
}
