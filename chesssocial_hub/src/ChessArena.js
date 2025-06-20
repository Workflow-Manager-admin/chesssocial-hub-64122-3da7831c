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
  // Persist Chess object across renders to avoid recreation
  const chessRef = useRef(null);
  if (!chessRef.current) chessRef.current = new Chess();

  const [fen, setFen] = useState("start");
  const [moves, setMoves] = useState([]);
  const [side, setSide] = useState("white");
  const [botIdx, setBotIdx] = useState(0);
  const [engine, setEngine] = useState(null);
  const [isBotThinking, setBotThinking] = useState(false);
  const [arenaWelcome, setArenaWelcome] = useState(false);

  // Highlighting logic additions
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [moveError, setMoveError] = useState("");

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

  // Bot-mode detection helper: play vs bot if BOTS[botIdx] exists, i.e., always true in this mode.
  const isBotGame = true; // Human vs Bot only for now.
  // vsBot: Used for AI block gating -- toggle to false to simulate vs human or multiplayer mode
  const [vsBot] = useState(true);

  // After every legal human move in bot mode, schedule AI response with 500ms delay.
  useEffect(() => {
    // No longer triggers bot move directly here, it's handled in handleMove/setTimeout.
    // This effect can be used for sync or future UI updates (if needed).
  }, [engine, fen, botIdx, side]);

  // Return true if the current chess instance is game over, supporting both game_over and gameOver for compatibility.
  function isGameOverWrapper(chessInstance) {
    if (chessInstance && typeof chessInstance.game_over === "function") {
      return chessInstance.game_over();
    }
    if (chessInstance && typeof chessInstance.gameOver === "function") {
      return chessInstance.gameOver();
    }
    // Fallback: try to check manually (checkmate, draw, stalemate, etc.)
    try {
      if (
        chessInstance.in_checkmate?.() ||
        chessInstance.in_stalemate?.() ||
        chessInstance.in_draw?.() ||
        chessInstance.insufficient_material?.() ||
        chessInstance.in_threefold_repetition?.()
      ) {
        return true;
      }
    } catch {}
    return false;
  }

  function resetGame() {
    chessRef.current = new Chess();
    setFen("start");
    setMoves([]);
    setSelectedSquare(null);
    setLegalMoves([]);
    setMoveError("");
    setTimeout(() => {
      // When restarting, handle bot's first move if needed (bots starting as black, etc.)
      if (
        (side === "black" && !isGameOverWrapper(chessRef.current)) ||
        (side === "white" && botIdx === 3)
      ) {
        thinkAndMove(chessRef.current);
      }
    }, 180);
  }

  // PUBLIC_INTERFACE
  /**
   * Validates and executes a chess move, ensuring the move appears in the list of strictly legal moves
   * using chess.js's move validation; if not legal, does not update board state and displays a message.
   * 
   * On a legal (player) move in bot mode: logs 'Player move registered' and lets the bot respond after a delay via effect.
   * Always calls setFen after every move.
   * Refactored so chess = chessRef.current, and vsBot/isBotGame logic now gates AI.
   */
  function handleMove({ sourceSquare, targetSquare }) {
    setMoveError("");
    setSelectedSquare(null);
    setLegalMoves([]);

    // Logging: Entry for move attempt
    // N.B. This logs even for illegal move attempts.
    // Only logs detailed steps if move proceeds below.
    const chess = chessRef.current;
    if (!chess || typeof chess.move !== "function") {
      console.log("[SKIP] No chess instance or move method is unavailable.");
      return;
    }
    if (isGameOverWrapper(chess)) {
      console.log("[SKIP] Move rejected: Game is over.");
      return;
    }
    if (isBotThinking) {
      console.log("[SKIP] Move ignored: Bot is currently thinking.");
      return;
    }

    // Collect strictly legal moves as verbose objects from sourceSquare
    const legalMovesVerbose = chess.moves({ square: sourceSquare, verbose: true });

    // Find if the desired move is strictly legal
    const legalMoveObj = legalMovesVerbose.find((mv) => mv.to === targetSquare);

    if (!legalMoveObj) {
      setMoveError("Illegal move! Only highlighted moves are allowed.");
      console.log("[SKIP] Attempted move was not legal from selection:", { from: sourceSquare, to: targetSquare });
      return null;
    }

    // Proceed with the legal move (promotion info included if needed)
    const move = chess.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: legalMoveObj.promotion || "q"
    });

    if (move) {
      setFen(chess.fen());
      setMoves((ms) => [...ms, move.san]);
      setMoveError("");
      // Key change: Both isBotGame and vsBot must be true for AI to move
      if (isBotGame && vsBot) {
        // DETAILED DIAGNOSTIC LOGGING:
        console.log(
          "[DEBUG] After player move (handleMove):",
          {
            isBotGame,
            vsBot,
            chessRef_current: chessRef.current,
            fen: chess.fen(),
            side,
            botIdx,
            isBotThinking,
            legalMoves: (() => {
              try {
                return chess.moves({ verbose: true });
              } catch {
                return [];
              }
            })(),
          }
        );
        // Explicit logging for player move, with clear message & layout
        console.log("Player move registered", move.san);

        // Additional guards for FEN, move stacks, turn, and remember async nature:
        console.log("[DEBUG] Next turn belongs to:", chess.turn(), "Intended bot side:", (side === "white" ? "black" : "white"));

        // Confirm AI block reachability and diagnostics on gating
        if (
          !isBotThinking &&
          (
            (chess.turn() === "b" && side === "white") ||
            (chess.turn() === "w" && side === "black")
          )
        ) {
          console.log("[AI BLOCK] Conditions met. Entering AI logic with state:", {
            botThinking: isBotThinking,
            chessTurn: chess.turn(),
            expectedAISide: (side === "white" ? "black" : "white"),
            side,
            fen: chess.fen(),
            legalMoves: chess.moves && typeof chess.moves === "function" ? chess.moves({ verbose: true }) : []
          });
          // SETTIMEOUT LOG
          console.log("[AI BLOCK] setTimeout scheduled for thinkAndMove (500ms)");

          setBotThinking(true);

          setTimeout(() => {
            console.log("[AI BLOCK] setTimeout fired: Executing thinkAndMove now");
            thinkAndMove();
          }, 500);
        } else {
          // Log skipped scenarios with reasons
          if (isBotThinking) {
            console.log("[AI SKIP] Did not trigger: Bot was already thinking.", {
              isBotThinking,
            });
          } else if (
            (chess.turn() === "b" && side !== "white") ||
            (chess.turn() === "w" && side !== "black")
          ) {
            console.log("[AI SKIP] AI block skipped: Not appropriate side/turn;", {
              chessTurn: chess.turn(),
              side,
              fen: chess.fen(),
              legalMoves: chess.moves && typeof chess.moves === "function" ? chess.moves({ verbose: true }) : [],
            });
          }
        }
      }
    } else {
      setMoveError("Unexpected invalid move. Try again.");
      console.log("[ERROR] Move object falsy after chess.move(). Should be impossible if legalMoveObj is valid.");
    }
    return move;
  }

  /**
   * Handles click-to-move logic on the chessboard.
   * Only allows moves that are strictly legal according to chess.js.
   * If an illegal attempt is made, does not update state and presents a descriptive error message.
   */
  function handleSquareClick(square) {
    setMoveError(""); // Reset on new click
    const chess = chessRef.current;
    if (isBotThinking || isGameOverWrapper(chess)) return;

    if (selectedSquare === square) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    if (selectedSquare && selectedSquare !== square) {
      // Valid selection: Check if target is a legal move from selectedSquare
      const legalMovesVerbose = chess.moves({
        square: selectedSquare,
        verbose: true,
      });
      const matchingMove = legalMovesVerbose.find((mv) => mv.to === square);
      if (matchingMove) {
        // Attempt move through validated path
        const wasMove = handleMove({
          sourceSquare: selectedSquare,
          targetSquare: square,
        });
        if (!wasMove) {
          setMoveError("Illegal move! Only highlighted moves are allowed.");
        }
        setSelectedSquare(null);
        setLegalMoves([]);
      } else {
        // Not a legal move to this square, see if clicked square can become new selection
        const newLegalVerbose = chess.moves({ square, verbose: true });
        if (
          newLegalVerbose.length > 0 &&
          chess.get(square) &&
          chess.get(square).color === chess.turn()
        ) {
          setSelectedSquare(square);
          setLegalMoves(newLegalVerbose.map((m) => m.to));
        } else {
          setSelectedSquare(null);
          setLegalMoves([]);
          setMoveError(""); // Don't show error for clicking non-movable squares
        }
      }
      return;
    }

    // Clicking a piece (not while already selected)
    const possibleMovesVerbose = chess.moves({ square, verbose: true });
    if (
      possibleMovesVerbose.length > 0 &&
      chess.get(square) &&
      chess.get(square).color === chess.turn()
    ) {
      setSelectedSquare(square);
      setLegalMoves(possibleMovesVerbose.map((m) => m.to));
      setMoveError("");
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
      setMoveError("");
    }
  }

  // Send position to Stockfish, receive best move, play as bot (with logging and forced fen update)
  function thinkAndMove(overrideGame) {
    setBotThinking(true);
    const game = overrideGame || chessRef.current;
    if (!engine || typeof engine.postMessage !== "function" || !game || typeof game.fen !== "function") {
      console.log("[SKIP] thinkAndMove aborted: Engine not ready or game/fen invalid.");
      setBotThinking(false);
      return;
    }
    console.log("AI thinking...");
    try {
      engine.postMessage("ucinewgame");
      engine.postMessage(`position fen ${game.fen()}`);
      engine.postMessage(`setoption name Skill Level value ${BOTS[botIdx].skill}`);
      engine.postMessage(`go depth ${Math.max(5, BOTS[botIdx].level + 1)}`);
    } catch (err) {
      console.log("[ERROR] Failed to send commands to Stockfish engine:", err);
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
          } catch (_e) {
            console.log("[ERROR] Exception during AI move application:", _e);
          }
          // Log the choice in required style
          if (moveObj && moveObj.san) {
            console.log("AI chose move: " + moveObj.san);
          } else {
            console.log("AI chose move: " + String(move));
          }
          setFen(game.fen());
          setMoves((ms) => [...ms, moveObj && moveObj.san ? moveObj.san : move]);
        } else {
          console.log("[ERROR] AI returned bestmove line but missing move portion:", line);
        }
        setBotThinking(false);
        try {
          engine.removeEventListener("message", handler);
        } catch (_) { /* Defensive: ignore if not possible */ }
      }
    };
    try {
      engine.addEventListener("message", handler);
    } catch (e) {
      console.log("[ERROR] Could not add Stockfish message handler:", e);
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
    // Highlighting logic: show all legal moves for the selected piece using squareStyles
    const highlightStyles = {};
    const chess = chessRef.current;

    if (selectedSquare) {
      // Get all legal moves from the current position for the selected square
      let legalMovesVerbose = chess && typeof chess.moves === "function"
        ? chess.moves({ square: selectedSquare, verbose: true })
        : [];
      const destSquares = legalMovesVerbose.map((m) => m.to);

      if (destSquares.length > 0) {
        // Highlight the selected square with a prominent green glow
        highlightStyles[selectedSquare] = {
          background:
            "radial-gradient(circle, var(--highlight) 56%, rgba(16,185,129,0.13) 97%)",
        };
        // Highlight legal destination squares with a strong amber glow
        for (let sq of destSquares) {
          highlightStyles[sq] = {
            background:
              "radial-gradient(circle, var(--accent) 68%, rgba(245,158,11,0.23) 100%)",
            boxShadow: "0 0 13px 3.5px var(--accent)",
            border: "2.5px solid var(--accent)",
            zIndex: 1,
          };
        }
      }
    }

    return (
      <>
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
            background: "var(--boardBg)",
          }}
          squareStyles={highlightStyles}
          sparePieces={false}
          onSquareClick={handleSquareClick}
        />
        {moveError && (
          <div
            style={{
              margin: "10px 0 6px 0",
              color: "var(--error)",
              fontWeight: 700,
              fontSize: "1.07em",
              background: "#f9eaea",
              borderRadius: "8px",
              padding: "6px 0",
              textAlign: "center",
            }}
            role="alert"
            aria-live="polite"
          >
            {moveError}
          </div>
        )}
      </>
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
