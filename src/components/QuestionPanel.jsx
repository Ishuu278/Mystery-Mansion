import { useEffect, useState } from "react";
import "../styles/QuestionPanel.css";

function QuestionPanel({ question }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [question]);

  return (
    <div className={`question-panel ${visible ? "question-visible" : ""}`}>
      <div className="question-icon">&#128218;</div>
      <p className="question-text">{question}</p>
    </div>
  );
}

export default QuestionPanel;
