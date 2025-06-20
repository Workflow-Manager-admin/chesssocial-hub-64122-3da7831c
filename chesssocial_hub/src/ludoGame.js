import React, { useState } from "react";

// PUBLIC_INTERFACE
/**
 * LudoGame - extremely simplified Ludo (race to finish), 2 players.
 * Props:
 * - onExit: function to return to game selector
 */
export default function LudoGame({ onExit }) {
  // Each player: single piece moves from 0 → 24 by exact roll.
  const TRACK = 25;
  const PLAYER_COLORS = ["#10B981", "#F59E0B"];
  const PLAYER_EMOJIS = ["🟢", "🟠"];
  const [positions, setPositions] = useState([0, 0]);
  const [current, setCurrent] = useState(0);
  const [roll, setRoll] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [msg, setMsg] = useState("Roll a 6 to start!");
  const [won, setWon] = useState(null);

  function rollDice() {
    setRolling(true);
    setTimeout(() => {
      const d = Math.floor(Math.random() * 6) + 1;
      setRoll(d);
      setRolling(false);
      movePiece(d);
    }, 690);
  }
  function movePiece(val) {
    setMsg("");
    let pos = [...positions];
    if (pos[current] === 0 && val !== 6) {
      setMsg("Need 6 to enter!");
      setTimeout(() => setCurrent(p => 1-p), 900);
      return;
    }
    let nxt = pos[current] + val;
    if (nxt > TRACK) nxt = pos[current]; // must land exactly
    pos[current] = nxt;
    setTimeout(() => {
      setPositions(pos);
      if (nxt === TRACK) {
        setMsg(`Player ${current+1} wins! 🎉`);
        setWon(current);
      } else {
        setCurrent(p => 1-p);
        setMsg("");
      }
    }, 168);
  }
  function handleRestart() {
    setPositions([0,0]);
    setCurrent(0);
    setRoll(null);
    setMsg("Roll a 6 to start!");
    setWon(null);
  }
  function renderTrack() {
    let arr = [];
    for (let i=0;i<=TRACK;++i) {
      arr.push(
        <div className="ludo-sq" key={i}>
          <span className="ludo-num">{i}</span>
          {positions[0]===i && <span className="ludo-p" style={{color: PLAYER_COLORS[0]}}>{PLAYER_EMOJIS[0]}</span>}
          {positions[1]===i && <span className="ludo-p" style={{color: PLAYER_COLORS[1],marginLeft:2}}>{PLAYER_EMOJIS[1]}</span>}
        </div>
      );
    }
    return <div className="ludo-track">{arr}</div>;
  }
  return (
    <div className="ludo-root">
      <div className="ludo-title"><span role="img" aria-label="ludo">🧿🎲</span> Ludo (Race Mode)</div>
      {renderTrack()}
      <div className="ludo-panel">
        <div className="ludo-status">
          {won === null
            ? <>
              Turn: <span style={{color:PLAYER_COLORS[current],fontWeight:700}}>Player {current+1} {PLAYER_EMOJIS[current]}</span>
              </>
            : <>
              <span style={{color:PLAYER_COLORS[won],fontWeight:700}}>Player {won+1} wins!</span>
            </>
          }
        </div>
        <div className="ludo-dice-ctrl">
          <span className={`ludo-dice${rolling?" rolling":""}`}>
            {rolling ? "🎲" : roll ? roll : "🎲"}
          </span>
          <button onClick={rollDice}
            disabled={rolling||won!==null}
            className="ludo-btn"
            style={{
              marginLeft: 13,
              background: "linear-gradient(93deg,var(--primary,#4F46E5),var(--accent,#F59E0B) 80%)", color:"#fff"
            }}>
            Roll
          </button>
          <button onClick={handleRestart} className="ludo-btn" style={{marginLeft:7}}>
            Restart
          </button>
        </div>
        {msg && <div className="ludo-msg">{msg}</div>}
        <button onClick={onExit} className="ludo-btn"
         style={{marginTop:16,background:"var(--highlight,#10B981)",color:"#fff"}}>
          Back to Game Selection
        </button>
        <style>{`
        .ludo-root { width:99%; max-width: 420px; margin: 0 auto; text-align:center;}
        .ludo-title { font-size:1.34em; font-weight: 800; color: var(--primary,#4F46E5); margin-bottom: 9px;}
        .ludo-track {display:flex;flex-wrap:wrap;justify-content:center;background:#FAF7E1;border:1.1px solid #efbaff50;
          border-radius:9px;box-shadow:0 4px 18px -11px var(--accent,#F59E0B)22;margin-bottom:13px;}
        .ludo-sq {width:38px; height:38px; border:1.1px solid #D1D5DB; border-radius:6px; margin:2.5px;
          display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;font-size:.91em;
          background:#fff;}
        .ludo-num {position:absolute;top:1.6px;left:6px;font-size:.75em;color:#2224;}
        .ludo-p {font-size:1.21em;}
        .ludo-panel{margin:9px 0 0 0;}
        .ludo-status{font-size:1.07em;margin-bottom:6px;}
        .ludo-dice-ctrl{display:flex;align-items:center;justify-content:center;}
        .ludo-dice{font-size:2.4em;margin-right:3px;color:var(--primary,#4F46E5);}
        .ludo-dice.rolling{animation:snl-dice-roll .33s linear infinite;}
        .ludo-btn{
          background: var(--primary,#4F46E5); color: #fff; border:none;
          padding:8px 12px; border-radius:7px; font-weight:700; font-size:1.00em; cursor:pointer;margin-top:3px;
          box-shadow:0 1.5px 8px -3px var(--primary,#4F46E5)21;transition: background .13s;
        }
        .ludo-btn:active{background:var(--accent,#F59E0B);}
        .ludo-msg{font-size:1.08em;margin-top:7px;color:var(--accent,#F59E0B);font-weight:800;}
        @media (max-width:500px){.ludo-root{width:99vw;} .ludo-track{max-width:98vw;}}
        `}
        </style>
      </div>
    </div>
  );
}
