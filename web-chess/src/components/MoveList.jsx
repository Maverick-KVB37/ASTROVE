import { useEffect, useRef } from "react";

export default function MoveList({ history }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  const pairs = [];
  for (let i = 0; i < history.length; i += 2) {
    pairs.push({ num: Math.floor(i / 2) + 1, w: history[i] || "", b: history[i + 1] || "" });
  }

  return (
    <div className="panel-section panel-section--moves">
      <div className="panel-label">Moves</div>
      <div className="move-scroll" ref={scrollRef}>
        {pairs.length === 0 ? (
          <p className="move-empty">No moves yet</p>
        ) : (
          <div className="move-grid">
            {pairs.map((p) => (
              <div key={p.num} style={{ display: "contents" }}>
                <span className="move-num">{p.num}.</span>
                <span className={`move-cell ${p.num === pairs.length && !p.b ? "move-cell--current" : ""}`}>{p.w}</span>
                <span className={`move-cell ${p.num === pairs.length && p.b ? "move-cell--current" : ""}`}>{p.b}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
