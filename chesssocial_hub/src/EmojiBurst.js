import React from "react";

// PUBLIC_INTERFACE
/**
 * EmojiBurst: Pop an emoji when show is true.
 * Defensive to avoid rendering if missing props.
 */
export default function EmojiBurst({ emoji, show }) {
  if (show !== true || !emoji) return null;
  return (
    <span className="emoji-burst">{emoji}</span>
  );
}
