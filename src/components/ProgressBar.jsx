import "../styles/ProgressBar.css";

function ProgressBar({ current, total }) {
  const pct = ((current) / total) * 100;

  return (
    <div className="progress-container">
      <span className="progress-label">
        ROOM {current + 1} / {total}
      </span>
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
