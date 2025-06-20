import React, { useEffect, useRef } from "react";
import Chessboard from "chessboardjsx";
import "./LessonPopup.css";

// PUBLIC_INTERFACE
/**
 * LessonPopup
 * Modal popup for displaying interactive chess lessons with animation, neon glow, static chessboard, tips, "complete" tracking.
 * Props:
 * - open: boolean (if modal is shown)
 * - onClose: function to close modal
 * - lesson: lesson object from lessonData
 * - onMarkComplete: function(lessonKey)
 * - completed: boolean (if this lesson is completed)
 */
export default function LessonPopup({
  open,
  onClose,
  lesson,
  onMarkComplete,
  completed = false
}) {
  const modalRef = useRef(null);

  // Trap focus inside modal and close with Escape
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
      // Trap focus inside modal
      if (modalRef.current) {
        if (e.key === "Tab") {
          const focusableEls = modalRef.current.querySelectorAll(
            "button, [tabindex]:not([tabindex='-1']), input, textarea, select, a"
          );
          if (!focusableEls.length) return;
          const first = focusableEls[0];
          const last = focusableEls[focusableEls.length - 1];
          if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault(); first.focus();
          } else if (e.shiftKey && document.activeElement === first) {
            e.preventDefault(); last.focus();
          }
        }
      }
    }
    if (open) {
      window.addEventListener("keydown", handleKey);
      setTimeout(() => {
        if (modalRef.current) modalRef.current.focus();
      }, 10);
    }
    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  // Neon animated shadow based on lesson color
  const neon = lesson.themeColor || "#4F46E5";
  // Responsive width: 420px on desktop, 98vw on small screens
  const styleVars = {
    "--neon": neon,
    "--modalWidth": "min(98vw, 420px)"
  };

  // Adaptive chessboard size
  function getBoardWidth() {
    let w = 330;
    if (window.innerWidth < 540) w = Math.max(198, window.innerWidth * 0.80);
    else if (window.innerWidth < 720) w = 250;
    return w;
  }
  const boardWidth = getBoardWidth();

  // Handle outside click to close the modal
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  // Button press ripple effect for mark complete and close
  function handleButtonRipple(e) {
    const btn = e.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
    circle.className = "ripple";
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.nativeEvent.offsetX - diameter/2}px`;
    circle.style.top = `${e.nativeEvent.offsetY - diameter/2}px`;
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  }

  return (
    <div
      className="lesson-modal-backdrop"
      style={{
        animation: "lessonModalFadeIn 280ms cubic-bezier(.70,.09,.38,1.13)",
        zIndex: 1110
      }}
      tabIndex={-1}
      onClick={handleBackdropClick}
      aria-modal="true"
      aria-label={`Lesson: ${lesson.title}`}
      role="dialog"
    >
      <div
        className="lesson-modal"
        ref={modalRef}
        tabIndex={0}
        style={styleVars}
      >
        {/* Animated modal border glow and shadow */}
        <div
          className="lesson-modal-glow"
          style={{
            borderColor: neon,
            boxShadow: `0 0 35px 5px ${neon}99, 0 7px 38px -8px ${neon}66`
          }}
        />

        {/* Close button */}
        <button
          className="lesson-modal-close"
          onClick={e => {handleButtonRipple(e); onClose();}}
          aria-label="Close lesson popup"
        >
          ✕
        </button>

        {/* Header: lesson title */}
        <div
          className="lesson-modal-title"
          style={{
            color: neon,
            textShadow: `0 2px 8px ${neon}8f`
          }}
        >
          {lesson.title}
          {completed && <span className="lesson-modal-check" title="Completed">✔️</span>}
        </div>
        {/* Description */}
        <div className="lesson-modal-desc">
          {lesson.description}
        </div>

        {/* Static Chessboard */}
        <div className="lesson-modal-board">
          <Chessboard
            position={lesson.fen}
            width={boardWidth}
            draggable={false}
            transitionDuration={300}
            boardStyle={{
              borderRadius: 13,
              boxShadow: `0 4px 40px -17px ${neon}99, 0 0 0 1.2px ${neon}80`,
              outline: `2.2px solid ${neon}bb`,
              background: "#F9FAFB"
            }}
            showNotation={true}
          />
        </div>

        {/* Tip Box */}
        <div className="lesson-modal-tipbox">
          <span className="lesson-modal-tipicon">💡</span> {lesson.tip}
        </div>

        {/* Long Details */}
        <ul className="lesson-modal-details">
          {lesson.details && lesson.details.map((d, i) =>
            <li key={i}>{d}</li>
          )}
        </ul>

        {/* Dummy Quiz Box */}
        <div className="lesson-modal-quizbox">
          <div className="lesson-modal-quizq">
            <span role="img" aria-label="quiz">❓</span> {lesson.quiz?.question}
          </div>
          <div className="lesson-modal-quizopts">
            {lesson.quiz?.options.map((opt, idx) => (
              <button
                key={idx}
                className="lesson-modal-quizopt"
                aria-label={`Option ${idx + 1}`}
                tabIndex={0}
                disabled
              >
                {opt}
              </button>
            ))}
          </div>
          <div className="lesson-modal-quiznote">(Interactive quiz coming soon)</div>
        </div>

        {/* Mark Complete Button */}
        <button
          className={`lesson-modal-done ${completed ? "done" : ""}`}
          onClick={e => {handleButtonRipple(e); onMarkComplete(lesson.key);}}
          tabIndex={0}
          aria-label={completed ? "Lesson already completed" : "Mark lesson as completed"}
          disabled={completed}
        >
          {completed ? "✔ Completed" : "Mark as Complete"}
        </button>
      </div>
    </div>
  );
}
