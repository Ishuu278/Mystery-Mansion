import { useEffect, useRef, useState } from "react";
import "../styles/HorrorOverlay.css";

export default function HorrorOverlay({ glitchTrigger }) {
  const canvasRef = useRef(null);
  const [glitching, setGlitching] = useState(false);

  // Film grain canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;

    const resize = () => {
      canvas.width = window.innerWidth / 2;
      canvas.height = window.innerHeight / 2;
    };
    resize();
    window.addEventListener("resize", resize);

    const drawGrain = () => {
      const w = canvas.width;
      const h = canvas.height;
      const imgData = ctx.createImageData(w, h);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.random() * 40;
        d[i] = v;
        d[i + 1] = v;
        d[i + 2] = v;
        d[i + 3] = 25;
      }
      ctx.putImageData(imgData, 0, 0);
      raf = requestAnimationFrame(drawGrain);
    };
    drawGrain();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Glitch trigger
  useEffect(() => {
    if (glitchTrigger > 0) {
      setGlitching(true);
      const t = setTimeout(() => setGlitching(false), 400);
      return () => clearTimeout(t);
    }
  }, [glitchTrigger]);

  return (
    <div className="horror-overlay">
      {/* Film grain */}
      <canvas ref={canvasRef} className="ho-grain" />

      {/* Animated vignette */}
      <div className="ho-vignette" />

      {/* Flickering light effect */}
      <div className="ho-flicker" />

      {/* Chromatic aberration glitch */}
      {glitching && (
        <>
          <div className="ho-glitch-r" />
          <div className="ho-glitch-c" />
          <div className="ho-static" />
        </>
      )}
    </div>
  );
}
