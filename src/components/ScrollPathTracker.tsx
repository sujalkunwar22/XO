import React, { useEffect } from "react";
import { motion, useSpring, useTransform, useMotionValue } from "motion/react";
import { ClubXOLogo } from "./ClubXOLogo";

interface ScrollPathTrackerProps {
  scrollProgress: number; // continuously updated scroll progress from 0 to 1
}

export const ScrollPathTracker: React.FC<ScrollPathTrackerProps> = ({
  scrollProgress
}) => {
  const motionProgress = useMotionValue(scrollProgress);

  // Synchronize dynamic progress shifts
  useEffect(() => {
    motionProgress.set(scrollProgress);
  }, [scrollProgress, motionProgress]);

  // Smooth out the progress for supreme physical stabilization
  const smoothProgress = useSpring(motionProgress, {
    stiffness: 90,
    damping: 30,
    restDelta: 0.0005
  }) as any;

  // Calculate the cubic bezier coordinates directly across the full screen viewport
  // d="M 95 5 C 5 15, 95 85, 5 95"
  // start P0(95, 5), control P1(5, 15), control P2(95, 85), end P3(5, 95)
  const xPercent = useTransform<number, string>(smoothProgress, (t: number) => {
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const t2 = t * t;
    const t3 = t2 * t;
    const x = mt3 * 95 + 3 * mt2 * t * 5 + 3 * mt * t2 * 95 + t3 * 5;
    return `${x}%`;
  });

  const yPercent = useTransform<number, string>(smoothProgress, (t: number) => {
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const t2 = t * t;
    const t3 = t2 * t;
    const y = mt3 * 5 + 3 * mt2 * t * 15 + 3 * mt * t2 * 85 + t3 * 95;
    return `${y}%`;
  });

  // Continuous synchronized spin rotation dynamically mapped across the full scroll progress (720 degrees)
  const swayRotation = useTransform<number, number>(smoothProgress, (t: number) => {
    return t * 720;
  });

  return (
    <div 
      className="fixed inset-0 w-full h-full pointer-events-none z-[5] select-none"
      id="scroll-flight-container"
    >
      {/* Full-width curved SVG tracks rendering behind interactive elements */}
      <svg 
        className="absolute inset-0 h-full w-full overflow-visible opacity-25" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        {/* Background Track - Dotted Silver Grid style */}
        <path
          d="M 95 5 C 5 15, 95 85, 5 95"
          fill="none"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="1.2"
          strokeDasharray="1 7"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Dynamic Flanking glowing trace */}
        <path
          d="M 95 5 C 5 15, 95 85, 5 95"
          fill="none"
          stroke="rgba(239, 68, 68, 0.04)"
          strokeWidth="3"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        
        {/* Active Scroll Tracker - Elegant active dot trail lighting up in silver as you scroll */}
        <motion.path
          d="M 95 5 C 5 15, 95 85, 5 95"
          fill="none"
          stroke="rgba(255, 255, 255, 0.45)"
          strokeWidth="2.0"
          strokeDasharray="1 7"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ pathLength: smoothProgress }}
        />
      </svg>

      {/* Floating Scroll Capsule tracking the path (contains ONLY the logo) */}
      <motion.div
        className="absolute flex items-center justify-center z-10"
        style={{
          top: yPercent,
          left: xPercent,
          rotate: swayRotation,
          transform: "translate(-50%, -50%)"
        }}
        id="scroll-tracker-capsule"
      >
        {/* Subtle glowing halo underlay */}
        <div className="absolute w-8 h-8 rounded-full bg-white/5 blur-md pointer-events-none" />

        {/* Persistent Logo Capsule */}
        <div className="w-8 h-8 p-1.5 bg-neutral-950/90 rounded-full border border-neutral-800 shadow-[0_4px_12px_rgba(0,0,0,0.6)] flex items-center justify-center backdrop-blur-md">
          <ClubXOLogo className="w-full h-full" color="#ffffff" glow={false} />
        </div>
      </motion.div>
    </div>
  );
};
