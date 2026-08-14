import "../styles/GameComplete.css";

function GameComplete({ score, correctCount, wrongCount, totalRooms, onRestart }) {
  return (
    <div className="complete-screen">
      <div className="complete-bg">
        <img src="/assets/room3.png" alt="" draggable={false} />
      </div>
      <div className="complete-darkness" />
      <div className="complete-fog complete-fog-1" />
      <div className="complete-fog complete-fog-2" />

      <div className="complete-content">
        <div className="complete-icon">&#128123;</div>
        <h1 className="complete-title">MYSTERY SOLVED!</h1>
        <div className="complete-stats">
          <div className="stat-row">
            <span className="stat-label">Final Score</span>
            <span className="stat-value score-final">{score}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Correct Answers</span>
            <span className="stat-value stat-correct">{correctCount}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Wrong Answers</span>
            <span className="stat-value stat-wrong">{wrongCount}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Rooms Explored</span>
            <span className="stat-value">{totalRooms}</span>
          </div>
        </div>
        <button className="play-again-button" onClick={onRestart}>
          <span className="button-glow" />
          EXPLORE AGAIN
        </button>
      </div>

      <div className="complete-vignette" />
    </div>
  );
}

export default GameComplete;
