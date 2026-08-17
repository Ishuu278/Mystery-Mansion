import { useEffect, useState, useRef, useCallback } from "react";
import { playUIClick, playCorrect, playWrong } from "../utils/horrorSounds";
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

function OptionCard({ option, index, revealed, isWrongThis, isCorrectThis, isDimmed, onSelect, locked }) {
  const [appeared, setAppeared] = useState(false);

  useEffect(() => {
    setAppeared(false);
    const t = setTimeout(() => setAppeared(true), 200 + index * 150);
    return () => clearTimeout(t);
  }, [index, option.text]);

  const cardClass = [
    "kid-option",
    appeared && "kid-option-appeared",
    isWrongThis && "kid-option-wrong",
    isCorrectThis && "kid-option-correct",
    isDimmed && "kid-option-dimmed",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={cardClass}
      onClick={() => {
        if (locked) return;
        playUIClick();
        onSelect(option);
      }}
      disabled={locked && !isWrongThis}
      aria-label={option.text}
    >
      <span className="kid-option-emoji">{option.emoji}</span>
      <span className="kid-option-text">{option.text}</span>
      {isCorrectThis && <span className="kid-option-badge">&#x2714;</span>}
      {isWrongThis && <span className="kid-option-badge kid-badge-wrong">&#x2718;</span>}
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

  // Auto-read the question aloud on first show
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
        setLocked(false);
        onRetry();
      }
    },
    [locked, question, onAnswer, onRetry]
  );

  const handleReadAloud = () => {
    playUIClick();
    speakText(question.question);
  };

  return (
    <div className="kid-overlay">
      {/* Question banner */}
      <div className="kid-question-area">
        <button className="kid-read-btn" onClick={handleReadAloud} title="Read the question aloud">
          <span className="kid-read-icon">&#x1F50A;</span>
          <span className="kid-read-label">Read Aloud</span>
        </button>
        <div className="kid-question-box">
          <p className="kid-question-text">{question.question}</p>
        </div>
      </div>

      {/* 3 options side by side */}
      <div className="kid-options-row">
        {question.options.map((option, idx) => (
          <OptionCard
            key={`${question.id}-${idx}`}
            option={option}
            index={idx}
            revealed={!answered}
            isWrongThis={selectedIdx === idx && lastResult === "wrong"}
            isCorrectThis={showSuccess && selectedIdx === idx}
            isDimmed={showSuccess && selectedIdx !== idx}
            onSelect={handleSelect}
            locked={locked}
          />
        ))}
      </div>

      {/* Success celebration */}
      {showSuccess && (
        <div className="kid-success-overlay">
          <div className="kid-success-stars">
            <span className="kid-star kid-star-1">&#x2B50;</span>
            <span className="kid-star kid-star-2">&#x2B50;</span>
            <span className="kid-star kid-star-3">&#x2B50;</span>
          </div>
          <div className="kid-success-text">Great Job!</div>
        </div>
      )}

      {/* Wrong feedback */}
      {answered && lastResult === "wrong" && !showSuccess && (
        <div className="kid-wrong-banner">
          <span>Try again!</span>
        </div>
      )}
    </div>
  );
}
