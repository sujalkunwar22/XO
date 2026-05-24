import React, { useRef, useState, useEffect } from "react";
import { motion, useSpring } from "motion/react";
import { CLUB_EVENTS } from "../data";
import { ClubEvent } from "../types";
import { PosterVisual } from "./PosterVisual";
import { ChevronLeft, ChevronRight, Ticket, Flame, Info, Calendar } from "lucide-react";

const cleanMediaUrl = (url: string): string => {
  if (!url) return "";
  
  // Intercept and replace the specific broken Giphy URLs with gorgeous Unsplash images
  if (url.includes("l0O9zk3Tq6V1zZ0oE")) {
    return "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800"; // Epic Live Rock
  }
  if (url.includes("l2SpYdCg4a4mALtYc")) {
    return "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800"; // EDM Saturday Lasers
  }
  if (url.includes("IccU6atP06X22tOveH")) {
    return "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800"; // Bollywood / Confetti Club
  }
  if (url.includes("39p233wA0wK64LOB6K")) {
    return "https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=800"; // Underground Techno Visuals
  }
  
  // General fallback for other broken/expired Giphy links
  if (url.includes("giphy.com") && (url.includes("v1.Y2lk") || url.includes("/media/"))) {
    return "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800";
  }

  return url;
};

const EventMedia: React.FC<{ url: string; title: string; isHovered?: boolean }> = ({ url, title, isHovered }) => {
  const [videoError, setVideoError] = React.useState(false);

  const cleanedUrl = cleanMediaUrl(url);
  if (!cleanedUrl) return null;

  // Google Drive video URL parser regex pattern
  const driveMatch = cleanedUrl.match(/(?:drive\.google\.com\/file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/i);
  if (driveMatch) {
    const fileId = driveMatch[1];
    if (!videoError) {
      const directDriveUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
      return (
        <video
          src={directDriveUrl}
          autoPlay
          loop
          muted
          playsInline
          onError={() => {
            console.warn("Google Drive direct video load failed. Falling back to iframe preview.");
            setVideoError(true);
          }}
          className={`w-full h-full object-cover contrast-[1.15] saturate-[1.2] transition-all duration-700 pointer-events-none ${
            isHovered ? "brightness-[0.85] scale-[1.05]" : "brightness-[0.6]"
          }`}
        />
      );
    } else {
      return (
        <div className="w-full h-full relative overflow-hidden pointer-events-none scale-[1.3] origin-center transition-all duration-700">
          <iframe
            src={`https://drive.google.com/file/d/${fileId}/preview`}
            className={`absolute inset-0 w-full h-[120%] border-0 contrast-[1.1] saturate-[1.2] transition-all duration-700 pointer-events-none ${
              isHovered ? "brightness-[0.85]" : "brightness-[0.6]"
            }`}
            allow="autoplay; encrypted-media"
            scrolling="no"
          />
          <div className="absolute inset-0 z-10 bg-transparent" />
        </div>
      );
    }
  }

  // Instagram Reel / Post / TV URL parser regex pattern
  const instaMatch = cleanedUrl.match(/(?:instagram\.com\/(?:p|reel|tv)\/)([a-zA-Z0-9_-]+)/i);
  if (instaMatch) {
    const shortcode = instaMatch[1];
    return (
      <div className="w-full h-full relative overflow-hidden pointer-events-none scale-[1.7] origin-center transition-all duration-700">
        {/* Render a muted pointer-events-none embed layout of the instagram reel, cropped significantly by scale-[1.7] */}
        <iframe
          src={`https://www.instagram.com/reel/${shortcode}/embed/?utm_source=ig_embed`}
          className={`absolute inset-0 w-full h-[120%] border-0 contrast-[1.1] saturate-[1.2] transition-all duration-700 pointer-events-none ${
            isHovered ? "brightness-[0.85]" : "brightness-[0.6]"
          }`}
          scrolling="no"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        />
        {/* Cover absolute overlay block to protect interactions */}
        <div className="absolute inset-0 z-10 bg-transparent" />
      </div>
    );
  }

  // Direct MP4 or dynamic video check
  const isVideo = cleanedUrl.endsWith(".mp4") || cleanedUrl.includes(".mp4") || cleanedUrl.includes("video");
  if (isVideo && !videoError) {
    return (
      <video
        src={cleanedUrl}
        autoPlay
        loop
        muted
        playsInline
        onError={() => {
          console.warn("Direct video load failed. Falling back to static cover.");
          setVideoError(true);
        }}
        className={`w-full h-full object-cover contrast-[1.15] saturate-[1.2] transition-all duration-700 pointer-events-none ${
          isHovered ? "brightness-[0.85] scale-[1.05]" : "brightness-[0.6]"
        }`}
      />
    );
  }

  // Standard high-fidelity static image / Unsplash / GIF fallback
  const finalUrl = videoError
    ? "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop"
    : cleanedUrl;

  return (
    <img 
      src={finalUrl} 
      alt={title} 
      referrerPolicy="no-referrer"
      onError={(e) => {
        // Ultimate fallback if even the primary image breaks
        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800";
      }}
      className={`w-full h-full object-cover contrast-[1.15] saturate-[1.2] transition-all duration-700 pointer-events-none ${
        isHovered ? "brightness-[0.85] scale-[1.05]" : "brightness-[0.6]"
      }`}
    />
  );
};

interface EventCardProps {
  event: ClubEvent;
  onBookClick: (event: ClubEvent) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onBookClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Parallax displacement states
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Elastic springs for glowing border (stiffness: 300, damping: 20)
  const glowOpacity = useSpring(0, { stiffness: 300, damping: 20 });
  const scaleSpring = useSpring(1, { stiffness: 300, damping: 20 });

  // Days Countdown state
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date(event.targetDate);
      let diff = target.getTime() - now.getTime();
      
      // If the event target date passed, auto-roll-forward to next week for dynamic prototype
      const sixHours = 6 * 60 * 60 * 1000;
      if (diff < -sixHours) {
        const daysToAdd = Math.ceil(Math.abs(diff) / (1000 * 60 * 60 * 24 * 7)) * 7;
        const newTarget = new Date(target);
        newTarget.setDate(newTarget.getDate() + daysToAdd);
        diff = newTarget.getTime() - now.getTime();
      }

      if (diff <= 0) {
        return null; // Live tonight
      }

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [event.targetDate]);

  const handleAddToCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    const startDate = new Date(event.targetDate);
    
    let durationHours = 6;
    if (event.time.includes("21:00 - 03:30")) durationHours = 6.5;
    else if (event.time.includes("22:00 - 03:30")) durationHours = 5.5;
    else if (event.time.includes("21:30 - 03:00")) durationHours = 5.5;
    else if (event.time.includes("22:00 - 03:00")) durationHours = 5;

    const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);

    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const icsDateStart = formatICSDate(startDate);
    const icsDateEnd = formatICSDate(endDate);
    const nowStr = formatICSDate(new Date());

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//XO Club Kathmandu//Event Calendar//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${event.id}@xoclubkathmandu.com`,
      `DTSTAMP:${nowStr}`,
      `DTSTART:${icsDateStart}`,
      `DTEND:${icsDateEnd}`,
      `SUMMARY:XO CLUB KATHMANDU - ${event.title}`,
      `DESCRIPTION:Join us for an immersive audio-visual spectacle at XO Club Kathmandu.\\n\\nHeadliner: ${event.headliner}\\nSupport: ${event.support.join(", ")}\\nGenre Spectrum: ${event.subgenre}\\nBPM: ${event.bpm}\\n\\nDoor Policy: ${event.doorPolicy}\\n\\nReserve tickets at: https://maps.google.com/?q=XO+Club+Thamel+Kathmandu`,
      "LOCATION:Chaksibari Marg, Thamel, Kathmandu, Nepal",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeTitle = event.title.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    link.download = `xo_club_${safeTitle}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    // Center point coordinates of card
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Relative displacement vector
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    
    // Inverse tracking mapping (shift opposite to mouse by factor of -0.075)
    setParallax({
      x: dx * -0.09,
      y: dy * -0.12
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    glowOpacity.set(1);
    scaleSpring.set(1.02);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    glowOpacity.set(0);
    scaleSpring.set(1);
    setParallax({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        scale: scaleSpring,
        willChange: "transform"
      }}
      className="relative flex-shrink-0 w-[290px] sm:w-[340px] h-[520px] rounded-lg bg-white/5 border border-white/10 overflow-hidden group/card cursor-pointer select-none"
    >
      {/* Elastic Neon Glowing Border Outer Shadow */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-lg z-20"
        style={{
          opacity: glowOpacity,
          boxShadow: `inset 0 0 15px rgba(255, 255, 255, 0.4), 0 0 25px rgba(255, 255, 255, 0.15)`,
          border: `1.5px solid #ffffff`,
        }}
      />

      {/* Layer 1: Parallax inverse tracking wrap */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          className="w-full h-full transition-transform duration-200 ease-out"
          style={{
            transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0) scale(1.15)`,
            willChange: "transform"
          }}
        >
          {/* Dynamic dynamic backdrop element */}
          <div className="absolute inset-0 z-0">
            <EventMedia url={event.gifUrl} title={event.title} isHovered={isHovered} />
            {/* Ambient dynamic dark gradient to ensure the text remains extremely legible */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent mix-blend-multiply" />
          </div>

          {/* Minimalist overlay vector layout for premium structural identity */}
          <div className="absolute inset-0 z-10 opacity-40 group-hover/card:opacity-60 transition-all duration-500">
            <PosterVisual style={event.graphicStyle} title={event.title} headliner={event.headliner} />
          </div>
        </div>
      </div>

      {/* Atmospheric bottom card vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10 pointer-events-none" />

      {/* Floating Info Overlay (top corner) */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-2 max-w-[90%]">
        <span className="px-2 py-0.5 text-[8px] font-mono font-bold bg-black/95 backdrop-blur-md text-white rounded border border-neutral-800 tracking-wider">
          {event.bpm} BPM
        </span>
        <span className="px-2 py-0.5 text-[8px] font-mono font-bold text-white bg-black/95 backdrop-blur-md rounded border border-neutral-800 tracking-wider">
          {event.availableTickets} LEFT
        </span>
        {timeLeft ? (
          <span className="px-2 py-0.5 text-[8px] font-mono font-bold text-red-400 bg-black/95 backdrop-blur-md border border-neutral-800 rounded flex items-center gap-1 tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {timeLeft.days > 0 ? `${timeLeft.days}d ` : ""}{timeLeft.hours}h LEFT
          </span>
        ) : (
          <span className="px-2 py-0.5 text-[8px] font-mono font-bold text-emerald-400 bg-black/95 backdrop-blur-md border border-emerald-950 rounded flex items-center gap-1 tracking-wider animate-pulse">
            ● LIVE TONIGHT
          </span>
        )}
      </div>

      {/* Cinematic sliding drawer panel */}
      <motion.div
        initial={{ y: "75%" }}
        animate={{ y: isHovered ? "0%" : "75%" }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="absolute inset-0 z-30 bg-black/95 border-t border-neutral-800 backdrop-blur-xl px-5 py-4 flex flex-col justify-between"
      >
        {/* Closed / Peak View Headers */}
        <div>
          {/* Small notch handle indicator */}
          <div className="w-8 h-1 bg-neutral-800 rounded-full mx-auto mb-3 opacity-60" />
          
          <div className="text-[10px] font-mono tracking-widest text-zinc-400 mb-1 font-semibold">
            {event.date} // {event.time}
          </div>
          <h3 className="font-syne font-extrabold text-lg sm:text-xl text-white uppercase tracking-wide leading-tight group-hover/card:text-white transition-colors duration-300">
            {event.title}
          </h3>
          <p className="font-mono text-[10px] text-zinc-400 mt-1 uppercase border-b border-neutral-900 pb-3">
            HEADLINER: <span className="text-white font-bold">{event.headliner}</span>
          </p>

          {/* Details Revealed inside Drawer */}
          <div className="mt-4 space-y-3 overflow-y-auto max-h-[220px] sm:max-h-[250px] pr-1" style={{ scrollbarWidth: "none" }}>
            <div>
              <span className="text-[9px] font-mono tracking-widest text-zinc-350 uppercase flex items-center gap-1 font-bold">
                <Flame size={10} className="text-zinc-400" /> SUPPORT ROTATION
              </span>
              <p className="font-sans text-xs font-medium text-slate-300 mt-1 leading-tight">
                {event.support.join(" / ")}
              </p>
            </div>

            <div>
              <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase flex items-center gap-1 font-semibold">
                <Info size={10} className="text-zinc-400" /> GENRE SPECTRUM
              </span>
              <p className="font-mono text-[11px] font-bold text-white mt-0.5 leading-tight">
                {event.subgenre}
              </p>
            </div>

            <div className="p-2.5 rounded bg-neutral-900/40 border border-neutral-800 font-mono text-[9px] text-zinc-350 leading-relaxed">
              <span className="text-white font-bold block mb-0.5 uppercase">ENTRY POLICY:</span>
              {event.doorPolicy}
            </div>

            {/* Days Countdown & Add to Calendar integrated widget */}
            <div className="p-2.5 rounded bg-white/5 border border-white/10 font-mono text-[9px] flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-1.5">
                <div>
                  <span className="text-zinc-500 block uppercase text-[8px]">COUNTDOWN</span>
                  {timeLeft ? (
                    <span className="text-white font-bold tracking-wider">
                      {timeLeft.days}D {timeLeft.hours}H {timeLeft.minutes}M {timeLeft.seconds}S
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-bold animate-pulse">
                      ● ALIVE TONIGHT
                    </span>
                  )}
                </div>
                {timeLeft && (
                  <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded text-[8px] font-bold">
                    {timeLeft.days} D TO GO
                  </span>
                )}
              </div>

              <button
                onClick={handleAddToCalendar}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-neutral-900 border border-neutral-800 hover:border-white text-white hover:text-black hover:bg-white text-[9px] font-mono tracking-widest uppercase font-extrabold transition-all duration-200 cursor-pointer rounded"
              >
                <Calendar size={11} />
                ADD TO CALENDAR
              </button>
            </div>
          </div>
        </div>

        {/* Immediate Ticket Booking Panel */}
        <div className="mt-4 pt-3 border-t border-neutral-900 flex items-center justify-between gap-3">
          <div>
            <span className="text-[9px] font-mono text-zinc-500 block uppercase">PASS RATE</span>
            <span className="font-mono text-sm sm:text-base font-bold text-white text-neon-glow">NPR {event.ticketPrice.toLocaleString()}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookClick(event);
            }}
            className="flex-grow flex items-center justify-center gap-1.5 py-2 px-3 rounded-sm bg-white text-xs font-mono tracking-widest uppercase text-black font-extrabold hover:bg-zinc-200 active:scale-95 transition-all cursor-pointer shadow-lg"
          >
            <Ticket size={12} />
            BUY ACCESS
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface EventRowProps {
  onBookClick: (event: ClubEvent) => void;
}

export const EventRow: React.FC<EventRowProps> = ({ onBookClick }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [liveEvents, setLiveEvents] = useState<ClubEvent[]>(CLUB_EVENTS);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await fetch("/api/admin/events");
        if (response.ok) {
          const res = await response.json();
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            setLiveEvents(res.data);
          }
        }
      } catch (err) {
        console.warn("API load failed, using local copy:", err);
      }
    };

    loadEvents();
    const interval = setInterval(loadEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollRight = () => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: 340, behavior: "smooth" });
    }
  };

  const scrollLeft = () => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: -340, behavior: "smooth" });
    }
  };

  return (
    <div id="events-section" className="relative w-full py-20 scroll-mt-20 border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-6 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] text-zinc-400 tracking-[0.3em] font-bold block mb-2 uppercase">
            // WORLD CLASS SPECTACLES
          </span>
          <h2 className="font-syne font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-white uppercase leading-none">
            XO CALENDAR EVENTS
          </h2>
        </div>

        {/* Dynamic Controls and Status */}
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] text-zinc-500 uppercase flex items-center gap-2">
            SWIPE TICKETS
          </span>
          <div className="flex gap-2">
            <button
              onClick={scrollLeft}
              className="p-3 bg-neutral-900/40 hover:bg-neutral-800 rounded border border-neutral-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={scrollRight}
              className="p-3 bg-neutral-900/40 hover:bg-neutral-800 rounded border border-neutral-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Lineup Horizontal Runway slider with drag bounds */}
      <div className="relative w-full overflow-hidden">
        {/* Subtle background glow element */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 rounded-full bg-white/[0.01] blur-[120px] pointer-events-none z-0" />
        
        <div
          ref={rowRef}
          className="flex gap-6 overflow-x-auto px-6 md:px-12 pb-8 scrollbar-none snap-x snap-mandatory relative z-10"
          style={{ scrollbarWidth: "none" }}
        >
          {liveEvents.map((evt) => (
            <div key={evt.id} className="snap-start">
              <EventCard event={evt} onBookClick={onBookClick} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
