import React from "react";
import "./gameLauncher.css";

// PUBLIC_INTERFACE
/**
 * Game launcher panel with quick links to other fun games, grouped by game type.
 * Organized for accessibility and readability, with Apple-style minimal visual design.
 */
function OtherGames() {
  // Define the grouped game data declaratively for maintainability
  const groupedGames = [
    {
      group: "Board Games",
      games: [
        { name: "Chess" },
        { name: "Ludo" },
        { name: "Checkers" },
        { name: "Go" },
        { name: "Backgammon" },
        { name: "Snake & Ladder" }
      ],
    },
    {
      group: "Card Games",
      games: [
        { name: "Solitaire" },
        { name: "Hearts" },
        { name: "Blackjack" },
        { name: "Uno" },
        { name: "Memory Match" }
      ]
    },
    {
      group: "Puzzle Games",
      games: [
        { name: "Sudoku" },
        { name: "Wordle" },
        { name: "2048" },
        { name: "Nonograms" },
        { name: "Crossword" }
      ]
    },
    {
      group: "Casual & Party",
      games: [
        { name: "Tic Tac Toe" },
        { name: "Dots & Boxes" },
        { name: "Simon Says" },
        { name: "Rock Paper Scissors" },
        { name: "Doodle Jump" }
      ]
    }
  ];
  return (
    <div className="other-games-panel" aria-label="Other Games">
      {groupedGames.map((section, idx) => (
        <section key={section.group} className="other-games-group" aria-labelledby={`group-header-${idx}`}>
          <h2
            id={`group-header-${idx}`}
            className="games-group-header"
            tabIndex={0}
            aria-level={2}
          >
            {section.group}
          </h2>
          <div className="games-list">
            {section.games.map((g) => (
              <div
                key={g.name}
                className="game-item"
                tabIndex={0}
                role="button"
                aria-label={g.name}
              >
                {g.name}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default OtherGames;
