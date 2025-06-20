//
// Standalone modular Chess AI Bot logic supporting 5 difficulty levels for chess.js
// Exports: getAIMove(chess, difficultyLevel) - returns a move object as returned by chess.move(), does not mutate input
// No dependencies except chess.js (must be loaded by importing { Chess } from 'chess.js')
//
// AI LEVELS:
// 0: randomMove            - Pure random
// 1: easyBotMove           - Prefer captures, else random
// 2: mediumBotMove         - One-ply best material gain
// 3: hardBotMove           - Two-ply "capture-for-free" and avoid losing material
// 4: veryHardBotMove       - Three-ply, greedy plus basic king safety + punishes blunders
//

// PUBLIC_INTERFACE
export function getAIMove(chess, difficultyLevel = 0) {
  /**
   * Return an AI move for the provided chess.js instance and difficulty.
   * Does NOT mutate the input 'chess'; all analysis is on a cloned game.
   * Returns a move object (same structure as chess.move())
   */
  if (!chess || typeof chess.fen !== "function") {
    throw new Error("getAIMove: missing or invalid chess parameter");
  }
  const level = Math.round(+difficultyLevel) || 0;
  const levels = [
    randomMove,
    easyBotMove,
    mediumBotMove,
    hardBotMove,
    veryHardBotMove,
  ];
  const fn =
    level < 0
      ? levels[0]
      : level >= levels.length
      ? levels[levels.length - 1]
      : levels[level];
  console.debug(`[chessBot.js] Choosing AI move: Level ${level} → ${fn.name}`);
  // Defensive: always return a FRESH move object for caller to use
  return fn(chess);
}

/**
 * Generates a random legal move (fully random).
 * Debug logs selection and all available moves.
 */
function randomMove(chess) {
  console.debug("[AI L0][randomMove]: Picking completely random move");
  const c = cloneChess(chess);
  const moves = c.moves({ verbose: true });
  if (!moves.length) {
    console.debug("[AI L0]: No moves available (game over or stalemate)");
    return null;
  }
  const choice = moves[Math.floor(Math.random() * moves.length)];
  console.debug("[AI L0]: Legal moves:", moves.map(m=>m.san).join(", "), "Selected:", choice.san);
  // Return move as {from, to, ...} object
  return { from: choice.from, to: choice.to, promotion: choice.promotion };
}

/**
 * Level 1: Prefer most valuable capture, else random legal move.
 * Returns move object, logs decision.
 */
function easyBotMove(chess) {
  const c = cloneChess(chess);
  const moves = c.moves({ verbose: true });
  if (!moves.length) return null;
  // Find all captures and sort by most valuable victim
  const captureMoves = moves
    .filter((m) => m.captured)
    .sort((a, b) => pieceValue(b.captured) - pieceValue(a.captured));
  if (captureMoves.length) {
    const best = captureMoves[0];
    console.debug("[AI L1][easyBotMove]: Capturing", best.captured, best.san);
    return { from: best.from, to: best.to, promotion: best.promotion };
  }
  // No captures, proceed as random
  console.debug("[AI L1]: No captures, using random move");
  return randomMove(c);
}

/**
 * Level 2: Choose move with best immediate material gain (capture or promotion);
 * falling back to random otherwise.
 */
function mediumBotMove(chess) {
  const c = cloneChess(chess);
  const moves = c.moves({ verbose: true });
  if (!moves.length) return null;
  let bestGain = -Infinity;
  let candidates = [];
  for (const m of moves) {
    const gain = evaluateMaterialGain(c, m);
    if (gain > bestGain) {
      bestGain = gain;
      candidates = [m];
    } else if (gain === bestGain) {
      candidates.push(m);
    }
  }
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  console.debug(
    `[AI L2][mediumBotMove]: Top gain=${bestGain}, Chose move: ${pick.san} (out of ${candidates.length})`
  );
  return { from: pick.from, to: pick.to, promotion: pick.promotion };
}

/**
 * Level 3: Two-ply: for each move, simulate opponent's best reply (material),
 * pick move minimizing material given up while maximizing gain.
 */
function hardBotMove(chess) {
  const c = cloneChess(chess);
  const moves = c.moves({ verbose: true });
  if (!moves.length) return null;
  let bestEval = -Infinity;
  let bestMoves = [];
  for (const m of moves) {
    const temp = cloneChess(c);
    temp.move({ from: m.from, to: m.to, promotion: m.promotion });
    // Simulate opponent's best gain after this move
    const oppMoves = temp.moves({ verbose: true });
    let worstOppGain = 0;
    for (const opp of oppMoves) {
      const g = evaluateMaterialGain(temp, opp);
      if (g > worstOppGain) worstOppGain = g;
    }
    // AI wants to maximize own gain while minimizing giving up material
    const myGain = evaluateMaterialGain(c, m) - worstOppGain * 0.9;
    if (myGain > bestEval) {
      bestEval = myGain;
      bestMoves = [m];
    } else if (myGain === bestEval) {
      bestMoves.push(m);
    }
  }
  const pick = bestMoves[Math.floor(Math.random() * bestMoves.length)];
  console.debug(
    `[AI L3][hardBotMove]: Picked move ${pick.san} (eval=${bestEval}, ${bestMoves.length} contenders)`
  );
  return { from: pick.from, to: pick.to, promotion: pick.promotion };
}

/**
 * Level 4: Three-ply with greedy and basic king "safety" heuristic:
 * Similar to hardBotMove, but simulates a third ply
 * (AI move → opp reply → AI "recapture" if available), and avoids blunders
 * like hanging queen/rook. Slight penalty for putting own king in check.
 */
function veryHardBotMove(chess) {
  const c = cloneChess(chess);
  const moves = c.moves({ verbose: true });
  if (!moves.length) return null;
  let bestEval = -Infinity, bestMoves = [];
  for (const m of moves) {
    const temp = cloneChess(c);
    const move1 = temp.move({ from: m.from, to: m.to, promotion: m.promotion });
    if (!move1) continue;
    // Opponent's best reply
    const oppMoves = temp.moves({ verbose: true });
    let worstOppGain = -Infinity, oppReplies = [];
    for (const opp of oppMoves) {
      const g = evaluateMaterialGain(temp, opp);
      if (g > worstOppGain) {
        worstOppGain = g;
        oppReplies = [opp];
      } else if (g === worstOppGain) {
        oppReplies.push(opp);
      }
    }
    // For most adverse reply (could be multiple due to equal gain)
    for (const opp of oppReplies) {
      const temp2 = cloneChess(temp);
      const move2 = temp2.move({ from: opp.from, to: opp.to, promotion: opp.promotion });
      if (!move2) continue;
      // AI's recapture or next best move (if legal)
      const replyMoves = temp2.moves({ verbose: true }) || [];
      let recaptureGain = 0;
      for (const reply of replyMoves) {
        const g = evaluateMaterialGain(temp2, reply);
        if (g > recaptureGain) recaptureGain = g;
      }
      // Material is my gain minus max they get plus a recapture potential
      let evalScore = 0.5 * evaluateMaterialGain(c, m)
        - 1.0 * worstOppGain
        + 0.4 * recaptureGain;
      // Penalize if move puts own king in check (avoid most basic mate-in-1s)
      if (inCheckAfterMove(c, m)) evalScore -= 1.1;
      // Discourage moves that immediately lose queen/rook for nothing
      if (m.piece && pieceValue(m.piece) >= 5 && worstOppGain >= pieceValue(m.piece))
        evalScore -= 2.3;
      if (evalScore > bestEval) {
        bestEval = evalScore;
        bestMoves = [m];
      } else if (evalScore === bestEval) {
        bestMoves.push(m);
      }
    }
  }
  if (!bestMoves.length) return randomMove(c);
  const pick = bestMoves[Math.floor(Math.random() * bestMoves.length)];
  console.debug(
    `[AI L4][veryHardBotMove]: Picked ${pick.san} (eval=${bestEval}, ${bestMoves.length} candidates)`
  );
  return { from: pick.from, to: pick.to, promotion: pick.promotion };
}

/**
 * Helper: Returns a material value for a single piece type.
 * Q=9, R=5, B=3, N=3, P=1. Ignore king (0).
 */
function pieceValue(pieceType) {
  if (!pieceType) return 0;
  const code = pieceType.toLowerCase();
  switch (code) {
    case "q": return 9;
    case "r": return 5;
    case "b": case "n": return 3;
    case "p": return 1;
    default: return 0;
  }
}

/**
 * Evaluates net material gain for a move on a chess.js position (not a full evaluation!).
 * Handles promotion, captures.
 * Returns positive for favorable, negative for material loss.
 */
function evaluateMaterialGain(chess, move) {
  if (!move || !chess) return 0;
  let score = 0;
  if (move.captured) score += pieceValue(move.captured);
  if (move.promotion && pieceValue(move.promotion) > 1) {
    score += pieceValue(move.promotion) - 1; // pawn promotes (net gain)
  }
  // Could penalize moving piece to attacked square, etc.
  return score;
}

/**
 * Helper: clone a chess.js instance, preserving FEN and history.
 * Returns a new, independent Chess object at same FEN.
 */
function cloneChess(chess) {
  // Defensive: detect chess.js version and use the right constructor or factory
  if (!chess || typeof chess.fen !== "function") {
    throw new Error("cloneChess: input invalid");
  }
  let ChessCtor = null;
  // Try global Chess, else chess.constructor
  if (typeof window !== "undefined" && typeof window.Chess === "function") {
    ChessCtor = window.Chess;
  } else if (typeof require === "function") {
    try {
      ChessCtor = require("chess.js").Chess;
    } catch { /* ignore, fallback below */ }
  }
  if (!ChessCtor && chess.constructor && typeof chess.constructor === "function") {
    ChessCtor = chess.constructor;
  }
  if (!ChessCtor) throw new Error("cloneChess: Chess constructor not found");
  return new ChessCtor(chess.fen());
}

/**
 * Helper: quickly checks if moving results in self-check.
 * Used for blunder-avoidance on veryHardBotMove.
 */
function inCheckAfterMove(chess, move) {
  try {
    const c = cloneChess(chess);
    c.move({ from: move.from, to: move.to, promotion: move.promotion });
    // chess.js: .in_check() returns true if side to move is in check (after the move)
    return typeof c.in_check === "function" ? c.in_check() : false;
  } catch (err) {
    return false;
  }
}

// Export helpers for testability if needed (not documented as part of public interface)
export {
  randomMove,
  easyBotMove,
  mediumBotMove,
  hardBotMove,
  veryHardBotMove,
  evaluateMaterialGain,
  cloneChess
};
