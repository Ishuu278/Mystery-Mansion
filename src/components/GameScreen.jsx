import QuestionPanel from "./QuestionPanel";
import AnswerCard from "./AnswerCard";
import ScoreBoard from "./ScoreBoard";
import ProgressBar from "./ProgressBar";
import FeedbackMessage from "./FeedbackMessage";
import "../styles/GameScreen.css";

function GameScreen({
  question,
  currentRoom,
  totalRooms,
  score,
  answered,
  lastResult,
  onAnswer,
  onRetry,
  transitioning,
  soundEnabled,
  onToggleSound,
}) {
  return (
    <div className={`game-screen ${transitioning ? "room-transition" : ""}`}>
      <div className="game-overlay" />
      <div className="flashlight-effect" />

      <div className="game-hud">
        <ProgressBar current={currentRoom} total={totalRooms} />
        <div className="hud-center">
          <button
            className="sound-toggle"
            onClick={onToggleSound}
            title={soundEnabled ? "Mute" : "Unmute"}
          >
            {soundEnabled ? "\u{1F50A}" : "\u{1F507}"}
          </button>
        </div>
        <ScoreBoard score={score} />
      </div>

      <div className="game-content">
        <QuestionPanel question={question.question} />

        <div className="answers-grid">
          {question.options.map((option) => (
            <AnswerCard
              key={option}
              text={option}
              correct={option === question.correct}
              answered={answered}
              lastResult={lastResult}
              onSelect={() => onAnswer(option)}
            />
          ))}
        </div>

        {answered && lastResult === "wrong" && (
          <FeedbackMessage type="wrong" onRetry={onRetry} />
        )}

        {answered && lastResult === "correct" && (
          <FeedbackMessage type="correct" />
        )}
      </div>
    </div>
  );
}

export default GameScreen;
