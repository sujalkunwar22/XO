import React from "react";
import { motion } from "motion/react";

interface PosterVisualProps {
  style: "industrial" | "acid" | "hypnotic" | "geometric";
  title: string;
  headliner: string;
}

export const PosterVisual: React.FC<PosterVisualProps> = ({ style, title, headliner }) => {
  // Render high-end generative vectors (adapted fully for XO Club premium silver & neutral theme)
  switch (style) {
    case "industrial":
      return (
        <div className="relative w-full h-full bg-slate-950 overflow-hidden flex items-center justify-center border border-neutral-800/40">
          {/* Brutalist mesh-grid background */}
          <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:14px_24px]" />
          
          {/* Moving metal girders/plates */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            className="absolute w-72 h-72 border border-white/5 rounded-sm opacity-30 flex items-center justify-center"
          >
            <div className="w-48 h-48 border-l border-r border-white/10" />
          </motion.div>

          {/* Heavy metal cross indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="180" height="180" viewBox="0 0 100 100" className="stroke-white/25 fill-none stroke-[0.75]">
              <line x1="10" y1="50" x2="90" y2="50" />
              <line x1="50" y1="10" x2="50" y2="90" />
              <circle cx="50" cy="50" r="30" />
              <circle cx="50" cy="50" r="10" />
              <rect x="25" y="25" width="50" height="50" strokeDasharray="3,3" />
            </svg>
          </div>

          {/* Glitch overlays */}
          <div className="absolute top-4 left-4 font-mono text-[8px] text-zinc-500 tracking-wider">
            SEC: LIVE_ROCK_COBWEB // 125BPM
          </div>
          <div className="absolute bottom-4 right-4 font-mono text-[8px] text-zinc-400 tracking-wider font-bold">
            XO_MAINROOM // LIVE
          </div>

          <div className="absolute text-center z-10 p-4 select-none">
            <h4 className="font-syne font-black text-2xl text-white tracking-wider leading-none mb-2 text-neon-glow">
              {headliner}
            </h4>
            <p className="font-mono text-[10px] text-zinc-450 tracking-[0.2em]">{title}</p>
          </div>
        </div>
      );

    case "acid":
      return (
        <div className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center border border-neutral-800/40">
          {/* Hypnotic nested moving circles */}
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
          
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.25, 1],
                rotate: i % 2 === 0 ? [0, 180, 360] : [360, 180, 0],
                borderRadius: ["45%", "50%", "40%", "45%"]
              }}
              transition={{
                duration: 6 + i * 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute border border-white/10"
              style={{
                width: `${40 + i * 45}px`,
                height: `${40 + i * 45}px`,
                boxShadow: "0 0 10px rgba(255, 255, 255, 0.02)"
              }}
            />
          ))}

          {/* Graphic Toxic Vector Art */}
          <div className="absolute text-center z-10 p-4 select-none">
            <span className="font-mono text-[9px] bg-white/5 text-zinc-300 border border-white/15 px-2 py-0.5 rounded-full inline-block mb-3 tracking-widest uppercase font-bold">
              XO BOLLYWOOD BOOM
            </span>
            <h4 className="font-syne font-black text-2xl text-white tracking-wider leading-none mb-1 text-neon-glow">
              {headliner}
            </h4>
            <p className="font-mono text-[10px] text-zinc-500 uppercase">{title}</p>
          </div>

          <div className="absolute top-4 right-4 font-mono text-[8px] text-zinc-500/40 font-bold">
            SYS_XO_BOLLYWEEK
          </div>
        </div>
      );

    case "hypnotic":
      return (
        <div className="relative w-full h-full bg-slate-950 overflow-hidden flex items-center justify-center border border-neutral-800/40">
          {/* Matrix Radar grid */}
          <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#050505_2px,transparent_2px),linear-gradient(to_bottom,#050505_2px,transparent_2px)] bg-[size:20px_20px]" />
          
          <div className="absolute w-56 h-56 rounded-full border border-white/5 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
              className="w-full h-full rounded-full border-t border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            />
          </div>

          {/* Nested sine wave indicators */}
          <svg className="absolute w-3/4 h-32 text-white/10" viewBox="0 0 100 40">
            <motion.path
              animate={{
                d: [
                  "M 0,20 Q 25,10 50,20 T 100,20",
                  "M 0,20 Q 25,30 50,20 T 100,20",
                  "M 0,20 Q 25,10 50,20 T 100,20"
                ]
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
            <motion.path
              animate={{
                d: [
                  "M 0,20 Q 25,30 50,20 T 100,20",
                  "M 0,20 Q 25,10 50,20 T 100,20",
                  "M 0,20 Q 25,30 50,20 T 100,20"
                ]
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.25"
            />
          </svg>

          <div className="absolute text-center z-10 p-4 select-none">
            <h4 className="font-syne font-black text-2xl text-white tracking-wider leading-none mb-1 text-neon-glow">
              {headliner}
            </h4>
            <p className="font-mono text-[9px] text-zinc-455 tracking-widest">{title}</p>
          </div>

          <div className="absolute bottom-4 left-4 font-mono text-[8px] text-zinc-400 font-bold">
            ADAMSON_RIG // CANADA_TUNED
          </div>
        </div>
      );

    case "geometric":
      return (
        <div className="relative w-full h-full bg-slate-950 overflow-hidden flex items-center justify-center border border-neutral-800/40">
          {/* Floating abstract shards */}
          <div className="absolute inset-0 bg-radial-gradient from-white/[0.02] via-transparent to-transparent opacity-60" />
          
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, 4, 0]
            }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="absolute w-36 h-36 border border-white/10 bg-white/[0.02] rotate-45 flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: -90 }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
              className="w-24 h-24 border border-white/10 flex items-center justify-center"
            >
              <div className="w-12 h-12 bg-white/10 rounded-full" />
            </motion.div>
          </motion.div>

          <div className="absolute top-4 right-4 font-mono text-[8px] text-white/50 font-bold">
            [XO_SYSTEMS_ACTIVE]
          </div>

          <div className="absolute text-center z-10 p-4 select-none">
            <h4 className="font-syne font-black text-2xl text-white tracking-wider leading-none mb-1 text-neon-glow">
              {headliner}
            </h4>
            <p className="font-mono text-[9px] text-zinc-400 tracking-[0.34em] font-semibold">{title}</p>
          </div>

          <div className="absolute bottom-4 left-4 font-mono text-[8px] text-zinc-500 font-bold">
            THAMEL_SECTOR // LIVE_RIG
          </div>
        </div>
      );
  }
};
