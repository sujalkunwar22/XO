import React, { useState, useEffect } from "react";
import { 
  Users, RefreshCw, ArrowLeft, ShieldAlert, CheckCircle2, 
  Layers, Check, UserPlus, Info
} from "lucide-react";
import { VIPTable } from "../types";

const SEAT_METADATA: Record<string, { type: string; capacity: number; label: string }> = {
  // First floor
  "A1": { type: "sofa", capacity: 8, label: "A1 BALCONY SOFA" },
  "A2": { type: "sofa", capacity: 8, label: "A2 BALCONY SOFA" },
  "A3": { type: "sofa", capacity: 8, label: "A3 BALCONY SOFA" },
  "A4": { type: "sofa", capacity: 8, label: "A4 BALCONY SOFA" },
  "A5": { type: "sofa", capacity: 8, label: "A5 BALCONY SOFA" },
  "A6": { type: "stools", capacity: 4, label: "A6 STOOL STAND" },
  "A7": { type: "stools", capacity: 4, label: "A7 STOOL STAND" },
  "A8": { type: "stools", capacity: 4, label: "A8 STOOL STAND" },
  
  // Second floor
  "C1": { type: "sofa", capacity: 10, label: "C1 VIP DECK SOFA" },
  "C2": { type: "sofa", capacity: 10, label: "C2 VIP DECK SOFA" },
  "C3": { type: "standing", capacity: 4, label: "C3 VIP STANDING" },
  "C4": { type: "standing", capacity: 4, label: "C4 VIP STANDING" },
  "C5": { type: "standing", capacity: 4, label: "C5 VIP STANDING" },
  "C6": { type: "sofa", capacity: 10, label: "C6 VIP SOFA BOOTH" },
  "C7": { type: "sofa", capacity: 10, label: "C7 VIP SOFA BOOTH" },
  "C8": { type: "sofa", capacity: 10, label: "C8 VIP SOFA BOOTH" },

  // Ground floor
  "G1": { type: "sofa", capacity: 12, label: "G1 MAIN ROOM SOFA" },
  "G2": { type: "sofa", capacity: 12, label: "G2 MAIN ROOM SOFA" },
  "G3": { type: "sofa", capacity: 12, label: "G3 MAIN ROOM SOFA" },
  "G4": { type: "sofa", capacity: 12, label: "G4 MAIN ROOM SOFA" },
  "G5": { type: "sofa", capacity: 12, label: "G5 MAIN ROOM SOFA" },
  "G6": { type: "sofa", capacity: 12, label: "G6 MAIN ROOM SOFA" },

  // VVIP & Stage VIP zones
  "VVIP1": { type: "sofa", capacity: 15, label: "VVIP 1 ULTRA LOUNGE" },
  "VVIP2": { type: "sofa", capacity: 15, label: "VVIP 2 ULTRA LOUNGE" },
  "VVIP3": { type: "sofa", capacity: 15, label: "VVIP 3 ULTRA LOUNGE" },
  "VVIP4": { type: "sofa", capacity: 12, label: "VVIP 4 ULTRA LOUNGE" },
  "VIP5": { type: "sofa", capacity: 10, label: "VIP 5 BALCONY DECK" },
  "VIP6": { type: "sofa", capacity: 10, label: "VIP 6 BALCONY DECK" },
  "VIP7": { type: "sofa", capacity: 10, label: "VIP 7 BALCONY DECK" },
  "STAGE1": { type: "sofa", capacity: 12, label: "STAGE PRIVATE BOOTH" }
};

// Robust helper to map any database table to its respective floor dynamically
const getFloorFromTable = (tbl: VIPTable): "GROUND" | "FIRST" | "SECOND" => {
  const cat = (tbl.category || "").toUpperCase();
  const id = (tbl.id || "").toUpperCase();
  
  if (cat.includes("FIRST") || id.startsWith("A")) return "FIRST";
  if (cat.includes("SECOND") || id.startsWith("C")) return "SECOND";
  
  // Default fallback is GROUND if not explicitly first or second floor
  return "GROUND";
};

export const FloorManagerPanel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<"GROUND" | "FIRST" | "SECOND" | null>(null);
  const [tables, setTables] = useState<VIPTable[]>([]);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Selections & form states
  const [selectedTable, setSelectedTable] = useState<VIPTable | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [bottleNotes, setBottleNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const showMsg = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tables");
      if (res.ok) {
        const d = await res.json();
        const loadedTables: VIPTable[] = d.data || [];
        setTables(loadedTables);

        // Keep active table selection details synchronized
        if (selectedTable) {
          const updatedSelect = loadedTables.find(t => t.id === selectedTable.id);
          if (updatedSelect) {
            setSelectedTable(updatedSelect);
          }
        }
      }
    } catch (err: any) {
      console.error("Floor Manager sync failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [selectedTable?.id]);

  const handleTableClick = (tbl: VIPTable) => {
    setSelectedTable(tbl);
    if (tbl.status === "VACANT") {
      setGuestName("");
      setGuestEmail("");
      setBottleNotes("");
    } else {
      setGuestName(tbl.guestName || "");
      setGuestEmail(tbl.guestEmail || "");
      setBottleNotes(tbl.bottleNotes || "");
    }
  };

  const handleAllocateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable || !guestName.trim()) {
      showMsg("Guest Name is required.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const meta = SEAT_METADATA[selectedTable.id] || { capacity: 10 };
      const updatedTable: VIPTable = {
        ...selectedTable,
        status: "TAKEN",
        capacity: meta.capacity || selectedTable.capacity || 10,
        guestName: guestName.toUpperCase(),
        guestEmail: guestEmail.trim(),
        bottleNotes: bottleNotes.trim(),
        assignedAt: new Date().toISOString()
      };

      const response = await fetch("/api/admin/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTable)
      });

      if (response.ok) {
        showMsg(`SUCCESS: Table ${selectedTable.name} occupied!`, "success");
        await fetchData();
      } else {
        showMsg("Database allocation rejection.", "error");
      }
    } catch (err: any) {
      showMsg(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDischargeTable = async () => {
    if (!selectedTable) return;
    if (!window.confirm(`Discharge reservation and vacate ${selectedTable.name} on the ${selectedFloor} floor?`)) return;

    try {
      const response = await fetch("/api/admin/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...selectedTable,
          status: "VACANT",
          guestName: undefined,
          guestEmail: undefined,
          orderId: undefined,
          bottleNotes: undefined,
          assignedAt: undefined
        })
      });

      if (response.ok) {
        showMsg(`SUCCESS: ${selectedTable.name} has been vacated.`, "success");
        await fetchData();
      } else {
        showMsg("Database release rejection.", "error");
      }
    } catch (err: any) {
      showMsg(err.message, "error");
    }
  };

  // Get matching tables for the currently selected floor
  const activeTables = tables.filter(t => getFloorFromTable(t) === selectedFloor);
  
  // Get unique categories dynamically to prevent empty state when custom DB entries are used
  const activeCategories = Array.from(new Set(activeTables.map(t => t.category)));

  const totalBooths = activeTables.length;
  const occupiedBooths = activeTables.filter(t => t.status === "TAKEN").length;
  const vacantBooths = activeTables.filter(t => t.status === "VACANT").length;

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-150 font-sans relative pb-16 select-text">
      
      {/* Glow */}
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-[#EF4444]/5 via-transparent to-transparent pointer-events-none" />

      {/* HEADER */}
      <header className="border-b border-neutral-900 bg-black/95 sticky top-0 z-50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#EF4444] text-white p-2 rounded-xs">
              <Layers size={18} />
            </div>
            <div>
              <h1 className="font-syne font-black text-sm sm:text-base tracking-wider text-white">XO FLOOR MANAGER</h1>
              <span className="font-mono text-[9px] text-[#EF4444] tracking-widest block font-bold">
                {selectedFloor ? `${selectedFloor} FLOOR SEATING COMMAND` : "SELECT ZONE FOR SHIFT COMMAND"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedFloor && (
              <button
                onClick={() => { setSelectedFloor(null); setSelectedTable(null); }}
                className="px-3 py-1.5 border border-neutral-850 hover:border-white text-zinc-400 hover:text-white font-mono text-[9px] uppercase rounded-xs transition-all cursor-pointer font-bold"
              >
                CHANGE FLOOR
              </button>
            )}
            <button
              onClick={() => {
                sessionStorage.removeItem("xo_floor_manager_auth");
                window.location.reload();
              }}
              className="px-3.5 py-1.5 bg-red-950/40 hover:bg-[#EF4444] border border-red-900/30 hover:border-white text-red-500 hover:text-white font-mono text-[10px] uppercase rounded-xs flex items-center gap-1.5 transition-all cursor-pointer font-bold"
            >
              LOCK PORTAL
            </button>
            <button
              onClick={() => window.location.href = "/"}
              className="px-3.5 py-1.5 border border-neutral-850 hover:border-white text-zinc-400 hover:text-white font-mono text-[10px] uppercase rounded-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowLeft size={11} />
              EXIT TO LOBBY
            </button>
            <button
              onClick={fetchData}
              className="p-2 border border-neutral-850 hover:bg-neutral-900 text-zinc-400 hover:text-white rounded-xs transition-all cursor-pointer"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        
        {/* Toast alerts */}
        {message && (
          <div className={`mb-6 p-4 rounded-xs border font-mono text-[10px] uppercase text-left flex items-center gap-2 max-w-md mx-auto ${
            message.type === "success" 
              ? "bg-emerald-950/20 border-emerald-900 text-emerald-400" 
              : "bg-red-950/20 border-red-900 text-red-400"
          }`}>
            {message.type === "success" ? <CheckCircle2 size={14} /> : <ShieldAlert size={14} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* STAGE 1: CHOOSE A FLOOR */}
        {!selectedFloor ? (
          <div className="max-w-4xl mx-auto py-16 text-center">
            <h2 className="font-syne font-black text-2xl tracking-wide text-white uppercase mb-2">
              SELECT YOUR ACTIVE SECTOR
            </h2>
            <p className="font-mono text-[9px] text-[#EF4444] tracking-widest uppercase block mb-12 font-bold">
              FLOOR MANAGER ASSIGNMENT DECK
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
              {[
                { 
                  id: "GROUND", 
                  title: "GROUND FLOOR", 
                  desc: "Includes VVIP Zone, Main Stage booths G1-G6, and VIP Elevated Deck booths VIP 5-7.",
                  catCount: 4 
                },
                { 
                  id: "FIRST", 
                  title: "FIRST FLOOR", 
                  desc: "Includes Balcony Sofa booths A1-A5 and Flank Cocktail standing tables A6-A8.",
                  catCount: 2 
                },
                { 
                  id: "SECOND", 
                  title: "SECOND FLOOR", 
                  desc: "Includes Balcony Sofa booths C1-C2 & C6-C8, and Standing high tables C3-C5.",
                  catCount: 2 
                }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFloor(f.id as any)}
                  className="bg-black border border-neutral-900 hover:border-[#EF4444] rounded-md p-6 text-left flex flex-col justify-between items-start transition-all duration-300 group cursor-pointer h-full"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[#EF4444] font-bold text-[9px] tracking-widest">// SECTOR {f.id}</span>
                      <Layers size={14} className="text-zinc-600 group-hover:text-[#EF4444] transition-colors" />
                    </div>
                    <h3 className="font-syne font-black text-white text-lg tracking-wide uppercase">{f.title}</h3>
                    <p className="text-zinc-500 text-[10px] leading-relaxed uppercase">{f.desc}</p>
                  </div>

                  <span className="mt-8 text-[9px] text-zinc-400 group-hover:text-white transition-colors font-bold uppercase tracking-wider flex items-center gap-1.5">
                    SELECT SECTOR &rarr;
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          
          // STAGE 2: FLOOR ACTIVE INTERFACE
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: ACTIVE DETAIL/ALLOCATE CARD (SPAN 5) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Floor Occupancy Board */}
              <div className="bg-black border border-neutral-900 p-5 rounded-md relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 inset-x-0 h-[2px] bg-[#EF4444]" />
                
                <h3 className="font-syne font-black text-xs tracking-widest text-white uppercase mb-4">
                  {selectedFloor} FLOOR DASHBOARD
                </h3>

                <div className="grid grid-cols-3 gap-2 font-mono text-center">
                  <div className="bg-neutral-950 border border-neutral-850 p-2.5 rounded-xs">
                    <span className="text-[7px] text-zinc-500 uppercase font-bold block">BOOTHS</span>
                    <span className="text-sm font-black text-white mt-1 block">{totalBooths}</span>
                  </div>
                  <div className="bg-neutral-950 border border-neutral-850 p-2.5 rounded-xs">
                    <span className="text-[7px] text-emerald-500 uppercase font-bold block">VACANT</span>
                    <span className="text-sm font-black text-emerald-400 mt-1 block">{vacantBooths}</span>
                  </div>
                  <div className="bg-neutral-950 border border-neutral-850 p-2.5 rounded-xs">
                    <span className="text-[7px] text-red-500 uppercase font-bold block">OCCUPIED</span>
                    <span className="text-sm font-black text-red-400 mt-1 block">{occupiedBooths}</span>
                  </div>
                </div>
              </div>

              {/* SEAT DETAIL / CONFIGURATION MODULE */}
              {selectedTable ? (
                <div className="bg-black border border-neutral-900 p-5 rounded-md relative overflow-hidden shadow-2xl">
                  {selectedTable.status === "TAKEN" ? (
                    /* Occupied Seat View */
                    <div className="space-y-4 text-left font-mono">
                      <div className="border-b border-neutral-900 pb-3 flex justify-between items-center">
                        <div>
                          <span className="text-[8px] text-zinc-500 block uppercase">SEAT MONITORING</span>
                          <h3 className="font-syne font-black text-sm text-white uppercase tracking-wider">
                            {selectedTable.name}
                          </h3>
                        </div>
                        <span className="px-2 py-0.5 bg-red-950/50 text-red-500 border border-red-900/40 text-[8px] font-bold uppercase rounded-xs">
                          OCCUPIED
                        </span>
                      </div>

                      <div className="space-y-2.5 text-[10px] bg-neutral-950 border border-neutral-850 p-3.5 rounded text-zinc-400">
                        <p className="text-white font-extrabold text-xs tracking-wide">// RESERVATION DETAILS</p>
                        <p><span className="text-zinc-550">GUEST NAME:</span> <span className="text-white font-bold">{selectedTable.guestName}</span></p>
                        <p><span className="text-zinc-550">EMAIL/PHONE:</span> <span className="text-zinc-350">{selectedTable.guestEmail || "NOT SPECIFIED"}</span></p>
                        {selectedTable.bottleNotes && (
                          <div className="border-t border-neutral-900/80 pt-2.5 mt-2.5">
                            <span className="text-[#EF4444] font-bold block mb-1">BOTTLE DETAILS &amp; MEMO:</span>
                            <p className="text-zinc-200 text-[10px] leading-relaxed uppercase bg-[#EF4444]/5 p-2 rounded-xs border border-red-950/20 italic">
                              {selectedTable.bottleNotes}
                            </p>
                          </div>
                        )}
                        <p className="text-[8px] text-zinc-550 pt-1.5 border-t border-neutral-900/50">
                          CHECK-IN ADMITTED AT: {selectedTable.assignedAt ? new Date(selectedTable.assignedAt).toLocaleTimeString() : "N/A"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleDischargeTable}
                        className="w-full py-3 bg-red-950/40 hover:bg-[#EF4444] border border-red-900/30 hover:border-white text-red-500 hover:text-white font-extrabold tracking-widest uppercase rounded-xs cursor-pointer transition-all flex items-center justify-center gap-1.5"
                      >
                        DISCHARGE SEAT
                      </button>
                    </div>
                  ) : (
                    /* Vacant Seat Allocation Form */
                    <div className="space-y-4 text-left font-mono">
                      <div className="border-b border-neutral-900 pb-3 flex justify-between items-center">
                        <div>
                          <span className="text-[8px] text-zinc-500 block uppercase">SEAT ALLOCATION</span>
                          <h3 className="font-syne font-black text-sm text-white uppercase tracking-wider">
                            {selectedTable.name}
                          </h3>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-950/50 text-emerald-400 border border-emerald-900/40 text-[8px] font-bold uppercase rounded-xs animate-pulse">
                          VACANT
                        </span>
                      </div>

                      <form onSubmit={handleAllocateSubmit} className="space-y-4 text-xs">
                        <div>
                          <label className="text-[8px] text-zinc-500 block uppercase mb-1.5 font-bold">GUEST LEADER NAME*</label>
                          <input autoComplete="off"
                            type="text"
                            required
                            placeholder="ENTER FULL NAME"
                            className="w-full bg-neutral-950 border border-neutral-850 p-2.5 rounded text-white focus:outline-none focus:border-[#EF4444] uppercase font-bold text-xs"
                            value={guestName}
                            onChange={e => setGuestName(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="text-[8px] text-zinc-500 block uppercase mb-1.5 font-bold">GUEST EMAIL / PHONE</label>
                          <input autoComplete="off"
                            type="text"
                            placeholder="sujal@example.com"
                            className="w-full bg-neutral-950 border border-neutral-850 p-2.5 rounded text-white focus:outline-none text-xs"
                            value={guestEmail}
                            onChange={e => setGuestEmail(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="text-[8px] text-zinc-500 block uppercase mb-1.5 font-bold">BOTTLES / ORDER MEMO</label>
                          <input autoComplete="off"
                            type="text"
                            placeholder="e.g. Jack Daniels, 4x Redbull"
                            className="w-full bg-neutral-950 border border-neutral-850 p-2.5 rounded text-white focus:outline-none text-xs"
                            value={bottleNotes}
                            onChange={e => setBottleNotes(e.target.value)}
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={submitting || !guestName.trim()}
                          className="w-full py-3 bg-white text-black hover:bg-[#EF4444] hover:text-white font-extrabold tracking-widest uppercase rounded-xs cursor-pointer transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          {submitting ? "SAVING..." : "ALLOCATE SEAT"}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-neutral-950/40 border border-neutral-900 rounded-md font-mono text-[9px] uppercase leading-relaxed text-zinc-500 text-left flex items-start gap-2">
                  <Info size={12} className="text-zinc-550 shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-zinc-400 font-bold block mb-1">RESERVATION VIEWER DECK</strong>
                    Please click on any seat div in the grid layout on the right. This console will load the seat's active occupant details, orders, and allocate new bookings instantly.
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: INTERACTIVE FLOOR SEAT GRIDS (SPAN 7) */}
            <div className="lg:col-span-7 bg-black border border-neutral-900 p-6 rounded-md shadow-2xl relative">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-indigo-500" />

              <h2 className="font-syne font-black text-xs tracking-wider text-white uppercase border-b border-neutral-900 pb-3 mb-6">
                ACTIVE SEATING GRID // {selectedFloor} FLOOR
              </h2>

              <div className="space-y-8">
                {activeCategories.length === 0 ? (
                  <div className="py-12 text-center text-zinc-600 font-mono uppercase text-[10px] border border-dashed border-neutral-900 rounded">
                    No seats registered on this floor.
                  </div>
                ) : (
                  activeCategories.map(cat => {
                    const items = activeTables.filter(t => t.category === cat);
                    if (items.length === 0) return null;

                    return (
                      <div key={cat} className="space-y-3.5 font-mono text-left">
                        <span className="text-[8px] text-zinc-550 font-bold block tracking-widest">// ZONE: {cat}</span>
                        
                        {/* Grid representation styled exactly like VIPBooking.tsx's reservations div */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {items.map(tbl => {
                            const meta = SEAT_METADATA[tbl.id] || { type: "booth", capacity: tbl.capacity || 10 };
                            const isTaken = tbl.status === "TAKEN";
                            const isSelected = selectedTable?.id === tbl.id;

                            return (
                              <button
                                key={tbl.id}
                                type="button"
                                onClick={() => handleTableClick(tbl)}
                                className={`p-3 rounded-xs border transition-all text-left relative flex flex-col justify-between overflow-hidden cursor-pointer min-h-[90px] w-full ${
                                  isTaken
                                    ? isSelected
                                      ? "bg-red-955/20 border-[#EF4444] ring-2 ring-[#EF4444]/55 text-white"
                                      : "bg-red-950/5 border-neutral-900 text-zinc-400"
                                    : isSelected
                                    ? "bg-red-950/20 border-[#EF4444] ring-2 ring-[#EF4444]/50 shadow-lg text-white"
                                    : "bg-black border-neutral-850 hover:border-zinc-700 text-zinc-350"
                                  }`}
                              >
                                {/* Top row: Name & status badge */}
                                <div className="flex items-start justify-between gap-1 w-full mb-1.5">
                                  <span className="font-syne font-black text-[11px] uppercase tracking-tight leading-tight break-words">
                                    {tbl.name}
                                  </span>
                                  
                                  <span className={`shrink-0 px-1.5 py-0.5 border text-[7px] font-mono font-bold uppercase rounded-xs ${
                                    isTaken 
                                      ? "bg-red-950/50 text-red-400 border-red-900/40" 
                                      : "bg-emerald-950/50 text-emerald-400 border-emerald-900/40"
                                  }`}>
                                    {isTaken ? "TAKEN" : "VACANT"}
                                  </span>
                                </div>

                                {/* Middle / Bottom row: If taken, show occupant details */}
                                {isTaken ? (
                                  <div className="w-full mt-1.5 text-left border-t border-neutral-900/80 pt-1.5">
                                    <span className="text-[7.5px] text-zinc-500 uppercase block font-bold">OCCUPANT:</span>
                                    <span className="text-[10px] text-white font-extrabold block truncate uppercase tracking-wide">
                                      {tbl.guestName || "RESERVED"}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="text-[7.5px] text-zinc-550 uppercase leading-normal mt-1.5 border-t border-neutral-900/40 pt-1.5">
                                    <span className="block font-bold text-zinc-400">{meta.capacity} GUESTS</span>
                                    <span className="block text-[7px] text-zinc-600 mt-0.5">{meta.type}</span>
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
};
