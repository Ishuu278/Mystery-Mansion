import { useEffect, useState } from "react";
import "../styles/GhostEffect.css";

function GhostEffect() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = () => {
      setVisible(true);
      setTimeout(() => setVisible(false), 4000);
    };

    const interval = setInterval(() => {
      if (Math.random() < 0.3) show();
    }, 8000);

    const first = setTimeout(show, 5000);
    return () => {
      clearInterval(interval);
      clearTimeout(first);
    };
  }, []);

  return (
    <div className={`ghost-container ${visible ? "ghost-visible" : ""}`}>
      <div className="ghost-body" />
      <div className="ghost-eyes">
        <div className="ghost-eye" />
        <div className="ghost-eye" />
      </div>
    </div>
  );
}

export default GhostEffect;
