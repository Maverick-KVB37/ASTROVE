import { useState } from "react";

const TIME_CONTROLS = [
  { id: "bullet",    label: "1+0",  category: "Bullet",    time: 1,  inc: 0 },
  { id: "blitz-3",   label: "3+2",  category: "Blitz",     time: 3,  inc: 2 },
  { id: "blitz-5",   label: "5+0",  category: "Blitz",     time: 5,  inc: 0 },
  { id: "rapid",     label: "10+0", category: "Rapid",     time: 10, inc: 0 },
  { id: "classical", label: "30+0", category: "Classical", time: 30, inc: 0 },
  { id: "unlimited", label: "∞",    category: "Unlimited", time: 0,  inc: 0 },
];

const DIFFICULTIES = [
  { id: "casual", label: "Casual", depth: 4 },
  { id: "normal", label: "Normal", depth: 6 },
  { id: "hard",   label: "Hard",   depth: 9 },
];

export default function HomeScreen({ onPlay, engineReady, engineLoading }) {
  const [tc, setTc] = useState(TIME_CONTROLS[2]);
  const [side, setSide] = useState("w");
  const [diff, setDiff] = useState(DIFFICULTIES[1]);

  function handlePlay() {
    if (!engineReady) return;
    onPlay({ tc, side, depth: diff.depth });
  }

  return (
    <>
      <div className="topbar">
        <span className="topbar__brand">ASTROVE</span>
        <span className="topbar__status">
          <span className={`topbar__dot ${engineLoading ? "topbar__dot--loading" : !engineReady ? "topbar__dot--error" : ""}`} />
          {engineLoading ? "Loading engine..." : engineReady ? "Engine ready" : "Failed"}
        </span>
      </div>

      <main className="home">
        <div className="home__inner">
          <h1 className="home__title">Play ASTROVE</h1>
          <p className="home__sub">~2600 Elo · Hand-crafted C++ engine · Runs in your browser</p>

          <div className="home__card">
            <div className="section-label">Time Control</div>
            <div className="tc-grid">
              {TIME_CONTROLS.map((t) => (
                <button key={t.id} className={`tc-btn ${tc.id === t.id ? "tc-btn--on" : ""}`} onClick={() => setTc(t)}>
                  <span className="tc-btn__time">{t.label}</span>
                  <span className="tc-btn__cat">{t.category}</span>
                </button>
              ))}
            </div>

            <div className="section-label">Play As</div>
            <div className="pick-row">
              <button className={`pick-btn ${side === "w" ? "pick-btn--on" : ""}`} onClick={() => setSide("w")}>♔ White</button>
              <button className={`pick-btn ${side === "b" ? "pick-btn--on" : ""}`} onClick={() => setSide("b")}>♚ Black</button>
            </div>

            <div className="section-label">Difficulty</div>
            <div className="pick-row pick-row--3">
              {DIFFICULTIES.map((d) => (
                <button key={d.id} className={`pick-btn ${diff.id === d.id ? "pick-btn--on" : ""}`} onClick={() => setDiff(d)}>
                  {d.label} <span className="pick-btn__depth">(depth {d.depth})</span>
                </button>
              ))}
            </div>

            <button className="play-btn" onClick={handlePlay} disabled={!engineReady}>
              {engineLoading ? "Loading engine..." : engineReady ? "Play" : "Engine failed"}
            </button>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        Hand-crafted C++ engine compiled to WebAssembly · Built by KVB ·{" "}
        <a href="https://github.com/kvb" target="_blank" rel="noopener noreferrer">GitHub</a>
      </footer>
    </>
  );
}
