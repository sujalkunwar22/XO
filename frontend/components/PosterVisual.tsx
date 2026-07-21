import React from "react";
import { motion } from "motion/react";

interface PosterVisualProps {
  style: "industrial" | "acid" | "hypnotic" | "geometric";
  title: string;
  headliner: string;
}

const getHeadlinerClass = (name: string) => {
  const len = name.length;
  if (len <= 8) return "text-2xl sm:text-3xl tracking-wider";
  if (len <= 14) return "text-xl sm:text-2xl tracking-normal";
  if (len <= 20) return "text-lg sm:text-xl tracking-tight";
  return "text-base sm:text-lg tracking-tighter";
};

const getTitleStyle = (text: string, baseTrackingEm: number) => {
  const len = text.length;
  let fontSize = "10px";
  let letterSpacing = `${baseTrackingEm}em`;
  
  if (len > 12 && len <= 22) {
    fontSize = "9px";
    letterSpacing = `${baseTrackingEm * 0.7}em`;
  } else if (len > 22 && len <= 32) {
    fontSize = "8px";
    letterSpacing = `${baseTrackingEm * 0.4}em`;
  } else if (len > 32) {
    fontSize = "8px";
    letterSpacing = "0.02em";
  }
  return { fontSize, letterSpacing };
};

export const PosterVisual: React.FC<PosterVisualProps> = ({ style, title, headliner }) => {
  // Render clean generative text layouts with transparent background to let the video backdrop shine through
  switch (style) {
    case "industrial":
      return (
        <div className="relative w-full h-full bg-transparent overflow-hidden flex items-center justify-center border border-neutral-800/20">
          {/* Brutalist mesh-grid background - simplified */}
          <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:14px_24px]" />
          
          {/* Glitch overlays */}
          <div className="absolute top-4 left-4 font-mono text-[8px] text-zinc-400 tracking-wider">
            SEC: LIVE_ROCK_COBWEB // 125BPM
          </div>
          <div className="absolute bottom-4 right-4 font-mono text-[8px] text-zinc-400 tracking-wider font-bold">
            XO_MAINROOM // LIVE
          </div>

          <div className="absolute text-center z-10 p-4 select-none w-full max-w-[90%] mx-auto">
            <h4 className={`font-syne font-black text-white leading-none mb-2 text-neon-glow uppercase whitespace-nowrap overflow-hidden text-ellipsis ${getHeadlinerClass(headliner)}`}>
              {headliner}
            </h4>
            <p 
              className="font-mono text-zinc-300 uppercase whitespace-nowrap overflow-hidden text-ellipsis"
              style={getTitleStyle(title, 0.2)}
            >
              {title}
            </p>
          </div>
        </div>
      );

    case "acid":
      return (
        <div className="relative w-full h-full bg-transparent overflow-hidden flex items-center justify-center border border-neutral-800/20">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
          
          {/* Graphic Toxic Vector Art */}
          <div className="absolute text-center z-10 p-4 select-none w-full max-w-[90%] mx-auto">
            <span className="font-mono text-[9px] bg-white/5 text-zinc-300 border border-white/15 px-2 py-0.5 rounded-full inline-block mb-3 tracking-widest uppercase font-bold">
              XO BOLLYWOOD BOOM
            </span>
            <h4 className={`font-syne font-black text-white leading-none mb-1 text-neon-glow uppercase whitespace-nowrap overflow-hidden text-ellipsis ${getHeadlinerClass(headliner)}`}>
              {headliner}
            </h4>
            <p 
              className="font-mono text-zinc-400 uppercase whitespace-nowrap overflow-hidden text-ellipsis"
              style={getTitleStyle(title, 0.1)}
            >
              {title}
            </p>
          </div>

          <div className="absolute top-4 right-4 font-mono text-[8px] text-zinc-400/40 font-bold">
            SYS_XO_BOLLYWEEK
          </div>
        </div>
      );

    case "hypnotic":
      return (
        <div className="relative w-full h-full bg-transparent overflow-hidden flex items-center justify-center border border-neutral-800/20">
          {/* Matrix Radar grid */}
          <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#050505_2px,transparent_2px),linear-gradient(to_bottom,#050505_2px,transparent_2px)] bg-[size:20px_20px]" />
          
          <div className="absolute text-center z-10 p-4 select-none w-full max-w-[90%] mx-auto">
            <h4 className={`font-syne font-black text-white leading-none mb-1 text-neon-glow uppercase whitespace-nowrap overflow-hidden text-ellipsis ${getHeadlinerClass(headliner)}`}>
              {headliner}
            </h4>
            <p 
              className="font-mono text-zinc-300 uppercase whitespace-nowrap overflow-hidden text-ellipsis"
              style={getTitleStyle(title, 0.15)}
            >
              {title}
            </p>
          </div>

          <div className="absolute bottom-4 left-4 font-mono text-[8px] text-zinc-400 font-bold">
            ADAMSON_RIG // CUSTOM_TUNED
          </div>
        </div>
      );

    case "geometric":
      return (
        <div className="relative w-full h-full bg-transparent overflow-hidden flex items-center justify-center border border-neutral-800/20">
          <div className="absolute top-4 right-4 font-mono text-[8px] text-white/40 font-bold">
            [XO_SYSTEMS_ACTIVE]
          </div>

          <div className="absolute text-center z-10 p-4 select-none w-full max-w-[90%] mx-auto">
            <h4 className={`font-syne font-black text-white leading-none mb-1 text-neon-glow uppercase whitespace-nowrap overflow-hidden text-ellipsis ${getHeadlinerClass(headliner)}`}>
              {headliner}
            </h4>
            <p 
              className="font-mono text-zinc-300 font-semibold uppercase whitespace-nowrap overflow-hidden text-ellipsis"
              style={getTitleStyle(title, 0.34)}
            >
              {title}
            </p>
          </div>

          <div className="absolute bottom-4 left-4 font-mono text-[8px] text-zinc-400 font-bold">
            THAMEL_SECTOR // LIVE_RIG
          </div>
        </div>
      );
  }
};
