import React, { useState, useEffect } from "react";

// PUBLIC_INTERFACE
export default function ChessTutorLoader() {
  const [dots, setDots] = useState(".");
  useEffect(() => {
    let running = true;
    function animate() {
      setDots((d) => (d === "..." ? "." : d + "."));
      if (running) setTimeout(animate, 510);
    }
    animate();
    return () => { running = false; };
  }, []);
  return (
    <div className="tutor-mode-loader">
      <span role="img" aria-label="brain" style={{ fontSize: "2rem" }}>
        🧠
      </span>{" "}
      Loading Neural Chess Tutor
      <span className="tutor-dot-dance">
        <span className="dot">{dots.length > 0 ? "." : ""}</span>
        <span className="dot">{dots.length > 1 ? "." : ""}</span>
        <span className="dot">{dots.length > 2 ? "." : ""}</span>
      </span>
    </div>
  );
}
