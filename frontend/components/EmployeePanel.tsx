import React, { useState, useEffect, useRef } from "react";
import { 
  Scan, Search, CheckCircle2, XCircle, RefreshCw, 
  MapPin, Check, ArrowLeft, Users, Info, ShieldAlert, Sparkles, Key
} from "lucide-react";
import { VIPTable } from "../types";

export const EmployeePanel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [scanInput, setScanInput] = useState("");
  const [verifyingScan, setVerifyingScan] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    title: string;
    message: string;
    details?: any;
  } | null>(null);

  // States
  const [tables, setTables] = useState<VIPTable[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"seats" | "vip" | "tickets">("seats");
  const [focusLocked, setFocusLocked] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const scanInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tbRes, ordRes, evRes] = await Promise.all([
        fetch("/api/admin/tables"),
        fetch("/api/admin/orders"),
        fetch("/api/admin/events")
      ]);

      if (tbRes.ok) {
        const d = await tbRes.json();
        setTables(d.data || []);
      }
      if (ordRes.ok) {
        const d = await ordRes.json();
        setOrders(d.data || []);
      }
      if (evRes.ok) {
        const d = await evRes.json();
        setEvents(d.data || []);
      }
    } catch (err: any) {
      console.error("Employee synchronizer failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Live update real-time sync every 4 seconds
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Autofocus loop for physical barcode scanner machine
  useEffect(() => {
    if (!focusLocked) return;

    const interval = setInterval(() => {
      if (document.activeElement !== scanInputRef.current) {
        scanInputRef.current?.focus();
      }
    }, 1000);

    scanInputRef.current?.focus();

    return () => clearInterval(interval);
  }, [focusLocked]);

  const showMsg = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const extractOrderId = (text: string): string => {
    const trimmed = text.trim();
    try {
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        const url = new URL(trimmed);
        const orderId = url.searchParams.get("orderId") || url.searchParams.get("id");
        if (orderId) return orderId;
        
        const parts = url.pathname.split("/");
        const lastPart = parts[parts.length - 1];
        if (lastPart && lastPart.length > 10) {
          return lastPart;
        }
      }
    } catch (e) {
      // Treat as standard raw ID
    }
    return trimmed;
  };

  const handleVerifyId = async (orderIdToScan: string) => {
    const orderId = extractOrderId(orderIdToScan);
    if (!orderId) return;

    setVerifyingScan(true);
    setScanResult(null);

    try {
      const response = await fetch("/api/admin/orders/verify-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setScanResult({
          success: true,
          title: "VERIFIED & PASSED",
          message: "Guest checked in successfully. Welcome to XO Club!",
          details: data.order
        });
        setScanInput("");
        fetchData(); // Sync list immediately
      } else {
        const isAlreadyScanned = data.error === "TICKET ALREADY SCAN-CLAIMED" || response.status === 409;
        const errorTitle = isAlreadyScanned ? "ALREADY CLAIMED" : (data.error || "VALIDATION FAILED");
        const errorMessage = isAlreadyScanned 
          ? `Checked in at: ${data.checkedInAt ? new Date(data.checkedInAt).toLocaleTimeString() : "earlier time"}.`
          : (data.message || "Unrecognized code.");

        setScanResult({
          success: false,
          title: errorTitle,
          message: errorMessage,
          details: data.order ? { ...data.order, checkedInAt: data.checkedInAt || data.order.checkedInAt } : null
        });
      }
    } catch (err: any) {
      setScanResult({
        success: false,
        title: "ROUTER FAULT",
        message: err.message
      });
    } finally {
      setVerifyingScan(false);
    }
  };

  // Filter logic
  const normalizedQuery = searchQuery.trim().toUpperCase();
  
  const filteredTables = tables.filter(t => {
    if (!normalizedQuery) return true;
    return (
      t.id.toUpperCase().includes(normalizedQuery) ||
      t.name.toUpperCase().includes(normalizedQuery) ||
      (t.guestName && t.guestName.toUpperCase().includes(normalizedQuery)) ||
      (t.guestEmail && t.guestEmail.toUpperCase().includes(normalizedQuery))
    );
  });

  const paidVipOrders = orders.filter(o => o.type === "vip" && o.status === "PAID");
  const filteredVips = paidVipOrders.filter(o => {
    if (!normalizedQuery) return true;
    return (
      o.orderId.toUpperCase().includes(normalizedQuery) ||
      o.guestName.toUpperCase().includes(normalizedQuery) ||
      o.guestEmail.toUpperCase().includes(normalizedQuery) ||
      o.typeName.toUpperCase().includes(normalizedQuery)
    );
  });

  const paidTicketOrders = orders.filter(o => o.type === "ticket" && o.status === "PAID");
  const filteredTickets = paidTicketOrders.filter(o => {
    if (!normalizedQuery) return true;
    return (
      o.orderId.toUpperCase().includes(normalizedQuery) ||
      o.guestName.toUpperCase().includes(normalizedQuery) ||
      o.guestEmail.toUpperCase().includes(normalizedQuery) ||
      o.typeName.toUpperCase().includes(normalizedQuery)
    );
  });

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-150 font-sans relative pb-16 select-text">
      
      {/* Glow effect */}
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-[#EF4444]/5 via-transparent to-transparent pointer-events-none" />

      {/* HEADER */}
      <header className="border-b border-neutral-900 bg-black/95 sticky top-0 z-50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#EF4444] text-white p-2 rounded-xs">
              <Scan size={18} />
            </div>
            <div>
              <h1 className="font-syne font-black text-sm sm:text-base tracking-wider text-white">XO DOOR CONTROL</h1>
              <span className="font-mono text-[9px] text-[#EF4444] tracking-widest block font-bold">
                PHYSICAL SCANNER &amp; GUEST LIST MAIN DECK
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sessionStorage.removeItem("xo_employee_auth");
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

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: PHYSICAL QR SCANNER PORT (SPAN 5) */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-black border border-neutral-900 p-6 rounded-md relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-[#EF4444]" />
            
            <h2 className="font-syne font-black text-xs tracking-widest text-white uppercase mb-4 flex items-center gap-2">
              <Scan size={14} className="text-[#EF4444]" />
              PHYSICAL QR LIGHT-SCANNER PORT
            </h2>

            {/* Simulated Scanning Viewport optimized for physical machine */}
            <div className="mb-5 w-full bg-neutral-950/70 border border-neutral-850 rounded p-6 text-center flex flex-col justify-center items-center min-h-[160px] relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(239,68,68,0.03)_0%,transparent_70%)] opacity-80 pointer-events-none" />
              
              <div className={`w-12 h-12 rounded-full border flex items-center justify-center mb-3 transition-colors ${
                focusLocked ? "border-[#EF4444]/60 bg-red-950/10 text-[#EF4444] animate-pulse" : "border-neutral-800 bg-neutral-900 text-zinc-550"
              }`}>
                <Scan size={20} />
              </div>

              <div className="space-y-1">
                <span className="font-mono text-[9px] text-[#EF4444] tracking-[0.2em] uppercase font-bold block">
                  {focusLocked ? "READY TO SCAN INBOUND TICKETS" : "SCANNER STANDBY MODE"}
                </span>
                <p className="text-[9px] text-zinc-500 font-mono uppercase leading-relaxed max-w-xs mx-auto">
                  {focusLocked 
                    ? "Connect your hardware QR light-scanner machine. Place the pointer light over the code to trigger auto check-in." 
                    : "Autofocus loop disabled. Use manual keyboard validation."}
                </p>
              </div>
            </div>

            {/* Autofocus controller & scanner input */}
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-[9px] text-zinc-500 font-mono font-bold uppercase tracking-wider block">
                  ACTIVE SCAN BUFFER (FOCUSED FIELD)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input autoComplete="off"
                      ref={scanInputRef}
                      type="text"
                      placeholder={focusLocked ? "Awaiting hardware laser scan..." : "Enter ID manually..."}
                      className="w-full bg-neutral-950 border border-neutral-850 py-3.5 px-4 text-xs font-mono rounded text-white focus:outline-none focus:border-[#EF4444] uppercase tracking-wider"
                      value={scanInput}
                      onChange={e => setScanInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleVerifyId(scanInput)}
                    />
                    {focusLocked && (
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EF4444]"></span>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleVerifyId(scanInput)}
                    disabled={verifyingScan || !scanInput.trim()}
                    className="px-5 bg-white text-black hover:bg-[#EF4444] hover:text-white font-extrabold text-[10px] tracking-widest uppercase rounded cursor-pointer transition-all flex items-center justify-center disabled:opacity-50"
                  >
                    {verifyingScan ? "..." : "CHECK-IN"}
                  </button>
                </div>
              </div>

              {/* Focus Lock Switcher */}
              <div className="flex items-center justify-between bg-neutral-950 p-3 border border-neutral-850 rounded-xs font-mono text-[9px] uppercase font-bold text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Key size={11} className={focusLocked ? "text-[#EF4444]" : "text-zinc-600"} />
                  HARDWARE SCANNER FOCUS LOCK
                </span>
                
                <button
                  type="button"
                  onClick={() => setFocusLocked(!focusLocked)}
                  className={`px-3 py-1 rounded-xs border text-[8px] font-black tracking-widest transition-all cursor-pointer ${
                    focusLocked 
                      ? "bg-red-950/20 border-[#EF4444] text-[#EF4444] uppercase" 
                      : "bg-neutral-900 border-neutral-800 text-zinc-500 uppercase"
                  }`}
                >
                  {focusLocked ? "LOCKED ON" : "LOCKED OFF"}
                </button>
              </div>
            </div>
          </div>

          {/* SCAN DIODE CHECK-IN RESULT CARD */}
          {scanResult && (
            <div className={`p-5 rounded-md border shadow-lg ${
              scanResult.success 
                ? "bg-emerald-950/15 border-emerald-900 text-emerald-400" 
                : "bg-red-950/15 border-red-900 text-red-400"
            }`}>
              <div className="flex items-center gap-2.5 mb-3 font-mono">
                {scanResult.success ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                <h3 className="font-syne font-black text-xs tracking-widest uppercase">{scanResult.title}</h3>
              </div>
              <p className="font-mono text-[10px] uppercase leading-relaxed text-zinc-200 mb-3">{scanResult.message}</p>

              {scanResult.details && (
                <div className="pt-3 border-t border-neutral-900/60 font-mono text-[9px] text-zinc-400 space-y-1.5 bg-black/50 p-3 rounded">
                  <p className="text-white font-bold tracking-widest">// VOUCHER REGISTER DETAILS</p>
                  <p><span className="text-zinc-550">GUEST NAME:</span> <span className="text-white font-bold">{scanResult.details.guestName}</span></p>
                  <p><span className="text-zinc-550">GUEST EMAIL:</span> <span className="text-zinc-350">{scanResult.details.guestEmail}</span></p>
                  <p><span className="text-zinc-550">ORDER VOUCHER:</span> <span className="text-white">{scanResult.details.orderId}</span></p>
                  <p><span className="text-zinc-550">DESIGNATION:</span> <span className="text-indigo-400 font-bold">{scanResult.details.typeName} ({scanResult.details.count}x)</span></p>
                  {scanResult.details.checkedInAt && (
                    <p className="text-[#EF4444] font-bold"><span className="text-zinc-550 font-normal">CLAIM TIME:</span> {new Date(scanResult.details.checkedInAt).toLocaleTimeString()}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* CHECK-IN PROTOCOLS AND STATS */}
          <div className="bg-neutral-950 border border-neutral-900 p-5 rounded font-mono text-[9px] space-y-3 leading-relaxed text-zinc-450 uppercase text-left">
            <span className="text-white font-bold block mb-1 tracking-widest flex items-center gap-1.5">
              <Info size={12} className="text-[#EF4444]" />
              DOOR CHECK-IN REGISTRY INFO
            </span>
            <div>• All ticket sales gathered from eSewa checkouts are synced in real time.</div>
            <div>• Ticket holders must match active passport or government ID name verification.</div>
            <div>• VIP bookings receive table credentials printed directly on checked-in vouchers.</div>
          </div>
        </section>

        {/* RIGHT COLUMN: SEAT ALLOCATIONS, GUEST LISTS & TICKETS (SPAN 7) */}
        <section className="lg:col-span-7 space-y-6">
          
          {/* Main search and tabs container */}
          <div className="bg-black border border-neutral-900 p-6 rounded-md shadow-2xl relative">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-indigo-500" />

            {/* Tab header controller */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-900 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <h2 className="font-syne font-black text-xs tracking-wider text-white uppercase">RESERVATIONS &amp; PASSES</h2>
              </div>

              {/* Custom Search bar */}
              <div className="relative w-full sm:w-64 font-mono text-[10px]">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-550">
                  <Search size={12} />
                </span>
                <input autoComplete="off"
                  type="text"
                  placeholder="SEARCH NAME / EMAIL / ORDER ID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-850 py-2 pl-8 pr-4 text-xs font-mono rounded text-white focus:outline-none focus:border-indigo-500 uppercase"
                />
              </div>
            </div>

            {/* TAB BUTTONS */}
            <div className="grid grid-cols-3 gap-2 mb-6 font-mono text-[9px] font-bold uppercase tracking-wider">
              <button
                type="button"
                onClick={() => { setActiveTab("seats"); setSearchQuery(""); }}
                className={`py-2 px-3 border rounded-xs transition-all cursor-pointer ${
                  activeTab === "seats" 
                    ? "bg-indigo-950/20 border-indigo-500 text-indigo-400" 
                    : "bg-neutral-950 border-neutral-900 text-zinc-500 hover:text-white"
                }`}
              >
                SEAT ALLOCATIONS ({tables.filter(t => t.status === "TAKEN").length})
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab("vip"); setSearchQuery(""); }}
                className={`py-2 px-3 border rounded-xs transition-all cursor-pointer ${
                  activeTab === "vip" 
                    ? "bg-indigo-950/20 border-indigo-500 text-indigo-400" 
                    : "bg-neutral-950 border-neutral-900 text-zinc-500 hover:text-white"
                }`}
              >
                INVITED GUESTS ({paidVipOrders.length})
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab("tickets"); setSearchQuery(""); }}
                className={`py-2 px-3 border rounded-xs transition-all cursor-pointer ${
                  activeTab === "tickets" 
                    ? "bg-indigo-950/20 border-indigo-500 text-indigo-400" 
                    : "bg-neutral-950 border-neutral-900 text-zinc-500 hover:text-white"
                }`}
              >
                TICKET HOLDERS ({paidTicketOrders.length})
              </button>
            </div>

            {/* TAB 1: SEAT ALLOCATIONS (READ ONLY VIEW) */}
            {activeTab === "seats" && (
              <div className="space-y-8">
                {[
                  {
                    code: "GF",
                    name: "GROUND FLOOR",
                    desc: "MAIN ROOM DANCEFLOOR ACCESS & VVIP LOUNGES",
                    tables: filteredTables.filter(t => {
                      const cat = (t.category || "").toUpperCase();
                      const id = (t.id || "").toUpperCase();
                      return !cat.includes("FIRST") && !cat.includes("SECOND") && !id.startsWith("A") && !id.startsWith("C");
                    })
                  },
                  {
                    code: "1F",
                    name: "FIRST FLOOR",
                    desc: "BALCONY LOUNGE & COCKTAIL HIGH STOOLS",
                    tables: filteredTables.filter(t => {
                      const cat = (t.category || "").toUpperCase();
                      const id = (t.id || "").toUpperCase();
                      return cat.includes("FIRST") || id.startsWith("A");
                    })
                  },
                  {
                    code: "2F",
                    name: "SECOND FLOOR",
                    desc: "UPPER VIP DECK & STANDING HIGH TABLES",
                    tables: filteredTables.filter(t => {
                      const cat = (t.category || "").toUpperCase();
                      const id = (t.id || "").toUpperCase();
                      return cat.includes("SECOND") || id.startsWith("C");
                    })
                  }
                ].map(floor => {
                  if (floor.tables.length === 0) return null;

                  return (
                    <div key={floor.code} className="border border-neutral-900 bg-neutral-950/40 p-4 rounded-md space-y-4 font-mono text-left">
                      {/* Floor Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2.5 border-b border-neutral-900">
                        <div className="flex items-center gap-2">
                          <span className="bg-red-500/10 border border-red-500/30 text-[#FF3B30] text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-widest shrink-0">
                            {floor.code}
                          </span>
                          <h3 className="text-white text-xs font-extrabold tracking-wider">{floor.name}</h3>
                        </div>
                        <span className="text-[8px] text-zinc-500 uppercase tracking-wider">{floor.desc}</span>
                      </div>

                      {/* Tables Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {floor.tables.map(tbl => (
                          <div 
                            key={tbl.id} 
                            className={`border rounded p-3 text-[11px] flex flex-col justify-between transition-all duration-300 ${
                              tbl.status === "VACANT" 
                                ? "bg-emerald-950/5 border-emerald-950/10 hover:border-emerald-900/30" 
                                : "bg-neutral-950 border-neutral-850 hover:border-neutral-700"
                            }`}
                          >
                            <div>
                              <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-neutral-900">
                                <span className="font-extrabold text-white uppercase tracking-wider">{tbl.name}</span>
                                <span className={`px-1.5 py-0.5 text-[7px] font-mono rounded-xs font-extrabold ${
                                  tbl.status === "VACANT" 
                                    ? "bg-emerald-950/50 border border-emerald-900/60 text-emerald-400" 
                                    : "bg-red-950/50 border border-red-900/60 text-red-400"
                                }`}>
                                  {tbl.status === "VACANT" ? "VACANT" : "ALLOCATED"}
                                </span>
                              </div>

                              {tbl.status === "TAKEN" ? (
                                <div className="space-y-1 text-[9px] text-zinc-400 uppercase pt-1 leading-normal">
                                  <p className="text-white font-extrabold truncate">GUEST: {tbl.guestName}</p>
                                  {tbl.guestEmail && <p className="text-zinc-550 truncate">EMAIL: {tbl.guestEmail}</p>}
                                  {tbl.bottleNotes && (
                                    <p className="text-[#EF4444] font-bold bg-[#EF4444]/5 p-1 rounded-xs border border-red-950/20 mt-1 truncate">
                                      NOTES: {tbl.bottleNotes}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-[9px] text-zinc-600 italic py-2 pt-1 uppercase">Ready for checkout allocation</p>
                              )}
                            </div>

                            <div className="mt-3 pt-2 border-t border-neutral-900/50 flex justify-between items-center text-[8px] text-zinc-550 uppercase">
                              <span>CAPACITY: {tbl.capacity} PAX</span>
                              {tbl.assignedAt && <span>SINCE: {new Date(tbl.assignedAt).toLocaleTimeString()}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 2: INVITED GUESTS (VIP RESERVATIONS) */}
            {activeTab === "vip" && (
              <div className="space-y-3">
                <span className="text-[8px] text-zinc-500 font-mono font-bold block uppercase tracking-widest text-left">
                  // REGISTERED PAID VIP RESERVATIONS
                </span>

                {filteredVips.length === 0 ? (
                  <div className="py-12 text-center text-zinc-600 font-mono uppercase text-[10px] border border-dashed border-neutral-900 rounded">
                    No matching PAID VIP guest reservations found.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {filteredVips.map(order => (
                      <div
                        key={order.orderId}
                        className={`p-3.5 rounded border font-mono text-[10px] text-left flex justify-between items-center transition-all ${
                          order.checkedIn 
                            ? "bg-neutral-950 border-neutral-900 text-zinc-550" 
                            : "bg-black border-neutral-850 text-white"
                        }`}
                      >
                        <div className="space-y-1.5 flex-grow truncate mr-3">
                          <div className="flex items-center gap-2">
                            <p className="font-extrabold text-white uppercase text-xs truncate">{order.guestName}</p>
                            {order.checkedIn ? (
                              <span className="text-emerald-500 text-[7px] font-extrabold uppercase bg-emerald-950/20 px-1 border border-emerald-950/50 flex items-center gap-0.5 shrink-0">
                                <Check size={8} /> CLAIMED
                              </span>
                            ) : (
                              <span className="text-indigo-400 text-[7px] font-extrabold uppercase bg-indigo-950/20 px-1 border border-indigo-950/50 shrink-0">
                                ACTIVE PASS
                              </span>
                            )}
                          </div>
                          <p className="text-[8px] text-zinc-500 truncate">{order.guestEmail} // ID: {order.orderId.slice(0, 8)}...</p>
                          <p className="text-indigo-400 text-[8px] font-bold uppercase">{order.typeName} ({order.count} PAX)</p>
                          {order.checkedInAt && (
                            <p className="text-[8px] text-emerald-500">CHECKED IN AT: {new Date(order.checkedInAt).toLocaleTimeString()}</p>
                          )}
                        </div>

                        {!order.checkedIn && (
                          <button
                            type="button"
                            onClick={() => handleVerifyId(order.orderId)}
                            className="px-4 py-2 bg-indigo-650 hover:bg-indigo-500 text-white font-extrabold text-[9px] tracking-widest uppercase rounded-xs cursor-pointer transition-all shrink-0 shadow-md"
                          >
                            CHECK IN
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: TICKET HOLDERS (REGULAR COMPILATION) */}
            {activeTab === "tickets" && (
              <div className="space-y-3">
                <span className="text-[8px] text-zinc-500 font-mono font-bold block uppercase tracking-widest text-left">
                  // PAID TICKET HOLDERS
                </span>

                {filteredTickets.length === 0 ? (
                  <div className="py-12 text-center text-zinc-600 font-mono uppercase text-[10px] border border-dashed border-neutral-900 rounded">
                    No matching paid ticket holder names found.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {filteredTickets.map(order => (
                      <div
                        key={order.orderId}
                        className={`p-3.5 rounded border font-mono text-[10px] text-left flex justify-between items-center transition-all ${
                          order.checkedIn 
                            ? "bg-neutral-950 border-neutral-900 text-zinc-550" 
                            : "bg-black border-neutral-850 text-white"
                        }`}
                      >
                        <div className="space-y-1.5 flex-grow truncate mr-3">
                          <div className="flex items-center gap-2">
                            <p className="font-extrabold text-white uppercase text-xs truncate">{order.guestName}</p>
                            {order.checkedIn ? (
                              <span className="text-emerald-500 text-[7px] font-extrabold uppercase bg-emerald-950/20 px-1 border border-emerald-950/50 flex items-center gap-0.5 shrink-0">
                                <Check size={8} /> CLAIMED
                              </span>
                            ) : (
                              <span className="text-emerald-500 text-[7px] font-extrabold uppercase bg-emerald-950/20 px-1 border border-emerald-950/50 shrink-0">
                                ACTIVE TICKET
                              </span>
                            )}
                          </div>
                          <p className="text-[8px] text-zinc-500 truncate">{order.guestEmail} // ID: {order.orderId.slice(0, 8)}...</p>
                          <p className="text-white font-bold uppercase">{order.typeName} ({order.count}x TICKETS)</p>
                          {order.checkedInAt && (
                            <p className="text-[8px] text-emerald-500">CHECKED IN AT: {new Date(order.checkedInAt).toLocaleTimeString()}</p>
                          )}
                        </div>

                        {!order.checkedIn && (
                          <button
                            type="button"
                            onClick={() => handleVerifyId(order.orderId)}
                            className="px-4 py-2 bg-indigo-650 hover:bg-indigo-500 text-white font-extrabold text-[9px] tracking-widest uppercase rounded-xs cursor-pointer transition-all shrink-0 shadow-md"
                          >
                            CHECK IN
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </section>

      </main>
    </div>
  );
};
