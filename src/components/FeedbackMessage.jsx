import "../styles/FeedbackMessage.css";

function FeedbackMessage({ type, onRetry }) {
  if (type === "correct") {
    return (
      <div className="feedback-message feedback-correct">
        <span className="feedback-icon">&#10004;</span>
        <span className="feedback-text">CORRECT! +100</span>
      </div>
    );
  }

  return (
    <div className="feedback-message feedback-wrong">
      <span className="feedback-icon">&#129417;</span>
      <span className="feedback-text">Oops! Try Again!</span>
      <button className="retry-button" onClick={onRetry}>
        TRY AGAIN
      </button>
    </div>
  );
}

export default FeedbackMessage;
