const PIECE_SYM = {
  w: { p: "♙", n: "♘", b: "♗", r: "♖", q: "♕" },
  b: { p: "♟", n: "♞", b: "♝", r: "♜", q: "♛" },
};
const VAL = { p: 1, n: 3, b: 3, r: 5, q: 9 };
const ORDER = ["q", "r", "b", "n", "p"];

export function getCaptured(game) {
  const start = { w: { p: 8, n: 2, b: 2, r: 2, q: 1 }, b: { p: 8, n: 2, b: 2, r: 2, q: 1 } };
  const cur = { w: { p: 0, n: 0, b: 0, r: 0, q: 0 }, b: { p: 0, n: 0, b: 0, r: 0, q: 0 } };
  for (const row of game.board()) {
    for (const sq of row) {
      if (sq && sq.type !== "k") cur[sq.color][sq.type]++;
    }
  }
  // capturedBy[side] = opponent pieces this side has captured
  const capturedBy = { w: {}, b: {} };
  for (const p of ORDER) {
    capturedBy.w[p] = start.b[p] - cur.b[p]; // white captured black pieces
    capturedBy.b[p] = start.w[p] - cur.w[p]; // black captured white pieces
  }
  // material advantage
  let wVal = 0, bVal = 0;
  for (const p of ORDER) { wVal += cur.w[p] * VAL[p]; bVal += cur.b[p] * VAL[p]; }
  return { capturedBy, advantage: { w: wVal - bVal, b: bVal - wVal } };
}

function formatClock(ms) {
  if (ms <= 0) return "0:00";
  if (ms < 20000) {
    const s = Math.floor(ms / 1000);
    const t = Math.floor((ms % 1000) / 100);
    return `0:${String(s).padStart(2, "0")}.${t}`;
  }
  const sec = Math.ceil(ms / 1000);
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

export default function PlayerBar({ name, rating, side, captured, advantage, clockMs, clockActive, clockLow, hasClock, position }) {
  // Build captured pieces string
  const capColor = side === "w" ? "b" : "w"; // color of pieces this player captured
  const symbols = [];
  if (captured) {
    for (const p of ORDER) {
      for (let i = 0; i < (captured[p] || 0); i++) symbols.push(PIECE_SYM[capColor][p]);
    }
  }

  return (
    <div className={`player-bar player-bar--${position}`}>
      <div className="player-bar__left">
        <span className="player-bar__icon">{side === "w" ? "♔" : "♚"}</span>
        <span className="player-bar__name">{name}</span>
        {rating && <span className="player-bar__rating">({rating})</span>}
        <span className="player-bar__captured">{symbols.join("")}</span>
        {advantage > 0 && <span className="player-bar__adv">+{advantage}</span>}
      </div>
      {hasClock && (
        <div className={`clock ${clockActive ? "clock--active" : ""} ${clockLow ? "clock--low" : ""}`}>
          {formatClock(clockMs)}
        </div>
      )}
    </div>
  );
}
