import "../styles/AnswerCard.css";

function AnswerCard({ text, correct, answered, lastResult, onSelect }) {
  const getCardClass = () => {
    if (!answered) return "";
    if (correct && (lastResult === "correct" || lastResult === "wrong")) {
      return "card-correct";
    }
    if (!correct && lastResult === "wrong") {
      return "card-wrong";
    }
    return "card-dimmed";
  };

  return (
    <button
      className={`answer-card ${getCardClass()}`}
      onClick={onSelect}
      disabled={answered}
    >
      <div className="card-inner">
        <span className="card-text">{text}</span>
      </div>
    </button>
  );
}

export default AnswerCard;
