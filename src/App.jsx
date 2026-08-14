import { useState, useCallback } from "react";
import StartScreen from "./components/StartScreen";
import MansionExplorer from "./components/MansionExplorer";
import GameComplete from "./components/GameComplete";
import questions from "./data/questions";
import "./styles/index.css";

function App() {
  const [gameState, setGameState] = useState("start");
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const audioCtxRef = useState({ current: null })[0];

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, [audioCtxRef]);

  const playSound = useCallback(
    (type) => {
      if (!soundEnabled) return;
      try {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        switch (type) {
          case "correct": {
            // Bird chirping sound - quick high-pitched tweets
            const chirpFreqs = [
              { freq: 1800, start: 0, dur: 0.06 },
              { freq: 2200, start: 0.08, dur: 0.06 },
              { freq: 2600, start: 0.16, dur: 0.05 },
              { freq: 2000, start: 0.24, dur: 0.07 },
              { freq: 2400, start: 0.34, dur: 0.06 },
              { freq: 2800, start: 0.42, dur: 0.05 },
            ];
            chirpFreqs.forEach(({ freq, start, dur }) => {
              const o = ctx.createOscillator();
              const g = ctx.createGain();
              o.connect(g);
              g.connect(ctx.destination);
              o.type = "sine";
              o.frequency.setValueAtTime(freq, ctx.currentTime + start);
              o.frequency.linearRampToValueAtTime(freq * 1.1, ctx.currentTime + start + dur * 0.5);
              o.frequency.linearRampToValueAtTime(freq * 0.95, ctx.currentTime + start + dur);
              g.gain.setValueAtTime(0.12, ctx.currentTime + start);
              g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + dur);
              o.start(ctx.currentTime + start);
              o.stop(ctx.currentTime + start + dur);
            });
            break;
          }
          case "wrong": {
            // Owl hoo-hoo sound
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc.type = "sine";
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.setValueAtTime(350, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.25);
            osc2.type = "sine";
            osc2.frequency.setValueAtTime(400, ctx.currentTime + 0.35);
            osc2.frequency.setValueAtTime(350, ctx.currentTime + 0.5);
            gain2.gain.setValueAtTime(0.1, ctx.currentTime + 0.35);
            gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
            osc2.start(ctx.currentTime + 0.35);
            osc2.stop(ctx.currentTime + 0.6);
            break;
          }
          case "door":
            osc.type = "triangle";
            osc.frequency.setValueAtTime(120, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.3);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.3);
            break;
          case "click":
            osc.type = "sine";
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.08);
            break;
          case "magical": {
            // Magical success chime
            const notes = [523, 659, 784, 1047];
            notes.forEach((freq, i) => {
              const o = ctx.createOscillator();
              const g = ctx.createGain();
              o.connect(g);
              g.connect(ctx.destination);
              o.type = "sine";
              o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
              g.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.12);
              g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.12 + 0.4);
              o.start(ctx.currentTime + i * 0.12);
              o.stop(ctx.currentTime + i * 0.12 + 0.4);
            });
            break;
          }
          default:
            break;
        }
      } catch {
        // Audio not available
      }
    },
    [soundEnabled, getAudioCtx]
  );

  const handleStart = useCallback(() => {
    playSound("door");
    setGameState("playing");
  }, [playSound]);

  const handleAnswer = useCallback(
    (selected) => {
      if (answered) return;
      const question = questions[currentQuestionIdx];
      const isCorrect = selected === question.correct;

      setAnswered(true);
      setLastResult(isCorrect ? "correct" : "wrong");

      if (isCorrect) {
        setScore((s) => s + 100);
        setCorrectCount((c) => c + 1);
        playSound("correct");
      } else {
        setScore((s) => Math.max(0, s - 10));
        setWrongCount((w) => w + 1);
        playSound("wrong");
      }
    },
    [answered, currentQuestionIdx, playSound]
  );

  const handleRetry = useCallback(() => {
    setAnswered(false);
    setLastResult(null);
  }, []);

  const handleAdvanceRoom = useCallback(() => {
    setCurrentQuestionIdx((i) => i + 1);
    setAnswered(false);
    setLastResult(null);
    playSound("door");
  }, [playSound]);

  const handleGameComplete = useCallback(() => {
    setGameState("complete");
  }, []);

  const handleRestart = useCallback(() => {
    setGameState("start");
    setCurrentQuestionIdx(0);
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setAnswered(false);
    setLastResult(null);
    playSound("click");
  }, [playSound]);

  const handleRoomChange = useCallback((newRoom) => {
    // Find the first question in the new room
    const roomQuestions = questions.filter((q) => q.room === newRoom);
    if (roomQuestions.length > 0) {
      const firstRoomQuestionIdx = questions.indexOf(roomQuestions[0]);
      setCurrentQuestionIdx(firstRoomQuestionIdx);
      setAnswered(false);
      setLastResult(null);
    }
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((s) => !s);
  }, []);

  return (
    <div className="app-container">
      {gameState === "start" && (
        <StartScreen onStart={handleStart} />
      )}

      {gameState === "playing" && (
        <MansionExplorer
          questions={questions}
          score={score}
          currentQuestionIdx={currentQuestionIdx}
          answered={answered}
          lastResult={lastResult}
          onAnswer={handleAnswer}
          onRetry={handleRetry}
          onAdvanceRoom={handleAdvanceRoom}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          onGameComplete={handleGameComplete}
          onRoomChange={handleRoomChange}
        />
      )}

      {gameState === "complete" && (
        <GameComplete
          score={score}
          correctCount={correctCount}
          wrongCount={wrongCount}
          totalRooms={questions.length}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

export default App;
