import React from "react";
import { motion } from "motion/react";
import { VIPPackage } from "../types";
import { Sparkles, MapPin, ZoomIn, Calendar, ArrowRight } from "lucide-react";

interface VipSectionProps {
  onBookVIPPackage: (pkg?: any) => void;
}

export const VipSection: React.FC<VipSectionProps> = ({ onBookVIPPackage }) => {
  return (
    <div id="vips-section" className="relative w-full py-20 bg-transparent border-b border-neutral-900 select-text">
      
      {/* Background glowing halo */}
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-white/[0.01] blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 mb-12">
        <span className="font-mono text-[10px] text-[#EF4444] tracking-[0.34em] font-bold block mb-2 uppercase">
          // VENUE BLUEPRINT & SEATING MAP
        </span>
        <h2 className="font-syne font-extrabold text-3xl sm:text-5xl tracking-tight text-white uppercase leading-none">
          THE SPACES & BOOTHS
        </h2>
        <p className="font-sans text-xs sm:text-sm text-slate-400 max-w-2xl mt-4 leading-relaxed font-light">
          Unlock absolute privilege inside Thamel's premier nightlife landmark. Explore the official venue floorplan blueprint below and select your preferred booth across the Ground Floor, Balconies, VIP Deck, or Stage Private lounges.
        </p>
      </div>

      {/* Table Layout Image Display */}
      <div className="max-w-6xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-lg border border-neutral-850 bg-black/90 overflow-hidden shadow-2xl group"
        >
          {/* Header Bar */}
          <div className="p-4 bg-neutral-950 border-b border-neutral-850 flex flex-wrap items-center justify-between gap-3 font-mono text-[10px]">
            <div className="flex items-center gap-2 text-white font-bold uppercase">
              <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
              <span>OFFICIAL VENUE FLOORPLAN LAYOUT</span>
            </div>
            
            <button
              onClick={() => onBookVIPPackage()}
              className="px-4 py-2 bg-white hover:bg-[#EF4444] text-black hover:text-white font-black uppercase text-[10px] tracking-wider transition-all rounded-xs cursor-pointer flex items-center gap-2 shadow-md"
            >
              <span>SELECT &amp; BOOK YOUR TABLE</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {/* Club Layout Image Container */}
          <div className="relative w-full overflow-hidden bg-black flex items-center justify-center p-0">
            <img
              src="/club-layout.jpg"
              alt="XO Club Kathmandu Seating Blueprint"
              className="w-full h-auto filter contrast-[1.05] brightness-95 group-hover:scale-[1.01] transition-transform duration-500"
            />

            {/* Floating Quick Action Overlay Button on Hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
              <button
                onClick={() => onBookVIPPackage()}
                className="px-6 py-3.5 bg-white text-black hover:bg-[#EF4444] hover:text-white font-mono text-xs font-black uppercase tracking-widest rounded transition-all cursor-pointer shadow-2xl flex items-center gap-2"
              >
                <ZoomIn size={14} />
                OPEN TABLE BOOKING CONSOLE
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Architectural Specs Summary */}
      <div className="max-w-6xl mx-auto px-6 mt-12">
        <div className="rounded-lg border border-neutral-850 bg-neutral-950/50 p-5 font-mono text-[9px] text-zinc-400 leading-relaxed flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-1 text-left flex-1">
            <span className="text-white font-bold block mb-1 uppercase tracking-widest">// ARENA FLOOR SPECIFICATIONS</span>
            <div>• TOTAL ARENA CAPACITY: 1,200+ CAPACITY & PREMIUM VIP BOOTHS</div>
            <div>• GROUND FLOOR: MAIN STAGE DANCEFLOOR ACCESS BOOTHS G1 - G6</div>
            <div>• FIRST & SECOND FLOOR: BALCONY LOUNGES, VIP DECK A1-A8, C1-C8</div>
          </div>
          <div className="space-y-1 text-left flex-1 border-t md:border-t-0 md:border-l border-neutral-850 pt-4 md:pt-0 md:pl-6">
            <span className="text-white font-bold block mb-1 uppercase tracking-widest">// VVIP & STAGE RESERVATION PROTOCOL</span>
            <div>• VVIP 1-4 &amp; STAGE PRIVATE BOOTH: DIRECT ARTIST STAGE ACCESS</div>
            <div>• DRESS CODE: SMART NIGHTLIFE ATTIRE. 18+ ID MANDATORY AT ENTRANCE.</div>
            <div>• RESERVATION PERKS: EXPRESS ENTRY BYPASS, DEDICATED HOSTESS &amp; BOTTLE SERVICE</div>
          </div>
        </div>
      </div>

    </div>
  );
};
