import React, { useRef, useState } from "react";
import { motion, useSpring, useMotionValue } from "motion/react";

interface KineticLetterProps {
  char: string;
  colorStyle: "club" | "xo" | "kathmandu";
}

const KineticLetter: React.FC<KineticLetterProps> = ({ char, colorStyle }) => {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Dynamic spring physics for uniform hover scaling and magnetic pulling
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const hoverScale = useSpring(1, { stiffness: 400, damping: 18 });
  const pullX = useSpring(0, { stiffness: 350, damping: 15 });
  const pullY = useSpring(0, { stiffness: 350, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (!containerRef.current) return;
    setIsHovered(true);

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);

    mouseX.set(x);
    mouseY.set(y);
    
    // Scale uniformly to 1.15 to avoid ANY stretched distortion
    hoverScale.set(1.15);
    // Drag letter towards cursor slightly
    pullX.set(x * 0.3);
    pullY.set(y * 0.3);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    hoverScale.set(1);
    pullX.set(0);
    pullY.set(0);
  };

  if (char === " ") {
    return <span className="w-2 sm:w-4 md:w-8 inline-block select-none pointer-events-none" />;
  }

  // Assign classes based on row style
  let sizeClasses = "";
  if (colorStyle === "club") {
    sizeClasses = "text-[11vw] xs:text-[11vw] sm:text-[9vw] md:text-[8vw] lg:text-[9rem] xl:text-[11rem] tracking-tight font-extrabold";
  } else if (colorStyle === "xo") {
    sizeClasses = "text-[12vw] xs:text-[12vw] sm:text-[10vw] md:text-[9vw] lg:text-[10rem] xl:text-[12rem] tracking-tight font-black";
  } else if (colorStyle === "kathmandu") {
    sizeClasses = "text-[7vw] xs:text-[6.8vw] sm:text-[5.5vw] md:text-[5vw] lg:text-[5.5rem] xl:text-[6.5rem] tracking-tight font-extrabold";
  }

  // Colors & Text Stroke Styles
  let color = "#ffffff";
  let textStroke = "none";
  let textShadow = "none";

  if (colorStyle === "club") {
    color = isHovered ? "#ffffff" : "#b3b3b3";
    textShadow = isHovered ? "0 0 15px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.3)" : "none";
  } else if (colorStyle === "xo") {
    // XO is stylized with custom pulsing white neon glow, reversing on hover
    color = isHovered ? "#a3a3a3" : "#ffffff";
    textShadow = isHovered 
      ? "0 0 20px rgba(255, 255, 255, 0.4), 0 0 40px rgba(255, 255, 255, 0.2)" 
      : "0 0 12px rgba(255, 255, 255, 0.5), 0 0 25px rgba(255, 255, 255, 0.25)";
  } else if (colorStyle === "kathmandu") {
    color = isHovered ? "#ffffff" : "transparent";
    textStroke = isHovered ? "none" : "1px rgba(255, 255, 255, 0.4)";
    textShadow = isHovered ? "0 0 15px rgba(255, 255, 255, 0.5)" : "none";
  }

  return (
    <motion.span
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-block relative cursor-pointer font-syne uppercase leading-none select-none"
      style={{
        scale: hoverScale,
        x: pullX,
        y: pullY,
        color: color,
        WebkitTextStroke: textStroke,
        textShadow: textShadow,
        willChange: "transform, color"
      }}
    >
      <span className={sizeClasses}>
        {char}
      </span>
    </motion.span>
  );
};

export const KineticHeader: React.FC = () => {
  const line1 = "XO".split("");
  const line2 = "CLUB".split("");
  const line3 = "KATHMANDU".split("");

  return (
    <div className="flex flex-col items-center justify-center text-center py-6 w-full max-w-full select-none z-10 pointer-events-auto overflow-hidden">
      {/* Visual top indicator line */}
      <motion.p 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="font-mono text-[9px] sm:text-xs md:text-sm tracking-[0.25em] sm:tracking-[0.5em] text-zinc-400 mb-6 uppercase flex items-center justify-center gap-2 font-bold select-text whitespace-nowrap"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] inline-block animate-pulse shadow-[0_0_8px_#EF4444]" />
        Chaksibari Marg, Thamel • Kathmandu
      </motion.p>
      
      {/* XO Row (strictly no wrapping) */}
      <div className="flex justify-center items-center flex-nowrap gap-x-0.5 sm:gap-x-1 sm:gap-x-2 md:gap-x-3 lg:gap-x-4 mb-1 w-full max-w-full overflow-hidden">
        {line1.map((char, index) => (
          <KineticLetter key={`line1-${index}`} char={char} colorStyle="xo" />
        ))}
      </div>
      
      {/* CLUB Row (strictly no wrapping) */}
      <div className="flex justify-center items-center flex-nowrap gap-x-0.5 sm:gap-x-1 md:gap-x-2 lg:gap-x-3 mb-2 sm:mb-4 md:mb-6 lg:mb-8 xl:mb-10 w-full max-w-full overflow-hidden">
        {line2.map((char, index) => (
          <KineticLetter key={`line2-${index}`} char={char} colorStyle="club" />
        ))}
      </div>
      
      {/* KATHMANDU Row (strictly no wrapping) */}
      <div className="flex justify-center items-center flex-nowrap gap-x-px sm:gap-x-0.5 md:gap-x-1 lg:gap-x-1.5 opacity-80 w-full max-w-full overflow-hidden">
        {line3.map((char, index) => (
          <KineticLetter key={`line3-${index}`} char={char} colorStyle="kathmandu" />
        ))}
      </div>
    </div>
  );
};
