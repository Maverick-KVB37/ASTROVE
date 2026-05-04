// ASTROVE Engine Web Worker
// Runs the WASM chess engine off the main thread so the UI stays responsive.

let engine = null;
let initialized = false;

// Load the Emscripten-generated engine module
importScripts("/engine.js");

async function initEngine() {
  try {
    // createEngine is the Emscripten module factory exposed by engine.js
    engine = await createEngine();

    // Initialize magic bitboards, zobrist, PSQT, etc.
    engine.ccall("init_engine", null, [], []);

    initialized = true;
    self.postMessage({ type: "ready" });
  } catch (err) {
    self.postMessage({ type: "error", message: "Failed to load engine: " + err.message });
  }
}

self.onmessage = function (e) {
  const { type, fen, depth } = e.data;

  if (type === "search") {
    if (!initialized || !engine) {
      self.postMessage({ type: "error", message: "Engine not initialized" });
      return;
    }

    try {
      const move = engine.ccall(
        "get_best_move",
        "string",
        ["string", "number"],
        [fen, depth]
      );

      if (move && move.length >= 4 && move !== "0000") {
        self.postMessage({ type: "bestmove", move });
      } else {
        self.postMessage({ type: "error", message: "Engine returned no valid move" });
      }
    } catch (err) {
      self.postMessage({ type: "error", message: "Search error: " + err.message });
    }
  }
};

// Start loading immediately when the worker is spawned
initEngine();
