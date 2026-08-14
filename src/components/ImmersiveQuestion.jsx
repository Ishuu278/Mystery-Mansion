import { useEffect, useState } from "react";
import "../styles/ImmersiveQuestion.css";

function ImmersiveQuestion({ question, answered, lastResult, onAnswer, onRetry }) {
  const [visible, setVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setVisible(false);
    setSelectedOption(null);
    setShowHint(false);
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, [question]);

  const handleSelect = (option) => {
    if (answered) return;
    setSelectedOption(option);
    onAnswer(option);
  };

  return (
    <div className={`immersive-question ${visible ? "iq-visible" : ""} ${answered && lastResult === "correct" ? "iq-correct" : ""} ${answered && lastResult === "wrong" ? "iq-wrong" : ""}`}>
      <div className="iq-glow" />

      <div className="iq-inner">
        <div className="iq-header">
          <span className="iq-icon">&#128270;</span>
          <span className="iq-label">CLUE FOUND</span>
        </div>

        <p className="iq-text">{question.question}</p>

        <div className="iq-options">
          {question.options.map((option, idx) => (
            <button
              key={option}
              className={`iq-option ${
                answered && option === question.correct ? "iq-opt-correct" : ""
              } ${answered && selectedOption === option && option !== question.correct ? "iq-opt-wrong" : ""} ${answered && option !== question.correct && option !== selectedOption ? "iq-opt-dimmed" : ""}`}
              onClick={() => handleSelect(option)}
              disabled={answered}
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              <span className="iq-opt-letter">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="iq-opt-text">{option}</span>
            </button>
          ))}
        </div>

        {answered && lastResult === "wrong" && (
          <div className="iq-feedback iq-feedback-wrong">
            <span>&#129417; Hoo-hoo! Try Again!</span>
            <button className="iq-retry" onClick={onRetry}>
              TRY AGAIN
            </button>
          </div>
        )}

        {answered && lastResult === "correct" && (
          <div className="iq-feedback iq-feedback-correct">
            <span>&#10024; CORRECT! +100</span>
          </div>
        )}

        {!answered && question.hint && (
          <div className="iq-hint-area">
            {!showHint ? (
              <button className="iq-hint-btn" onClick={() => setShowHint(true)}>
                <span className="iq-hint-icon">&#128161;</span>
                <span>Need a Hint?</span>
              </button>
            ) : (
              <div className="iq-hint-revealed">
                <span className="iq-hint-icon">&#128161;</span>
                <span className="iq-hint-text">{question.hint}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ImmersiveQuestion;
