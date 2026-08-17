import { useEffect, useState, useRef, useCallback } from "react";
import { playUIClick, playCorrect, playWrong, playScream } from "../utils/horrorSounds";
import "../styles/ImmersiveQuestion.css";

function speakText(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.85;
  u.pitch = 1.1;
  window.speechSynthesis.speak(u);
}

// Fixed positions for 3 options scattered around the room
const OPTION_POSITIONS = [
  { left: "12%", top: "42%" },
  { left: "46%", top: "52%" },
  { left: "80%", top: "40%" },
];

function OptionCard({ option, index, isWrongThis, isCorrectThis, isDimmed, onSelect, locked }) {
  const [appeared, setAppeared] = useState(false);
  const pos = OPTION_POSITIONS[index] || OPTION_POSITIONS[0];

  useEffect(() => {
    setAppeared(false);
    const t = setTimeout(() => setAppeared(true), 300 + index * 200);
    return () => clearTimeout(t);
  }, [index, option.text]);

  const cardClass = [
    "room-option",
    appeared && "room-option-appeared",
    isWrongThis && "room-option-wrong",
    isCorrectThis && "room-option-correct",
    isDimmed && "room-option-dimmed",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={cardClass}
      style={{ left: pos.left, top: pos.top }}
      onClick={() => {
        if (locked) return;
        playUIClick();
        onSelect(option);
      }}
      disabled={locked && !isWrongThis}
      aria-label={option.text}
    >
      <span className="room-option-glow" />
      <span className="room-option-emoji">{option.emoji}</span>
      <span className="room-option-text">{option.text}</span>
      {isCorrectThis && <span className="room-option-badge">&#x2714;</span>}
      {isWrongThis && <span className="room-option-badge room-badge-wrong">&#x2718;</span>}
    </button>
  );
}

export default function ImmersiveQuestion({ question, answered, lastResult, onAnswer, onRetry }) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [locked, setLocked] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const autoReadRef = useRef(false);

  useEffect(() => {
    setSelectedIdx(null);
    setLocked(false);
    setShowSuccess(false);
    autoReadRef.current = false;
  }, [question.id]);

  useEffect(() => {
    if (!autoReadRef.current && question) {
      autoReadRef.current = true;
      const t = setTimeout(() => speakText(question.question), 600);
      return () => clearTimeout(t);
    }
  }, [question]);

  const handleSelect = useCallback(
    (option) => {
      if (locked) return;
      const idx = question.options.findIndex((o) => o.text === option.text);
      setSelectedIdx(idx);

      if (option.isCorrect) {
        setLocked(true);
        playCorrect();
        setShowSuccess(true);
        speakText("Correct! Well done!");
        setTimeout(() => {
          onAnswer(option);
        }, 1500);
      } else {
        playWrong();
        playScream();
        setLocked(false);
        onRetry();
      }
    },
    [locked, question, onAnswer, onRetry]
  );

  const handleReadAloud = (e) => {
    e.stopPropagation();
    playUIClick();
    speakText(question.question);
  };

  return (
    <>
      {/* Question banner — fixed at top, pointer-events on so player can read/click Read Aloud */}
      <div className="room-question-banner">
        <button className="room-read-btn" onClick={handleReadAloud} title="Read the question aloud">
          <span className="room-read-icon">&#x1F50A;</span>
          <span className="room-read-label">Read Aloud</span>
        </button>
        <div className="room-question-box">
          <p className="room-question-text">{question.question}</p>
        </div>
      </div>

      {/* Answer options — scattered inside the room at different positions */}
      {question.options.map((option, idx) => (
        <OptionCard
          key={`${question.id}-${idx}`}
          option={option}
          index={idx}
          isWrongThis={selectedIdx === idx && lastResult === "wrong"}
          isCorrectThis={showSuccess && selectedIdx === idx}
          isDimmed={showSuccess && selectedIdx !== idx}
          onSelect={handleSelect}
          locked={locked}
        />
      ))}

      {/* Success celebration */}
      {showSuccess && (
        <div className="room-success-overlay">
          <div className="room-success-stars">
            <span className="room-star room-star-1">&#x2B50;</span>
            <span className="room-star room-star-2">&#x2B50;</span>
            <span className="room-star room-star-3">&#x2B50;</span>
          </div>
          <div className="room-success-text">Great Job!</div>
        </div>
      )}

      {/* Wrong feedback */}
      {answered && lastResult === "wrong" && !showSuccess && (
        <div className="room-wrong-banner">
          <span>Try again!</span>
        </div>
      )}
    </>
  );
}
