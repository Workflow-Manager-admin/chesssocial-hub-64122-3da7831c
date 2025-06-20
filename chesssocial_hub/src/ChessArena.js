import React, { useState, useEffect, useRef } from "react";

/**
 * Minimal chess.js - assume loaded via npm or CDN
 * Updated to use named import since chess.js no longer exports default.
 */
import { Chess } from "chess.js";
// PUBLIC_INTERFACE
import Chessboard from "chessboardjsx";

const BOTS = [
  {
    name: "Pawny", desc: "Shy (ELO 200)", skill: 1,
    bio: "Makes noodle-like blunders, great to boost your spirits.",
    level: 0
  },
  {
    name: "Sir Blunderlot", desc: "Clumsy (ELO 800)", skill: 4,
    bio: "Will miss forks and accidentally hang pieces. Go for wild sacrifices!",
    level: 3
  },
  {
    name: "Knightmare", desc: "Ruthless (ELO 2000)", skill: 13,
    bio: "Sees 7 moves ahead; does not take prisoners.",
    level: 8
  },
  {
    name: "Mittens", desc: "Terrifyingly calm (∞)", skill: 20,
    bio: "Every move exudes existential dread. Fear the Mittens.",
    level: 20
  },
  {
    name: "Centaur", desc: "Balanced (ELO 1400)", skill: 6,
    bio: "Mix of clever and random. Your testing ground.",
    level: 5
  }
];

// Return Stockfish via window.Stockfish (CDN loaded)
function loadStockfish() {
  // Try to re-use an existing instance if possible
  if (window._stockfishEngine) return window._stockfishEngine;
  // eslint-disable-next-line
  const eng = window.Stockfish
    ? window.Stockfish()
    : null;
  window._stockfishEngine = eng;
  return eng;
}

function BotPersona({ bot }) {
  return (
    <div>
      <span style={{ fontWeight: "500", fontSize: "1.06rem" }}>{bot.name}</span>
      <span className="stockfish-level">— {bot.desc}</span>
      <div className="chess-arena-bot-persona">{bot.bio}</div>
    </div>
  );
}

// PUBLIC_INTERFACE
export default function ChessArena() {
  const [chess, setChess] = useState(() => new Chess());
  const [fen, setFen] = useState("start");
  const [moves, setMoves] = useState([]);
  const [side, setSide] = useState("white");
  const [botIdx, setBotIdx] = useState(0);
  const [engine, setEngine] = useState(null);
  const [isBotThinking, setBotThinking] = useState(false);
  const [arenaWelcome, setArenaWelcome] = useState(false);

  // Load Stockfish.js dynamically via CDN on first mount
  useEffect(() => {
    let isMounted = true;
    function onStockfishLoaded() {
      if (isMounted) setEngine(loadStockfish());
    }
    // Only add script if not present
    if (!window.Stockfish) {
      const tag = document.createElement("script");
      tag.src = "https://cdn.jsdelivr.net/npm/stockfish/stockfish.min.js";
      tag.async = true;
      tag.onload = onStockfishLoaded;
      document.head.appendChild(tag);
    } else {
      onStockfishLoaded();
    }
    setArenaWelcome(true);
    return () => {
      isMounted = false;
      try {
        if (window._stockfishEngine && typeof window._stockfishEngine.postMessage === "function")
          window._stockfishEngine.postMessage("quit");
      } catch (e) {
        // Stockfish may already be cleaned up
      }
    };
    // eslint-disable-next-line
  }, []);

  // Reset game state whenever side/bot changes
  useEffect(() => {
    resetGame();
    // eslint-disable-next-line
  }, [botIdx, side]);

  // Bot moves after player
  useEffect(() => {
    if (!engine || chess.game_over()) return;
    if (
      (chess.turn() === "b" && side === "white") ||
      (chess.turn() === "w" && side === "black")
    ) {
      thinkAndMove();
    }
    // eslint-disable-next-line
  }, [engine, fen, botIdx, side]);

  function resetGame() {
    const game = new Chess();
    setChess(game);
    setFen("start");
    setMoves([]);
    setTimeout(() => {
      if (
        (side === "black" && !game.game_over()) ||
        (side === "white" && botIdx === 3) // Mittens starts as black
      ) {
        thinkAndMove(game);
      }
    }, 180);
  }

  function handleMove({ sourceSquare, targetSquare }) {
    if (!chess || typeof chess.move !== 'function') return;
    if (chess.game_over() || isBotThinking) return;
    const move = chess.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q"
    });
    if (move) {
      setFen(chess.fen());
      setMoves((ms) => [...ms, move.san]);
    }
    // Bot will respond in effect above
    return move;
  }

  // Send position to Stockfish, receive best move, play as bot
  function thinkAndMove(overrideGame) {
    setBotThinking(true);
    const game = overrideGame || chess;
    if (!engine || typeof engine.postMessage !== "function" || !game || typeof game.fen !== "function") {
      setBotThinking(false);
      return;
    }
    try {
      engine.postMessage("ucinewgame");
      engine.postMessage(`position fen ${game.fen()}`);
      engine.postMessage(`setoption name Skill Level value ${BOTS[botIdx].skill}`);
      engine.postMessage(`go depth ${Math.max(5, BOTS[botIdx].level + 1)}`);
    } catch (err) {
      setBotThinking(false);
      return;
    }
    const handler = (e) => {
      let line = "";
      try {
        line = typeof e === "string" ? e : (e && e.data) ? e.data : "";
      } catch (_) {}
      if (typeof line !== "string") return;
      if (line.startsWith("bestmove")) {
        const move = line.split(" ")[1];
        if (move) {
          let moveObj = null;
          try {
            moveObj = game.move({
              from: move.slice(0, 2),
              to: move.slice(2, 4),
              promotion: "q"
            });
          } catch (_) {}
          setFen(game.fen());
          setMoves((ms) => [...ms, moveObj && moveObj.san ? moveObj.san : move]);
        }
        setBotThinking(false);
        try {
          engine.removeEventListener("message", handler);
        } catch (_) { /* Defensive: ignore if not possible */ }
      }
    };
    try {
      engine.addEventListener("message", handler);
    } catch (_) {
      setBotThinking(false);
    }
  }

  function handleBotSelect(idx) {
    setBotIdx(idx);
    resetGame();
  }

  function handleRestart() {
    resetGame();
  }

  function renderBoard() {
    return (
      <Chessboard
        key={side}
        id="checkmates-board"
        position={fen}
        onDrop={handleMove}
        orientation={side}
        width={358}
        boardStyle={{
          borderRadius: 12,
          boxShadow: "0 7px 40px -18px var(--dropGlow), 0 0 0 1.7px var(--primary)",
          background: "var(--boardBg)"
        }}
        squareStyles={{}}
        sparePieces={false}
      />
    );
  }

  return (
    <div className="chess-arena-main">
      <div className="chess-arena-boardcol">
        {arenaWelcome && (
          <div
            className="chess-arena-welcome"
            style={{
              color: "var(--primary)",
              fontWeight: 700,
              fontSize: "1.33rem",
              marginBottom: 16
            }}
          >
            Welcome to the Arena. Pick your opponent.
          </div>
        )}
        {renderBoard()}
        <div className="chess-arena-controls">
          <button
            className="chess-arena-btn"
            onClick={handleRestart}
            disabled={isBotThinking}
          >
            Restart
          </button>
          <button
            className="chess-arena-btn"
            onClick={() => setSide(side === "white" ? "black" : "white")}
            disabled={isBotThinking}
          >
            Play as {side === "white" ? "Black" : "White"}
          </button>
        </div>
        <div className="chess-arena-movelog">
          {moves.length === 0
            ? <span style={{ opacity: 0.48 }}>Move log appears here...</span>
            : moves.map((m, i) => (
              <span key={i} style={{ marginRight: 7 }}>
                {i % 2 ? "" : `${Math.floor(i / 2) + 1}. `}
                {m}
              </span>
            ))}
        </div>
      </div>
      <div className="chess-arena-sidebar">
        <div
          style={{
            fontWeight: 700,
            fontSize: "1.15rem",
            marginBottom: 3,
            color: "var(--accent)"
          }}
        >
          Stockfish Bots
        </div>
        <div className="chess-arena-botlist">
          {BOTS.map((bot, i) => (
            <button
              key={bot.name}
              className={
                "chess-arena-bot-btn" + (i === botIdx ? " selected" : "")
              }
              onClick={() => handleBotSelect(i)}
              tabIndex={0}
              style={{
                filter: i === botIdx ? "drop-shadow(0 0 8px var(--highlight)) saturate(1.16)" : undefined
              }}
            >
              {bot.name}
            </button>
          ))}
        </div>
        <BotPersona bot={BOTS[botIdx]} />
        <div className="chess-arena-sidebio">
          Tip: Bots vary in skill and style. Mittens is not recommended for the faint of heart!<br />
          <span style={{ color: "var(--error)", fontWeight: "bold" }}>
            All games are local — try beating your record!
          </span>
        </div>
      </div>
    </div>
  );
}
