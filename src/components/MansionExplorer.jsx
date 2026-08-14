import { useState, useEffect, useRef, useCallback } from "react";
import GunFlashlight from "./GunFlashlight";
import ImmersiveQuestion from "./ImmersiveQuestion";
import ScoreBoard from "./ScoreBoard";
import "../styles/MansionExplorer.css";

const HINTS = [
  "Use WASD or Arrow keys to move around the room.",
  "Move your mouse to look around with the flashlight.",
  "Get close to the glowing dot and click INVESTIGATE to answer.",
  "Scroll wheel to zoom in and out.",
  "Answer correctly to progress to the next room!",
];

const ROOMS = [
  { bg: "/assets/room1.png", fogColor: "rgba(80, 60, 120, 0.08)" },
  { bg: "/assets/room2.png", fogColor: "rgba(60, 80, 120, 0.08)" },
  { bg: "/assets/room3.png", fogColor: "rgba(100, 60, 80, 0.08)" },
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
  const investigateRef = useRef(null);
  const hintDotRef = useRef(null);
  const hintPulseRef = useRef(null);
  const directionArrowRef = useRef(null);

  const mouseRaw = useRef({ x: 0.5, y: 0.5 });
  const mouseSmooth = useRef({ x: 0.5, y: 0.5 });
  const zoomCurrent = useRef(1);
  const zoomTarget = useRef(1);
  const rafId = useRef(null);

  // Navigation state - separate from flashlight
  const moveKeys = useRef({ left: false, right: false, up: false, down: false });
  const movePos = useRef({ x: 0, y: 0 }); // -1 to 1 range
  const moveSmooth = useRef({ x: 0, y: 0 });
  const moveSpeed = 0.02; // Movement speed per frame

  const swipeThreshold = 50; // Minimum swipe distance in pixels

  const [transitioning, setTransitioning] = useState(false);
  const [transitionType, setTransitionType] = useState(null);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [flashlightOn, setFlashlightOn] = useState(true);
  const [flashlightCrush, setFlashlightCrush] = useState(null);
  const [screenShake, setScreenShake] = useState(false);
  const [roomFog, setRoomFog] = useState(0);
  const [mobileDir, setMobileDir] = useState(null); // For mobile touch zones
  const [hintOpen, setHintOpen] = useState(false);
  const [hintIdx, setHintIdx] = useState(0);
  const [roomMessage, setRoomMessage] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null);

  // Find the current question in the current room for hotspot display
  const currentRoomQuestion = questions.find(
    (q) => q.room === currentRoom && !answered
  );

  // Store question position in ref for the animation loop
  const questionPosRef = useRef(null);
  useEffect(() => {
    if (currentRoomQuestion) {
      questionPosRef.current = currentRoomQuestion.position;
    } else {
      questionPosRef.current = null;
    }
  }, [currentRoomQuestion]);

  // Mouse/touch tracking
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

  // Room navigation function
  const navigateRoom = useCallback((direction) => {
    if (transitioning) return;

    const newRoom = currentRoom + direction;
    if (newRoom < 0 || newRoom >= ROOMS.length) return;

    setTransitioning(true);
    setTransitionType(direction > 0 ? "forward" : "backward");
    setSwipeDirection(direction > 0 ? "right" : "left");

    setTimeout(() => {
      setCurrentRoom(newRoom);
      if (onRoomChange) onRoomChange(newRoom);
      setTransitioning(false);
      setTransitionType(null);
      setSwipeDirection(null);

      setRoomMessage(`ROOM ${newRoom + 1}`);
      setTimeout(() => setRoomMessage(null), 2000);
    }, 1200);
  }, [currentRoom, transitioning, onRoomChange]);

  // Stable refs for swipe handlers (never go stale)
  const navigateRoomRef = useRef(navigateRoom);
  navigateRoomRef.current = navigateRoom;
  const transitioningRef = useRef(transitioning);
  transitioningRef.current = transitioning;
  const activeQuestionRef = useRef(activeQuestion);
  activeQuestionRef.current = activeQuestion;

  // Swipe detection via window capture (bypasses all z-index / pointer-events issues)
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let active = false;

    const onTouchStart = (e) => {
      if (transitioningRef.current || activeQuestionRef.current) return;
      const touch = e.touches[0];
      if (!touch) return;
      startX = touch.clientX;
      startY = touch.clientY;
      active = true;
    };

    const onTouchMove = (e) => {
      if (!active || transitioningRef.current || activeQuestionRef.current) return;
      const touch = e.touches[0];
      if (!touch) return;
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > swipeThreshold) {
        active = false;
        navigateRoomRef.current(dx > 0 ? 1 : -1);
      }
    };

    const onTouchEnd = () => {
      active = false;
    };

    const onMouseDown = (e) => {
      if (transitioningRef.current || activeQuestionRef.current) return;
      startX = e.clientX;
      startY = e.clientY;
      active = true;
    };

    const onMouseUp = (e) => {
      if (!active || transitioningRef.current || activeQuestionRef.current) return;
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

      // Smooth interpolation - fast follow for mouse (flashlight)
      const speed = 1 - Math.pow(0.0001, dt);
      mouseSmooth.current.x += (mouseRaw.current.x - mouseSmooth.current.x) * speed;
      mouseSmooth.current.y += (mouseRaw.current.y - mouseSmooth.current.y) * speed;

      // Zoom interpolation
      const zoomSpeed = 1 - Math.pow(0.001, dt);
      zoomCurrent.current += (zoomTarget.current - zoomCurrent.current) * zoomSpeed * 0.5;

      // Movement input from keyboard or mobile touch
      let moveInputX = 0;
      let moveInputY = 0;
      if (moveKeys.current.left) moveInputX -= 1;
      if (moveKeys.current.right) moveInputX += 1;
      if (moveKeys.current.up) moveInputY -= 1;
      if (moveKeys.current.down) moveInputY += 1;

      // Mobile touch direction
      if (mobileDir) {
        if (mobileDir === "left") moveInputX -= 1;
        if (mobileDir === "right") moveInputX += 1;
        if (mobileDir === "up") moveInputY -= 1;
        if (mobileDir === "down") moveInputY += 1;
      }

      // Smooth movement interpolation
      const moveSmoothSpeed = 1 - Math.pow(0.00001, dt);
      moveSmooth.current.x += (moveInputX - moveSmooth.current.x) * moveSmoothSpeed;
      moveSmooth.current.y += (moveInputY - moveSmooth.current.y) * moveSmoothSpeed;

      // Update camera position with movement
      movePos.current.x += moveSmooth.current.x * moveSpeed;
      movePos.current.y += moveSmooth.current.y * moveSpeed;

      // Clamp camera position
      movePos.current.x = Math.max(-1, Math.min(1, movePos.current.x));
      movePos.current.y = Math.max(-1, Math.min(1, movePos.current.y));

      const mx = mouseSmooth.current.x;
      const my = mouseSmooth.current.y;
      const zoom = zoomCurrent.current;
      const camX = movePos.current.x;
      const camY = movePos.current.y;

      // Background parallax - combines mouse look AND camera movement
      const bgOffsetX = (mx - 0.5) * -80 + camX * 150;
      const bgOffsetY = (my - 0.5) * -50 + camY * 100;

      // Mid layer - slightly less movement
      const midOffsetX = (mx - 0.5) * -40 + camX * 75;
      const midOffsetY = (my - 0.5) * -25 + camY * 50;

      // Apply transforms directly to DOM
      if (bgFarRef.current) {
        bgFarRef.current.style.transform = `translate(${bgOffsetX}px, ${bgOffsetY}px) scale(${zoom})`;
      }
      if (bgMidRef.current) {
        bgMidRef.current.style.transform = `translate(${midOffsetX}px, ${midOffsetY}px) scale(${zoom * 1.02})`;
      }

      // Flashlight beam position - follows mouse exactly (independent of camera)
      if (flashlightRef.current) {
        flashlightRef.current.style.left = `${mx * 100}%`;
        flashlightRef.current.style.top = `${my * 100}%`;
      }

      // Gun tilt based on mouse
      if (gunRef.current) {
        const tiltX = (mx - 0.5) * 20;
        const tiltY = (my - 0.5) * 10;
        const bobX = (mx - 0.5) * 10;
        const bobY = Math.abs(my - 0.5) * -6;
        gunRef.current.style.transform = `translateX(calc(-50% + ${bobX}px)) translateY(${bobY}px) rotate(${tiltX}deg) perspective(400px) rotateY(${tiltX * 0.5}deg) rotateX(${-tiltY * 0.3}deg)`;
      }

      // Hotspot detection
      const qPos = questionPosRef.current;
      let shouldShowInvestigate = false;

      if (qPos && !activeQuestion && !answered) {
        const fx = mx * 100;
        const fy = my * 100;
        const dist = Math.sqrt((fx - qPos.x) ** 2 + (fy - qPos.y) ** 2);
        shouldShowInvestigate = dist < 18;
      }

      // Investigate prompt
      if (investigateRef.current) {
        investigateRef.current.style.opacity = shouldShowInvestigate ? "1" : "0";
        investigateRef.current.style.pointerEvents = shouldShowInvestigate ? "auto" : "none";
        if (qPos) {
          investigateRef.current.style.left = `${qPos.x}%`;
          investigateRef.current.style.top = `${qPos.y - 8}%`;
        }
      }

      // Hint dot - always visible, brighter when close
      if (hintDotRef.current && hintPulseRef.current && qPos) {
        const fx = mx * 100;
        const fy = my * 100;
        const dist = Math.sqrt((fx - qPos.x) ** 2 + (fy - qPos.y) ** 2);
        const isClose = dist < 18;
        const showDot = !activeQuestion && !answered;

        hintDotRef.current.style.opacity = showDot ? (isClose ? "1" : "0.6") : "0";
        hintPulseRef.current.style.opacity = showDot ? (isClose ? "1" : "0.4") : "0";
        hintDotRef.current.style.left = `${qPos.x}%`;
        hintDotRef.current.style.top = `${qPos.y}%`;
        hintPulseRef.current.style.left = `${qPos.x}%`;
        hintPulseRef.current.style.top = `${qPos.y}%`;
      }

      // Direction arrow - shows when hotspot is far from flashlight
      if (directionArrowRef.current && qPos && !activeQuestion && !answered) {
        const fx = mx * 100;
        const fy = my * 100;
        const dist = Math.sqrt((fx - qPos.x) ** 2 + (fy - qPos.y) ** 2);
        const showArrow = dist > 30;

        directionArrowRef.current.style.opacity = showArrow ? "1" : "0";

        if (showArrow) {
          const angle = Math.atan2(qPos.y - fy, qPos.x - fx);
          const edgeDist = 8;
          const arrowX = Math.max(edgeDist, Math.min(100 - edgeDist, fx + Math.cos(angle) * edgeDist));
          const arrowY = Math.max(edgeDist, Math.min(100 - edgeDist, fy + Math.sin(angle) * edgeDist));
          const angleDeg = angle * (180 / Math.PI) + 90;
          directionArrowRef.current.style.left = `${arrowX}%`;
          directionArrowRef.current.style.top = `${arrowY}%`;
          directionArrowRef.current.style.transform = `translate(-50%, -50%) rotate(${angleDeg}deg)`;
        }
      }

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [activeQuestion, answered, mobileDir]);

  // Screen shake
  useEffect(() => {
    if (lastResult === "wrong") {
      setScreenShake(true);
      const t = setTimeout(() => setScreenShake(false), 400);
      return () => clearTimeout(t);
    }
  }, [lastResult]);

  // Correct answer -> room transition
  useEffect(() => {
    if (lastResult !== "correct") return;
    const t = setTimeout(() => {
      setTransitioning(true);
      setTransitionType("forward");
      setTimeout(() => {
        if (currentQuestionIdx + 1 >= questions.length) {
          onGameComplete();
        } else {
          onAdvanceRoom();
        }
        setTransitioning(false);
        setTransitionType(null);
      }, 1200);
    }, 1000);
    return () => clearTimeout(t);
  }, [lastResult, currentQuestionIdx, questions.length, onAdvanceRoom, onGameComplete]);

  // Room fog
  useEffect(() => {
    setRoomFog(0);
    const t = setTimeout(() => setRoomFog(1), 300);
    return () => clearTimeout(t);
  }, [currentRoom]);

  // Show room message on room change
  useEffect(() => {
    setRoomMessage(`ROOM ${currentRoom + 1}`);
    const t = setTimeout(() => setRoomMessage(null), 2000);
    return () => clearTimeout(t);
  }, [currentRoom]);

  // Forward/backward zoom with scroll
  useEffect(() => {
    const handleWheel = (e) => {
      if (activeQuestion) return;
      e.preventDefault();
      zoomTarget.current = Math.max(0.85, Math.min(1.3, zoomTarget.current + e.deltaY * -0.001));
    };
    const el = containerRef.current;
    if (el) el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      if (el) el.removeEventListener("wheel", handleWheel);
    };
  }, [activeQuestion]);

  // Keyboard navigation (WASD / Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeQuestion) return;
      switch (e.key.toLowerCase()) {
        case "a":
        case "arrowleft":
          moveKeys.current.left = true;
          break;
        case "d":
        case "arrowright":
          moveKeys.current.right = true;
          break;
        case "w":
        case "arrowup":
          moveKeys.current.up = true;
          break;
        case "s":
        case "arrowdown":
          moveKeys.current.down = true;
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.key.toLowerCase()) {
        case "a":
        case "arrowleft":
          moveKeys.current.left = false;
          break;
        case "d":
        case "arrowright":
          moveKeys.current.right = false;
          break;
        case "w":
        case "arrowup":
          moveKeys.current.up = false;
          break;
        case "s":
        case "arrowdown":
          moveKeys.current.down = false;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [activeQuestion]);

  // Mobile touch direction handlers
  const handleMobileMoveStart = useCallback((dir) => {
    setMobileDir(dir);
  }, []);

  const handleMobileMoveEnd = useCallback(() => {
    setMobileDir(null);
  }, []);

  const handleInvestigate = useCallback(() => {
    if (!currentRoomQuestion) return;
    setActiveQuestion(currentRoomQuestion);
  }, [currentRoomQuestion]);

  const handleQuestionClose = useCallback(() => {
    setActiveQuestion(null);
  }, []);

  useEffect(() => {
    if (lastResult === "correct" && activeQuestion) {
      const t = setTimeout(handleQuestionClose, 1800);
      return () => clearTimeout(t);
    }
  }, [lastResult, activeQuestion, handleQuestionClose]);

  return (
    <div
      ref={containerRef}
      className={`mansion-explorer ${transitioning ? "me-transitioning" : ""} ${screenShake ? "me-shake" : ""} ${transitionType === "forward" ? "me-transition-forward" : ""} ${transitionType === "backward" ? "me-transition-backward" : ""} ${swipeDirection === "right" ? "me-swipe-right" : ""} ${swipeDirection === "left" ? "me-swipe-left" : ""}`}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* Background layers */}
      <div className="me-bg-layer me-bg-far" ref={bgFarRef}>
        <img src={ROOMS[currentRoom].bg} alt="" draggable={false} />
      </div>

      <div className="me-bg-layer me-bg-mid" ref={bgMidRef}>
        <div className="me-fog-overlay" style={{ background: ROOMS[currentRoom].fogColor }} />
      </div>

      {/* Dark overlay */}
      <div className="me-darkness" />

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

      {/* Question hint dot */}
      <div className="me-question-hint" ref={hintDotRef} style={{ opacity: 0 }}>
        <div className="me-hint-pulse" ref={hintPulseRef} />
        <div className="me-hint-dot-inner" />
      </div>

      {/* Direction arrow to next hotspot */}
      <div className="me-direction-arrow" ref={directionArrowRef} style={{ opacity: 0 }}>
        <svg width="40" height="40" viewBox="0 0 40 40">
          <path d="M20 5 L30 20 L24 20 L24 35 L16 35 L16 20 L10 20 Z" fill="rgba(123, 94, 167, 0.8)" />
        </svg>
        <span className="me-direction-text">GO HERE</span>
      </div>

      {/* Room transition message */}
      {roomMessage && (
        <div className="me-room-message">
          <span>{roomMessage}</span>
        </div>
      )}

      {/* Investigate prompt */}
      <div
        className="me-investigate"
        ref={investigateRef}
        style={{ opacity: 0, pointerEvents: "none" }}
        onClick={handleInvestigate}
      >
        <span className="me-investigate-icon">&#128270;</span>
        <span className="me-investigate-text">INVESTIGATE</span>
      </div>

      {/* Immersive question panel */}
      {activeQuestion && (
        <div className="me-question-overlay">
          <ImmersiveQuestion
            question={activeQuestion}
            answered={answered}
            lastResult={lastResult}
            onAnswer={onAnswer}
            onRetry={onRetry}
          />
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
              <div
                key={r}
                className={`me-room-dot ${r === currentRoom ? "me-dot-active" : ""}`}
              />
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
        <span>WASD / ARROWS TO MOVE &#8226; MOUSE TO LOOK &#8226; SWIPE TO CHANGE ROOMS</span>
      </div>

      {/* Mobile touch navigation zones */}
      <div className="me-mobile-nav">
        <button
          className="me-mobile-zone me-mobile-left"
          onTouchStart={() => handleMobileMoveStart("left")}
          onTouchEnd={handleMobileMoveEnd}
          onMouseDown={() => handleMobileMoveStart("left")}
          onMouseUp={handleMobileMoveEnd}
          onMouseLeave={handleMobileMoveEnd}
          aria-label="Move left"
        >
          <span className="me-mobile-arrow">&#9664;</span>
        </button>
        <button
          className="me-mobile-zone me-mobile-right"
          onTouchStart={() => handleMobileMoveStart("right")}
          onTouchEnd={handleMobileMoveEnd}
          onMouseDown={() => handleMobileMoveStart("right")}
          onMouseUp={handleMobileMoveEnd}
          onMouseLeave={handleMobileMoveEnd}
          aria-label="Move right"
        >
          <span className="me-mobile-arrow">&#9654;</span>
        </button>
        <button
          className="me-mobile-zone me-mobile-up"
          onTouchStart={() => handleMobileMoveStart("up")}
          onTouchEnd={handleMobileMoveEnd}
          onMouseDown={() => handleMobileMoveStart("up")}
          onMouseUp={handleMobileMoveEnd}
          onMouseLeave={handleMobileMoveEnd}
          aria-label="Move forward"
        >
          <span className="me-mobile-arrow">&#9650;</span>
        </button>
        <button
          className="me-mobile-zone me-mobile-down"
          onTouchStart={() => handleMobileMoveStart("down")}
          onTouchEnd={handleMobileMoveEnd}
          onMouseDown={() => handleMobileMoveStart("down")}
          onMouseUp={handleMobileMoveEnd}
          onMouseLeave={handleMobileMoveEnd}
          aria-label="Move backward"
        >
          <span className="me-mobile-arrow">&#9660;</span>
        </button>
      </div>

      {/* Hint tooltip */}
      {hintOpen && (
        <div className="me-hint-tooltip">
          <span className="me-hint-tooltip-icon">&#x1F4A1;</span>
          <span>{HINTS[hintIdx]}</span>
        </div>
      )}

      {/* Swipe edge indicators */}
      {!transitioning && !activeQuestion && (
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

      {/* Transition overlay */}
      {transitioning && <div className="me-transition-overlay" />}

      {/* Room fog bottom */}
      <div className="me-room-fog" style={{ opacity: roomFog }} />
    </div>
  );
}

export default MansionExplorer;
