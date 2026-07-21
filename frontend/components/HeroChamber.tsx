import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { KineticHeader } from "./KineticHeader";
import { ArrowDown, Shield, Music, Zap } from "lucide-react";
import { ClubXOLogo } from "./ClubXOLogo";

gsap.registerPlugin(ScrollTrigger);

interface HeroChamberProps {
  onExploreEvents: () => void;
  onExploreVIP: () => void;
}

export const HeroChamber: React.FC<HeroChamberProps> = ({ onExploreEvents, onExploreVIP }) => {
  const chamberRef = useRef<HTMLDivElement>(null);
  const bgWrapperRef = useRef<HTMLDivElement>(null);
  const fgContentRef = useRef<HTMLDivElement>(null);
  const bgLogoRef = useRef<HTMLDivElement>(null);

  // Interactivity tracking reference vectors
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const logoEl = bgLogoRef.current;
    let animId: number;
    let ctxTimeline: any;

    // Desktop mousemove tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth) - 0.5;
      mouseRef.current.targetY = (e.clientY / window.innerHeight) - 0.5;
    };

    // Mobile touch tracking
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current.targetX = (e.touches[0].clientX / window.innerWidth) - 0.5;
        mouseRef.current.targetY = (e.touches[0].clientY / window.innerHeight) - 0.5;
      }
    };

    const handleTouchEnd = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
    };

    let targetScrollY = 0;
    const handleScroll = () => {
      targetScrollY = window.scrollY;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Inertia, scroll, and floating drift loop for background logo
    let time = 0;
    let currentX = 0;
    let currentY = 0;
    let currentScrollY = 0;

    const tick = () => {
      time += 0.006; // ultra-smooth drift velocity

      // Damped tracking interpolation
      currentX += (mouseRef.current.targetX * 60 - currentX) * 0.06;
      currentY += (mouseRef.current.targetY * 60 - currentY) * 0.06;

      // Damped scroll interpolation 
      currentScrollY += (targetScrollY - currentScrollY) * 0.08;

      // Organic fluid float drift (Sine & Cosine waves)
      const floatX = Math.sin(time * 0.9) * 22;
      const floatY = Math.cos(time * 0.7) * 16;
      const floatRotate = Math.sin(time * 0.4) * 2.5;

      // Scroll-driven effects
      const scrollRotation = currentScrollY * 0.06;
      const scrollScale = 1.0 + (currentScrollY * 0.00025);

      const finalX = currentX + floatX;
      const finalY = currentY + floatY;
      const finalRotate = scrollRotation + floatRotate;
      const finalScale = scrollScale;

      if (logoEl) {
        logoEl.style.transform = `translate3d(${finalX}px, ${finalY}px, 0) rotate(${finalRotate}deg) scale(${finalScale})`;
        const activeOpacity = Math.max(0, 0.20 - (currentScrollY * 0.0003));
        logoEl.style.opacity = `${activeOpacity}`;
      }

      animId = requestAnimationFrame(tick);
    };
    tick();

    // GSAP ScrollTrigger camera motion context
    ctxTimeline = gsap.context(() => {
      gsap.fromTo(
        bgWrapperRef.current,
        { scale: 1.2, opacity: 1 },
        {
          scale: 1.0,
          opacity: 0.25,
          ease: "none",
          scrollTrigger: {
            trigger: chamberRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          }
        }
      );

      gsap.fromTo(
        fgContentRef.current,
        { scale: 1.0, opacity: 1, y: 0 },
        {
          scale: 1.5,
          opacity: 0,
          y: -150,
          ease: "power2.in",
          scrollTrigger: {
            trigger: chamberRef.current,
            start: "top top",
            end: "bottom 40%",
            scrub: true,
            invalidateOnRefresh: true,
          }
        }
      );
    }, chamberRef);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animId);
      if (ctxTimeline) ctxTimeline.revert();
    };
  }, []);

  return (
    <div
      ref={chamberRef}
      className="relative w-full min-h-[160vh] sm:min-h-[170vh] md:min-h-[180vh] bg-transparent flex flex-col items-center justify-between overflow-hidden border-b border-red-950/40 z-10"
    >
      {/* Background container wrapper for 2.5D deep-scroll scaling */}
      <div ref={bgWrapperRef} className="absolute inset-0 w-full h-full z-0 overflow-hidden will-change-transform">
        {/* Massive floating active-logo background watermark (Lesse Studio style) shifted higher up */}
        <div className="absolute inset-0 flex items-center justify-center -translate-y-[10vh] pointer-events-none z-0 select-none overflow-hidden">
          <div 
            ref={bgLogoRef} 
            className="w-[85vw] max-w-[1100px] h-[55vh] md:h-[75vh] flex items-center justify-center will-change-transform opacity-15"
            style={{ 
              mixBlendMode: "screen", 
              filter: "contrast(1.05) brightness(1.1) drop-shadow(0 0 40px rgba(255,255,255,0.05))" 
            }}
          >
            <ClubXOLogo className="w-full h-full max-h-full object-contain pointer-events-none" color="#FFFFFF" glow={false} />
          </div>
        </div>
        
        {/* Immersive Subdued Ambient Overlays mimicking moving concert venue lasers */}
        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-neutral-900/10 blur-[130px] ambient-aurora pointer-events-none" />
        <div className="absolute bottom-[20%] left-1/4 w-[600px] h-[450px] rounded-full bg-neutral-950/5 blur-[120px] ambient-aurora pointer-events-none" />
        <div className="absolute top-[40%] right-10 w-[400px] h-[400px] rounded-full bg-white/[0.015] blur-[140px] ambient-aurora pointer-events-none" />
        
        {/* Red Underlay Grid lines */}
        <div className="absolute inset-0 opacity-20 club-grid z-1" />
      </div>

      {/* Floating Header UI / Controls */}
      <div className="w-full max-w-7xl px-6 md:px-12 py-5 flex items-center justify-between z-20 relative select-none">
        
        {/* Logo and branding - Authentic graphical logo coupled with sleek premium typography */}
        <div className="flex items-center gap-3 md:gap-4 relative group">
          {/* Subtle glowing silver aura underlay */}
          <div className="absolute -inset-2 bg-white/[0.04] rounded-full blur-md group-hover:bg-white/[0.08] transition-all duration-350 pointer-events-none" />
          
          <div className="relative flex items-center gap-2 sm:gap-3 md:gap-4 select-none whitespace-nowrap">
            {/* Pure emblem - No borders, no shadows, no background circle as requested */}
            <ClubXOLogo className="w-9 h-9 sm:w-11 sm:h-11 text-white hover:scale-105 transition-transform duration-300 pointer-events-auto cursor-pointer" color="#FFFFFF" glow={false} />
            
            {/* Premium Typography alongside user's actual logo mark in a single horizontal line across all screens */}
            <div className="flex items-center gap-2 sm:gap-3.5 select-none whitespace-nowrap">
              <span className="font-syne font-black text-sm sm:text-lg md:text-xl tracking-[0.14em] sm:tracking-[0.18em] text-white leading-none">
                XO <span className="text-[#EF4444] font-black drop-shadow-[0_0_8px_#EF4444]">CLUB</span>
              </span>
              <span className="text-white/20 text-[10px] sm:text-xs font-mono select-none">/</span>
              <span className="font-mono text-[8px] sm:text-[10px] tracking-[0.18em] sm:tracking-[0.35em] uppercase text-slate-450 leading-none">
                KATHMANDU
              </span>
            </div>
          </div>
        </div>


      </div>

      {/* Centerpiece 2.5D foreground Chamber Header (gets scaled up as we scroll) */}
      <div
        ref={fgContentRef}
        className="w-full flex-grow flex flex-col items-center justify-center px-4 sm:px-6 py-10 z-10 transform-gpu"
      >
        {/* Kinetic Header Component ("XO CLUB KATHMANDU") */}
        <div className="w-full">
          <KineticHeader />
        </div>

        {/* Responsive, invisible spacer div designed to dynamically push home headlines and CTAs out of the first-fold view on all screen sizes */}
        <div id="first-fold-responsive-space" className="w-full h-[30vh] sm:h-[36vh] md:h-[42vh] lg:h-[48vh] xl:h-[52vh] flex-shrink-0 pointer-events-none select-none" />

        {/* Home Headlines and Call to Action buttons */}
        <div className="w-full max-w-4xl text-center mt-6 select-text pointer-events-auto">
          {/* H1 Headline */}
          <h1 className="font-syne font-black text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-white uppercase tracking-tight leading-none mb-4">
            A NEW ERA OF <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-100 to-neutral-400 text-neon-glow">SOUND & SPECTACLE</span>
          </h1>
          
          {/* Sub-headline */}
          <p className="font-sans text-xs sm:text-sm md:text-base text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed font-light">
            Experience Nepal’s premium clubbing environment. Featuring a{" "}
            <span className="font-semibold text-white">1,200+ capacity mega-space</span> and the country’s first
            custom-engineered <span className="font-semibold text-white font-medium">Adamson Audio</span> sound system.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap justify-center items-center gap-4">
            <button
              onClick={onExploreVIP}
              className="px-8 py-4 bg-white hover:bg-[#EF4444] hover:text-white text-black font-syne font-extrabold text-xs tracking-wider uppercase rounded-sm border border-transparent shadow-[0_0_30px_rgba(255,255,255,0.05)] cursor-pointer active:scale-95 transition-all duration-300"
            >
              RESERVE VIP BOOTH
            </button>
            
            <button
              onClick={onExploreEvents}
              className="px-8 py-4 bg-transparent hover:bg-white/5 text-white font-syne font-extrabold text-xs tracking-wider uppercase rounded-sm border border-white/20 hover:border-[#EF4444] transition-colors cursor-pointer"
            >
              UPCOMING EVENTS
            </button>
          </div>
        </div>
      </div>

      {/* The Experience Structural Highlight Description Banner (Black/Red monolithic design accent) */}
      <div className="w-full bg-black/90 border-t border-b border-neutral-800/60 py-8 z-20 relative select-text">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-ping inline-block" />
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-bold">THE EXPERIENCE PHILOSOPHY</span>
            </div>
            <h3 className="font-syne font-extrabold text-lg sm:text-xl text-white uppercase tracking-wider mb-2">
              MONOLITHIC CHROME ARCHITECTURE
            </h3>
            <p className="font-sans text-xs text-gray-400 leading-relaxed font-light">
              XO Club’s physical layout leverages a monolithic black interior sliced open by dynamic, synchronized white and silver lighting structures. Built around high-energy dancefloors, the physical structure hosts massive LED screens and custom array placements configured to route pure, unadulterated Adamson Audio acoustic energy through every square centimeter.
            </p>
          </div>
          
          <div className="bg-neutral-900/40 border border-neutral-750 rounded p-4 flex flex-col justify-center">
            <p className="text-[10px] font-mono text-zinc-350 uppercase tracking-widest mb-1 font-bold">NOW HEADLINING</p>
            <p className="text-white font-syne font-black text-sm tracking-wide">TOP LOCAL & INTERNATIONAL TALENTS</p>
            <p className="text-gray-400 text-xs mt-1 leading-normal font-light">Experience heart-pounding lineups under Thamel’s most advanced custom laser matrices.</p>
          </div>
        </div>
      </div>

      {/* Hero Bottom Minimalist Trust Badges Status Bar */}
      <div className="w-full max-w-7xl px-6 md:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-6 z-20 relative border-t border-neutral-800/30 bg-gradient-to-t from-obsidian to-transparent mb-2">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 sm:gap-12 w-full sm:w-auto">
          {/* Badge 1 */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-neutral-900/40 border border-neutral-850 text-white">
              <Shield size={16} />
            </div>
            <div>
              <p className="text-[11px] font-mono text-gray-400 uppercase leading-none">CAPACITY VENUE</p>
              <p className="text-white font-syne font-extrabold text-sm leading-tight">1,200+ LUXURY REVELERS</p>
            </div>
          </div>
          
          {/* Separator */}
          <div className="hidden md:block w-px h-8 bg-zinc-800" />

          {/* Badge 2 */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-neutral-900/40 border border-neutral-850 text-white">
              <Music size={16} />
            </div>
            <div>
              <p className="text-[11px] font-mono text-gray-400 uppercase leading-none">ACOUSTICAL RIG</p>
              <p className="text-white font-syne font-extrabold text-sm leading-tight">ADAMSON AUDIO SPEAKER RIG</p>
            </div>
          </div>

          {/* Separator */}
          <div className="hidden md:block w-px h-8 bg-zinc-800" />

          {/* Badge 3 */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-neutral-900/40 border border-neutral-850 text-white">
              <Zap size={16} />
            </div>
            <div>
              <p className="text-[11px] font-mono text-gray-400 uppercase leading-none">VIP SERVICES</p>
              <p className="text-white font-syne font-extrabold text-sm leading-tight">EXCLUSIVE FLOOR PLANS</p>
            </div>
          </div>
        </div>

        {/* Scroll link indicator */}
        <button
          onClick={onExploreVIP}
          className="flex items-center gap-2 text-gray-400 hover:text-white font-mono text-[10px] tracking-widest uppercase transition-colors group cursor-pointer font-bold"
        >
          EXPLORE THE SPACES
          <ArrowDown size={14} className="group-hover:translate-y-1 transition-transform text-[#EF4444]" />
        </button>
      </div>
    </div>
  );
};
