import { useState, useCallback, useRef, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import PlayerBar, { getCaptured } from "../components/PlayerBar";
import MoveList from "../components/MoveList";
import EvalBar from "../components/EvalBar";
import OpeningName from "../components/OpeningName";

const MIN_THINK_MS = 250;

export default function GameScreen({ settings, onNewGame, getBestMove, engineReady }) {
  const { tc, side: playerSide, depth } = settings;
  const engineSide = playerSide === "w" ? "b" : "w";
  const hasClock = tc.time > 0;

  const [game, setGame] = useState(new Chess());
  const [history, setHistory] = useState([]);
  const [thinking, setThinking] = useState(false);
  const [result, setResult] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const [whiteMs, setWhiteMs] = useState(tc.time * 60000);
  const [blackMs, setBlackMs] = useState(tc.time * 60000);
  const [boardSize, setBoardSize] = useState(400);
  const boardContainerRef = useRef(null);

  const clockRef = useRef({
    whiteMs: tc.time * 60000, blackMs: tc.time * 60000,
    active: "w", turnStart: Date.now(), running: hasClock,
    incMs: tc.inc * 1000,
  });
  const phaseRef = useRef("playing");
  const timeoutRef = useRef(null);

  // Persist W/D/L
  function saveRecord(o) {
    try {
      const r = JSON.parse(localStorage.getItem("astrove_record") || '{"wins":0,"draws":0,"losses":0}');
      if (o === "win") r.wins++; else if (o === "draw") r.draws++; else r.losses++;
      localStorage.setItem("astrove_record", JSON.stringify(r));
    } catch {}
  }

  function endGame(title, reason, outcome) {
    clockRef.current.running = false;
    phaseRef.current = "done";
    saveRecord(outcome);
    setResult({ title, reason });
  }

  // Clock commit + switch
  function commitAndSwitch() {
    const c = clockRef.current;
    if (!c.running) return;
    const elapsed = Date.now() - c.turnStart;
    if (c.active === "w") c.whiteMs = Math.max(0, c.whiteMs - elapsed) + c.incMs;
    else c.blackMs = Math.max(0, c.blackMs - elapsed) + c.incMs;
    c.active = c.active === "w" ? "b" : "w";
    c.turnStart = Date.now();
  }

  // Timeout handler ref
  timeoutRef.current = (side) => {
    const loser = side === "w" ? "White" : "Black";
    const winner = side === "w" ? "Black" : "White";
    endGame(`${winner} wins`, `${loser} ran out of time`, side === playerSide ? "loss" : "win");
  };

  // Clock tick
  useEffect(() => {
    const id = setInterval(() => {
      const c = clockRef.current;
      if (!c.running) return;
      const elapsed = Date.now() - c.turnStart;
      const wMs = c.active === "w" ? Math.max(0, c.whiteMs - elapsed) : c.whiteMs;
      const bMs = c.active === "b" ? Math.max(0, c.blackMs - elapsed) : c.blackMs;
      setWhiteMs(wMs);
      setBlackMs(bMs);
      if (wMs <= 0) timeoutRef.current?.("w");
      else if (bMs <= 0) timeoutRef.current?.("b");
    }, 100);
    return () => clearInterval(id);
  }, []);

  // Dynamically size the board to fit its container
  useEffect(() => {
    const el = boardContainerRef.current;
    if (!el) return;
    const calc = () => {
      const { width, height } = el.getBoundingClientRect();
      setBoardSize(Math.floor(Math.min(width, height)));
    };
    calc();
    const obs = new ResizeObserver(calc);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Check game end conditions
  function checkEnd(g, isEngineMoved) {
    if (g.isCheckmate()) {
      endGame(isEngineMoved ? "ASTROVE wins" : "You win!", "Checkmate", isEngineMoved ? "loss" : "win");
      return true;
    }
    if (g.isStalemate()) { endGame("Draw", "Stalemate", "draw"); return true; }
    if (g.isDraw()) { endGame("Draw", "Insufficient material / repetition", "draw"); return true; }
    return false;
  }

  // Engine move
  const makeEngineMove = useCallback(async (cur) => {
    if (cur.isGameOver()) return;
    setThinking(true);
    const t0 = Date.now();
    const best = await getBestMove(cur.fen(), depth);
    const elapsed = Date.now() - t0;
    if (elapsed < MIN_THINK_MS) await new Promise(r => setTimeout(r, MIN_THINK_MS - elapsed));
    if (phaseRef.current !== "playing") { setThinking(false); return; }
    if (!best) { setThinking(false); return; }

    const g = new Chess(cur.fen());
    const mv = g.move({ from: best.slice(0, 2), to: best.slice(2, 4), promotion: best[4] || "q" });
    if (!mv) { setThinking(false); return; }

    commitAndSwitch();
    setLastMove({ from: mv.from, to: mv.to });
    setGame(g);
    setHistory(g.history());
    setThinking(false);
    checkEnd(g, true);
  }, [getBestMove, depth]);

  // Engine plays first if player is black
  useEffect(() => {
    if (engineReady && playerSide === "b" && game.turn() === "w" && history.length === 0) {
      makeEngineMove(game);
    }
  }, [engineReady, playerSide]);

  // Player move
  function onDrop({ sourceSquare, targetSquare }) {
    if (thinking || game.isGameOver() || game.turn() !== playerSide || phaseRef.current !== "playing") return false;
    const g = new Chess(game.fen());
    const mv = g.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    if (!mv) return false;

    commitAndSwitch();
    setLastMove({ from: mv.from, to: mv.to });
    setGame(g);
    setHistory(g.history());
    if (!checkEnd(g, false)) makeEngineMove(g);
    return true;
  }

  function handleResign() {
    endGame("ASTROVE wins", "You resigned", "loss");
  }

  // Derived data
  const { capturedBy, advantage } = getCaptured(game);
  const activeTurn = game.turn();
  const topSide = engineSide;
  const botSide = playerSide;
  const topMs = topSide === "w" ? whiteMs : blackMs;
  const botMs = botSide === "w" ? whiteMs : blackMs;

  // Square styles for last move highlight
  const sqStyles = {};
  if (lastMove) {
    sqStyles[lastMove.from] = { backgroundColor: "rgba(255, 255, 0, 0.15)" };
    sqStyles[lastMove.to] = { backgroundColor: "rgba(255, 255, 0, 0.2)" };
  }

  let statusDot = "green";
  let statusText = "Your move";
  if (result) { statusDot = "gray"; statusText = result.reason; }
  else if (thinking) { statusDot = "amber"; statusText = "ASTROVE is thinking…"; }
  else if (game.isCheck()) { statusText = "Check — your move"; }

  return (
    <>
      <div className="topbar">
        <span className="topbar__brand">ASTROVE</span>
        <span className="topbar__status">
          <span className="topbar__dot" />
          {tc.label} · {tc.category}
        </span>
      </div>

      <div className="game-body">
        {/* Board Area */}
        <div className="board-area">
          <PlayerBar
            name="ASTROVE" rating="~2600" side={topSide} position="top"
            captured={capturedBy[topSide]} advantage={advantage[topSide]}
            clockMs={topMs} clockActive={activeTurn === topSide && !result}
            clockLow={hasClock && topMs < 30000 && topMs > 0} hasClock={hasClock}
          />
          <div className="board-container" ref={boardContainerRef}>
            {result && (
              <div className="result-overlay">
                <div className="result-overlay__title">{result.title}</div>
                <div className="result-overlay__reason">{result.reason}</div>
                <button className="result-overlay__btn" onClick={onNewGame}>New Game</button>
              </div>
            )}
            <div style={{ width: boardSize, height: boardSize }}>
              <Chessboard
                options={{
                  id: "astrove-board",
                  position: game.fen(),
                  onPieceDrop: onDrop,
                  boardOrientation: playerSide === "w" ? "white" : "black",
                  animationDurationInMs: 150,
                  allowDragging: engineReady && !thinking && !game.isGameOver() && !result,
                  boardStyle: { borderRadius: "0" },
                  darkSquareStyle: { backgroundColor: "#779556" },
                  lightSquareStyle: { backgroundColor: "#ebecd0" },
                  dropSquareStyle: { boxShadow: "inset 0 0 1px 4px rgba(255,255,80,0.5)" },
                  customSquareStyles: sqStyles,
                }}
              />
            </div>
          </div>
          <PlayerBar
            name="You" side={botSide} position="bottom"
            captured={capturedBy[botSide]} advantage={advantage[botSide]}
            clockMs={botMs} clockActive={activeTurn === botSide && !result}
            clockLow={hasClock && botMs < 30000 && botMs > 0} hasClock={hasClock}
          />
        </div>

        {/* Game Panel */}
        <div className="game-panel">
          <OpeningName history={history} />
          <EvalBar game={game} />
          <MoveList history={history} />
          <div className="panel-bottom">
            <div className="game-status">
              <span className={`status-dot status-dot--${statusDot}`} />
              <span>{statusText}</span>
            </div>
            <div className="game-actions">
              <button className="act-btn" onClick={onNewGame}>New Game</button>
              {!result && <button className="act-btn act-btn--danger" onClick={handleResign}>Resign</button>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
