import { useState, useCallback } from "react";
import StartScreen from "./components/StartScreen";
import MansionExplorer from "./components/MansionExplorer";
import GameComplete from "./components/GameComplete";
import HorrorOverlay from "./components/HorrorOverlay";
import questions from "./data/questions";
import {
  unlockAudio,
  startAmbient,
  stopAmbient,
  setSoundEnabled as setHorrorSoundEnabled,
  playCorrect,
  playWrong,
  playDoorCreak,
  playJumpScare,
  playFootsteps,
} from "./utils/horrorSounds";
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
  const [glitchTrigger, setGlitchTrigger] = useState(0);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const handleStart = useCallback(() => {
    if (!audioUnlocked) {
      unlockAudio();
      setAudioUnlocked(true);
    }
    startAmbient();
    playDoorCreak();
    setGameState("playing");
  }, [audioUnlocked]);

  const handleAnswer = useCallback(
    (selected) => {
      if (answered) return;
      const isCorrect = selected.isCorrect;

      if (isCorrect) {
        setAnswered(true);
        setLastResult("correct");
        setScore((s) => s + 100);
        setCorrectCount((c) => c + 1);
        playCorrect();
      } else {
        setLastResult("wrong");
        setScore((s) => Math.max(0, s - 10));
        setWrongCount((w) => w + 1);
        playWrong();
        playJumpScare();
        setGlitchTrigger((g) => g + 1);
        // Reset so child can try another option
        setTimeout(() => {
          setLastResult(null);
        }, 500);
      }
    },
    [answered, currentQuestionIdx]
  );

  const handleRetry = useCallback(() => {
    setAnswered(false);
    setLastResult(null);
  }, []);

  const handleAdvanceRoom = useCallback(() => {
    playFootsteps(4);
    playDoorCreak();
    setGlitchTrigger((g) => g + 1);
    setCurrentQuestionIdx((i) => i + 1);
    setAnswered(false);
    setLastResult(null);
  }, []);

  const handleGameComplete = useCallback(() => {
    stopAmbient();
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
    stopAmbient();
  }, []);

  const handleRoomChange = useCallback((newRoom) => {
    const roomQuestions = questions.filter((q) => q.room === newRoom);
    if (roomQuestions.length > 0) {
      const firstRoomQuestionIdx = questions.indexOf(roomQuestions[0]);
      playFootsteps(2);
      playDoorCreak();
      setCurrentQuestionIdx(firstRoomQuestionIdx);
      setAnswered(false);
      setLastResult(null);
    }
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((s) => {
      const next = !s;
      setHorrorSoundEnabled(next);
      return next;
    });
  }, []);

  return (
    <div className="app-container">
      <HorrorOverlay glitchTrigger={glitchTrigger} />

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
          totalRooms={3}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

export default App;
