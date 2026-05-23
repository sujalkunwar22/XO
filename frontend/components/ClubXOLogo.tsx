import React from "react";

interface ClubXOLogoProps {
  className?: string;
  color?: string;
  glow?: boolean;
}

export const ClubXOLogo: React.FC<ClubXOLogoProps> = ({
  className = "w-12 h-12",
  color = "#FFFFFF",
  glow = false,
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className} ${
        glow ? "filter drop-shadow-[0_0_12px_rgba(239,68,68,0.7)]" : ""
      } transition-all duration-300`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      id="club-xo-svg-logo"
    >
      {/* Outer Circle Ring */}
      <circle 
        cx="50" 
        cy="50" 
        r="28" 
        stroke={color} 
        strokeWidth="6" 
        strokeLinecap="round" 
        id="xo-logo-ring"
      />
      
      {/* Upper arched crescent shape */}
      <path
        d="M28 28 C 38 42, 62 42, 72 28"
        stroke={color}
        strokeWidth="6.5"
        strokeLinecap="round"
        id="xo-logo-top-curve"
      />
      
      {/* Lower arched crescent shape */}
      <path
        d="M28 72 C 38 58, 62 58, 72 72"
        stroke={color}
        strokeWidth="6.5"
        strokeLinecap="round"
        id="xo-logo-bottom-curve"
      />

      {/* Diagonal legs extending outwards to corners */}
      <path
        d="M15 15 L30 30"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        id="xo-logo-leg-top-left"
      />
      <path
        d="M85 15 L70 30"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        id="xo-logo-leg-top-right"
      />
      <path
        d="M15 85 L30 70"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        id="xo-logo-leg-bottom-left"
      />
      <path
        d="M85 85 L70 70"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        id="xo-logo-leg-bottom-right"
      />
    </svg>
  );
};
