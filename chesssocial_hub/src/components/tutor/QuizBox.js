import React from "react";

// PUBLIC_INTERFACE
/**
 * QuizBox
 * Presents interactive chess quiz, question, or puzzle (multiple-choice, FEN-based, etc.).
 * Accepts question, options, onSelect, answer, etc. as props (to be implemented).
 */
export default function QuizBox(props) {
  return (
    <div>
      {/* QuizBox: Displays quiz question/options for tutor lessons */}
      <h4>Quiz Question</h4>
      <div>
        {/* TODO: Render quiz prompt/options via props */}
        Quiz content will appear here.
      </div>
    </div>
  );
}
