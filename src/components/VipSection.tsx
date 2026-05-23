import React from "react";
import { motion } from "motion/react";
import { VIP_PACKAGES } from "../data";
import { VIPPackage } from "../types";
import { Sparkles, Armchair, Wine, ShieldCheck, Star } from "lucide-react";

interface VipSectionProps {
  onBookVIPPackage: (pkg: VIPPackage) => void;
}

export const VipSection: React.FC<VipSectionProps> = ({ onBookVIPPackage }) => {
  return (
    <div id="vips-section" className="relative w-full py-20 bg-transparent border-b border-neutral-900">
      
      {/* Background glowing halo - Charcoal/White themed */}
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-white/[0.01] blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 mb-16">
        <span className="font-mono text-[10px] text-zinc-400 tracking-[0.34em] font-bold block mb-2 uppercase">
          // PREMIUM EXCLUSIVITY
        </span>
        <h2 className="font-syne font-extrabold text-3xl sm:text-5xl tracking-tight text-white uppercase leading-none">
          THE SPACES & BOOTHS
        </h2>
        <p className="font-sans text-xs sm:text-sm text-slate-400 max-w-2xl mt-4 leading-relaxed font-light">
          Unlock absolute privilege inside Thamel's premier nightlife landmark. XO Club’s 1,200+ capacity structure holds distinct designated zones, premium VIP booths flanking the main dance floor, and a Level 2 VIP Lounge overlooking the venue's pure sound matrices.
        </p>
      </div>

      {/* Grid of VIP Options */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {VIP_PACKAGES.map((pkg, idx) => {
          // Select beautiful icons based on tier
          const RenderIcon = idx === 0 ? Wine : idx === 1 ? Armchair : Star;
          
          return (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: idx * 0.15, duration: 0.6 }}
              className="relative rounded-lg p-6 bg-white/5 border border-white/10 hover:border-white hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all duration-300 flex flex-col justify-between group h-full"
            >
              {/* Top Details */}
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 rounded-full bg-neutral-950 border border-neutral-800 text-zinc-400 group-hover:bg-white group-hover:text-black transition-all">
                    <RenderIcon size={18} />
                  </div>
                  <span className="font-mono text-[11px] font-bold text-white bg-white/10 px-3 py-1 rounded-full border border-white/10 shadow-sm">
                    {idx === 0 ? "PLATINUM LEVEL" : idx === 1 ? "ULTRA EXCLUSIVE" : "COMMAND DECK"}
                  </span>
                </div>

                <h3 className="font-syne font-extrabold text-lg sm:text-xl text-white uppercase tracking-wide group-hover:text-white transition-colors">
                  {pkg.name}
                </h3>
                <span className="font-mono text-[10px] text-slate-400 block mt-1 uppercase leading-tight">
                  LOC: {pkg.location} <br />
                  LIMIT: UP TO {pkg.capacity} GUESTS
                </span>

                <div className="mt-6 space-y-3">
                  {pkg.perks.map((perk, i) => (
                    <div key={i} className="flex gap-2.5 items-start">
                      <ShieldCheck size={13} className="text-zinc-450 shrink-0 mt-0.5" />
                      <p className="font-sans text-xs text-slate-300 group-hover:text-slate-100 transition-colors leading-relaxed font-light">
                        {perk}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing, booking actions */}
              <div className="mt-8 pt-4 border-t border-neutral-900 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[9px] text-zinc-500 block uppercase">TARE RATE</span>
                  <span className="font-mono text-base xs:text-lg font-bold text-white block">
                    NPR {pkg.price.toLocaleString()}
                  </span>
                  <span className="font-mono text-[10px] text-gray-500 block">
                    ~${Math.round(pkg.price / 133)} USD
                  </span>
                </div>
                
                <button
                  onClick={() => onBookVIPPackage(pkg)}
                  className="py-2.5 px-4 rounded-sm bg-black hover:bg-white hover:text-black hover:border-white border border-zinc-800 font-mono text-[10px] tracking-wider uppercase font-bold transition-all cursor-pointer shadow-md"
                >
                  SELECT BOOTH
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Decorative Blueprint layout wireframe at the bottom */}
      <div className="max-w-7xl mx-auto px-6 mt-16 opacity-40">
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/10 p-5 font-mono text-[9px] text-zinc-500 leading-relaxed flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-1 text-left">
            <span className="text-zinc-350 font-bold block mb-1 uppercase tracking-widest">// ARCHITECTURAL SPECIFICATIONS</span>
            <div>TOTAL ARENA CAPACITY: 1,200+ REVELERS & ROYALTY VIP BOOTHS</div>
            <div>BASS ARRAY DISTRIBUTION: Nepal's first Canada-tuned Adamson Audio subwoofers</div>
            <div>LIGHTING SYSTEM: Sync architectural laser matrices and high-frequency strobes</div>
          </div>
          <div className="space-y-1 text-left">
            <span className="text-zinc-350 font-bold block mb-1 uppercase tracking-widest">// DRESS CODE & HOUSE RULES</span>
            <div>ENTRY LICENSE: strictly based on code compliance with 18+ verification.</div>
            <div>DRESS CODE: Smart, fashionable nightlife attire. No athletic wear, slippers, or hoodies.</div>
            <div>LOCATION: Chaksibari Marg, Thamel, Kathmandu, Nepal (Parking & Valet Available).</div>
          </div>
        </div>
      </div>
    </div>
  );
};
