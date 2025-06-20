import React from "react";
import "../gameLauncher.css";

/**
 * Comprehensive list of popular games for each major type.
 * Each entry: { name, type }
 */
const games = [
  // Board Games
  { name: "Ludo", type: "Board" },
  { name: "Snakes & Ladders", type: "Board" },
  { name: "Monopoly", type: "Board" },
  { name: "Scrabble", type: "Board" },

  // Card Games
  { name: "Hearts", type: "Card" },
  { name: "Solitaire", type: "Card" },
  { name: "Poker", type: "Card" },

  // Strategy Games
  { name: "Chess", type: "Strategy" },
  { name: "Go", type: "Strategy" },
  { name: "Checkers", type: "Strategy" },

  // Word Games
  { name: "Crossword", type: "Word" },
  { name: "Boggle", type: "Word" },
  { name: "Wordle", type: "Word" },

  // Trivia
  { name: "Jeopardy!", type: "Trivia" },
  { name: "Who Wants to Be a Millionaire?", type: "Trivia" },
  { name: "Trivial Pursuit", type: "Trivia" },

  // Arcade
  { name: "Tetris", type: "Arcade" },
  { name: "Pac-Man", type: "Arcade" },
  { name: "Space Invaders", type: "Arcade" },

  // Puzzle
  { name: "Sudoku", type: "Puzzle" },
  { name: "Minesweeper", type: "Puzzle" },
  { name: "Jigsaw", type: "Puzzle" },

  // Logic
  { name: "Nonograms", type: "Logic" },
  { name: "Mastermind", type: "Logic" },
  { name: "Lights Out", type: "Logic" },

  // Education
  { name: "Math Bingo", type: "Education" },
  { name: "Kahoot!", type: "Education" },
  { name: "TypingClub", type: "Education" },

  // Classic
  { name: "Snake", type: "Classic" },
  { name: "Pong", type: "Classic" },
  { name: "Tic-Tac-Toe", type: "Classic" },

  // Casual
  { name: "Candy Crush", type: "Casual" },
  { name: "Angry Birds", type: "Casual" },
  { name: "Doodle Jump", type: "Casual" }
];

// Enforce display order
const GAME_TYPE_ORDER = [
  "Board", "Card", "Strategy", "Word", "Trivia", "Arcade", "Puzzle", "Logic", "Education", "Classic", "Casual"
];

/**
 * Groups games by type, enforces ordering.
 */
const groupByType = (list) => {
  const groups = {};
  list.forEach((g) => {
    if (!groups[g.type]) groups[g.type] = [];
    groups[g.type].push(g.name);
  });
  // Enforce section order
  return GAME_TYPE_ORDER.map(type => ({ 
    type, 
    games: groups[type] || []
  }));
};

/**
 * PUBLIC_INTERFACE
 * OtherGames component - minimalist, theme-responsive panel
 * - Groups by type with headers (h3, aria)
 * - Accessible sectioning
 * - Responsive grid layout
 * - Ensures .game-item class usage and theme color compliance
 */
export default function OtherGames() {
  const grouped = groupByType(games);

  return (
    <section className="other-games-panel" aria-label="Other Games">
      <h2 className="section-title" style={{
        fontWeight: 700,
        fontSize: "1.14rem",
        marginBottom: "1.25rem",
        color: "var(--kavia-dark, #1A1A1A)"
      }}>
        Other Games
      </h2>
      <div className="other-games-grid">
        {grouped.map(({ type, games }) =>
          games.length > 0 && (
            <div key={type} className="game-group" aria-label={`${type} games`}>
              <h3 className="game-type" tabIndex={0} role="heading" aria-level={3}>{type} Games</h3>
              <ul className="game-list">
                {games.map((name) => (
                  <li className="game-item" key={name}>{name}</li>
                ))}
              </ul>
            </div>
          )
        )}
      </div>
    </section>
  );
}
