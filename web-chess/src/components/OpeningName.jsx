const OPENINGS = [
  { m: ["e4","e5","Nf3","Nc6","Bb5"], name: "Ruy Lopez" },
  { m: ["e4","e5","Nf3","Nc6","Bc4"], name: "Italian Game" },
  { m: ["e4","e5","Nf3","Nc6","d4"], name: "Scotch Game" },
  { m: ["e4","e5","Nf3","Nf6"], name: "Petrov's Defense" },
  { m: ["e4","c5","Nf3","d6"], name: "Sicilian Najdorf" },
  { m: ["e4","c5","Nf3","Nc6"], name: "Sicilian Open" },
  { m: ["d4","d5","c4","e6"], name: "Queen's Gambit Declined" },
  { m: ["d4","d5","c4","dxc4"], name: "Queen's Gambit Accepted" },
  { m: ["d4","Nf6","c4","g6"], name: "King's Indian Defense" },
  { m: ["d4","Nf6","c4","e6"], name: "Nimzo-Indian Defense" },
  { m: ["e4","e5","Nf3"], name: "King's Knight Opening" },
  { m: ["e4","e5","f4"], name: "King's Gambit" },
  { m: ["d4","d5","c4"], name: "Queen's Gambit" },
  { m: ["e4","c5"], name: "Sicilian Defense" },
  { m: ["e4","c6"], name: "Caro-Kann Defense" },
  { m: ["e4","e6"], name: "French Defense" },
  { m: ["e4","d5"], name: "Scandinavian Defense" },
  { m: ["e4","g6"], name: "Modern Defense" },
  { m: ["e4","e5"], name: "Open Game" },
  { m: ["d4","d5"], name: "Closed Game" },
  { m: ["d4","Nf6"], name: "Indian Defense" },
  { m: ["c4"], name: "English Opening" },
  { m: ["Nf3"], name: "Réti Opening" },
  { m: ["e4"], name: "King's Pawn Opening" },
  { m: ["d4"], name: "Queen's Pawn Opening" },
];

export default function OpeningName({ history }) {
  if (!history || history.length === 0) return (
    <div className="panel-section">
      <div className="panel-label">Opening</div>
      <div className="panel-value">Starting Position</div>
    </div>
  );

  let name = "Unknown";
  for (const o of OPENINGS) {
    if (o.m.length <= history.length && o.m.every((m, i) => history[i] === m)) {
      name = o.name;
      break;
    }
  }

  return (
    <div className="panel-section">
      <div className="panel-label">Opening</div>
      <div className="panel-value">{name}</div>
    </div>
  );
}
