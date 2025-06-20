import React, { useState, useRef, useEffect } from "react";

// PUBLIC_INTERFACE
/**
 * Simple, modern Snake & Ladder game for CheckMates. 2 players (vs friend or yourself).
 * Props:
 * - onExit: function to call when user clicks back
 */
export default function SnakeLadder({ onExit }) {
  // Board setup: 6x6 (36), snakes and ladders positions
  const BOARD_SIZE = 36;
  const SQUARES_PER_ROW = 6;
  const SNAKES = { 17: 7, 29: 15, 33: 11 };
  const LADDERS = { 5: 13, 9: 27, 21: 33 };
  const PLAYER_COLORS = ["#10B981", "#F59E0B"];
  const PLAYER_EMOJIS = ["🟢", "🟠"];
  const [positions, setPositions] = useState([0, 0]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [diceRoll, setDiceRoll] = useState(null);
  const [msg, setMsg] = useState("Roll to start!");
  const [rolling, setRolling] = useState(false);
  const [won, setWon] = useState(null);

  function rollDice() {
    setRolling(true);
    setTimeout(() => {
      const val = Math.floor(Math.random() * 6) + 1;
      setDiceRoll(val);
      setRolling(false);
      movePlayer(val);
    }, 650);
  }

  function movePlayer(val) {
    setMsg("");
    let next = [...positions];
    let pos = next[currentPlayer] + val;
    if (pos > BOARD_SIZE - 1) pos = next[currentPlayer]; // must land exactly
    // Check for snake/ladder
    if (LADDERS[pos]) {
      setTimeout(() => setMsg("Ladder! 🪜"), 333);
      pos = LADDERS[pos];
    } else if (SNAKES[pos]) {
      setTimeout(() => setMsg("Oh no, snake! 🐍"), 333);
      pos = SNAKES[pos];
    }
    next[currentPlayer] = pos;
    setTimeout(() => {
      setPositions(next);
      if (pos === BOARD_SIZE - 1) {
        setMsg(`Player ${currentPlayer + 1} wins! 🎉`);
        setWon(currentPlayer);
      } else {
        setCurrentPlayer(cp => 1 - cp);
        setMsg("");
      }
    }, 180);
  }

  function handleRestart() {
    setPositions([0, 0]);
    setCurrentPlayer(0);
    setDiceRoll(null);
    setMsg("Roll to start!");
    setWon(null);
  }

  // Board squares (0..35), alternating left-right per row
  function renderBoard() {
    let rows = [];
    for (let row = 5; row >= 0; --row) {
      let squares = [];
      for (let col = 0; col < 6; ++col) {
        let idx = row % 2 === 0
          ? row * 6 + col
          : row * 6 + (5 - col);
        const snake = Object.keys(SNAKES).find((k) => +k === idx);
        const ladder = Object.keys(LADDERS).find((k) => +k === idx);
        const playersHere = positions.map((p, i) => p === idx ? PLAYER_EMOJIS[i] : null).filter(Boolean).join(" ");
        let classes = "snl-square";
        if (snake) classes += " snl-snake";
        if (ladder) classes += " snl-ladder";
        if (positions[0] === idx && positions[1] === idx) classes += " snl-both";
        squares.push(
          <div key={idx} className={classes}>
            <div className="snl-num">{idx + 1}</div>
            {snake && <span className="snl-sv" role="img" aria-label="snake" style={{fontSize:"1.09em"}}>🐍</span>}
            {ladder && <span className="snl-sv" role="img" aria-label="ladder" style={{fontSize:"1.09em"}}>🪜</span>}
            <div style={{marginTop:3}}>
              {positions[0] === idx && <span style={{color: PLAYER_COLORS[0]}}>{PLAYER_EMOJIS[0]}</span>}
              {positions[1] === idx && <span style={{color: PLAYER_COLORS[1], marginLeft: 2}}>{PLAYER_EMOJIS[1]}</span>}
            </div>
          </div>
        );
      }
      rows.push(
        <div className="snl-row" key={row}>{squares}</div>
      );
    }
    return (
      <div className="snl-board">{rows}</div>
    );
  }

  // Anim roll
  function renderDice() {
    if (rolling) {
      return <span className="snl-dice rolling">🎲</span>;
    }
    return diceRoll ? <span className="snl-dice">{diceRoll}</span>
      : <span className="snl-dice" style={{opacity:0.57}}>🎲</span>;
  }

  return (
    <div className="snl-root">
      <div className="snl-title">
        <span role="img" aria-label="game" style={{fontSize:"1.21em", top:2, position:"relative"}}>🐍🎲</span>
        Snake &amp; Ladder
      </div>
      {renderBoard()}
      <div className="snl-panel">
        <div className="snl-status">
          {won === null
            ? <>
                Turn: <span style={{color: PLAYER_COLORS[currentPlayer], fontWeight:700}}>Player {currentPlayer+1} {PLAYER_EMOJIS[currentPlayer]}</span>
              </>
            : <>
                <span style={{color: PLAYER_COLORS[won], fontWeight:700}}>Player {won+1} wins!</span>
              </>
          }
        </div>
        <div className="snl-dice-ctrl">
          {renderDice()}
          <button
            onClick={rollDice}
            disabled={rolling || won !== null}
            className="snl-btn"
            style={{
              marginLeft: 12,
              background: "linear-gradient(93deg,var(--accent,#F59E0B),var(--highlight,#10B981) 80%)",
              color: "#fff"
            }}
            aria-label="Roll Dice"
          >
            Roll
          </button>
          <button onClick={handleRestart} className="snl-btn" style={{ marginLeft: 8}}>
            Restart
          </button>
        </div>
        {msg && <div className="snl-msg">{msg}</div>}
        <button
          onClick={onExit}
          className="snl-btn"
          style={{
            marginTop: 14,
            background:"var(--primary,#4F46E5)", color: "#fff"
          }}
        >
          Back to Game Selection
        </button>
      </div>
      <style>{`
      .snl-root {
        width: 345px; margin: 0 auto; text-align:center;
        font-family: inherit;
      }
      .snl-title { font-size: 1.55em; font-weight: 800; color: var(--primary,#4F46E5); margin-bottom: 7px; }
      .snl-board { display: flex; flex-direction: column; border: 2.2px solid var(--accent,#F59E0B); border-radius:13px; background: #F6FBFF; box-shadow:0 3px 18px -8px var(--accent,#F59E0B)55; margin:7px 0;}
      .snl-row { display: flex; }
      .snl-square {
        width: 48px; height: 48px; border: 1.1px solid #ffcf6a90;
        display: flex; flex-direction: column; align-items: center; justify-content:center;
        font-size: .99em; background: #fffbe9; position:relative; border-radius: 5.5px; margin:1.5px;
        box-shadow:0 1px 6px -2px #F59E0B22;
      }
      .snl-square.snl-snake { background: linear-gradient(101deg,#FC8181 60%, #FEF3C7 100%);}
      .snl-square.snl-ladder { background: linear-gradient(111deg,#FFF59D 60%,#ABF7B1 100%);}
      .snl-square.snl-both { filter: brightness(1.12); }
      .snl-num { position:absolute; top:3px; left:5px; font-size:0.77em; color:#2225; }
      .snl-sv { position: absolute; right:4px; bottom:3px; font-size:1.01em; }
      .snl-panel {margin: 16px 0 2px 0; text-align:center;}
      .snl-status {font-size: 1.11em; margin-bottom:5px;}
      .snl-dice-ctrl {display:flex; align-items:center;justify-content:center;}
      .snl-dice {font-size: 2.8em; margin-right: 3px; color: var(--primary,#4F46E5);}
      .snl-dice.rolling { animation:snl-dice-roll 0.36s linear infinite;}
      @keyframes snl-dice-roll { 0%{ transform:rotate(0);} 70%{ transform:rotate(27deg);} 100%{ transform:rotate(-7deg);} }
      .snl-btn {
        background: var(--primary,#4F46E5); color:#fff; border: none;
        padding: 8px 13px; border-radius: 7px; font-weight: 700;
        font-size: 1.00em; cursor: pointer; margin-top:3px;
        box-shadow: 0 1.5px 10px -3px var(--primary,#4F46E5)21;
        transition: background 0.13s;
      }
      .snl-btn:active { background: var(--highlight,#10B981);}
      .snl-msg {font-size: 1.08em; margin-top:7px; color: var(--accent,#F59E0B); font-weight:800;}
      @media (max-width: 500px) { .snl-root { width: 99vw; min-width: 0; }
        .snl-board { max-width:98vw; }
        .snl-square { width: 13vw; height: 13vw; min-width:32px; min-height:32px; }
      }
      `}</style>
    </div>
  );
}
