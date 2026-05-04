import { useState } from "react";
import { useEngine } from "./hooks/useEngine";
import HomeScreen from "./screens/HomeScreen";
import GameScreen from "./screens/GameScreen";
import "./index.css";

export default function App() {
  const { ready, loading, getBestMove } = useEngine();
  const [screen, setScreen] = useState("home");
  const [settings, setSettings] = useState(null);

  function startGame(s) {
    setSettings(s);
    setScreen("game");
  }

  function goHome() {
    setScreen("home");
  }

  return (
    <div className="app">
      {screen === "home" ? (
        <HomeScreen onPlay={startGame} engineReady={ready} engineLoading={loading} />
      ) : (
        <GameScreen key={Date.now()} settings={settings} onNewGame={goHome} getBestMove={getBestMove} engineReady={ready} />
      )}
    </div>
  );
}
