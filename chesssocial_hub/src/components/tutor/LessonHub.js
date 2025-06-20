import React, { useEffect, useState } from "react";
import LESSONS from "./lessonData";
import LessonPopup from "./LessonPopup";
import "./LessonPopup.css";

// PUBLIC_INTERFACE
/**
 * LessonHub
 * The main hub for navigating lesson categories, recommended lessons, or tutor progress.
 * Integrates and routes to LessonModule components.
 * Shows a responsive grid of lesson cards, animating a modal popup for each lesson with trackable completion state.
 */
export default function LessonHub(props) {
  const [selected, setSelected] = useState(null);
  const [completed, setCompleted] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("checkmates-tutor-complete-v2")) || {};
    } catch {
      return {};
    }
  });

  // Persist completed lessons
  useEffect(() => {
    localStorage.setItem("checkmates-tutor-complete-v2", JSON.stringify(completed));
  }, [completed]);

  function handleSelect(idx) { setSelected(idx); }
  function handleClose() { setSelected(null); }
  function handleMarkComplete(lessonKey) {
    setCompleted(c => ({ ...c, [lessonKey]: true }));
  }

  return (
    <div style={{
      width: "100%",
      maxWidth: 950,
      margin: "0 auto",
      padding: "12px 0",
      textAlign: "center"
    }}>
      <div style={{
        fontWeight: 800,
        fontSize: "2.17rem",
        color: "var(--primary)",
        textShadow: "0 2px 18px var(--dropGlow)",
        margin: "2px 0 2px 0"
      }}>
        Chess Tutor
      </div>
      <div style={{
        color: "var(--text-secondary)",
        fontWeight: 500,
        fontSize: "1.06rem",
        marginBottom: 17
      }}>
        Click a lesson to begin. Track your progress as you complete lessons!
      </div>
      <div className="lessons-grid">
        {LESSONS.map((lesson, idx) => (
          <div
            key={lesson.key}
            className={"lesson-card" + (completed[lesson.key] ? " check-done" : "")}
            style={{
              borderColor: lesson.themeColor,
              boxShadow: `0 0 20px -6px ${lesson.themeColor}66, 0 1.5px 5px -1.4px #F59E0B99`
            }}
            tabIndex={0}
            aria-label={lesson.title + (completed[lesson.key] ? ", completed" : "")}
            onClick={() => handleSelect(idx)}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === " ") handleSelect(idx);
            }}
          >
            <div
              style={{
                fontSize: "2.4rem",
                marginBottom: 2,
                filter: `drop-shadow(0 2.5px 9px ${lesson.themeColor || "#4F46E5"}88)`
              }}
              aria-hidden="true"
            >
              {/* lesson key to emoji */}
              {lesson.key === "openings" && <span role="img" aria-label="openings">📖</span>}
              {lesson.key === "tactics" && <span role="img" aria-label="tactics">⚡</span>}
              {lesson.key === "checkmate" && <span role="img" aria-label="checkmate">🏁</span>}
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: "1.22rem",
                color: lesson.themeColor
              }}
            >
              {lesson.title}
            </div>
            <div
              style={{
                color: "var(--accent)",
                fontWeight: 500,
                fontSize: "1.01rem",
                opacity: .91,
                margin: "7px 0 0 0",
                textAlign: "center"
              }}
            >
              {lesson.description}
            </div>
            {/* Complete check shown via CSS */}
          </div>
        ))}
      </div>
      {selected !== null && (
        <LessonPopup
          open={selected !== null}
          lesson={LESSONS[selected]}
          onClose={handleClose}
          completed={!!completed[LESSONS[selected].key]}
          onMarkComplete={(k) => {
            handleMarkComplete(k);
            setTimeout(() => handleClose(), 750);
          }}
        />
      )}
      <div style={{
        marginTop: 34,
        color: "var(--text-secondary)",
        fontWeight: 500,
        fontSize: "1.06rem"
      }}>
        <span role="img" aria-label="book">📚</span> More chess lessons coming soon.
      </div>
    </div>
  );
}
