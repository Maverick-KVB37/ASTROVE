import { useEffect, useRef, useState, useCallback } from "react";

export function useEngine() {
  const workerRef = useRef(null);
  const resolverRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const worker = new Worker("/engineWorker.js");
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const { type, move, message } = e.data;

      switch (type) {
        case "ready":
          setReady(true);
          setLoading(false);
          console.log("♟ ASTROVE engine loaded in Web Worker!");
          break;

        case "bestmove":
          if (resolverRef.current) {
            resolverRef.current.resolve(move);
            resolverRef.current = null;
          }
          break;

        case "error":
          console.error("Engine worker error:", message);
          if (resolverRef.current) {
            resolverRef.current.resolve(null);
            resolverRef.current = null;
          }
          // If we're still loading and get an error, mark as failed
          setLoading((prev) => {
            if (prev) return false;
            return prev;
          });
          break;
      }
    };

    worker.onerror = (err) => {
      console.error("Worker error:", err);
      setLoading(false);
      if (resolverRef.current) {
        resolverRef.current.resolve(null);
        resolverRef.current = null;
      }
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
      if (resolverRef.current) {
        resolverRef.current.resolve(null);
        resolverRef.current = null;
      }
    };
  }, []);

  const getBestMove = useCallback((fen, depth = 5) => {
    if (!workerRef.current || !ready) return Promise.resolve(null);

    return new Promise((resolve) => {
      resolverRef.current = { resolve };
      workerRef.current.postMessage({ type: "search", fen, depth });
    });
  }, [ready]);

  return { ready, loading, getBestMove };
}
