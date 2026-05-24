import React from "react";
import { motion } from "motion/react";

interface PosterVisualProps {
  style: "industrial" | "acid" | "hypnotic" | "geometric";
  title: string;
  headliner: string;
}

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

          <div className="absolute text-center z-10 p-4 select-none">
            <h4 className="font-syne font-black text-2xl text-white tracking-wider leading-none mb-2 text-neon-glow uppercase">
              {headliner}
            </h4>
            <p className="font-mono text-[10px] text-zinc-300 tracking-[0.2em] uppercase">{title}</p>
          </div>
        </div>
      );

    case "acid":
      return (
        <div className="relative w-full h-full bg-transparent overflow-hidden flex items-center justify-center border border-neutral-800/20">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
          
          {/* Graphic Toxic Vector Art */}
          <div className="absolute text-center z-10 p-4 select-none">
            <span className="font-mono text-[9px] bg-white/5 text-zinc-300 border border-white/15 px-2 py-0.5 rounded-full inline-block mb-3 tracking-widest uppercase font-bold">
              XO BOLLYWOOD BOOM
            </span>
            <h4 className="font-syne font-black text-2xl text-white tracking-wider leading-none mb-1 text-neon-glow uppercase">
              {headliner}
            </h4>
            <p className="font-mono text-[10px] text-zinc-400 uppercase">{title}</p>
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
          
          <div className="absolute text-center z-10 p-4 select-none">
            <h4 className="font-syne font-black text-2xl text-white tracking-wider leading-none mb-1 text-neon-glow uppercase">
              {headliner}
            </h4>
            <p className="font-mono text-[9px] text-zinc-300 tracking-widest uppercase">{title}</p>
          </div>

          <div className="absolute bottom-4 left-4 font-mono text-[8px] text-zinc-400 font-bold">
            ADAMSON_RIG // CANADA_TUNED
          </div>
        </div>
      );

    case "geometric":
      return (
        <div className="relative w-full h-full bg-transparent overflow-hidden flex items-center justify-center border border-neutral-800/20">
          <div className="absolute top-4 right-4 font-mono text-[8px] text-white/40 font-bold">
            [XO_SYSTEMS_ACTIVE]
          </div>

          <div className="absolute text-center z-10 p-4 select-none">
            <h4 className="font-syne font-black text-2xl text-white tracking-wider leading-none mb-1 text-neon-glow uppercase">
              {headliner}
            </h4>
            <p className="font-mono text-[9px] text-zinc-300 tracking-[0.34em] font-semibold uppercase">{title}</p>
          </div>

          <div className="absolute bottom-4 left-4 font-mono text-[8px] text-zinc-400 font-bold">
            THAMEL_SECTOR // LIVE_RIG
          </div>
        </div>
      );
  }
};
