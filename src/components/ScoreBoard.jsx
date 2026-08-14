import { useEffect, useState } from "react";
import "../styles/ScoreBoard.css";

function ScoreBoard({ score }) {
  const [animClass, setAnimClass] = useState("");
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (score > displayScore) {
      setAnimClass("score-up");
    } else if (score < displayScore) {
      setAnimClass("score-down");
    }
    const diff = Math.abs(score - displayScore);
    const step = Math.max(1, Math.ceil(diff / 10));
    const t = setInterval(() => {
      setDisplayScore((prev) => {
        if (prev === score) {
          clearInterval(t);
          return prev;
        }
        if (prev < score) return Math.min(prev + step, score);
        return Math.max(prev - step, score);
      });
    }, 30);
    return () => {
      clearInterval(t);
      const t2 = setTimeout(() => setAnimClass(""), 400);
      return () => clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  return (
    <div className={`score-board ${animClass}`}>
      <span className="score-label">SCORE</span>
      <span className="score-value">{displayScore}</span>
    </div>
  );
}

export default ScoreBoard;
