import { useState } from "react";
import { playUIClick } from "../utils/horrorSounds";
import "../styles/StartScreen.css";

function StartScreen({ onStart }) {
  const [exiting, setExiting] = useState(false);

  const handleEnter = () => {
    playUIClick();
    setExiting(true);
    setTimeout(onStart, 800);
  };

  return (
    <div className={`start-screen ${exiting ? "start-exit" : ""}`}>
      <div className="start-bg">
        <img src="/assets/room1.png" alt="" draggable={false} />
      </div>
      <div className="start-darkness" />
      <div className="start-fog start-fog-1" />
      <div className="start-fog start-fog-2" />

      <div className="start-content">
        <div className="start-icon">&#128123;</div>
        <h1 className="start-title">HAUNTED MYSTERY</h1>
        <p className="start-subtitle">
          Explore the Mansion. Solve the Mystery.
        </p>
        <div className="start-instructions">
          <p>Use your mouse to look around with the flashlight</p>
          <p>Find hidden clues and solve the puzzles</p>
        </div>
        <button className="start-button" onClick={handleEnter}>
          <span className="button-glow" />
          ENTER THE MANSION
        </button>
      </div>

      <div className="start-vignette" />
    </div>
  );
}

export default StartScreen;
