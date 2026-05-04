# ♟ ASTROVE — Web Chess Interface

A browser-based chess platform powered by a hand-crafted C++ engine compiled to WebAssembly. Play against a ~2600 Elo engine directly in your browser — no server, no downloads.

## Features

- **C++ Chess Engine** — Custom-built from scratch with negamax search, alpha-beta pruning, move ordering, and transposition tables
- **WebAssembly** — Compiled via Emscripten to run at near-native speed inside a Web Worker
- **Real-Time Clocks** — High-precision timers using `Date.now()` delta tracking, immune to browser tab-lag
- **Time Controls** — Bullet (1+0), Blitz (3+2, 5+0), Rapid (10+0), Classical (30+0), and Unlimited
- **Difficulty Levels** — Casual (depth 4), Normal (depth 6), Hard (depth 9)
- **Opening Detection** — Identifies 25+ common openings by move prefix matching
- **Material Evaluation** — Live material count with visual eval bar
- **Captured Pieces** — Unicode piece display with material advantage indicator
- **Game Records** — Win/Draw/Loss tracking persisted to localStorage

## Tech Stack

| Layer | Technology |
|-------|------------|
| Engine | C++17, compiled to WASM via Emscripten |
| Frontend | React 19, Vite 8 |
| Board | react-chessboard v5 |
| Game Logic | chess.js v1.4 |
| Styling | Vanilla CSS (dark theme) |

## Project Structure

```
web-chess/
├── public/
│   ├── engine.js          # Emscripten JS glue
│   ├── engine.wasm        # Compiled C++ engine binary
│   └── engineWorker.js    # Web Worker wrapper for the engine
├── src/
│   ├── components/
│   │   ├── EvalBar.jsx    # Material evaluation display
│   │   ├── MoveList.jsx   # Scrollable move history
│   │   ├── OpeningName.jsx# Opening detection (25+ openings)
│   │   └── PlayerBar.jsx  # Player info, captured pieces, clock
│   ├── hooks/
│   │   └── useEngine.js   # React hook for engine communication
│   ├── screens/
│   │   ├── HomeScreen.jsx # Game setup (time, side, difficulty)
│   │   └── GameScreen.jsx # Board, clocks, game logic
│   ├── App.jsx            # Screen routing
│   ├── main.jsx           # React entry point
│   └── index.css          # Global styles
├── index.html
├── vite.config.js
└── package.json
```

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm

### Install & Run

```bash
cd web-chess
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview
```

## How It Works

1. **C++ Engine** → Written from scratch in C++17 with alpha-beta pruning, move ordering, and transposition tables
2. **Emscripten** → Compiled to WebAssembly. The binary runs at near-native speed inside a Web Worker
3. **Your Browser** → No server, no downloads. The engine runs locally with zero latency

The engine communicates with the React UI through a Web Worker, keeping the main thread free for clock updates and smooth interactions.

## Architecture

```
React UI (main thread)
    │
    ├── useEngine hook ──► postMessage ──► Web Worker
    │                                        │
    │                                   engine.js (Emscripten glue)
    │                                        │
    │                                   engine.wasm (C++ binary)
    │                                        │
    └── onmessage ◄────── best move ◄───────┘
```

## License

MIT

## Author

Built by **KVB**
