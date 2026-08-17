import { forwardRef } from "react";

const GunFlashlight = forwardRef(function GunFlashlight(props, ref) {
  return (
    <div className="gun-flashlight" ref={ref}>
      <svg
        viewBox="0 0 120 200"
        width="160"
        height="260"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="gunBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3a3a4a" />
            <stop offset="50%" stopColor="#2a2a35" />
            <stop offset="100%" stopColor="#1a1a25" />
          </linearGradient>
          <linearGradient id="barrel" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4a4a5a" />
            <stop offset="50%" stopColor="#3a3a48" />
            <stop offset="100%" stopColor="#2a2a38" />
          </linearGradient>
          <radialGradient id="lensGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffeaa7" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#fdcb6e" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#e17055" stopOpacity="0.3" />
          </radialGradient>
          <filter id="gunShadow">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Handle / Grip */}
        <path
          d="M 45 130 Q 42 140 40 160 Q 38 175 42 190 L 58 190 Q 62 175 60 160 Q 58 140 55 130 Z"
          fill="url(#gunBody)"
          stroke="#555"
          strokeWidth="1"
          filter="url(#gunShadow)"
        />
        <path
          d="M 47 140 L 53 140 M 46 150 L 54 150 M 45 160 L 55 160 M 44 170 L 56 170"
          stroke="#555"
          strokeWidth="0.8"
          opacity="0.5"
        />

        {/* Main body */}
        <rect
          x="35"
          y="100"
          width="30"
          height="35"
          rx="4"
          fill="url(#gunBody)"
          stroke="#555"
          strokeWidth="1"
          filter="url(#gunShadow)"
        />

        {/* Barrel / Flashlight tube */}
        <rect
          x="40"
          y="30"
          width="20"
          height="75"
          rx="6"
          fill="url(#barrel)"
          stroke="#555"
          strokeWidth="1"
          filter="url(#gunShadow)"
        />

        {/* Barrel rings */}
        <rect x="38" y="40" width="24" height="3" rx="1.5" fill="#555" opacity="0.6" />
        <rect x="38" y="55" width="24" height="3" rx="1.5" fill="#555" opacity="0.6" />
        <rect x="38" y="70" width="24" height="3" rx="1.5" fill="#555" opacity="0.6" />

        {/* Flashlight lens */}
        <ellipse
          cx="50"
          cy="28"
          rx="14"
          ry="6"
          fill="url(#lensGlow)"
          stroke="#fdcb6e"
          strokeWidth="1"
        />

        {/* Lens inner glow */}
        <ellipse
          cx="50"
          cy="28"
          rx="8"
          ry="3"
          fill="#ffeaa7"
          opacity="0.8"
        />

        {/* Trigger guard */}
        <path
          d="M 42 130 Q 35 135 35 145 Q 35 150 42 150"
          fill="none"
          stroke="#555"
          strokeWidth="2"
        />

        {/* Trigger */}
        <line x1="43" y1="133" x2="40" y2="143" stroke="#666" strokeWidth="1.5" />

        {/* Top sight */}
        <rect x="48" y="25" width="4" height="5" rx="1" fill="#666" />
      </svg>

      {/* Lens flare effect */}
      <div className="gun-lens-flare" />
    </div>
  );
});

export default GunFlashlight;
