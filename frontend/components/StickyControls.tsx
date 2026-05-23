import React from "react";
import { motion, useScroll, useSpring as useSpringMotion } from "motion/react";

interface StickyControlsProps {
  onBookVIPClick: () => void;
}

export const StickyControls: React.FC<StickyControlsProps> = () => {
  // Core Scroll Depth Indicators via Motion
  const { scrollYProgress } = useScroll();
  const scaleXProgress = useSpringMotion(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <>
      {/* Global Viewport Scroll Progress Line - Signature White/Silver */}
      <motion.div
        className="fixed top-0 inset-x-0 h-[2.5px] bg-[#FFFFFF] origin-left z-50 pointer-events-none"
        style={{ scaleX: scaleXProgress }}
        id="viewport-progress-line"
      />
    </>
  );
};
