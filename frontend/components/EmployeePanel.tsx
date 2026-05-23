import React, { useState, useEffect } from "react";
import { 
  Scan, Search, CheckCircle2, XCircle, Shield, RefreshCw, 
  MapPin, Check, Compass, Trash2, ArrowLeft, Users, AlertTriangle, Coffee, Info
} from "lucide-react";
import { VIPTable } from "../../backend/routes/admin.routes";
import { Html5Qrcode } from "html5-qrcode";

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
  const [searchQuery, setSearchQuery] = useState("");
  
  // Interactive mock scanning state
  const [cameraActive, setCameraActive] = useState(false);
  const [customTableForm, setCustomTableForm] = useState<{
    tableId: string;
    guestName: string;
    guestEmail: string;
    bottleNotes: string;
  }>({
    tableId: "",
    guestName: "",
    guestEmail: "",
    bottleNotes: ""
  });
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tbRes, ordRes] = await Promise.all([
        fetch("/api/admin/tables"),
        fetch("/api/admin/orders")
      ]);

      if (tbRes.ok) {
        const d = await tbRes.json();
        setTables(d.data || []);
      }
      if (ordRes.ok) {
        const d = await ordRes.json();
        setOrders(d.data || []);
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

  const showMsg = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  /* =========================================================================
     VERIFY OR SCAN TICKET CODE
     ========================================================================= */
  const handleVerifyId = async (orderIdToScan: string) => {
    if (!orderIdToScan.trim()) return;
    setVerifyingScan(true);
    setScanResult(null);

    try {
      const response = await fetch("/api/admin/orders/verify-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderIdToScan.trim() })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setScanResult({
          success: true,
          title: "TICKET AUTHORIZED",
          message: "Guest verified and marked as Checked-in. Welcome to XO Thamel!",
          details: data.order
        });
        setScanInput("");
        fetchData(); // Sync list immediately
      } else {
        setScanResult({
          success: false,
          title: data.error || "VALIDATION FAULT",
          message: data.message || "Unrecognized cryptographic pass. Check spelling or override manually.",
          details: data.order ? { ...data.order, checkedInAt: data.checkedInAt || data.order.checkedInAt } : null
        });
      }
    } catch (err: any) {
      setScanResult({
        success: false,
        title: "API ROUTER FAILURE",
        message: "Offline or server block: " + err.message
      });
    } finally {
      setVerifyingScan(false);
    }
  };

  // Turn on/off simulation viewfinder
  const toggleCameraScanner = () => {
    setCameraActive(!cameraActive);
    setScanResult(null);
  };

  // Real browser camera scan runner using html5-qrcode
  useEffect(() => {
    let qrScanner: Html5Qrcode | null = null;
    let isActive = true;

    if (cameraActive) {
      const initScanner = async () => {
        try {
          const container = document.getElementById("qr-reader");
          if (!container) {
            console.warn("QR reader DOM element not resolved yet");
            return;
          }

          qrScanner = new Html5Qrcode("qr-reader");

          await qrScanner.start(
            { facingMode: "environment" },
            {
              fps: 15,
              qrbox: (width, height) => {
                const smallerDimension = Math.min(width, height);
                const size = Math.floor(smallerDimension * 0.7);
                return { width: size, height: size };
              },
              aspectRatio: 1.777778,
            },
            (decodedText) => {
              if (!isActive) return;
              // Successfully scanned! trigger verification
              handleVerifyId(decodedText);
              // Clean up camera immediately to prevent spam or duplicate scanned tickets
              setCameraActive(false);
            },
            () => {
              // Idle noise / scanner search interval
            }
          );
        } catch (err: any) {
          console.error("Failed to start html5-qrcode standard stream:", err);
          if (isActive) {
            setScanResult({
              success: false,
              title: "CAMERA SYSTEM FAULT",
              message: err?.message || "Please grant camera permissions to continue or enter code manually below.",
            });
            setCameraActive(false);
          }
        }
      };

      const timeoutId = setTimeout(initScanner, 120);
      return () => {
        clearTimeout(timeoutId);
        isActive = false;
        if (qrScanner && qrScanner.isScanning) {
          qrScanner.stop().catch((e) => console.warn("Stopping scanner failed:", e));
        }
      };
    }
  }, [cameraActive]);

  // Simulation support: Clicking on an active Paid order instantly triggers verification
  const handleSimulateScan = (orderId: string) => {
    setScanInput(orderId);
    handleVerifyId(orderId);
    setCameraActive(false);
  };


  /* =========================================================================
     TABLE OCCUPANCY CONTROLS
     ========================================================================= */
  const handleFreeTable = async (tbl: VIPTable) => {
    if (!window.confirm(`Discharge reservation and mark ${tbl.name} as Vacant?`)) return;
    try {
      const response = await fetch("/api/admin/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...tbl,
          status: "VACANT",
          guestName: undefined,
          guestEmail: undefined,
          orderId: undefined,
          bottleNotes: undefined,
          assignedAt: undefined
        })
      });

      if (response.ok) {
        showMsg(`Table ${tbl.name} cleared successfully`, "success");
        fetchData();
      }
    } catch (err: any) {
      showMsg(err.message, "error");
    }
  };

  const handleManualOccupancySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { tableId, guestName, guestEmail, bottleNotes } = customTableForm;
    if (!tableId || !guestName) {
      showMsg("Please select a vacant table and fill guest name.", "error");
      return;
    }

    const matchedTable = tables.find(t => t.id === tableId);
    if (!matchedTable) return;

    try {
      const response = await fetch("/api/admin/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...matchedTable,
          status: "TAKEN",
          guestName: guestName.toUpperCase(),
          guestEmail: guestEmail,
          bottleNotes: bottleNotes,
          assignedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        showMsg(`Assigned reservation on ${matchedTable.name}`, "success");
        setCustomTableForm({ tableId: "", guestName: "", guestEmail: "", bottleNotes: "" });
        fetchData();
      } else {
        showMsg("Internal database save aborted", "error");
      }
    } catch (err: any) {
      showMsg(err.message, "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#040404] text-zinc-100 font-sans relative pb-16">
      
      {/* Dynamic ambient grid background */}
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-indigo-550/5 via-transparent to-transparent pointer-events-none" />

      {/* HEADER BAR */}
      <header className="border-b border-neutral-900 bg-black/95 sticky top-0 z-50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded">
              <Scan size={18} />
            </div>
            <div>
              <h1 className="font-syne font-black text-sm sm:text-base tracking-wider text-white">XO FLOOR SERVICE</h1>
              <span className="font-mono text-[9px] text-indigo-400 tracking-widest block font-bold">
                EMPLOYEE CONSOLE & TICKET CHECK-IN
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.href = "/"}
              className="px-3.5 py-1.5 border border-neutral-850 hover:border-white text-zinc-400 hover:text-white font-mono text-[10px] uppercase rounded-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowLeft size={11} />
              EXIT TO LOBBY
            </button>
            <button
              onClick={fetchData}
              className="p-2 border border-neutral-850 hover:bg-neutral-900 text-zinc-400 hover:text-white rounded-sm transition-all"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COMPASS: QR / PASS VALIDATION CHANNEL (COLUMN SPAN 5) */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-black border border-neutral-900 p-5 rounded relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[3px] bg-indigo-500" />
            
            <h2 className="font-syne font-black text-xs tracking-widest text-white uppercase mb-4 flex items-center gap-2">
              <Compass size={14} className="text-indigo-400" />
              INTELLIGENT INTEGRATED SCANNER
            </h2>

            {/* Simulated Live Viewfinder */}
            <div className="mb-4 aspect-video rounded-sm bg-neutral-950 border border-neutral-850 relative overflow-hidden flex flex-col justify-center items-center text-center p-4">
              {cameraActive ? (
                <>
                  {/* Actual camera video target container */}
                  <div id="qr-reader" className="absolute inset-0 w-full h-full overflow-hidden bg-black object-cover z-0" />

                  {/* Camera backdrop look */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(99,102,241,0.12)_0%,transparent_70%)] opacity-80 pointer-events-none z-10" />
                  
                  {/* Animated laser line scanner */}
                  <div className="absolute left-0 w-full h-[2px] bg-indigo-500 shadow-[0_0_10px_#6366f1] animate-bounce top-0 bottom-0 pointer-events-none z-20" />
                  
                  {/* Custom viewport target reticle */}
                  <div className="w-40 h-40 border border-dashed border-indigo-400/40 rounded flex items-center justify-center relative pointer-events-none z-20">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-indigo-500" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-indigo-500" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-indigo-500" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-indigo-500" />
                    <span className="font-mono text-[8px] text-indigo-400 tracking-widest leading-none animate-pulse">
                      WAITING PASS...
                    </span>
                  </div>

                  <p className="font-mono text-[9px] text-zinc-400 mt-4 uppercase z-20 pointer-events-none bg-black/60 px-2 py-0.5 rounded border border-neutral-800">
                    // CAMERA FEED LIVE
                  </p>
                </>
              ) : (
                <div className="space-y-3 p-4">
                  <div className="w-12 h-12 rounded-full border border-neutral-800 bg-black flex items-center justify-center mx-auto">
                    <Scan size={20} className="text-zinc-500" />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-zinc-400 uppercase font-black">CAMERA SCANNING VIEWPORT STANDBY</p>
                    <p className="text-[9px] text-zinc-650 font-mono mt-1">Activate viewport or pass an Order UUID to process validity.</p>
                  </div>
                </div>
              )}

              {/* Viewfinder toggles */}
              <button
                onClick={toggleCameraScanner}
                className="absolute bottom-3 right-3 px-2.5 py-1 bg-neutral-900 border border-neutral-800 hover:text-[#6366f1] hover:border-[#6366f1] font-mono text-[8px] uppercase font-bold rounded-sm cursor-pointer transition-all z-30"
              >
                {cameraActive ? "SHUT CONSOLE" : "OPEN FEED"}
              </button>
            </div>

            {/* Manual input validation form */}
            <div className="space-y-3 font-mono">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-550">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="Enter Order ID to manually scan (UUID)..."
                    className="w-full bg-neutral-950 border border-neutral-850 py-3.5 pl-10 pr-4 text-xs font-mono rounded text-white focus:outline-none focus:border-indigo-500 uppercase"
                    value={scanInput}
                    onChange={e => setScanInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleVerifyId(scanInput)}
                  />
                </div>
                <button
                  onClick={() => handleVerifyId(scanInput)}
                  disabled={verifyingScan}
                  className="px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[10px] tracking-widest uppercase rounded cursor-pointer transition-all flex items-center justify-center"
                >
                  {verifyingScan ? "..." : "SCAN"}
                </button>
              </div>

              {/* Instructions banner */}
              <div className="p-3 bg-neutral-950 border border-neutral-850 rounded text-left flex items-start gap-2.5 text-[9px] text-zinc-450 leading-relaxed uppercase">
                <Info size={12} className="text-indigo-400 shrink-0 mt-0.5" />
                <p>
                  * QR scan outputs standard Base64 string containing transaction_uuid. Match it with client orders list below to trigger instant claim checking.
                </p>
              </div>
            </div>
          </div>

          {/* SCANNER DIODE VERIFICATION RESULT BADGES */}
          {scanResult && (
            <div className={`p-5 rounded border animate-fade-in ${
              scanResult.success 
                ? "bg-emerald-950/20 border-emerald-900 text-emerald-400" 
                : "bg-red-950/20 border-red-900 text-red-400"
            }`}>
              <div className="flex items-center gap-2.5 mb-3 font-mono">
                {scanResult.success ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                <h3 className="font-syne font-black text-xs tracking-widest uppercase">{scanResult.title}</h3>
              </div>
              <p className="font-mono text-[10px] uppercase leading-relaxed text-zinc-300">{scanResult.message}</p>

              {scanResult.details && (
                <div className="mt-4 pt-4 border-t border-neutral-900 font-mono text-[9px] text-zinc-400 space-y-1 bg-black/40 p-3 rounded">
                  <p className="text-white font-bold tracking-wider">// REGISTER DETAILS</p>
                  <p><span className="text-zinc-550">GUEST HOLDER:</span> <span className="text-white font-bold">{scanResult.details.guestName}</span></p>
                  <p><span className="text-zinc-550">EMAIL REGISTER:</span> <span className="text-zinc-350">{scanResult.details.guestEmail}</span></p>
                  <p><span className="text-zinc-550">ORDER VOUCHER:</span> <span className="text-white">{scanResult.details.orderId}</span></p>
                  <p><span className="text-zinc-550">RESERVE DESIG:</span> <span className="text-indigo-400 font-bold">{scanResult.details.typeName} ({scanResult.details.count}x)</span></p>
                  {scanResult.details.checkedInAt && (
                    <p className="text-red-500 font-bold"><span className="text-zinc-550 font-normal">SCANNED-CLAIM TIME:</span> {new Date(scanResult.details.checkedInAt).toLocaleTimeString()}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SIMULATED HIGH STRESS DIGITAL PAID PASSES ON THE SCREEN */}
          <div className="bg-neutral-950 border border-neutral-900 p-5 rounded font-mono">
            <h3 className="font-syne font-black text-[10px] tracking-widest text-zinc-400 uppercase mb-3 flex items-center justify-between">
              <span>SIMULATED RECENT ACTIVE PASSES</span>
              <span className="text-[8px] text-indigo-400 font-bold uppercase tracking-normal">tap to test scanning</span>
            </h3>

            {orders.filter(o => o.status === "PAID").length === 0 ? (
              <p className="text-[9px] text-zinc-650 uppercase italic text-center py-6">
                No active paid tickets from database registers yet. Use VIP booking tab or admin ledger to assign some!
              </p>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {orders.filter(o => o.status === "PAID").map(order => (
                  <button
                    key={order.orderId}
                    onClick={() => handleSimulateScan(order.orderId)}
                    className={`w-full p-2.5 rounded border text-left flex justify-between items-center text-[10px] transition-all cursor-pointer ${
                      order.checkedIn 
                        ? "bg-neutral-950 border-neutral-900 text-zinc-650" 
                        : "bg-black hover:bg-neutral-900 border-neutral-850 hover:border-indigo-500 text-white"
                    }`}
                  >
                    <div>
                      <p className="font-bold uppercase truncate max-w-[200px]">{order.guestName}</p>
                      <p className="text-[8px] text-zinc-550 truncate max-w-[200px]">{order.typeName}</p>
                    </div>
                    
                    <div className="text-right flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="text-[8px] font-mono text-zinc-500 block font-bold">{order.orderId.slice(0, 8)}...</span>
                      {order.checkedIn ? (
                        <span className="text-red-500 text-[8px] font-extrabold uppercase bg-red-950/20 px-1 border border-red-950">CLAIMED</span>
                      ) : (
                        <span className="text-emerald-500 text-[8px] font-extrabold uppercase bg-emerald-950/20 px-1 border border-emerald-950">ACTIVE</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* RIGHT DECK: FLOOR PLAN TABLE MONITORING BOARD (COLUMN SPAN 7) */}
        <section className="lg:col-span-7 space-y-8">
          
          {/* Vacant vs Taken Visual Board */}
          <div className="bg-black border border-neutral-900 p-6 rounded relative">
            <div className="absolute top-0 inset-x-0 h-[3px] bg-indigo-500" />
            
            <h2 className="font-syne font-black text-xs tracking-widest text-white uppercase mb-4 flex items-center justify-between">
              <span>FLOOR MASTER: VIP BOOTH RESERVATIONS STATE</span>
              <span className="font-mono text-[9px] text-indigo-400 font-extrabold">// AUTOMATIC eSewa LINK SYNC</span>
            </h2>

            {/* BARRICADE ALERTS SUMMARY */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 font-mono text-xs">
              <div className="bg-neutral-950 border border-neutral-850 p-2 text-center rounded">
                <p className="text-[8px] text-zinc-550 uppercase">// CAP BOOTHS</p>
                <p className="text-lg font-black text-white mt-1">{tables.length}</p>
              </div>
              <div className="bg-neutral-950 border border-neutral-850 p-2 text-center rounded">
                <p className="text-[8px] text-zinc-550 uppercase text-emerald-500 font-extrabold">// VACANT</p>
                <p className="text-lg font-black text-emerald-500 mt-1">
                  {tables.filter(t => t.status === "VACANT").length}
                </p>
              </div>
              <div className="bg-neutral-950 border border-neutral-850 p-2 text-center rounded col-span-2 sm:col-span-1">
                <p className="text-[8px] text-zinc-550 uppercase text-red-500 font-extrabold">// OCCUPIED</p>
                <p className="text-lg font-black text-red-500 mt-1">
                  {tables.filter(t => t.status === "TAKEN").length}
                </p>
              </div>
            </div>

            {/* Tables Grid Layout */}
            <div className="space-y-6">
              {["PLATINUM MAIN ROOM BOOTH", "XO PRESTIGE VIP LOUNGE", "ADAMSON CONSOLE DECK"].map(catGroup => {
                const items = tables.filter(t => t.category === catGroup);
                if (items.length === 0) return null;

                return (
                  <div key={catGroup} className="space-y-2.5 font-mono text-left">
                    <span className="text-[9px] text-zinc-500 font-bold block tracking-wider">// CATEGORY: {catGroup}</span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {items.map(tbl => (
                        <div 
                          key={tbl.id} 
                          className={`border rounded p-3 text-xs flex flex-col justify-between transition-all ${
                            tbl.status === "VACANT" 
                              ? "bg-emerald-950/5 border-emerald-950/40 hover:bg-emerald-950/15" 
                              : "bg-red-950/5 border-red-950/40 hover:bg-red-950/15"
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-center mb-1.5 pb-1 border-b border-neutral-900">
                              <span className="font-extrabold text-white text-[11px] uppercase tracking-wide">{tbl.name}</span>
                              <span className={`px-2 py-0.5 text-[8px] font-mono rounded font-black ${
                                tbl.status === "VACANT" 
                                  ? "bg-emerald-950 border border-emerald-900 text-emerald-400" 
                                  : "bg-red-950 border border-red-900 text-red-400"
                              }`}>
                                {tbl.status === "VACANT" ? "VACANT" : "OCCUPIED"}
                              </span>
                            </div>

                            {tbl.status === "TAKEN" ? (
                              <div className="space-y-1 font-mono text-[9px] text-zinc-400 uppercase pt-1.5">
                                <p className="text-white font-extrabold truncate">GUEST: {tbl.guestName}</p>
                                {tbl.guestEmail && <p className="text-[8px] text-zinc-550 truncate">EMAIL: {tbl.guestEmail}</p>}
                                {tbl.bottleNotes && <p className="text-[#EF4444] text-[8px] leading-normal">{tbl.bottleNotes}</p>}
                              </div>
                            ) : (
                              <p className="text-[9px] text-zinc-650 italic py-2 pt-1 uppercase">Ready for walk-in or paid allocation</p>
                            )}
                          </div>

                          <div className="mt-4 pt-3 border-t border-neutral-900 flex justify-between items-center gap-2">
                            <span className="text-[8px] text-zinc-550 uppercase">Capacity limit: {tbl.capacity} Pax</span>
                            {tbl.status === "TAKEN" && (
                              <button
                                onClick={() => handleFreeTable(tbl)}
                                className="px-2.5 py-1 text-[8px] hover:text-white text-zinc-400 border border-neutral-850 hover:border-red-500 bg-neutral-950 hover:bg-red-950/30 rounded font-black transition-all cursor-pointer"
                              >
                                DISCHARGE VACANT
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick manual walk-in assign board */}
          <div className="bg-black border border-neutral-900 p-6 rounded relative">
            <div className="absolute top-0 inset-x-0 h-[3px] bg-indigo-500" />
            
            <h3 className="font-syne font-black text-xs tracking-widest text-white uppercase mb-4 flex items-center gap-1">
              <Users size={14} className="text-indigo-400" />
              QUICK GUEST WALK-IN SEAT ALLOCATION
            </h3>

            <form onSubmit={handleManualOccupancySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs text-left">
              <div>
                <label className="text-[9px] text-zinc-500 block uppercase mb-1">CHOOSE VACANT TABLE*</label>
                <select
                  required
                  className="w-full bg-neutral-950 border border-neutral-850 p-2.5 rounded text-white focus:outline-none focus:border-indigo-500"
                  value={customTableForm.tableId}
                  onChange={e => setCustomTableForm({ ...customTableForm, tableId: e.target.value })}
                >
                  <option value="">-- SELECT TBL BOARD --</option>
                  {tables.filter(t => t.status === "VACANT").map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.category.slice(0, 10)}... Cap {t.capacity})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] text-zinc-500 block uppercase mb-1">GUEST LEADER NAME*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUJAL KUNWAR"
                  className="w-full bg-neutral-950 border border-neutral-850 p-2.5 rounded text-white focus:outline-none focus:border-indigo-500 uppercase"
                  value={customTableForm.guestName}
                  onChange={e => setCustomTableForm({ ...customTableForm, guestName: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[9px] text-zinc-500 block uppercase mb-1">GUEST EMAIL / PHONE</label>
                <input
                  type="text"
                  placeholder="sujal@example.com"
                  className="w-full bg-neutral-950 border border-neutral-850 p-2.5 rounded text-white focus:outline-none"
                  value={customTableForm.guestEmail}
                  onChange={e => setCustomTableForm({ ...customTableForm, guestEmail: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[9px] text-zinc-500 block uppercase mb-1">BOTTLE DETAILS / TABLE ORDER</label>
                <input
                  type="text"
                  placeholder="e.g. Black Label, 4x Soda"
                  className="w-full bg-neutral-950 border border-neutral-850 p-2.5 rounded text-white focus:outline-none"
                  value={customTableForm.bottleNotes}
                  onChange={e => setCustomTableForm({ ...customTableForm, bottleNotes: e.target.value })}
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={tables.filter(t => t.status === "VACANT").length === 0}
                  className="w-full py-3 bg-white hover:bg-indigo-600 hover:text-white text-black font-extrabold tracking-widest uppercase rounded-sm cursor-pointer transition-all"
                >
                  OCCUPY SELECTED TABLE // SECURE RESERVE
                </button>
              </div>
            </form>
          </div>

        </section>

      </main>
    </div>
  );
};
