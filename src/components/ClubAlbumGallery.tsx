import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PHOTO_GROUPS } from "../data";
import { PhotoGroup } from "../types";
import { ChevronLeft, ChevronRight, X, Image as ImageIcon, Flame, ZoomIn } from "lucide-react";

export function ClubAlbumGallery() {
  const [selectedGroup, setSelectedGroup] = useState<PhotoGroup | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [livePhotos, setLivePhotos] = useState<PhotoGroup[]>(PHOTO_GROUPS);

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const response = await fetch("/api/admin/photos");
        if (response.ok) {
          const res = await response.json();
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            setLivePhotos(res.data);
          }
        }
      } catch (err) {
        console.warn("API load failed, using local photo copies:", err);
      }
    };

    loadPhotos();
    const interval = setInterval(loadPhotos, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenAlbum = (group: PhotoGroup) => {
    setSelectedGroup(group);
    setActivePhotoIndex(0);
  };

  const handleCloseAlbum = () => {
    setSelectedGroup(null);
  };

  const handleNextPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!selectedGroup) return;
    setActivePhotoIndex((prev) => (prev + 1) % selectedGroup.images.length);
  };

  const handlePrevPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!selectedGroup) return;
    setActivePhotoIndex((prev) => (prev - 1 + selectedGroup.images.length) % selectedGroup.images.length);
  };

  return (
    <section id="album-section" className="w-full bg-transparent border-b border-neutral-900/60 py-24 select-text relative z-10">
      <div className="w-full max-w-7xl mx-auto px-6">
        
        {/* Gallery Section Header */}
        <div className="text-center mb-16">
          <span className="font-mono text-[10px] text-[#EF4444] tracking-[0.3em] font-bold block mb-3 uppercase">
            // VISUAL ARCHIVE DECK
          </span>
          <h2 className="font-syne font-black text-3xl sm:text-5xl text-white uppercase leading-none tracking-tight">
            XO SENSORY ALBUMS
          </h2>
          <p className="font-mono text-[10px] text-zinc-550 max-w-lg mx-auto mt-4 uppercase tracking-[0.1em] leading-relaxed">
            High-fidelity captures from the 30 crore Kathmandu flagship venue. Select an archive to load the visual stream.
          </p>
        </div>

        {/* Album Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {livePhotos.map((group, index) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className="group relative flex flex-col justify-between bg-black/40 border border-neutral-850/70 hover:border-red-950/40 rounded-sm overflow-hidden p-6 transition-all duration-300"
            >
              {/* Cover Image Container */}
              <div className="relative aspect-[16/10] w-full overflow-hidden border border-neutral-900 rounded-sm bg-zinc-950 mb-6 group-hover:border-neutral-800 transition-colors">
                <img
                  src={group.coverImage}
                  alt={group.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover filter brightness-[0.75] contrast-[1.05] grayscale-[20%] group-hover:scale-105 group-hover:brightness-95 group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                
                {/* Micro Metadata tag */}
                <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/85 border border-neutral-850 font-mono text-[8px] text-[#EF4444] tracking-widest font-extrabold uppercase rounded-xs">
                  {group.date}
                </span>

                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 font-mono text-[9px] text-zinc-450 uppercase font-semibold">
                  <ImageIcon size={10} className="text-[#EF4444]" />
                  <span>[ {group.images.length} CAPTURES ]</span>
                </div>
              </div>

              {/* Text Info */}
              <div className="mb-8">
                <h3 className="font-syne font-black text-lg text-white group-hover:text-red-500 transition-colors tracking-wide uppercase leading-tight">
                  {group.title}
                </h3>
                <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wide leading-relaxed mt-2.5">
                  {group.description}
                </p>
              </div>

              {/* View Trigger Action */}
              <button
                type="button"
                onClick={() => handleOpenAlbum(group)}
                className="w-full py-3 bg-neutral-900/40 hover:bg-white text-zinc-400 hover:text-black font-mono text-[10px] tracking-[0.2em] uppercase font-bold text-center border border-neutral-850/80 group-hover:border-neutral-800 transition-all cursor-pointer flex items-center justify-center gap-2 rounded-xs"
              >
                <ZoomIn size={12} />
                LOAD ALBUM STREAM
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* MODAL FULLSCREEN CAROUSEL LIGHTBOX */}
      <AnimatePresence>
        {selectedGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 md:p-8"
            onClick={handleCloseAlbum}
          >
            {/* Upper Toolbar Bar */}
            <div className="w-full max-w-7xl flex items-center justify-between z-10 border-b border-neutral-900/60 pb-4">
              <div className="flex flex-col">
                <span className="font-mono text-[9px] text-zinc-500 tracking-[0.3em] font-semibold uppercase leading-none">
                  // VISUAL STREAM DECK
                </span>
                <h3 className="font-syne font-black text-sm md:text-xl text-white tracking-wider uppercase mt-1 leading-none">
                  {selectedGroup.title}
                </h3>
              </div>

              <div className="flex items-center gap-4">
                {/* Slide Count display in JetBrains Mono font */}
                <span className="font-mono text-[10px] text-zinc-450 tracking-widest hidden sm:inline-block">
                  SLIDE <span className="text-[#EF4444] font-bold">{(activePhotoIndex + 1).toString().padStart(2, "0")}</span> // {selectedGroup.images.length.toString().padStart(2, "0")}
                </span>

                <button
                  type="button"
                  onClick={handleCloseAlbum}
                  className="p-2 sm:px-3 sm:py-2 bg-neutral-900 border border-neutral-800 text-zinc-400 hover:text-white hover:border-red-500/50 transition-colors uppercase font-mono text-[9px] tracking-widest flex items-center gap-1.5 cursor-pointer rounded-xs"
                >
                  <X size={12} />
                  <span className="hidden sm:inline">CLOSE</span>
                </button>
              </div>
            </div>

            {/* Core Carousel Layout */}
            <div className="flex-1 w-full max-w-6xl flex items-center justify-between my-4 relative">
              {/* Prev Trigger button */}
              <button
                type="button"
                onClick={handlePrevPhoto}
                className="absolute left-0 md:-left-8 z-10 p-4 bg-black/60 md:bg-neutral-900/20 border border-neutral-850/80 hover:border-[#EF4444]/60 text-zinc-400 hover:text-white hover:bg-neutral-900 transition-all rounded-full cursor-pointer"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Active Image Box with motion fading transitions */}
              <div 
                className="w-full h-full max-h-[60vh] md:max-h-[70vh] flex items-center justify-center p-2 relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePhotoIndex}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.01 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="w-full h-full flex items-center justify-center relative select-none"
                  >
                    <img
                      src={selectedGroup.images[activePhotoIndex]}
                      alt={`Capture ${activePhotoIndex + 1}`}
                      referrerPolicy="no-referrer"
                      className="max-w-full max-h-full object-contain filter contrast-[1.04] brightness-95 shadow-[0_0_80px_rgba(239,68,68,0.04)] border border-neutral-900/60 rounded-xs"
                    />

                    {/* Subtle watermarked code branding in bottom left */}
                    <div className="absolute bottom-4 left-4 font-mono text-[8px] tracking-[0.2em] text-white/30 bg-black/60 px-2 py-1 rounded-xs flex items-center gap-1.5 pointer-events-none uppercase">
                      <Flame size={9} className="text-[#EF4444]" />
                      XO KATHMANDU
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Next Trigger button */}
              <button
                type="button"
                onClick={handleNextPhoto}
                className="absolute right-0 md:-right-8 z-10 p-4 bg-black/60 md:bg-neutral-900/20 border border-neutral-850/80 hover:border-[#EF4444]/60 text-zinc-400 hover:text-white hover:bg-neutral-900 transition-all rounded-full cursor-pointer"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Lower Album Thumbnails & Status details */}
            <div className="w-full max-w-7xl flex flex-col items-center gap-4 z-10 pt-4 border-t border-neutral-900/60" onClick={(e) => e.stopPropagation()}>
              
              {/* Thumbnail Strip */}
              <div className="flex gap-2.5 overflow-x-auto max-w-full py-1.5 px-2 px-auto scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
                {selectedGroup.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`relative w-16 h-12 md:w-20 md:h-14 overflow-hidden rounded-xs border transition-all shrink-0 cursor-pointer ${
                      activePhotoIndex === idx 
                        ? "border-[#EF4444] scale-105 shadow-[0_0_12px_rgba(239,68,68,0.25)]" 
                        : "border-neutral-850 hover:border-zinc-700 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              <span className="font-mono text-[8px] text-zinc-550 uppercase tracking-[0.2em] mb-2 sm:mb-0">
                SWIPE OR PRESS ARROWS TO BROWSE // CHAKSIBARI ACQUISITIONS
              </span>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
