import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ClubEvent, VIPPackage } from "../types";
import { CLUB_EVENTS, VIP_PACKAGES } from "../data";
import { X, Check, CreditCard, ShieldCheck, Terminal, RefreshCw, Sparkles } from "lucide-react";

interface VIPBookingProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "ticket" | "vip";
  initialEvent?: ClubEvent | null;
}

export const VIPBooking: React.FC<VIPBookingProps> = ({
  isOpen,
  onClose,
  initialMode = "ticket",
  initialEvent = null
}) => {
  const [mode, setMode] = useState<"ticket" | "vip">(initialMode);
  const [selectedEvent, setSelectedEvent] = useState<ClubEvent>(CLUB_EVENTS[0]);
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

  useEffect(() => {
    if (initialEvent) {
      setSelectedEvent(initialEvent);
    }
  }, [initialEvent]);

  useEffect(() => {
    setMode(initialMode);
    setBookingStage("setup");
  }, [initialMode, isOpen]);

  // Handle generating terminal logs
  const startReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !agreePolicy) return;

    setBookingStage("validating");
    setTerminalLog([
      "INITIALIZING SECURE SECURITY DIRECTIVE...",
      `TARGET: ${mode === "vip" ? "VIP_CLUB_XO_BOOTH" : "MAIN_ROOM_TICKET_POOL"}`,
      "ESTABLISHING BIPARTITE ENCRYPTED CHANNEL...",
      "VERIFYING ANTI-BOT PROTOCOLS FOR THAMEL PORT...",
    ]);

    // Timed terminal updates mimicking authentic mainframe security verification
    let timer1 = setTimeout(() => {
      setTerminalLog(prev => [
        ...prev,
        `ARRANGING ZONE SECTOR: ${mode === "vip" ? selectedVIP.location : "MAIN_ROOM_DANCEFLOOR"}`,
        `CAPACITY LEVEL CHECK: PASS [REQ: ${count} SEATS]`,
        "COMPILING VIP CONSOLE PASSKEY VECTORS..."
      ]);
    }, 800);

    let timer2 = setTimeout(() => {
      const code = `XO-${Math.floor(100000 + Math.random() * 900000)}-${mode === "vip" ? "VIP" : "TKT"}`;
      setReceiptCode(code);
      setTerminalLog(prev => [
        ...prev,
        "SECURE TICKET ASSIGNED SYSTEM CODE: " + code,
        "ADAMSON AUDIO FREQUENCY RESERVATION INGESTED.",
        "AUTHORIZING DIRECTIVE TRANSITION COMPLETE."
      ]);
    }, 1800);

    let timer3 = setTimeout(() => {
      setBookingStage("confirmed");
    }, 2600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  const ticketTotal = mode === "ticket" ? selectedEvent.ticketPrice * count : selectedVIP.price;

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
                          value={selectedEvent.id}
                          onChange={(e) => {
                            const found = CLUB_EVENTS.find(ev => ev.id === e.target.value);
                            if (found) setSelectedEvent(found);
                          }}
                          className="w-full py-3 px-3 rounded bg-neutral-900 border border-neutral-850 text-slate-200 font-mono text-xs focus:border-white focus:ring-1 focus:ring-white outline-none"
                        >
                          {CLUB_EVENTS.map(ev => (
                            <option key={ev.id} value={ev.id} className="bg-black text-slate-200">
                              {ev.title} (NPR {ev.ticketPrice.toLocaleString()})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Ticket Count multiplier */}
                      <div>
                        <label className="block font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">
                          TICKET QUANTITY
                        </label>
                        <div className="flex items-center gap-4">
                          <input
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
                    <div className="space-y-4">
                      {/* VIP suite choices */}
                      <div>
                        <label className="block font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-2.5">
                          SELECT BOOTH/ZONE TIER
                        </label>
                        <div className="space-y-2.5">
                          {VIP_PACKAGES.map((pkg) => (
                            <div
                              key={pkg.id}
                              onClick={() => setSelectedVIP(pkg)}
                              className={`p-3.5 rounded border text-left transition-all duration-300 cursor-pointer ${
                                selectedVIP.id === pkg.id
                                  ? "bg-neutral-900/50 border-white shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                                  : "bg-black/40 border-neutral-800 hover:border-neutral-700"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`font-syne font-bold text-xs uppercase ${selectedVIP.id === pkg.id ? "text-white" : "text-slate-400"}`}>
                                    {pkg.name}
                                </span>
                                <span className={`font-mono text-xs font-semibold ${selectedVIP.id === pkg.id ? "text-white" : "text-slate-400"}`}>
                                  NPR {pkg.price.toLocaleString()}
                                </span>
                              </div>
                              <p className="font-mono text-[9px] text-zinc-400 uppercase mt-1">
                                LOCATION: {pkg.location} // CAPACITY: UP TO {pkg.capacity} REVELERS
                              </p>
                              
                              {/* Perks expanded list */}
                              {selectedVIP.id === pkg.id && (
                                <motion.ul
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  className="mt-3 pt-3 border-t border-neutral-800 space-y-1"
                                >
                                  {pkg.perks.map((prk, i) => (
                                    <li key={i} className="text-[10px] text-gray-400 flex items-start gap-1.5 leading-relaxed font-light">
                                      <Check size={11} className="text-white mt-0.5 shrink-0" />
                                      {prk}
                                    </li>
                                  ))}
                                </motion.ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Primary guest registration inputs */}
                  <form onSubmit={startReservation} className="space-y-4 pt-3 border-t border-neutral-900">
                    <div>
                      <label className="block font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">
                        GUEST REGISTERED NAME
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. SUJAL KUNWAR"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full py-2.5 px-3 rounded bg-neutral-950 border border-neutral-800 text-xs font-mono text-white placeholder:text-zinc-700 focus:border-white outline-none uppercase"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">
                        COMMUNICATION EMAIL
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. resident@club-xo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full py-2.5 px-3 rounded bg-neutral-950 border border-neutral-800 text-xs font-mono text-white placeholder:text-zinc-700 focus:border-white outline-none"
                      />
                    </div>

                    {/* Policy terms validation */}
                    <label className="flex items-start gap-2.5 pt-1.5 select-none cursor-pointer group">
                      <input
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

                      <button
                        type="submit"
                        disabled={!name || !email || !agreePolicy}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded bg-white text-xs font-mono tracking-widest uppercase text-black font-extrabold hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all shadow-lg"
                      >
                        <CreditCard size={14} />
                        INITIALIZE DEPOSIT SEQUENCE
                      </button>
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
                            {mode === "vip" ? selectedVIP.name : selectedEvent.title}
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
