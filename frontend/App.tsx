import React, { useState, useEffect, useRef } from "react";
import { HeroChamber } from "./components/HeroChamber";
import { EventRow } from "./components/EventRow";
import { VipSection } from "./components/VipSection";
import { StickyControls } from "./components/StickyControls";
import { ScrollPathTracker } from "./components/ScrollPathTracker";
import { VIPBooking } from "./components/VIPBooking";
import { DotMeshBackground } from "./components/DotMeshBackground";
import { ClubAlbumGallery } from "./components/ClubAlbumGallery";
import { ClubEvent, VIPPackage } from "./types";
import { Sparkles, Instagram, Flame, MapPin, Globe, Clock, ShieldAlert, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { EsewaFeedback } from "./components/EsewaFeedback";
import { AdminPanel } from "./components/AdminPanel";
import { EmployeePanel } from "./components/EmployeePanel";

export default function App() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingMode, setBookingMode] = useState<"ticket" | "vip">("ticket");
  const [bookingEvent, setBookingEvent] = useState<ClubEvent | null>(null);

  // 18+ Age Gate State
  const [ageVerified, setAgeVerified] = useState<boolean | null>(null);

  // Continuously tracked scroll progress from 0 to 1
  const [scrollProgress, setScrollProgress] = useState(0);

  // Lightweight native router path state
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    // Check local storage for persistent age verification
    const verified = localStorage.getItem("xo_age_verified");
    if (verified === "true") {
      setAgeVerified(true);
    } else {
      setAgeVerified(false);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress(Math.min(Math.max(scrollY / totalHeight, 0), 1));
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    
    // Initial check
    setTimeout(handleScroll, 100);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const handleVerifyAge = () => {
    localStorage.setItem("xo_age_verified", "true");
    setAgeVerified(true);
  };

  const handleBookTicket = (event: ClubEvent) => {
    setBookingEvent(event);
    setBookingMode("ticket");
    setBookingOpen(true);
  };

  const handleBookVIPClass = (pkg: VIPPackage) => {
    setBookingMode("vip");
    setBookingOpen(true);
  };

  const handleStickyVIPClick = () => {
    setBookingMode("vip");
    setBookingOpen(true);
  };

  const scrollToEvents = () => {
    document.getElementById("events-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToVIP = () => {
    document.getElementById("vip-section")?.scrollIntoView({ behavior: "smooth" });
  };

  if (path === "/payment/success") {
    return <EsewaFeedback type="success" />;
  }

  if (path === "/payment/failure") {
    return <EsewaFeedback type="failure" />;
  }

  if (path === "/admin") {
    return <AdminPanel />;
  }

  if (path === "/employee") {
    return <EmployeePanel />;
  }

  return (
    <div className="relative min-h-screen bg-obsidian text-slate-100 selection:bg-[#EF4444] selection:text-white">
      
      {/* INTERACTIVE BACKGROUND CANVAS DOTS MESH */}
      <DotMeshBackground />
      
      {/* 18+ AGE GATE MODAL */}
      <AnimatePresence>
        {ageVerified === false && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#050505] backdrop-blur-xl animate-once animate-duration-300"
          >
            <motion.div
              initial={{ scale: 0.92, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 26 }}
              className="relative w-full max-w-lg p-8 rounded-lg bg-black border border-neutral-850 shadow-[0_0_50px_rgba(239,68,68,0.06)] text-center overflow-hidden"
            >
              {/* Premium red gradient top line */}
              <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-neutral-900 via-[#EF4444] to-neutral-900 animate-pulse" />
              
              <div className="w-16 h-16 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center mx-auto mb-6 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                <ShieldAlert size={32} className="text-[#EF4444]" />
              </div>

              <h2 className="font-syne font-black text-2.5xl tracking-wide text-white uppercase mb-2">
                AGE GATE RESTRICTED
              </h2>
              <span className="font-mono text-[9px] text-[#EF4444] tracking-widest uppercase block mb-6 font-bold">
                XO CLUB KATHMANDU // AGE 18+ STRICTLY ENFORCED
              </span>

              <p className="font-sans text-xs sm:text-sm text-zinc-400 leading-relaxed mb-8 max-w-md mx-auto">
                XO Club is Kathmandu's ultimate luxury nightlife landmark in Thamel. Acceding to our events, premium Canada-tuned Adamson acoustics, and exclusive VIP tables requires guests to be of <strong>18+ years of age</strong>. Please confirm your compliance.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <button
                  type="button"
                  onClick={handleVerifyAge}
                  className="w-full sm:w-auto px-8 py-3.5 bg-white text-black font-semibold rounded-sm text-xs font-mono tracking-widest font-extrabold uppercase hover:bg-[#EF4444] hover:text-white active:scale-95 transition-all shadow-lg cursor-pointer"
                >
                  I AM 18 OR OLDER
                </button>
                <button
                  type="button"
                  onClick={() => window.location.href = "https://google.com"}
                  className="w-full sm:w-auto px-8 py-3.5 bg-black hover:bg-zinc-950 rounded-sm text-xs font-mono tracking-widest text-zinc-500 border border-neutral-850 uppercase active:scale-95 transition-all cursor-pointer"
                >
                  EXIT PORTAL
                </button>
              </div>

              <div className="mt-8 pt-4 border-t border-neutral-900 text-[9px] font-mono text-zinc-550 uppercase">
                By entering, you confirm agreement to our smart dress code & entry regulations.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GLOBAL BACKGROUND ATMOSPHERIC GLOWS - SUBDUED SILVER & CHARCOAL GLOWS WITH TRACE OF RED */}
      <div className="fixed top-[-200px] left-[-200px] w-[600px] h-[600px] bg-red-600 opacity-[0.008] blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-neutral-100 opacity-[0.008] blur-[120px] rounded-full pointer-events-none z-0" />

      {/* FIXED BRUTALIST AESTHETIC VERTICAL RAIL (LEFT FLANK) */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-8 z-30 pointer-events-none">
        <div className="w-[1px] h-24 bg-neutral-800/40" />
        <span className="[writing-mode:vertical-lr] rotate-180 text-[9px] uppercase tracking-[0.5em] text-neutral-600/50 font-mono leading-none font-bold">
          XO KATHMANDU // 30 CRORE NEURO VENUE
        </span>
        <div className="w-[1px] h-24 bg-neutral-800/40" />
      </div>

      {/* RENDER CONTINUOUS WEB PAGE SECTIONS */}
      <main className="relative z-10 w-full flex flex-col items-center">
        {/* Section 1: Hero Chamber */}
        <HeroChamber
          onExploreEvents={scrollToEvents}
          onExploreVIP={scrollToVIP}
        />

        {/* Section 2: XO Calendar Events */}
        <EventRow onBookClick={handleBookTicket} />

        {/* Section 3: VIP Spaces */}
        <div id="vip-section" className="w-full bg-transparent border-b border-neutral-900/60 flex flex-col justify-center min-h-[85vh]">
          <VipSection onBookVIPPackage={handleBookVIPClass} />
        </div>

        {/* Section 3.5: Club Album Gallery */}
        <ClubAlbumGallery />

        {/* Section 4: House Rules, Map and Footer */}
        <div id="info-section" className="w-full bg-transparent flex flex-col justify-between min-h-[85vh]">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20 w-full">
            {/* House Guidelines & Rules */}
            <div className="space-y-6 select-text">
              <div>
                <span className="font-mono text-[10px] text-[#EF4444] tracking-[0.3em] font-bold block mb-2 uppercase">
                  // ADMISSION PROTOCOL
                </span>
                <h2 className="font-syne font-black text-3.5xl text-white uppercase leading-none">
                  HOUSE CODES & HOURS
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Operational parameters */}
                <div className="p-4 rounded border border-neutral-850 bg-neutral-900/10 space-y-2">
                  <div className="flex items-center gap-2 text-white">
                    <Clock size={14} className="text-[#EF4444]" />
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider">OPERATIONAL HOURS</span>
                  </div>
                  <div className="space-y-1 text-slate-300 font-sans text-xs">
                    <p className="font-bold text-white uppercase">FRIDAY &amp; SATURDAY:</p>
                    <p className="text-zinc-400 font-mono">10:00 PM – 3:30 AM</p>
                    <p className="text-[9px] text-zinc-500 mt-2 font-mono uppercase block">Mid-week specials individually posted.</p>
                  </div>
                </div>

                {/* Dress Code parameter */}
                <div className="p-4 rounded border border-neutral-850 bg-neutral-900/10 space-y-2">
                  <div className="flex items-center gap-2 text-white">
                    <Flame size={14} className="animate-pulse text-[#EF4444]" />
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider">DRESS PROTOCOL</span>
                  </div>
                  <div className="space-y-1 text-slate-300 font-sans text-xs leading-relaxed">
                    <p className="font-bold uppercase text-white">SMART &amp; STYLISH:</p>
                    <p className="text-zinc-400">Strictly no tracksuits, athletic slides, hoodies, or slippers permitted at validation points.</p>
                  </div>
                </div>
              </div>

              {/* Checklist guidelines */}
              <div className="space-y-2 pt-2 font-mono text-[10px] text-zinc-400">
                <div className="flex items-start gap-2">
                  <Check size={12} className="text-red-500 shrink-0 mt-0.5" />
                  <p>Governed by strict 18+ age checks — active Government ID or Passport mandatory.</p>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={12} className="text-red-500 shrink-0 mt-0.5" />
                  <p>Canada-tuned Adamson Audio acoustics maintained at peak auditory safety parameters.</p>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={12} className="text-red-500 shrink-0 mt-0.5" />
                  <p>Valet service coordinates and fast-track reservation lines active via Thamel gate.</p>
                </div>
              </div>
            </div>

            {/* Map rendering */}
            <div className="relative rounded-lg overflow-hidden border border-neutral-850 h-[300px] group w-full">
              <div className="absolute inset-0 bg-zinc-950 bg-[radial-gradient(#1c1c1e_1.5px,transparent_1.5px)] [background-size:16px_16px] flex flex-col justify-between p-5">
                <div className="flex justify-between items-start font-mono text-[9px] text-zinc-500 z-10">
                  <span>SECTOR: THAMEL // CENTRAL</span>
                  <span className="text-[#EF4444] font-bold">27.7142° N, 85.3117° E</span>
                </div>

                <div className="absolute inset-x-0 w-2/3 h-1.5 bg-neutral-900/20 rotate-12 top-1/3 left-10 pointer-events-none" />
                <div className="absolute inset-y-0 w-1.5 h-full bg-neutral-900/10 top-0 left-1/2 rotate-45 pointer-events-none" />
                
                <div className="absolute top-[48%] left-[45%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-15">
                  <span className="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-red-650 opacity-15" />
                  <span className="animate-pulse absolute inline-flex h-5 w-5 rounded-full bg-red-950 border border-red-500 opacity-60" />
                  
                  <div className="py-1 px-2 rounded bg-black border border-red-500/50 text-white font-mono text-[8px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-lg relative">
                    <MapPin size={9} className="text-[#EF4444]" />
                    XO CLUB KATHMANDU
                  </div>
                </div>

                <div className="absolute top-1/4 right-8 p-2 bg-black/95 border border-neutral-850 rounded text-[8px] font-mono text-zinc-400 max-w-[130px] pointer-events-none">
                  <span className="text-white font-bold block mb-0.5 font-sans">CHAKSIBARI MARG:</span>
                  Near Bhagwati Bahal Thamel.
                </div>

                <div className="z-10 w-full mt-auto bg-black/95 border border-neutral-850 p-3 rounded flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[8px] text-zinc-400 block font-bold leading-none uppercase">CHAKSIBARI MARG</span>
                    <span className="font-sans text-[10px] text-zinc-400 font-light mt-1 block">Thamel, Kathmandu, Nepal</span>
                  </div>
                  
                  <a
                    href="https://maps.google.com/?q=XO+Club+Thamel+Kathmandu" 
                    target="_blank" 
                    rel="noreferrer"
                    className="py-1 px-3 rounded bg-red-950/45 hover:bg-neutral-850 text-[10px] font-mono font-bold text-red-500 border border-red-900/50 transition-colors pointer-events-auto cursor-pointer"
                  >
                    NAVIGATE WITH GPS
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Brutalist Footer parameters */}
          <footer className="w-full bg-slate-950/80 border-t border-neutral-900 py-10 px-6 mt-auto">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-3 md:col-span-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-syne font-black text-lg text-white uppercase tracking-wider">
                    XO CLUB KATHMANDU
                  </span>
                </div>
                <p className="font-sans text-xs text-zinc-400 max-w-sm leading-relaxed font-light">
                  Nepal’s ultra-premium nightlife landmark. Crafted with an NPR 30 Crore infrastructure layout in Chaksibari Marg, Thamel, XO Club features a 1,200+ capacity mega-chamber and the country’s premier Canada-tuned Adamson Audio acoustics integration.
                </p>
                <div className="flex items-center gap-4 pt-1 text-zinc-550">
                  <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors uppercase font-mono text-[9px] tracking-wider flex items-center gap-1.5 cursor-pointer">
                    <Instagram size={11} className="text-[#EF4444]" /> INSTAGRAM
                  </a>
                  <a href="#about" className="hover:text-white transition-colors uppercase font-mono text-[9px] tracking-wider flex items-center gap-1.5 cursor-pointer">
                    <Globe size={11} /> SOUND INTEL
                  </a>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-mono text-[9px] text-zinc-500 block uppercase font-bold tracking-widest">
                  // PHYSICAL DESTINATION
                </span>
                <p className="font-mono text-xs text-zinc-400 leading-relaxed uppercase">
                  CHAKSIBARI MARG, THAMEL
                  <br />
                  KATHMANDU, NEPAL
                  <br />
                  COORDINATES: <span className="text-white font-bold">27.7142° N, 85.3117° E</span>
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-mono text-[9px] text-zinc-500 block uppercase font-bold tracking-widest">
                  // ACOUSTIC ATTRIBUTES
                </span>
                <ul className="font-mono text-[10px] text-zinc-450 space-y-1 uppercase font-medium">
                  <li>• CANADA ADAMSON SPEAKER RIG</li>
                  <li>• MAX AUDIO COMPLIANCE // 133db</li>
                  <li>• 1,200 CAPACITY PEAK</li>
                  <li>• CHROMATIC NEON GRID</li>
                </ul>
              </div>
            </div>

            <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-1 font-mono text-[8px] text-zinc-650">
              <span>XO CLUB KATHMANDU © 2026. ALL RIGHTS REGISTERED.</span>
              <span className="flex items-center gap-1">
                <Flame size={10} className="text-red-500" />
                UNAUTHORIZED DUPLICATES CANCELLED // THAMEL, NEPAL
              </span>
            </div>
          </footer>
        </div>
      </main>

      {/* FLOAT LAYER 1: VIEWPORT STICKY CONTROLS & THE MAGNETIC "BOOK VIP TABLE" BUTTON */}
      <StickyControls onBookVIPClick={handleStickyVIPClick} />

      {/* FLOAT LAYER 1.5: THE ORGANIC SCROLL-FLIGHT PATH TRACKER IN BACKGROUND */}
      <ScrollPathTracker scrollProgress={scrollProgress} />

      {/* FLOAT LAYER 2: INTERACTIVE VIP/TICKET COMPILING CONSOLE (SLIDE MODAL) */}
      <VIPBooking
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        initialMode={bookingMode}
        initialEvent={bookingEvent}
      />
    </div>
  );
}
