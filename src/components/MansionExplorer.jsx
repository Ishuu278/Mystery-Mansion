import { useState, useEffect, useRef, useCallback } from "react";
import GunFlashlight from "./GunFlashlight";
import ImmersiveQuestion from "./ImmersiveQuestion";
import ScoreBoard from "./ScoreBoard";
import Particles from "./Particles";
import GhostEffect from "./GhostEffect";
import { playUIClick, playFootsteps, playDoorCreak, playTorchFlicker } from "../utils/horrorSounds";
import "../styles/MansionExplorer.css";

const HINTS = [
  "Use WASD or Arrow keys to move around the room.",
  "Move your mouse to look around with the flashlight.",
  "Find the glowing clue cards and click the correct answer!",
  "Scroll wheel to zoom in and out.",
  "Answer correctly to progress deeper into the mansion!",
];

const ROOMS = [
  { bg: "/assets/room1.png", fogColor: "rgba(60, 30, 20, 0.12)", name: "ENTRANCE HALL" },
  { bg: "/assets/room2.png", fogColor: "rgba(40, 25, 35, 0.15)", name: "DARK CORRIDOR" },
  { bg: "/assets/room3.png", fogColor: "rgba(30, 15, 15, 0.18)", name: "FORGOTTEN CHAMBER" },
];

function MansionExplorer({
  questions,
  score,
  currentQuestionIdx,
  answered,
  lastResult,
  onAnswer,
  onRetry,
  onAdvanceRoom,
  soundEnabled,
  onToggleSound,
  onGameComplete,
  onRoomChange,
}) {
  const containerRef = useRef(null);
  const bgFarRef = useRef(null);
  const bgMidRef = useRef(null);
  const flashlightRef = useRef(null);
  const gunRef = useRef(null);
  const bgAudioRef = useRef(null);
  const heartbeatRef = useRef(null);
  const chainsRef = useRef(null);
  const musicBoxRef = useRef(null);
  const screamRef = useRef(null);

  const mouseRaw = useRef({ x: 0.5, y: 0.5 });
  const mouseSmooth = useRef({ x: 0.5, y: 0.5 });
  const zoomCurrent = useRef(1);
  const zoomTarget = useRef(1);
  const rafId = useRef(null);

  const moveKeys = useRef({ left: false, right: false, up: false, down: false });
  const movePos = useRef({ x: 0, y: 0 });
  const moveSmooth = useRef({ x: 0, y: 0 });
  const moveSpeed = 0.02;

  const swipeThreshold = 50;

  const [transitioning, setTransitioning] = useState(false);
  const [transitionType, setTransitionType] = useState(null);
  const [flashlightOn, setFlashlightOn] = useState(true);
  const [flashlightCrush, setFlashlightCrush] = useState(null);
  const [screenShake, setScreenShake] = useState(false);
  const [roomFog, setRoomFog] = useState(0);
  const [mobileDir, setMobileDir] = useState(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [hintIdx, setHintIdx] = useState(0);
  const [roomMessage, setRoomMessage] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [walkingTransition, setWalkingTransition] = useState(false);
  const [showClues, setShowClues] = useState(false);

  const currentRoomQuestion = questions[currentQuestionIdx] || null;

  // Sync currentRoom from question
  useEffect(() => {
    if (currentRoomQuestion && currentRoomQuestion.room !== currentRoom) {
      setCurrentRoom(currentRoomQuestion.room);
    }
  }, [currentRoomQuestion?.id]);

  // Show question after room transition
  useEffect(() => {
    if (!transitioning && currentRoomQuestion) {
      const t = setTimeout(() => setShowClues(true), 300);
      return () => clearTimeout(t);
    }
    setShowClues(false);
  }, [transitioning, currentRoomQuestion?.id]);

  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRaw.current.x = (e.clientX - rect.left) / rect.width;
    mouseRaw.current.y = (e.clientY - rect.top) / rect.height;
  }, []);

  const handleTouchMove = useCallback((e) => {
    const touch = e.touches[0];
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || !touch) return;
    mouseRaw.current.x = (touch.clientX - rect.left) / rect.width;
    mouseRaw.current.y = (touch.clientY - rect.top) / rect.height;
  }, []);

  const navigateRoom = useCallback((direction) => {
    if (transitioning) return;
    const newRoom = currentRoom + direction;
    if (newRoom < 0 || newRoom >= ROOMS.length) return;

    playFootsteps(3);
    setTransitioning(true);
    setShowClues(false);
    setTransitionType(direction > 0 ? "forward" : "backward");
    setSwipeDirection(direction > 0 ? "right" : "left");
    setWalkingTransition(true);

    setTimeout(() => {
      playDoorCreak();
      setCurrentRoom(newRoom);
      if (onRoomChange) onRoomChange(newRoom);
      setTransitioning(false);
      setTransitionType(null);
      setSwipeDirection(null);
      setWalkingTransition(false);

      setRoomMessage(`ROOM ${newRoom + 1}`);
      setTimeout(() => setRoomMessage(null), 2000);
    }, 1200);
  }, [currentRoom, transitioning, onRoomChange]);

  const navigateRoomRef = useRef(navigateRoom);
  navigateRoomRef.current = navigateRoom;
  const transitioningRef = useRef(transitioning);
  transitioningRef.current = transitioning;
  const showCluesRef = useRef(showClues);
  showCluesRef.current = showClues;

  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let active = false;

    const onTouchStart = (e) => {
      if (transitioningRef.current) return;
      const touch = e.touches[0];
      if (!touch) return;
      startX = touch.clientX;
      startY = touch.clientY;
      active = true;
    };

    const onTouchMove = (e) => {
      if (!active || transitioningRef.current) return;
      const touch = e.touches[0];
      if (!touch) return;
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > swipeThreshold) {
        active = false;
        navigateRoomRef.current(dx > 0 ? 1 : -1);
      }
    };

    const onTouchEnd = () => { active = false; };

    const onMouseDown = (e) => {
      if (transitioningRef.current) return;
      startX = e.clientX;
      startY = e.clientY;
      active = true;
    };

    const onMouseUp = (e) => {
      if (!active || transitioningRef.current) return;
      active = false;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > swipeThreshold) {
        navigateRoomRef.current(dx > 0 ? 1 : -1);
      }
    };

    window.addEventListener("touchstart", onTouchStart, { capture: true, passive: true });
    window.addEventListener("touchmove", onTouchMove, { capture: true, passive: true });
    window.addEventListener("touchend", onTouchEnd, { capture: true, passive: true });
    window.addEventListener("mousedown", onMouseDown, { capture: true });
    window.addEventListener("mouseup", onMouseUp, { capture: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart, { capture: true });
      window.removeEventListener("touchmove", onTouchMove, { capture: true });
      window.removeEventListener("touchend", onTouchEnd, { capture: true });
      window.removeEventListener("mousedown", onMouseDown, { capture: true });
      window.removeEventListener("mouseup", onMouseUp, { capture: true });
    };
  }, []);

  useEffect(() => {
    let lastTime = performance.now();

    const animate = (time) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const speed = 1 - Math.pow(0.0001, dt);
      mouseSmooth.current.x += (mouseRaw.current.x - mouseSmooth.current.x) * speed;
      mouseSmooth.current.y += (mouseRaw.current.y - mouseSmooth.current.y) * speed;

      const zoomSpeed = 1 - Math.pow(0.001, dt);
      zoomCurrent.current += (zoomTarget.current - zoomCurrent.current) * zoomSpeed * 0.5;

      let moveInputX = 0;
      let moveInputY = 0;
      if (moveKeys.current.left) moveInputX -= 1;
      if (moveKeys.current.right) moveInputX += 1;
      if (moveKeys.current.up) moveInputY -= 1;
      if (moveKeys.current.down) moveInputY += 1;

      if (mobileDir) {
        if (mobileDir === "left") moveInputX -= 1;
        if (mobileDir === "right") moveInputX += 1;
        if (mobileDir === "up") moveInputY -= 1;
        if (mobileDir === "down") moveInputY += 1;
      }

      const moveSmoothSpeed = 1 - Math.pow(0.00001, dt);
      moveSmooth.current.x += (moveInputX - moveSmooth.current.x) * moveSmoothSpeed;
      moveSmooth.current.y += (moveInputY - moveSmooth.current.y) * moveSmoothSpeed;

      movePos.current.x += moveSmooth.current.x * moveSpeed;
      movePos.current.y += moveSmooth.current.y * moveSpeed;

      movePos.current.x = Math.max(-1, Math.min(1, movePos.current.x));
      movePos.current.y = Math.max(-1, Math.min(1, movePos.current.y));

      const mx = mouseSmooth.current.x;
      const my = mouseSmooth.current.y;
      const zoom = zoomCurrent.current;
      const camX = movePos.current.x;
      const camY = movePos.current.y;

      const bgOffsetX = (mx - 0.5) * -80 + camX * 150;
      const bgOffsetY = (my - 0.5) * -50 + camY * 100;

      const midOffsetX = (mx - 0.5) * -40 + camX * 75;
      const midOffsetY = (my - 0.5) * -25 + camY * 50;

      if (bgFarRef.current) {
        bgFarRef.current.style.transform = `translate(${bgOffsetX}px, ${bgOffsetY}px) scale(${zoom})`;
      }
      if (bgMidRef.current) {
        bgMidRef.current.style.transform = `translate(${midOffsetX}px, ${midOffsetY}px) scale(${zoom * 1.02})`;
      }

      if (flashlightRef.current) {
        flashlightRef.current.style.left = `${mx * 100}%`;
        flashlightRef.current.style.top = `${my * 100}%`;
      }

      if (gunRef.current) {
        const tiltX = (mx - 0.5) * 20;
        const tiltY = (my - 0.5) * 10;
        const bobX = (mx - 0.5) * 10;
        const bobY = Math.abs(my - 0.5) * -6;
        gunRef.current.style.transform = `translateX(calc(-50% + ${bobX}px)) translateY(${bobY}px) rotate(${tiltX}deg) perspective(400px) rotateY(${tiltX * 0.5}deg) rotateX(${-tiltY * 0.3}deg)`;
      }

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [mobileDir]);

  useEffect(() => {
    if (lastResult === "wrong") {
      setScreenShake(true);
      const t = setTimeout(() => setScreenShake(false), 400);
      return () => clearTimeout(t);
    }
  }, [lastResult]);

  useEffect(() => {
    if (lastResult !== "correct") return;
    const t = setTimeout(() => {
      setWalkingTransition(true);
      setShowClues(false);
      playFootsteps(4);
      setTransitioning(true);
      setTransitionType("forward");
      setTimeout(() => {
        playDoorCreak();
        if (currentQuestionIdx + 1 >= questions.length) {
          onGameComplete();
        } else {
          onAdvanceRoom();
        }
        setTransitioning(false);
        setTransitionType(null);
        setWalkingTransition(false);
      }, 1200);
    }, 1400);
    return () => clearTimeout(t);
  }, [lastResult, currentQuestionIdx, questions.length, onAdvanceRoom, onGameComplete]);

  useEffect(() => {
    setRoomFog(0);
    const t = setTimeout(() => setRoomFog(1), 300);
    return () => clearTimeout(t);
  }, [currentRoom]);

  useEffect(() => {
    setRoomMessage(`ROOM ${currentRoom + 1}`);
    const t = setTimeout(() => setRoomMessage(null), 2000);
    return () => clearTimeout(t);
  }, [currentRoom]);

  // Play/pause horror background audio
  useEffect(() => {
    const audios = [bgAudioRef, heartbeatRef, chainsRef, musicBoxRef];
    audios.forEach((ref, i) => {
      const audio = ref.current;
      if (!audio) return;
      audio.volume = [0.5, 0.35, 0.15, 0.12][i];
      audio.play().catch(() => {});
    });
  }, []);

  useEffect(() => {
    const audios = [bgAudioRef, heartbeatRef, chainsRef, musicBoxRef];
    audios.forEach((ref) => {
      const audio = ref.current;
      if (!audio) return;
      if (soundEnabled) {
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    });
  }, [soundEnabled]);

  useEffect(() => {
    const handleWheel = (e) => {
      if (transitioning) return;
      e.preventDefault();
      zoomTarget.current = Math.max(0.85, Math.min(1.3, zoomTarget.current + e.deltaY * -0.001));
    };
    const el = containerRef.current;
    if (el) el.addEventListener("wheel", handleWheel, { passive: false });
    return () => { if (el) el.removeEventListener("wheel", handleWheel); };
  }, [transitioning]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (transitioning) return;
      switch (e.key.toLowerCase()) {
        case "a": case "arrowleft": moveKeys.current.left = true; break;
        case "d": case "arrowright": moveKeys.current.right = true; break;
        case "w": case "arrowup": moveKeys.current.up = true; break;
        case "s": case "arrowdown": moveKeys.current.down = true; break;
      }
    };
    const handleKeyUp = (e) => {
      switch (e.key.toLowerCase()) {
        case "a": case "arrowleft": moveKeys.current.left = false; break;
        case "d": case "arrowright": moveKeys.current.right = false; break;
        case "w": case "arrowup": moveKeys.current.up = false; break;
        case "s": case "arrowdown": moveKeys.current.down = false; break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [transitioning]);

  const handleMobileMoveStart = useCallback((dir) => { setMobileDir(dir); }, []);
  const handleMobileMoveEnd = useCallback(() => { setMobileDir(null); }, []);

  const roomDepth = ["ENTRANCE HALL", "DARK CORRIDOR", "FORGOTTEN CHAMBER"];

  return (
    <div
      ref={containerRef}
      className={`mansion-explorer ${transitioning ? "me-transitioning" : ""} ${screenShake ? "me-shake" : ""} ${transitionType === "forward" ? "me-transition-forward" : ""} ${transitionType === "backward" ? "me-transition-backward" : ""} ${swipeDirection === "right" ? "me-swipe-right" : ""} ${swipeDirection === "left" ? "me-swipe-left" : ""} ${walkingTransition ? "me-walking" : ""}`}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      <Particles />
      <GhostEffect />

      {/* Background layers */}
      <div className="me-bg-layer me-bg-far" ref={bgFarRef}>
        <video
          src="/assets/bg.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="me-room-video"
        />
      </div>

      <div className="me-bg-layer me-bg-mid" ref={bgMidRef}>
        <div className="me-fog-overlay" style={{ background: ROOMS[currentRoom].fogColor }} />
      </div>

      {/* Dark overlay */}
      <div className="me-darkness" />

      {/* Ambient glow for base room visibility */}
      <div className="me-ambient-glow" />

      {/* Vignette */}
      <div className="me-vignette" />

      {/* Flashlight beam */}
      {flashlightOn && (
        <div className="me-flashlight-beam" ref={flashlightRef}>
          <div className="me-beam-core" />
          <div className="me-beam-glow" />
          <div className="me-beam-outer" />
        </div>
      )}

      {/* Room transition message */}
      {roomMessage && (
        <div className="me-room-message">
          <span>{roomMessage}</span>
          <span className="me-room-submessage">{roomDepth[currentRoom]}</span>
        </div>
      )}

      {/* Kid question overlay */}
      {showClues && currentRoomQuestion && (
        <ImmersiveQuestion
          question={currentRoomQuestion}
          answered={answered}
          lastResult={lastResult}
          onAnswer={onAnswer}
          onRetry={onRetry}
        />
      )}

      {/* Walking transition overlay */}
      {walkingTransition && (
        <div className="me-walking-overlay">
          <div className="me-walking-darkness" />
        </div>
      )}

      {/* HUD */}
      <div className="me-hud">
        <div className="me-hud-left">
          <span className="me-room-label">
            ROOM {currentRoom + 1} / {ROOMS.length}
          </span>
          <div className="me-room-dots">
            {ROOMS.map((_, r) => (
              <div key={r} className={`me-room-dot ${r === currentRoom ? "me-dot-active" : ""}`} />
            ))}
          </div>
        </div>
        <div className="me-hud-center">
          <button
            className="me-sound-btn"
            onClick={onToggleSound}
            title={soundEnabled ? "Mute" : "Unmute"}
          >
            {soundEnabled ? "\u{1F50A}" : "\u{1F507}"}
          </button>
          <button
            className={`me-flashlight-btn ${flashlightCrush === "on" ? "me-crush-on" : ""} ${flashlightCrush === "off" ? "me-crush-off" : ""}`}
            onClick={() => {
              const turningOn = !flashlightOn;
              setFlashlightOn(turningOn);
              setFlashlightCrush(turningOn ? "on" : "off");
              playUIClick();
              setTimeout(() => setFlashlightCrush(null), 400);
            }}
            title={flashlightOn ? "Turn off flashlight" : "Turn on flashlight"}
          >
            {flashlightOn ? "\u{1F4A1}" : "\u{1F576}\uFE0F"}
          </button>
        </div>
        <div className="me-hud-right">
          <button
            className="me-hint-btn"
            onClick={() => {
              setHintIdx((i) => (i + 1) % HINTS.length);
              setHintOpen((o) => !o);
              playUIClick();
            }}
            title="Hints"
          >
            &#x2753;
          </button>
          <ScoreBoard score={score} />
        </div>
      </div>

      {/* Scroll hint */}
      <div className="me-scroll-hint">
        <span>WASD / ARROWS TO MOVE &#8226; MOUSE TO LOOK &#8226; FIND THE ANSWER IN THE ROOM</span>
      </div>

      {/* Mobile touch navigation zones */}
      {!showClues && (
        <div className="me-mobile-nav">
          <button className="me-mobile-zone me-mobile-left"
            onTouchStart={() => handleMobileMoveStart("left")} onTouchEnd={handleMobileMoveEnd}
            onMouseDown={() => handleMobileMoveStart("left")} onMouseUp={handleMobileMoveEnd} onMouseLeave={handleMobileMoveEnd}
            aria-label="Move left">
            <span className="me-mobile-arrow">&#9664;</span>
          </button>
          <button className="me-mobile-zone me-mobile-right"
            onTouchStart={() => handleMobileMoveStart("right")} onTouchEnd={handleMobileMoveEnd}
            onMouseDown={() => handleMobileMoveStart("right")} onMouseUp={handleMobileMoveEnd} onMouseLeave={handleMobileMoveEnd}
            aria-label="Move right">
            <span className="me-mobile-arrow">&#9654;</span>
          </button>
          <button className="me-mobile-zone me-mobile-up"
            onTouchStart={() => handleMobileMoveStart("up")} onTouchEnd={handleMobileMoveEnd}
            onMouseDown={() => handleMobileMoveStart("up")} onMouseUp={handleMobileMoveEnd} onMouseLeave={handleMobileMoveEnd}
            aria-label="Move forward">
            <span className="me-mobile-arrow">&#9650;</span>
          </button>
          <button className="me-mobile-zone me-mobile-down"
            onTouchStart={() => handleMobileMoveStart("down")} onTouchEnd={handleMobileMoveEnd}
            onMouseDown={() => handleMobileMoveStart("down")} onMouseUp={handleMobileMoveEnd} onMouseLeave={handleMobileMoveEnd}
            aria-label="Move backward">
            <span className="me-mobile-arrow">&#9660;</span>
          </button>
        </div>
      )}

      {/* Hint tooltip */}
      {hintOpen && (
        <div className="me-hint-tooltip">
          <span className="me-hint-tooltip-icon">&#x1F4A1;</span>
          <span>{HINTS[hintIdx]}</span>
        </div>
      )}

      {/* Swipe edge indicators */}
      {!transitioning && !showClues && (
        <>
          {currentRoom > 0 && (
            <div className="me-swipe-edge me-swipe-left-edge">
              <span className="me-swipe-arrow">&#9664;</span>
              <span className="me-swipe-text">SWIPE</span>
            </div>
          )}
          {currentRoom < ROOMS.length - 1 && (
            <div className="me-swipe-edge me-swipe-right-edge">
              <span className="me-swipe-arrow">&#9654;</span>
              <span className="me-swipe-text">SWIPE</span>
            </div>
          )}
        </>
      )}

      {/* Gun / Flashlight at bottom */}
      <GunFlashlight ref={gunRef} />

      {/* Horror background audio layers */}
      <audio ref={bgAudioRef} src="/assets/horror-ambient.wav" loop preload="auto" />
      <audio ref={heartbeatRef} src="/assets/heartbeat.wav" loop preload="auto" />
      <audio ref={chainsRef} src="/assets/chains.wav" loop preload="auto" />
      <audio ref={musicBoxRef} src="/assets/creepy-music-box.wav" loop preload="auto" />
      <audio ref={screamRef} src="/assets/scream.wav" preload="auto" />

      {/* Transition overlay */}
      {transitioning && <div className="me-transition-overlay" />}

      {/* Room fog bottom */}
      <div className="me-room-fog" style={{ opacity: roomFog }} />
    </div>
  );
}

export default MansionExplorer;
