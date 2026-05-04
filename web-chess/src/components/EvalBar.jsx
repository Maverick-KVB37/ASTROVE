const VAL = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

export function getMaterialEval(game) {
  let w = 0, b = 0;
  for (const row of game.board()) {
    for (const sq of row) {
      if (sq) {
        if (sq.color === "w") w += VAL[sq.type];
        else b += VAL[sq.type];
      }
    }
  }
  return w - b;
}

export default function EvalBar({ game }) {
  const ev = getMaterialEval(game);
  const pct = Math.min(95, Math.max(5, 50 + ev * 5));
  const sign = ev > 0 ? "+" : "";
  const color = ev > 0 ? "var(--accent)" : ev < 0 ? "var(--danger)" : "var(--text-primary)";

  return (
    <div className="panel-section">
      <div className="panel-label">Evaluation</div>
      <div className="eval-num" style={{ color }}>{sign}{ev}</div>
      <div className="eval-track">
        <div className="eval-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
