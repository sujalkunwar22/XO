import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ClubEvent, VIPPackage, VIPTable } from "../types";
import { CLUB_EVENTS, VIP_PACKAGES } from "../data";
import { X, Check, CreditCard, ShieldCheck, Terminal, RefreshCw, Sparkles } from "lucide-react";
import { EsewaPaymentButton } from "./EsewaPaymentButton";

interface TablePosition {
  id: string;
  name: string;
  type: "sofa" | "stools" | "standing";
  x: number;
  y: number;
  w: number;
  h: number;
  r?: number;
}

const TABLE_POSITIONS: TablePosition[] = [
  // Top Row
  { id: "C5", name: "C5", type: "standing", x: 201, y: 28, w: 26, h: 26, r: 13 },
  { id: "C4", name: "C4", type: "standing", x: 259, y: 28, w: 26, h: 26, r: 13 },
  { id: "C3", name: "C3", type: "standing", x: 319, y: 28, w: 26, h: 26, r: 13 },
  { id: "C2", name: "C2", type: "sofa", x: 607, y: 50, w: 96, h: 30 },
  { id: "C1", name: "C1", type: "sofa", x: 747, y: 50, w: 60, h: 30 },

  // First Floor
  { id: "A1", name: "A1", type: "sofa", x: 227, y: 298, w: 52, h: 38 },
  { id: "A2", name: "A2", type: "sofa", x: 312, y: 298, w: 52, h: 38 },
  { id: "A7", name: "A7", type: "stools", x: 206, y: 413, w: 26, h: 26, r: 13 },
  { id: "A8", name: "A8", type: "stools", x: 246, y: 413, w: 26, h: 26, r: 13 },
  { id: "A3", name: "A3", type: "sofa", x: 302, y: 413, w: 52, h: 50 },
  { id: "A6", name: "A6", type: "stools", x: 206, y: 533, w: 26, h: 26, r: 13 },
  { id: "A5", name: "A5", type: "sofa", x: 257, y: 533, w: 48, h: 50 },
  { id: "A4", name: "A4", type: "sofa", x: 319, y: 533, w: 48, h: 50 },

  // Ground Floor
  { id: "G3", name: "G3", type: "sofa", x: 392, y: 395, w: 52, h: 50 },
  { id: "G2", name: "G2", type: "sofa", x: 459, y: 395, w: 52, h: 50 },
  { id: "G1", name: "G1", type: "sofa", x: 525, y: 395, w: 52, h: 50 },
  { id: "G4", name: "G4", type: "sofa", x: 392, y: 498, w: 52, h: 50 },
  { id: "G5", name: "G5", type: "sofa", x: 459, y: 498, w: 52, h: 50 },
  { id: "G6", name: "G6", type: "sofa", x: 525, y: 498, w: 52, h: 50 },

  // Stage Private
  { id: "STAGE1", name: "STAGE PRIVATE TABLE", type: "sofa", x: 737, y: 228, w: 52, h: 45 },

  // VVIP Zone
  { id: "VVIP1", name: "VVIP 1", type: "sofa", x: 377, y: 673, w: 115, h: 50 },
  { id: "VVIP2", name: "VVIP 2", type: "sofa", x: 537, y: 673, w: 115, h: 50 },
  { id: "VVIP3", name: "VVIP 3", type: "sofa", x: 692, y: 673, w: 60, h: 50 },
  { id: "VVIP4", name: "VVIP 4", type: "sofa", x: 759, y: 673, w: 32, h: 78 },

  // VIP Zone
  { id: "VIP5", name: "VIP 5", type: "sofa", x: 377, y: 783, w: 105, h: 50 },
  { id: "VIP6", name: "VIP 6", type: "sofa", x: 507, y: 783, w: 105, h: 50 },
  { id: "VIP7", name: "VIP 7", type: "sofa", x: 637, y: 783, w: 105, h: 50 },

  // Second Floor Bottom
  { id: "C6", name: "C6", type: "sofa", x: 357, y: 893, w: 115, h: 50 },
  { id: "C7", name: "C7", type: "sofa", x: 507, y: 893, w: 115, h: 50 },
  { id: "C8", name: "C8", type: "sofa", x: 657, y: 893, w: 115, h: 50 }
];

const FLOOR_SECTIONS = [
  {
    title: "FIRST FLOOR",
    icon: "1F",
    subtitle: "Balcony Lounge & Cocktail High Stools",
    tables: [
      { id: "A1", name: "A1", label: "A1 BALCONY SOFA", type: "sofa", capacity: 8 },
      { id: "A2", name: "A2", label: "A2 BALCONY SOFA", type: "sofa", capacity: 8 },
      { id: "A3", name: "A3", label: "A3 BALCONY SOFA", type: "sofa", capacity: 8 },
      { id: "A4", name: "A4", label: "A4 BALCONY SOFA", type: "sofa", capacity: 8 },
      { id: "A5", name: "A5", label: "A5 BALCONY SOFA", type: "sofa", capacity: 8 },
      { id: "A6", name: "A6", label: "A6 STOOL STAND", type: "stools", capacity: 4 },
      { id: "A7", name: "A7", label: "A7 STOOL STAND", type: "stools", capacity: 4 },
      { id: "A8", name: "A8", label: "A8 STOOL STAND", type: "stools", capacity: 4 },
    ]
  },
  {
    title: "SECOND FLOOR",
    icon: "2F",
    subtitle: "Upper VIP Deck & Standing High Tables",
    tables: [
      { id: "C1", name: "C1", label: "C1 VIP DECK SOFA", type: "sofa", capacity: 10 },
      { id: "C2", name: "C2", label: "C2 VIP DECK SOFA", type: "sofa", capacity: 10 },
      { id: "C3", name: "C3", label: "C3 VIP STANDING", type: "standing", capacity: 4 },
      { id: "C4", name: "C4", label: "C4 VIP STANDING", type: "standing", capacity: 4 },
      { id: "C5", name: "C5", label: "C5 VIP STANDING", type: "standing", capacity: 4 },
      { id: "C6", name: "C6", label: "C6 VIP SOFA BOOTH", type: "sofa", capacity: 10 },
      { id: "C7", name: "C7", label: "C7 VIP SOFA BOOTH", type: "sofa", capacity: 10 },
      { id: "C8", name: "C8", label: "C8 VIP SOFA BOOTH", type: "sofa", capacity: 10 },
    ]
  },
  {
    title: "GROUND FLOOR",
    icon: "GF",
    subtitle: "Main Room Dancefloor Access Booths",
    tables: [
      { id: "G1", name: "G1", label: "G1 MAIN ROOM SOFA", type: "sofa", capacity: 12 },
      { id: "G2", name: "G2", label: "G2 MAIN ROOM SOFA", type: "sofa", capacity: 12 },
      { id: "G3", name: "G3", label: "G3 MAIN ROOM SOFA", type: "sofa", capacity: 12 },
      { id: "G4", name: "G4", label: "G4 MAIN ROOM SOFA", type: "sofa", capacity: 12 },
      { id: "G5", name: "G5", label: "G5 MAIN ROOM SOFA", type: "sofa", capacity: 12 },
      { id: "G6", name: "G6", label: "G6 MAIN ROOM SOFA", type: "sofa", capacity: 12 },
    ]
  },
  {
    title: "VVIP & STAGE VIP ZONES",
    icon: "VIP",
    subtitle: "Exclusive Premium Stage & VVIP Ultra Lounges",
    tables: [
      { id: "VVIP1", name: "VVIP 1", label: "VVIP 1 ULTRA LOUNGE", type: "sofa", capacity: 15 },
      { id: "VVIP2", name: "VVIP 2", label: "VVIP 2 ULTRA LOUNGE", type: "sofa", capacity: 15 },
      { id: "VVIP3", name: "VVIP 3", label: "VVIP 3 ULTRA LOUNGE", type: "sofa", capacity: 15 },
      { id: "VVIP4", name: "VVIP 4", label: "VVIP 4 ULTRA LOUNGE", type: "sofa", capacity: 12 },
      { id: "VIP5", name: "VIP 5", label: "VIP 5 BALCONY DECK", type: "sofa", capacity: 10 },
      { id: "VIP6", name: "VIP 6", label: "VIP 6 BALCONY DECK", type: "sofa", capacity: 10 },
      { id: "VIP7", name: "VIP 7", label: "VIP 7 BALCONY DECK", type: "sofa", capacity: 10 },
      { id: "STAGE1", name: "STAGE PRIVATE", label: "STAGE PRIVATE BOOTH", type: "sofa", capacity: 12 },
    ]
  }
];

const getCategoryFromId = (id: string): string => {
  if (id.startsWith("G")) return "GROUND FLOOR MAIN ROOM";
  if (id.startsWith("VVIP")) return "VVIP ZONE";
  if (id.startsWith("VIP")) return "VIP BALCONY / DECK";
  if (id.startsWith("STAGE")) return "STAGE PRIVATE DECK";
  if (id.startsWith("A")) {
    const num = parseInt(id.replace("A", ""));
    if (num >= 6) return "FIRST FLOOR COCKTAIL STANDING";
    return "FIRST FLOOR BALCONY";
  }
  if (id.startsWith("C")) {
    const num = parseInt(id.replace("C", ""));
    if (num >= 3 && num <= 5) return "SECOND FLOOR VIP STANDING";
    return "SECOND FLOOR VIP";
  }
  return "GROUND FLOOR MAIN ROOM";
};

const getCapacityFromId = (id: string): number => {
  if (id.startsWith("G")) return 12;
  if (id.startsWith("VVIP")) return id === "VVIP4" ? 12 : 15;
  if (id.startsWith("VIP")) return 10;
  if (id.startsWith("STAGE")) return 12;
  if (id.startsWith("A")) {
    const num = parseInt(id.replace("A", ""));
    if (num >= 6) return 4;
    return 8;
  }
  if (id.startsWith("C")) {
    const num = parseInt(id.replace("C", ""));
    if (num >= 3 && num <= 5) return 4;
    return 10;
  }
  return 10;
};

interface VIPBookingProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "ticket" | "vip";
  initialEvent?: ClubEvent | null;
  events?: ClubEvent[];
}

export const VIPBooking: React.FC<VIPBookingProps> = ({
  isOpen,
  onClose,
  initialMode = "ticket",
  initialEvent = null,
  events = []
}) => {
  const [mode, setMode] = useState<"ticket" | "vip">(initialMode);
  const [selectedEvent, setSelectedEvent] = useState<ClubEvent | null>(initialEvent || (events.length > 0 ? events[0] : null));
  const [selectedVIP, setSelectedVIP] = useState<VIPPackage>(VIP_PACKAGES[0]);
  
  // Form parameters
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [count, setCount] = useState(2);
  const [agreePolicy, setAgreePolicy] = useState(false);
  
  // Transition booking stages
  const [bookingStage, setBookingStage] = useState<"setup" | "validating" | "confirmed">("setup");
  const [terminalLog, setTerminalLog] = useState<string[]>([]);
  const [receiptCode, setReceiptCode] = useState("");
  const [paymentOrderId, setPaymentOrderId] = useState("");

  const [tables, setTables] = useState<VIPTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<VIPTable | null>(null);
  const [zoomMap, setZoomMap] = useState(false);

  useEffect(() => {
    if (initialEvent) {
      setSelectedEvent(initialEvent);
    } else if (events.length > 0 && !selectedEvent) {
      setSelectedEvent(events[0]);
    }
  }, [initialEvent, events, selectedEvent]);

  useEffect(() => {
    setMode(initialMode);
    setBookingStage("setup");
    setSelectedTable(null);
    if (isOpen) {
      const randId = `XO-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      setPaymentOrderId(randId);
    }
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (isOpen && mode === "vip") {
      fetch("/api/admin/tables")
        .then(res => res.json())
        .then(resData => {
          if (resData.success && resData.data) {
            setTables(resData.data);
          }
        })
        .catch(err => console.error("Failed loading VIP tables:", err));
    }
  }, [isOpen, mode]);

  const handleTableClick = (pos: TablePosition) => {
    const tbl = tables.find(t => t.id === pos.id);
    if (tbl && tbl.status === "TAKEN") return;
    
    // Toggle selection
    if (selectedTable && selectedTable.id === pos.id) {
      setSelectedTable(null);
    } else {
      const dbTable = tbl || { id: pos.id, name: `TABLE ${pos.name}`, category: getCategoryFromId(pos.id), capacity: getCapacityFromId(pos.id), status: "VACANT" as const };
      setSelectedTable(dbTable);
      const pkg = VIP_PACKAGES.find(p => p.name === dbTable.category);
      if (pkg) {
        setSelectedVIP(pkg);
        setCount(dbTable.capacity);
      }
    }
  };

  const ticketTotal = mode === "ticket" 
    ? (selectedEvent ? selectedEvent.ticketPrice * count : 0) 
    : (selectedTable ? (VIP_PACKAGES.find(p => p.name === selectedTable.category)?.price || selectedVIP.price) : selectedVIP.price);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end overflow-hidden">
          {/* Obsidian Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#050505] backdrop-blur-md"
          />

          {/* Interactive Sliding Side Panel Console */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative w-full md:w-[620px] h-full bg-[#050505] border-l border-neutral-800 shadow-2xl flex flex-col justify-between z-10 overflow-y-auto font-sans"
          >
            {/* Console Header */}
            <div className="p-6 border-b border-neutral-900 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                <span className="font-mono text-xs tracking-widest text-zinc-350 uppercase font-bold">
                  XO CLUB PORTAL // THAMEL, NEPAL
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-850 text-zinc-440 hover:text-white transition-colors cursor-pointer"
                aria-label="Close booking modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* Stages Content Container */}
            <div className="flex-grow p-6 flex flex-col justify-between select-text">
              
              {/* STAGE 1: BOOKING CONTROLS FORM */}
              {bookingStage === "setup" && (
                <div className="space-y-6">
                  {/* Selector: Entrance Ticket OR VIP Package Table */}
                  <div className="grid grid-cols-2 p-1 bg-black border border-neutral-800 rounded-sm">
                    <button
                      type="button"
                      onClick={() => setMode("ticket")}
                      className={`py-2 px-3 text-center text-xs font-mono tracking-wider uppercase rounded transition-all cursor-pointer ${
                        mode === "ticket"
                          ? "bg-white text-black font-extrabold shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                          : "text-zinc-500 hover:text-white"
                      }`}
                    >
                      ENTRANCE ASSIGN
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("vip")}
                      className={`py-2 px-3 text-center text-xs font-mono tracking-wider uppercase rounded transition-all cursor-pointer ${
                        mode === "vip"
                          ? "bg-white text-black font-extrabold shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                          : "text-zinc-500 hover:text-white"
                      }`}
                    >
                      VIP TABLE BOOTHS
                    </button>
                  </div>

                  {/* Mode dependent configuration forms */}
                  {mode === "ticket" ? (
                    <div className="space-y-4">
                      {/* Active events selector */}
                      <div>
                        <label className="block font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">
                          SELECT EVENT
                        </label>
                        <select
                          value={selectedEvent?.id || ""}
                          onChange={(e) => {
                            const found = events.find(ev => ev.id === e.target.value);
                            if (found) setSelectedEvent(found);
                          }}
                          className="w-full py-3 px-3 rounded bg-neutral-900 border border-neutral-850 text-slate-200 font-mono text-xs focus:border-white focus:ring-1 focus:ring-white outline-none"
                          disabled={events.length === 0}
                        >
                          {events.length === 0 ? (
                            <option className="bg-black text-zinc-550">NO EVENTS SCHEDULED</option>
                          ) : (
                            events.map(ev => (
                              <option key={ev.id} value={ev.id} className="bg-black text-slate-200">
                                {ev.title} (NPR {ev.ticketPrice.toLocaleString()})
                              </option>
                            ))
                          )}
                        </select>
                      </div>

                      {/* Ticket Count multiplier */}
                      <div>
                        <label className="block font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">
                          TICKET QUANTITY
                        </label>
                        <div className="flex items-center gap-4">
                          <input autoComplete="off"
                            type="range"
                            min="1"
                            max="10"
                            value={count}
                            onChange={(e) => setCount(parseInt(e.target.value))}
                            className="flex-grow accent-white h-1 bg-neutral-800 border-none outline-none cursor-pointer"
                          />
                          <span className="font-mono text-xs font-bold text-white w-10 text-center bg-black py-1.5 border border-neutral-800 rounded">
                            {count}x
                          </span>
                        </div>
                        <p className="font-mono text-[8px] text-zinc-500 mt-1.5 uppercase">
                          MAX 10 PASSEXPRESS PER ACCESS GROUP // AGE 18+ MANDATORY FOR ALL TICKETHOLDERS
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
                        <label className="block font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                          SELECT TABLE / BOOTH BY FLOOR & ZONE
                        </label>
                        <div className="flex items-center gap-3 font-mono text-[9px]">
                          <span className="flex items-center gap-1 text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> VACANT
                          </span>
                          <span className="flex items-center gap-1 text-red-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> TAKEN
                          </span>
                        </div>
                      </div>

                      {/* Floor-by-Floor Tables List */}
                      <div className="space-y-6 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                        {FLOOR_SECTIONS.map((section) => (
                          <div key={section.title} className="space-y-3">
                            {/* Floor Header */}
                            <div className="flex flex-wrap items-center justify-between border-b border-neutral-850 pb-2 gap-1">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-[#EF4444] text-white font-mono text-[9px] font-black rounded-xs">
                                  {section.icon}
                                </span>
                                <h4 className="font-syne font-black text-white text-xs sm:text-sm uppercase tracking-wider">
                                  {section.title}
                                </h4>
                              </div>
                              <span className="font-mono text-[9px] text-zinc-500 uppercase">
                                {section.subtitle}
                              </span>
                            </div>

                            {/* Tables Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                              {section.tables.map((tItem) => {
                                const dbTable = tables.find((t) => t.id === tItem.id);
                                const status = dbTable ? dbTable.status : "VACANT";
                                const isTaken = status === "TAKEN";
                                const isSelected = selectedTable?.id === tItem.id;

                                const posObj = TABLE_POSITIONS.find((p) => p.id === tItem.id) || {
                                  id: tItem.id,
                                  name: tItem.name,
                                  type: tItem.type as any,
                                  x: 0, y: 0, w: 0, h: 0
                                };

                                return (
                                  <button
                                    key={tItem.id}
                                    type="button"
                                    disabled={isTaken}
                                    onClick={() => handleTableClick(posObj)}
                                    className={`p-3 rounded-xs border transition-all text-left relative flex flex-col justify-between overflow-hidden cursor-pointer disabled:cursor-not-allowed ${
                                      isTaken
                                        ? "bg-neutral-950/40 border-neutral-900 opacity-40 text-zinc-600"
                                        : isSelected
                                        ? "bg-red-950/40 border-[#EF4444] ring-2 ring-[#EF4444]/50 shadow-lg text-white"
                                        : "bg-black/80 border-neutral-850 hover:border-zinc-700 text-zinc-300"
                                    }`}
                                  >
                                    {/* Top Row: Table Name & Status Badge */}
                                    <div className="flex items-start justify-between gap-1.5 w-full mb-2">
                                      <span className="font-syne font-black text-xs uppercase tracking-tight leading-tight break-words pr-1">
                                        {tItem.name}
                                      </span>

                                      {isTaken ? (
                                        <span className="shrink-0 px-1.5 py-0.5 bg-red-950/50 text-red-500 border border-red-900/40 text-[7px] font-mono font-bold uppercase rounded-xs">
                                          TAKEN
                                        </span>
                                      ) : isSelected ? (
                                        <span className="shrink-0 px-1.5 py-0.5 bg-[#EF4444] text-white text-[7px] font-mono font-black uppercase rounded-xs animate-pulse">
                                          SELECTED
                                        </span>
                                      ) : (
                                        <span className="shrink-0 px-1.5 py-0.5 bg-emerald-950/50 text-emerald-400 border border-emerald-900/40 text-[7px] font-mono font-bold uppercase rounded-xs">
                                          VACANT
                                        </span>
                                      )}
                                    </div>

                                    {/* Bottom Row: Capacity & Seating Type */}
                                    <div className="font-mono text-[8px] text-zinc-500 uppercase">
                                      <span className="block font-bold text-zinc-350">{tItem.capacity} GUESTS</span>
                                      <span className="block text-[7.5px] mt-0.5 text-zinc-500">{tItem.type.toUpperCase()}</span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Selection Detail Card */}
                      {selectedTable ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded border border-white bg-neutral-950/40 text-left space-y-2.5 font-mono shadow-[0_0_15px_rgba(255,255,255,0.03)]"
                        >
                          <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
                            <div>
                              <span className="text-[8px] text-zinc-500 block uppercase">SELECTED TABLE BOOTH</span>
                              <span className="text-sm font-black text-white uppercase">{selectedTable.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[8px] text-zinc-500 block uppercase">TARIFF RATE</span>
                              <span className="text-sm font-black text-white">NPR {ticketTotal.toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div>
                              <span className="text-zinc-500 block">SECTOR TIER:</span>
                              <span className="text-slate-300 font-bold uppercase">{selectedTable.category}</span>
                            </div>
                            <div>
                              <span className="text-zinc-500 block">MAX CAPACITY:</span>
                              <span className="text-slate-300 font-bold uppercase">{selectedTable.capacity} REVELERS</span>
                            </div>
                          </div>

                        </motion.div>
                      ) : null}
                    </div>
                  )}

                  {/* Primary guest registration inputs */}
                  <form onSubmit={(e) => e.preventDefault()} className="space-y-4 pt-3 border-t border-neutral-900">
                    <div>
                      <label className="block font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">
                        GUEST REGISTERED NAME
                      </label>
                      <input
                        type="text"
                        required
                        autoComplete="off"
                        placeholder="ENTER YOUR NAME"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full py-2.5 px-3 rounded bg-neutral-950 border border-neutral-850 text-xs font-mono text-white placeholder:text-zinc-700 focus:border-white outline-none uppercase"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">
                        COMMUNICATION EMAIL
                      </label>
                      <input
                        type="email"
                        required
                        autoComplete="off"
                        placeholder="ENTER YOUR EMAIL"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full py-2.5 px-3 rounded bg-neutral-950 border border-neutral-800 text-xs font-mono text-white placeholder:text-zinc-700 focus:border-white outline-none"
                      />
                    </div>

                    {/* Policy terms validation */}
                    <label className="flex items-start gap-2.5 pt-1.5 select-none cursor-pointer group">
                      <input autoComplete="off"
                        type="checkbox"
                        checked={agreePolicy}
                        onChange={(e) => setAgreePolicy(e.target.checked)}
                        className="mt-0.5 accent-white h-3.5 w-3.5 bg-black border border-neutral-850 rounded-sm"
                      />
                      <span className="font-mono text-[9px] text-zinc-500 leading-normal group-hover:text-zinc-400 transition-colors uppercase">
                        I CERTIFY THAT ALL INDIVIDUALS ARE 18+ OF AGE AND CONFIRM FULL CODE COMPLIANCE WITH XO CLUB’S CODES AND SMART CASUAL DRESS PROTOCOLS.
                      </span>
                    </label>

                    {/* Booking calculation and triggers */}
                    <div className="pt-4 border-t border-neutral-900 flex flex-col gap-3">
                      <div className="flex items-center justify-between font-mono bg-black p-3.5 rounded border border-neutral-800">
                        <span className="text-[10px] text-zinc-500 uppercase">CALCULATED SECURE TARIFF:</span>
                        <span className="text-base sm:text-lg font-bold text-white">NPR {ticketTotal.toLocaleString()}</span>
                      </div>

                      {/* Real checkout triggers */}
                      {name && email && agreePolicy ? (
                        mode === "vip" && !selectedTable ? (
                          <div className="py-2.5 text-center text-[10px] font-mono text-amber-500 bg-amber-950/10 border border-dashed border-amber-900/30 uppercase tracking-widest rounded">
                            SELECT AN AVAILABLE TABLE BOOTH FROM FLOORPLAN MAP TO BOOK
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {/* eSewa Button */}
                            {selectedEvent?.showEsewa !== false && (
                              <EsewaPaymentButton
                                amount={ticketTotal}
                                orderId={paymentOrderId}
                                guestName={name}
                                guestEmail={email}
                                bookingType={mode}
                                typeName={mode === "ticket" ? (selectedEvent?.title || "XO TICKET") : (selectedTable ? selectedTable.name : selectedVIP.name)}
                                count={mode === "ticket" ? count : 1}
                                onInitiateProgress={(msg) => {
                                  setBookingStage("validating");
                                  setTerminalLog((prev) => [...prev, msg]);
                                }}
                                onError={(err) => {
                                  setBookingStage("setup");
                                  setTerminalLog((prev) => [...prev, `ESEWA CORE REJECTED STATUS: ${err}`]);
                                }}
                              />
                            )}

                            {/* Custom Payment Redirect Button */}
                            {selectedEvent?.showCustomPayment === true && selectedEvent?.customPaymentLink && (
                              <a
                                href={selectedEvent.customPaymentLink}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded bg-white hover:bg-[#EF4444] hover:text-white text-black font-mono text-xs font-extrabold tracking-widest uppercase cursor-pointer transition-all text-center shadow-lg"
                              >
                                {selectedEvent.customPaymentLabel || "COMPLETE CUSTOM PAYMENT"}
                              </a>
                            )}

                            {/* In case all payment buttons are toggled off */}
                            {selectedEvent && selectedEvent?.showEsewa === false && !selectedEvent?.showCustomPayment && (
                              <div className="py-3 text-center text-[10px] font-mono text-amber-550 bg-amber-950/10 border border-amber-900/30 uppercase tracking-widest rounded">
                                NO PAYMENT METHODS CONFIGURED FOR THIS EVENT
                              </div>
                            )}
                          </div>
                        )
                      ) : (
                        <div className="py-2 text-center text-[10px] font-mono text-zinc-650 bg-black/20 border border-dashed border-neutral-900 uppercase tracking-widest rounded">
                          ENTER GUEST REGISTRATION AND AGREEMENT TO PROCEED
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {/* STAGE 2: IMMERSIVE TELEMETRY VERIFICATION */}
              {bookingStage === "validating" && (
                <div className="flex-grow flex flex-col justify-center items-center py-12">
                  <div className="relative mb-6">
                    <RefreshCw size={55} className="text-white animate-spin" />
                    <Terminal size={22} className="absolute inset-x-0 mx-auto top-[16.5px] text-white" />
                  </div>

                  <h3 className="font-syne font-extrabold text-xl tracking-wider text-white uppercase mb-3">
                    INGESTING ADMISSION CODES
                  </h3>

                  {/* Scrolling terminal window log */}
                  <div className="w-full font-mono text-[10px] bg-black border border-neutral-800 p-4 rounded text-zinc-400 h-48 overflow-y-auto space-y-1 text-left leading-relaxed">
                    {terminalLog.map((log, index) => (
                      <div key={index} className="flex gap-2">
                        <span className="text-zinc-650 font-bold select-none">&gt;&gt;</span>
                        <p>{log}</p>
                      </div>
                    ))}
                    <span className="inline-block w-1.5 h-3 bg-white animate-pulse" />
                  </div>
                </div>
              )}

              {/* STAGE 3: GUEST PASS / TICKET RECEIPT SUCCESS */}
              {bookingStage === "confirmed" && (
                <div className="flex-grow flex flex-col justify-between pt-4">
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck size={28} className="text-white" />
                    </div>

                    <h3 className="font-syne font-extrabold text-2xl tracking-wide text-white uppercase mb-1">
                      ACCESS GRANTED
                    </h3>
                    <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-6 border-b border-neutral-900 pb-3">
                      PASS REGISTERED BY ROYAL ADMISSION NODE
                    </p>

                    {/* Atmospheric Digital Pass ticket slip */}
                    <div className="relative bg-black border border-neutral-800 rounded-lg p-5 text-left max-w-sm mx-auto overflow-hidden">
                      {/* Notch half cuts */}
                      <div className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-[#050505] border border-neutral-850" />
                      <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-[#050505] border border-neutral-850" />
                      
                      {/* Dynamic white accent line */}
                      <div className="absolute top-0 inset-x-0 h-1 bg-white" />

                      <div className="flex justify-between items-start mb-6 font-mono">
                        <div>
                          <span className="text-[8px] text-slate-500 block uppercase">PASS TYPE</span>
                          <span className="text-xs font-bold text-white uppercase">{mode === "vip" ? "VIP BOOTH RESV" : "STAGE ACCESS"}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] text-slate-500 block uppercase">STATUS</span>
                          <span className="text-xs font-bold text-white">GRANTED</span>
                        </div>
                      </div>

                      <div className="space-y-3.5 font-mono mb-6 pb-5 border-b border-dashed border-neutral-850">
                        <div>
                          <span className="text-[8px] text-slate-500 block uppercase">VISITOR REGISTERED ON</span>
                          <span className="text-[11px] font-bold text-white uppercase">{name}</span>
                        </div>

                        <div>
                          <span className="text-[8px] text-slate-500 block uppercase">ACCESS SECTOR OR RESERVED UNIT</span>
                          <span className="text-[11px] font-bold text-white uppercase">
                            {mode === "vip" ? selectedVIP.name : (selectedEvent ? selectedEvent.title : "XO EVENT")}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[8px] text-slate-500 block uppercase">SECURED BY</span>
                            <span className="text-[11px] font-bold text-white uppercase">{count} HEADS</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-500 block uppercase">ENTRY ADMISSION</span>
                            <span className="text-[11px] font-semibold text-white uppercase">NPR {ticketTotal.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Generative QR visual */}
                      <div className="flex flex-col items-center justify-center p-3 bg-white w-32 h-32 rounded mx-auto relative group">
                        {/* Decorative scanline overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/5 to-transparent w-full h-[2px] animate-bounce pointer-events-none" />
                        
                        <svg viewBox="0 0 100 100" className="w-full h-full fill-slate-950">
                          {/* Outer markers */}
                          <rect x="0" y="0" width="25" height="25" />
                          <rect x="2" y="2" width="21" height="21" fill="white" />
                          <rect x="6" y="6" width="13" height="13" />

                          <rect x="75" y="0" width="25" height="25" />
                          <rect x="77" y="2" width="21" height="21" fill="white" />
                          <rect x="81" y="6" width="13" height="13" />

                          <rect x="0" y="75" width="25" height="25" />
                          <rect x="2" y="77" width="21" height="21" fill="white" />
                          <rect x="6" y="81" width="13" height="13" />

                          {/* Complex QR digital dots patterns */}
                          <rect x="35" y="5" width="8" height="8" />
                          <rect x="55" y="10" width="10" height="4" />
                          <rect x="40" y="20" width="15" height="5" />
                          <rect x="5" y="35" width="12" height="12" />
                          <rect x="25" y="40" width="20" height="8" />
                          <rect x="55" y="45" width="15" height="15" />
                          <rect x="80" y="35" width="6" height="14" />
                          <rect x="10" y="60" width="18" height="6" />
                          <rect x="35" y="55" width="12" height="18" />
                          <rect x="80" y="60" width="15" height="8" />
                          <rect x="55" y="75" width="8" height="20" />
                          <rect x="40" y="85" width="10" height="10" />
                          <rect x="75" y="85" width="15" height="15" />
                        </svg>
                      </div>

                      <span className="block text-center text-[7px] font-mono text-zinc-500 mt-3 font-bold tracking-widest select-all">
                        {receiptCode}
                      </span>
                    </div>

                    <div className="mt-4 p-3 rounded bg-neutral-900 border border-neutral-800 max-w-sm mx-auto text-left">
                      <p className="font-mono text-[9px] text-white font-bold uppercase mb-1">LOCATION INSTRUCTIONS:</p>
                      <p className="font-sans text-[10px] text-zinc-350 leading-normal font-light">
                        Head directly to Chaksibari Marg, Thamel, Kathmandu, Nepal. Provide this ticket QR code to VIP Reception at our main entrance gates.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="w-full mt-6 py-3 bg-neutral-900 hover:bg-neutral-800 rounded border border-neutral-750 font-mono text-xs text-white uppercase tracking-widest font-extrabold cursor-pointer transition-colors"
                  >
                    DISMISS CONSOLE
                  </button>
                </div>
              )}
            </div>

            {/* Console Footer */}
            <div className="p-6 border-t border-neutral-900 bg-black/40 text-center flex items-center justify-center gap-2">
              <Sparkles size={11} className="text-zinc-400" />
              <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest">
                VERIFIED BY THE XO CLUB REGISTRY // RE-2026
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
