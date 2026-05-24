import React, { useState, useEffect } from "react";
import { 
  Calendar, Loader2, Plus, Edit2, Trash2, Camera, Shield, 
  Users, CheckCircle2, AlertCircle, ShoppingBag, ArrowLeft, RefreshCw, Layers, DollarSign, Eye, EyeOff
} from "lucide-react";
import { ClubEvent, PhotoGroup } from "../types";
import { VIPTable } from "../../backend/routes/admin.routes";

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"events" | "photos" | "tables" | "orders">("events");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Core Data Lists
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [photos, setPhotos] = useState<PhotoGroup[]>([]);
  const [tables, setTables] = useState<VIPTable[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  // Event Edit / Create Form state
  const [eventForm, setEventForm] = useState<Partial<ClubEvent>>({
    id: "",
    title: "",
    date: "",
    time: "21:30 - 03:30",
    headliner: "",
    support: [],
    subgenre: "",
    bpm: 128,
    ticketPrice: 2000,
    availableTickets: 150,
    accentColor: "from-[#ef4444] to-black",
    rawAccent: "#ef4444",
    doorPolicy: "SMART CASUAL / 18+ SECURITY MANDATORY",
    graphicStyle: "geometric",
    targetDate: new Date(Date.now() + 7 * 86450000).toISOString().slice(0, 16),
    gifUrl: "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExZG5pczByNGNrbXB2OXUwdXR3d3loNzNqdzFycWR2dzBvdWhhczZ5MiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0O9zk3Tq6V1zZ0oE/giphy.gif"
  });
  const [supportInput, setSupportInput] = useState("");
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Photo Edit / Create Form state
  const [photoForm, setPhotoForm] = useState<{
    id: string;
    title: string;
    date: string;
    description: string;
    coverImage: string;
    imagesStr: string;
  }>({
    id: "",
    title: "",
    date: "MAY 2026",
    description: "",
    coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200",
    imagesStr: ""
  });
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);

  // Table Edit / Create Form state
  const [tableForm, setTableForm] = useState<Partial<VIPTable>>({
    id: "",
    name: "",
    category: "PLATINUM MAIN ROOM BOOTH",
    capacity: 10,
    status: "VACANT",
    guestName: "",
    guestEmail: "",
    bottleNotes: ""
  });
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<"loading" | "supabase" | "in-memory">("loading");

  // Fetch all DB endpoints
  const fetchData = async () => {
    setLoading(true);
    try {
      const [evRes, phRes, tbRes, ordRes, hlRes] = await Promise.all([
        fetch("/api/admin/events"),
        fetch("/api/admin/photos"),
        fetch("/api/admin/tables"),
        fetch("/api/admin/orders"),
        fetch("/api/health").catch(() => null)
      ]);

      if (evRes.ok) {
        const d = await evRes.json();
        setEvents(d.data || []);
      }
      if (phRes.ok) {
        const d = await phRes.json();
        setPhotos(d.data || []);
      }
      if (tbRes.ok) {
        const d = await tbRes.json();
        setTables(d.data || []);
      }
      if (ordRes.ok) {
        const d = await ordRes.json();
        setOrders(d.data || []);
      }
      if (hlRes && hlRes.ok) {
        const h = await hlRes.json();
        setDbStatus(h.database || "in-memory");
      } else {
        setDbStatus("in-memory");
      }
    } catch (err: any) {
      showMsg("Failed fetching server-backed states: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Setup real-time poll fallback (poll every 4 seconds)
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const showMsg = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  /* =========================================================================
     EVENTS CONTROLS
     ========================================================================= */
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...eventForm,
          id: editingEventId || undefined,
          support: supportInput ? supportInput.split(",").map(s => s.trim()) : eventForm.support
        })
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        showMsg("Event saved completely on active registries", "success");
        setEditingEventId(null);
        resetEventForm();
        fetchData();
      } else {
        showMsg(resData.error || "Failed saving event", "error");
      }
    } catch (err: any) {
      showMsg(err.message, "error");
    }
  };

  const handleEditEventClick = (evt: ClubEvent) => {
    setEditingEventId(evt.id);
    setEventForm(evt);
    setSupportInput(evt.support.join(", "));
  };

  const handleDeleteEventClick = async (evtId: string) => {
    if (!window.confirm("Are you sure you want to remove this event from the Thamel deck listings?")) return;
    try {
      const response = await fetch(`/api/admin/events/${evtId}`, { method: "DELETE" });
      if (response.ok) {
        showMsg("Event deleted from registries", "success");
        fetchData();
      }
    } catch (err: any) {
      showMsg(err.message, "error");
    }
  };

  const resetEventForm = () => {
    setEditingEventId(null);
    setEventForm({
      id: "",
      title: "",
      date: "",
      time: "21:30 - 03:30",
      headliner: "",
      support: [],
      subgenre: "",
      bpm: 128,
      ticketPrice: 2000,
      availableTickets: 150,
      accentColor: "from-[#ef4444] to-black",
      rawAccent: "#ef4444",
      doorPolicy: "SMART CASUAL / 18+ SECURITY MANDATORY",
      graphicStyle: "geometric",
      targetDate: new Date(Date.now() + 7 * 86450000).toISOString().slice(0, 16),
      gifUrl: "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExZG5pczByNGNrbXB2OXUwdXR3d3loNzNqdzFycWR2dzBvdWhhczZ5MiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0O9zk3Tq6V1zZ0oE/giphy.gif"
    });
    setSupportInput("");
  };


  /* =========================================================================
     PHOTOS CONTROLS
     ========================================================================= */
  const handleSavePhotoGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const imgsArray = photoForm.imagesStr
        ? photoForm.imagesStr.split("\n").map(img => img.trim()).filter(img => img.length > 0)
        : [];

      const response = await fetch("/api/admin/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingPhotoId || undefined,
          title: photoForm.title,
          date: photoForm.date,
          description: photoForm.description,
          coverImage: photoForm.coverImage,
          images: imgsArray
        })
      });

      if (response.ok) {
        showMsg("Album posted to sensory gallery", "success");
        setEditingPhotoId(null);
        resetPhotoForm();
        fetchData();
      } else {
        const err = await response.json();
        showMsg(err.error || "Failed saving group", "error");
      }
    } catch (err: any) {
      showMsg(err.message, "error");
    }
  };

  const handleEditPhotoClick = (group: PhotoGroup) => {
    setEditingPhotoId(group.id);
    setPhotoForm({
      id: group.id,
      title: group.title,
      date: group.date,
      description: group.description,
      coverImage: group.coverImage,
      imagesStr: group.images.join("\n")
    });
  };

  const handleDeletePhotoClick = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this photographic group?")) return;
    try {
      const response = await fetch(`/api/admin/photos/${id}`, { method: "DELETE" });
      if (response.ok) {
        showMsg("Album deleted completely", "success");
        fetchData();
      }
    } catch (err: any) {
      showMsg(err.message, "error");
    }
  };

  const resetPhotoForm = () => {
    setEditingPhotoId(null);
    setPhotoForm({
      id: "",
      title: "",
      date: "MAY 2026",
      description: "",
      coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200",
      imagesStr: ""
    });
  };


  /* =========================================================================
     VIP TABLES CONTROLS
     ========================================================================= */
  const handleSaveTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...tableForm,
          id: editingTableId || undefined
        })
      });

      if (response.ok) {
        showMsg("Booth record updated completely", "success");
        setEditingTableId(null);
        resetTableForm();
        fetchData();
      } else {
        showMsg("Error saving table booth status", "error");
      }
    } catch (err: any) {
      showMsg(err.message, "error");
    }
  };

  const handleEditTableClick = (tbl: VIPTable) => {
    setEditingTableId(tbl.id);
    setTableForm(tbl);
  };

  const handleDeleteTableClick = async (id: string) => {
    if (!window.confirm("Delete this physical table registration?")) return;
    try {
      const response = await fetch(`/api/admin/tables/${id}`, { method: "DELETE" });
      if (response.ok) {
        showMsg("Table booth registration deleted from core floorplan", "success");
        fetchData();
      }
    } catch (err: any) {
      showMsg(err.message, "error");
    }
  };

  const toggleTableVacancy = async (tbl: VIPTable) => {
    try {
      const updatedStatus = tbl.status === "VACANT" ? "TAKEN" : "VACANT";
      const payload: Partial<VIPTable> = {
        ...tbl,
        status: updatedStatus,
        assignedAt: updatedStatus === "TAKEN" ? new Date().toISOString() : undefined,
        guestName: updatedStatus === "TAKEN" ? (tbl.guestName || "MANUAL PREMIUM GUEST") : undefined,
        guestEmail: updatedStatus === "TAKEN" ? (tbl.guestEmail || "cash@club-xo.com") : undefined,
        bottleNotes: updatedStatus === "TAKEN" ? (tbl.bottleNotes || "Bottle service initialized") : undefined
      };

      const response = await fetch("/api/admin/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showMsg(`Table ${tbl.name} is now ${updatedStatus}`, "success");
        fetchData();
      }
    } catch (err: any) {
      showMsg(err.message, "error");
    }
  };

  const resetTableForm = () => {
    setEditingTableId(null);
    setTableForm({
      id: "",
      name: "",
      category: "PLATINUM MAIN ROOM BOOTH",
      capacity: 10,
      status: "VACANT",
      guestName: "",
      guestEmail: "",
      bottleNotes: ""
    });
  };


  /* =========================================================================
     ORDERS & OVERRIDES LIST CONTROLS
     ========================================================================= */
  const handleManualApprove = async (orderId: string, toggleCheckIn?: boolean) => {
    try {
      const response = await fetch("/api/admin/orders/manually-set-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: "PAID",
          checkedIn: toggleCheckIn
        })
      });

      if (response.ok) {
        showMsg(`Receipt ${orderId} synced successfully`, "success");
        fetchData();
      }
    } catch (err: any) {
      showMsg(err.message, "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 font-sans relative pb-16">
      
      {/* Dynamic ambient grid overlay matching sensory theme */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-[#EF4444]/5 via-transparent to-transparent pointer-events-none" />

      {/* HEADER SECTION */}
      <header className="border-b border-neutral-900 bg-black/95 relative z-10 sticky top-0 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#EF4444] text-white p-2 rounded">
              <Shield size={18} />
            </div>
            <div>
              <h1 className="font-syne font-black text-lg tracking-wider text-white">XO ADMIN CORES</h1>
              <span className="font-mono text-[9px] text-[#EF4444] tracking-widest block font-bold">
                SYSTEM ADMINISTRATOR // DECK CONTROLLERS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.href = "/"}
              className="px-4 py-2 border border-neutral-850 hover:border-white text-zinc-400 hover:text-white font-mono text-[10px] uppercase rounded-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowLeft size={12} />
              VISITOR WEB
            </button>
            <button
              onClick={fetchData}
              className="p-2 border border-neutral-850 hover:bg-neutral-900 text-zinc-400 hover:text-white rounded-sm transition-all"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">

        {/* DATABASE STATUS DIAGNOSTIC */}
        <div className="mb-6">
          {dbStatus === "loading" && (
            <div className="p-3 bg-neutral-950 border border-neutral-900 text-zinc-400 font-mono text-[9px] rounded flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
              VERIFYING SECURE STORAGE CLOUD LINK...
            </div>
          )}
          {dbStatus === "supabase" && (
            <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 font-mono text-[9px] rounded flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE PERSISTENCE ACTIVE: SECURE SUPABASE CLOUD CONNECTION PASSES ALL HEALTH INTEGRITY TESTS
            </div>
          )}
          {dbStatus === "in-memory" && (
            <div className="p-4 bg-amber-950/20 border border-amber-900/30 text-amber-400 font-mono text-[9px] rounded flex flex-col gap-2">
              <div className="flex items-center gap-2 font-black uppercase text-[10px] text-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                INTEGRATION ADVISORY: APPLICATION IS OPERATING IN LOCAL IN-MEMORY FALLBACK MODE
              </div>
              <p className="text-[10px] text-zinc-400 leading-relaxed font-sans font-medium">
                Any changes, events, or VIP table modifications will disappear when the server restarts or spins down on Vercel. To link your live Supabase database permanently, go to your <strong>Vercel Dashboard &gt; Project Settings &gt; Environment Variables</strong> and securely define:
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                <code className="text-[9px] text-white bg-black/50 border border-neutral-800 px-1.5 py-0.5 rounded font-mono">DATABASE_URL</code>
                <code className="text-[9px] text-white bg-black/50 border border-neutral-800 px-1.5 py-0.5 rounded font-mono">SUPABASE_URL</code>
                <code className="text-[9px] text-white bg-black/50 border border-neutral-800 px-1.5 py-0.5 rounded font-mono">SUPABASE_SERVICE_ROLE_KEY</code>
              </div>
            </div>
          )}
        </div>

        {/* FEEDBACK BANNER */}
        {message && (
          <div className={`mb-6 p-4 border rounded-sm flex items-start gap-3 animate-fade-in ${
            message.type === "success" 
              ? "bg-emerald-950/20 border-emerald-920 text-emerald-400" 
              : "bg-red-950/20 border-red-920 text-red-400"
          }`}>
            {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <p className="font-mono text-xs uppercase font-semibold">{message.text}</p>
          </div>
        )}

        {/* SYSTEM STATUS MINI BENTO */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 font-mono">
          <div className="bg-neutral-950 border border-neutral-900 p-4 rounded-sm flex flex-col justify-between">
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider block">// ACTIVE EVENTS</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-white">{events.length}</span>
              <span className="text-[10px] text-zinc-400 uppercase">OFFERS</span>
            </div>
          </div>
          <div className="bg-neutral-950 border border-neutral-900 p-4 rounded-sm flex flex-col justify-between">
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider block">// SENSORY MODULES</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-white">{photos.length}</span>
              <span className="text-[10px] text-zinc-400 uppercase">ALBUMS</span>
            </div>
          </div>
          <div className="bg-neutral-950 border border-neutral-900 p-4 rounded-sm flex flex-col justify-between">
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider block">// FLOOR BOOTHS</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-white">
                {tables.filter(t => t.status === "TAKEN").length} / {tables.length}
              </span>
              <span className="text-[10px] text-red-500 font-extrabold uppercase">TAKEN</span>
            </div>
          </div>
          <div className="bg-neutral-950 border border-neutral-900 p-4 rounded-sm flex flex-col justify-between">
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider block">// TRANSACTION LEDGER</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-1.5xl font-mono font-black text-emerald-500">
                NPR {orders.filter(o => o.status === "PAID").reduce((sum, o) => sum + (o.amount || 0), 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* CONTROLLING TABS */}
        <div className="flex border-b border-neutral-900 mb-8 font-mono text-[10px] uppercase tracking-wider overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab("events")}
            className={`py-3 px-6 cursor-pointer border-b-2 font-black transition-all whitespace-nowrap ${
              activeTab === "events" ? "border-[#EF4444] text-white bg-neutral-950/20" : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            EVENTS MASTER ({events.length})
          </button>
          <button
            onClick={() => setActiveTab("photos")}
            className={`py-3 px-6 cursor-pointer border-b-2 font-black transition-all whitespace-nowrap ${
              activeTab === "photos" ? "border-[#EF4444] text-white bg-neutral-950/20" : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            SENSORY MEDIA ({photos.length})
          </button>
          <button
            onClick={() => setActiveTab("tables")}
            className={`py-3 px-6 cursor-pointer border-b-2 font-black transition-all whitespace-nowrap ${
              activeTab === "tables" ? "border-[#EF4444] text-white bg-neutral-950/20" : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            VIP BOOTH CONFIGS ({tables.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`py-3 px-6 cursor-pointer border-b-2 font-black transition-all whitespace-nowrap ${
              activeTab === "orders" ? "border-[#EF4444] text-white bg-neutral-950/20" : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            TRANSACTIONS ({orders.length})
          </button>
        </div>

        {/* =========================================================================
           EVENTS PANEL CONTENT
           ========================================================================= */}
        {activeTab === "events" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Form Column */}
            <div className="lg:col-span-5 bg-black border border-neutral-900 p-6 rounded relative">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-[#EF4444]" />
              <h3 className="font-syne font-black text-sm tracking-widest text-white uppercase mb-4 flex items-center justify-between">
                <span>{editingEventId ? "EDIT EVENT ENTRIES" : "REGISTER NEW EVENT"}</span>
                {editingEventId && (
                  <button onClick={resetEventForm} className="text-[10px] font-mono hover:text-[#EF4444] normal-case tracking-normal">
                    Cancel Edit
                  </button>
                )}
              </h3>

              <form onSubmit={handleSaveEvent} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="text-[10px] text-zinc-500 block uppercase mb-1">EVENT TITLE*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VIP SATURDAY MIDNIGHT DECK"
                    className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-white focus:outline-none focus:border-[#EF4444] uppercase"
                    value={eventForm.title}
                    onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-zinc-500 block uppercase mb-1">DATE BANNER*</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SATURDAY SPEC"
                      className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-white focus:outline-none focus:border-[#EF4444]"
                      value={eventForm.date}
                      onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 block uppercase mb-1">TIME SLOT</label>
                    <input
                      type="text"
                      placeholder="e.g. 21:00 - 03:00"
                      className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-white focus:outline-none focus:border-[#EF4444]"
                      value={eventForm.time}
                      onChange={e => setEventForm({ ...eventForm, time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-zinc-500 block uppercase mb-1">HEADLINER ARTIST*</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. COBWEB"
                      className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-white focus:outline-none focus:border-[#EF4444]"
                      value={eventForm.headliner}
                      onChange={e => setEventForm({ ...eventForm, headliner: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 block uppercase mb-1">SUPPORT (COMMA SEPARATE)</label>
                    <input
                      type="text"
                      placeholder="DJ BPM, DJ Susan"
                      className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-white focus:outline-none focus:border-[#EF4444]"
                      value={supportInput}
                      onChange={e => setSupportInput(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 block uppercase mb-1">SUBGENRE / MUSICAL ARCHITECTURE</label>
                  <input
                    type="text"
                    placeholder="e.g. NEPALESE POWER METAL & MELODIC HOUSE"
                    className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-white focus:outline-none focus:border-[#EF4444] uppercase"
                    value={eventForm.subgenre}
                    onChange={e => setEventForm({ ...eventForm, subgenre: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-500 block uppercase mb-1">BPM</label>
                    <input
                      type="number"
                      className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-white focus:outline-none focus:border-[#EF4444]"
                      value={eventForm.bpm}
                      onChange={e => setEventForm({ ...eventForm, bpm: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 block uppercase mb-1">NPR PRICE</label>
                    <input
                      type="number"
                      className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-white focus:outline-none focus:border-[#EF4444]"
                      value={eventForm.ticketPrice}
                      onChange={e => setEventForm({ ...eventForm, ticketPrice: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 block uppercase mb-1">LIMIT CODES</label>
                    <input
                      type="number"
                      className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-white focus:outline-none focus:border-[#EF4444]"
                      value={eventForm.availableTickets}
                      onChange={e => setEventForm({ ...eventForm, availableTickets: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-[#EF4444] block uppercase mb-1 font-bold">
                    MEDIA BACKDROP URL (INSTAGRAM REEL, MP4 VIDEO, OR GIF)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. https://www.instagram.com/reel/C1tZ4p1rY7g/ or direct MP4 link"
                    className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-white text-[10px] focus:outline-none focus:border-[#EF4444]"
                    value={eventForm.gifUrl}
                    onChange={e => setEventForm({ ...eventForm, gifUrl: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-white hover:bg-[#EF4444] hover:text-white text-black font-extrabold tracking-widest uppercase rounded-sm cursor-pointer transition-all"
                >
                  {editingEventId ? "COMMIT MODIFICATIONS // SYNC" : "SAVE NEW DECK SHOWMARK"}
                </button>
              </form>
            </div>

            {/* List Column */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-syne font-black text-sm tracking-widest text-zinc-400 uppercase">
                ACTIVE THERMAL EVENTS IN THAMEL DECK LISTING ({events.length})
              </h3>

              {events.length === 0 ? (
                <div className="py-12 border border-dashed border-neutral-850 text-center font-mono text-xs text-zinc-650 rounded">
                  NO CHANNELS CONFIGURED IN MEMORY RECONSTRUCTOR.
                </div>
              ) : (
                <div className="space-y-3">
                  {events.map(evt => (
                    <div key={evt.id} className="bg-neutral-950 hover:bg-neutral-930 border border-neutral-900 rounded p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all relative">
                      {/* Accent glow bar */}
                      <div className="absolute left-0 inset-y-0 w-[3px] bg-white" />
                      
                      <div className="font-mono text-left max-w-md ml-2">
                        <span className="text-[8px] bg-zinc-900 px-2 py-0.5 border border-zinc-800 text-[#EF4444] rounded uppercase font-bold tracking-wider inline-block mb-1.5">
                          {evt.date} // {evt.time}
                        </span>
                        <h4 className="text-sm font-black text-white leading-tight uppercase font-syne tracking-wider">
                          {evt.title}
                        </h4>
                        <p className="text-[10px] text-zinc-400 mt-1 uppercase">
                          HEAD: <span className="text-white font-bold">{evt.headliner}</span> {evt.support.length > 0 && `(SUPP: ${evt.support.join(", ")})`}
                        </p>
                        <p className="text-[9px] text-zinc-550 mt-1 uppercase">
                          {evt.subgenre} (BPM: {evt.bpm}) · NPR {evt.ticketPrice.toLocaleString()} (Avail: {evt.availableTickets})
                        </p>
                      </div>

                      <div className="flex md:flex-col gap-2 shrink-0 w-full md:w-auto self-stretch md:justify-center border-t border-neutral-900 md:border-t-0 pt-3 md:pt-0">
                        <button
                          onClick={() => handleEditEventClick(evt)}
                          className="flex-1 md:flex-none px-3 py-1.5 bg-neutral-900 hover:bg-neutral-850 hover:text-white text-zinc-400 text-[10px] rounded uppercase border border-neutral-850 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Edit2 size={10} />
                          EDIT
                        </button>
                        <button
                          onClick={() => handleDeleteEventClick(evt.id)}
                          className="flex-1 md:flex-none px-3 py-1.5 bg-neutral-900/40 hover:bg-red-950/45 text-red-500 text-[10px] rounded uppercase border border-red-950/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Trash2 size={10} />
                          DELETE
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* =========================================================================
           PHOTOS PANEL CONTENT
           ========================================================================= */}
        {activeTab === "photos" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Folder Form */}
            <div className="lg:col-span-5 bg-black border border-neutral-900 p-6 rounded relative">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-[#EF4444]" />
              <h3 className="font-syne font-black text-sm tracking-widest text-white uppercase mb-4 flex items-center justify-between">
                <span>{editingPhotoId ? "EDIT SENSORY ALBUM" : "POST PHOTO ALBUM"}</span>
                {editingPhotoId && (
                  <button onClick={resetPhotoForm} className="text-[10px] font-mono hover:text-[#EF4444] normal-case tracking-normal">
                    Cancel Edit
                  </button>
                )}
              </h3>

              <form onSubmit={handleSavePhotoGroup} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="text-[10px] text-zinc-500 block uppercase mb-1">ALBUM TITLE*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. THAMEL FRIDAY ADRENALINE"
                    className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-white focus:outline-none focus:border-[#EF4444] uppercase"
                    value={photoForm.title}
                    onChange={e => setPhotoForm({ ...photoForm, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-zinc-500 block uppercase mb-1">DATE STAMP (e.g. MAY 2026)</label>
                    <input
                      type="text"
                      placeholder="DATE STAMP"
                      className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-white focus:outline-none focus:border-[#EF4444]"
                      value={photoForm.date}
                      onChange={e => setPhotoForm({ ...photoForm, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 block uppercase mb-1">COVER PHOTO URL</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-white text-[10px] focus:outline-none focus:border-[#EF4444]"
                      value={photoForm.coverImage}
                      onChange={e => setPhotoForm({ ...photoForm, coverImage: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 block uppercase mb-1">BRIEF ALBUM NARRATIVE / TEXT</label>
                  <textarea
                    rows={2}
                    placeholder="Describe the sensory elements captured in this night range..."
                    className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-white focus:outline-none focus:border-[#EF4444]"
                    value={photoForm.description}
                    onChange={e => setPhotoForm({ ...photoForm, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 block uppercase mb-1">
                    GALLERY SUB-IMAGES LINKS (1 IMAGE URL PER LINE)
                  </label>
                  <textarea
                    rows={6}
                    placeholder="https://images.unsplash.com/photo-1545128485-c400e...&#10;https://images.unsplash.com/photo-1506157786151-b8491..."
                    className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-white text-[10px] font-mono focus:outline-none focus:border-[#EF4444]"
                    value={photoForm.imagesStr}
                    onChange={e => setPhotoForm({ ...photoForm, imagesStr: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-white hover:bg-[#EF4444] hover:text-white text-black font-extrabold tracking-widest uppercase rounded-sm cursor-pointer transition-all"
                >
                  {editingPhotoId ? "COMMIT PHOTO MODIFICATIONS" : "PUBLISH ALBUM TO VISITOR PORTALS"}
                </button>
              </form>
            </div>

            {/* Photo Albums List */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-syne font-black text-sm tracking-widest text-zinc-400 uppercase">
                EXISTING MEDIA ARCHIVES ({photos.length})
              </h3>

              {photos.length === 0 ? (
                <div className="py-12 border border-dashed border-neutral-850 text-center font-mono text-xs text-zinc-650 rounded">
                  NO PHOTOGRAPHIC REGISTERS DETECTED.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {photos.map(group => (
                    <div key={group.id} className="bg-neutral-950 border border-neutral-900 rounded overflow-hidden flex flex-col justify-between group">
                      <div className="relative h-32 w-full bg-zinc-900">
                        <img
                          src={group.coverImage}
                          alt={group.title}
                          className="w-full h-full object-cover opacity-60 filter brightness-90 group-hover:opacity-85 transition-all"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                        <span className="absolute bottom-2 left-3 font-mono text-[9px] bg-red-950/80 border border-red-900/50 text-[#EF4444] px-2 py-0.5 rounded font-extrabold tracking-wider">
                          {group.date}
                        </span>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div className="font-mono text-left mb-4">
                          <h4 className="font-syne font-bold text-xs uppercase tracking-wider text-white truncate">
                            {group.title}
                          </h4>
                          <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                            {group.description || "No narrative entered."}
                          </p>
                          <span className="text-[9px] text-[#EF4444] mt-2 block font-extrabold">
                            // {group.images.length} SECURE IMAGES
                          </span>
                        </div>

                        <div className="flex gap-2 border-t border-neutral-900 pt-3">
                          <button
                            onClick={() => handleEditPhotoClick(group)}
                            className="flex-1 px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-850 text-zinc-350 text-[10px] uppercase rounded border border-neutral-850 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Edit2 size={10} />
                            EDIT
                          </button>
                          <button
                            onClick={() => handleDeletePhotoClick(group.id)}
                            className="flex-1 px-2.5 py-1.5 bg-neutral-900/40 hover:bg-red-950/45 text-red-500 text-[10px] uppercase rounded border border-red-950/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Trash2 size={10} />
                            DELETE
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
           VIP TABLES CONFIGURATOR CONTENT
           ========================================================================= */}
        {activeTab === "tables" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Table registry form */}
            <div className="lg:col-span-4 bg-black border border-neutral-900 p-6 rounded relative">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-[#EF4444]" />
              <h3 className="font-syne font-black text-sm tracking-widest text-white uppercase mb-4 flex items-center justify-between">
                <span>{editingTableId ? "AMEND BOOTH DATA" : "REGISTER NEW VIP TABLE"}</span>
                {editingTableId && (
                  <button onClick={resetTableForm} className="text-[10px] font-mono hover:text-[#EF4444] normal-case tracking-normal">
                    Cancel
                  </button>
                )}
              </h3>

              <form onSubmit={handleSaveTable} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="text-[10px] text-zinc-500 block uppercase mb-1">TABLE LABEL / DISPLAY NAME*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BOOTH PLATINUM 08"
                    className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-white focus:outline-none focus:border-[#EF4444] uppercase"
                    value={tableForm.name}
                    onChange={e => setTableForm({ ...tableForm, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 block uppercase mb-1">TABLE SECTOR CATEGORY*</label>
                  <select
                    className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-white focus:outline-none focus:border-[#EF4444]"
                    value={tableForm.category}
                    onChange={e => setTableForm({ ...tableForm, category: e.target.value })}
                  >
                    <option value="PLATINUM MAIN ROOM BOOTH">PLATINUM MAIN ROOM BOOTH</option>
                    <option value="XO PRESTIGE VIP LOUNGE">XO PRESTIGE VIP LOUNGE</option>
                    <option value="ADAMSON CONSOLE DECK">ADAMSON CONSOLE DECK</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-zinc-500 block uppercase mb-1">CAPACITY (GUESTS)</label>
                    <input
                      type="number"
                      className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-white focus:outline-none focus:border-[#EF4444]"
                      value={tableForm.capacity}
                      onChange={e => setTableForm({ ...tableForm, capacity: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 block uppercase mb-1">RESERVATION STATE</label>
                    <select
                      className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-white focus:outline-none focus:border-[#EF4444]"
                      value={tableForm.status}
                      onChange={e => setTableForm({ ...tableForm, status: e.target.value as "VACANT" | "TAKEN" })}
                    >
                      <option value="VACANT">VACANT (GREEN)</option>
                      <option value="TAKEN">TAKEN / RESERVED</option>
                    </select>
                  </div>
                </div>

                {tableForm.status === "TAKEN" && (
                  <div className="space-y-3 p-3 bg-neutral-950 border border-dashed border-red-950 rounded">
                    <span className="font-black text-[9px] text-[#EF4444] tracking-widest block uppercase">// ASSIGNED GUEST DETAILS</span>
                    <div>
                      <input
                        type="text"
                        placeholder="RESERVATION HOLDER NAME"
                        className="w-full bg-black border border-neutral-850 p-2.5 rounded text-white text-[10px] focus:outline-none"
                        value={tableForm.guestName || ""}
                        onChange={e => setTableForm({ ...tableForm, guestName: e.target.value })}
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="GUEST CONTACT EMAIL"
                        className="w-full bg-black border border-neutral-850 p-2.5 rounded text-white text-[10px] focus:outline-none"
                        value={tableForm.guestEmail || ""}
                        onChange={e => setTableForm({ ...tableForm, guestEmail: e.target.value })}
                      />
                    </div>
                    <div>
                      <textarea
                        rows={2}
                        placeholder="BOTTLES / SPECIFIC VIP ORDERS"
                        className="w-full bg-black border border-neutral-850 p-2.5 rounded text-white text-[10px] focus:outline-none"
                        value={tableForm.bottleNotes || ""}
                        onChange={e => setTableForm({ ...tableForm, bottleNotes: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-white hover:bg-[#EF4444] hover:text-white text-black font-extrabold tracking-widest uppercase rounded-sm cursor-pointer transition-all"
                >
                  {editingTableId ? "AMEND PLATFORM ARRANGEMENT" : "REGISTER TO FLOOR MATRIX"}
                </button>
              </form>
            </div>

            {/* Tables status grid mapping */}
            <div className="lg:col-span-8 space-y-6">
              <h3 className="font-syne font-black text-sm tracking-widest text-zinc-400 uppercase flex items-center justify-between">
                <span>ACTIVE PHYSICAL FLOORPLAN ({tables.length} BOOTHS)</span>
                <span className="font-mono text-[9px] text-zinc-550 lowercase italic">updates synchronized with employees</span>
              </h3>

              <div className="space-y-4">
                {["PLATINUM MAIN ROOM BOOTH", "XO PRESTIGE VIP LOUNGE", "ADAMSON CONSOLE DECK"].map(categoryGroup => {
                  const items = tables.filter(t => t.category === categoryGroup);
                  if (items.length === 0) return null;

                  return (
                    <div key={categoryGroup} className="bg-neutral-950/70 border border-neutral-900 rounded p-4 font-mono text-left">
                      <h4 className="text-[10px] font-black text-zinc-450 uppercase mb-3 border-b border-neutral-900 pb-2 tracking-widest">
                        // {categoryGroup} RANGE
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {items.map(tbl => (
                          <div key={tbl.id} className="bg-black/85 border border-neutral-850 rounded p-3 text-xs flex justify-between items-stretch">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${tbl.status === "VACANT" ? "bg-emerald-500 animate-pulse" : "bg-[#EF4444]"}`} />
                                <span className="font-bold text-white text-[11px] uppercase">{tbl.name}</span>
                                <span className="text-[8px] text-zinc-550">(Cap: {tbl.capacity})</span>
                              </div>

                              {tbl.status === "TAKEN" ? (
                                <div className="text-[9px] text-zinc-400 space-y-0.5 pt-1 uppercase">
                                  <p className="text-white truncate font-extrabold">HOLDER: {tbl.guestName}</p>
                                  {tbl.guestEmail && <p className="text-zinc-500 text-[8px] truncate">{tbl.guestEmail}</p>}
                                  {tbl.bottleNotes && <p className="text-[#EF4444] text-[8px] leading-relaxed truncate max-w-[200px]">{tbl.bottleNotes}</p>}
                                </div>
                              ) : (
                                <p className="text-[9px] text-zinc-600 uppercase pt-1 italic">VACANT // UNASSUMED</p>
                              )}
                            </div>

                            <div className="flex flex-col gap-1 justify-between shrink-0 pl-2 ml-1 border-l border-neutral-900 font-mono text-[8px]">
                              <button
                                onClick={() => toggleTableVacancy(tbl)}
                                className={`px-2 py-1 rounded tracking-wide border font-bold uppercase cursor-pointer text-center ${
                                  tbl.status === "VACANT" 
                                    ? "bg-emerald-950/25 text-emerald-500 border-emerald-900/30 hover:bg-emerald-900/30" 
                                    : "bg-red-950/25 text-red-500 border-red-900/30 hover:bg-red-900/30"
                                }`}
                              >
                                {tbl.status === "VACANT" ? "TAKE" : "FREE"}
                              </button>
                              <button
                                onClick={() => handleEditTableClick(tbl)}
                                className="px-2 py-0.5 bg-neutral-900 hover:bg-neutral-850 text-zinc-450 border border-neutral-850 rounded uppercase text-center font-bold"
                              >
                                EDIT
                              </button>
                              <button
                                onClick={() => handleDeleteTableClick(tbl.id)}
                                className="px-2 py-0.5 bg-neutral-950/40 text-red-650/80 hover:bg-red-950/40 border border-[#45100a] rounded uppercase text-center"
                              >
                                DEL
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
           ORDERS LEDGER CONTENT
           ========================================================================= */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <h3 className="font-syne font-black text-sm tracking-widest text-zinc-400 uppercase flex justify-between items-center">
              <span>XO MASTER LEDGER / TICKET & VIP BOOKINGS ({orders.length})</span>
              <span className="font-mono text-[9px] text-zinc-650 italic">Central transaction storage registry</span>
            </h3>

            {orders.length === 0 ? (
              <div className="py-16 border border-dashed border-neutral-850 text-center font-mono text-xs text-zinc-650 rounded">
                NO REGISTERED TRANSACTIONS OR QR PASSES REGISTERED IN DISK BUFFER.
              </div>
            ) : (
              <div className="bg-neutral-950 border border-neutral-900 rounded overflow-x-auto">
                <table className="w-full text-left font-mono border-collapse text-xs select-text">
                  <thead>
                    <tr className="border-b border-neutral-900 bg-black text-zinc-400 uppercase text-[9px] tracking-wider">
                      <th className="p-4">ORDER SECURE CODE</th>
                      <th className="p-4">RESERVEE</th>
                      <th className="p-4">CAP / COUNT</th>
                      <th className="p-4">SECTOR / ADMISSION</th>
                      <th className="p-4">NPR AMOUNT</th>
                      <th className="p-4">PORTAL STATUS</th>
                      <th className="p-4">CHECK-IN</th>
                      <th className="p-4 text-center">OVERRIDE ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900 whitespace-nowrap">
                    {orders.map(order => (
                      <tr key={order.orderId} className="hover:bg-neutral-930 transition-all">
                        <td className="p-4">
                          <span className="text-[#EF4444] font-bold select-all block">{order.orderId}</span>
                          {order.transactionCode && <span className="text-[8px] text-zinc-600 block">ESM-REF: {order.transactionCode}</span>}
                        </td>
                        <td className="p-4">
                          <p className="text-white font-bold uppercase">{order.guestName}</p>
                          <p className="text-[10px] text-zinc-500 capitalize">{order.guestEmail}</p>
                        </td>
                        <td className="p-4 uppercase text-zinc-300">
                          {order.count}x {order.type}
                        </td>
                        <td className="p-4 text-zinc-300 font-bold uppercase max-w-[150px] truncate">
                          {order.typeName}
                        </td>
                        <td className="p-4 font-bold text-white">
                          NPR {(order.amount || 0).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 text-[8px] font-black rounded uppercase ${
                            order.status === "PAID" 
                              ? "bg-emerald-950 text-emerald-500 border border-emerald-900/30" 
                              : order.status === "PENDING"
                              ? "bg-amber-950 text-amber-500 border border-amber-900/30 font-semibold"
                              : "bg-red-950 text-red-500 border border-red-900/30"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4">
                          {order.checkedIn ? (
                            <span className="text-emerald-500 text-[10px] font-extrabold flex items-center gap-1">
                              <CheckCircle2 size={12} />
                              VALIDATED
                            </span>
                          ) : (
                            <span className="text-zinc-650 text-[10px] uppercase font-bold">
                              OPEN PORTAL
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex gap-2 justify-center font-mono text-[9px]">
                            {order.status !== "PAID" && (
                              <button
                                onClick={() => handleManualApprove(order.orderId, false)}
                                className="px-2 py-1 bg-white hover:bg-neutral-100 text-black font-extrabold rounded-sm uppercase tracking-wider cursor-pointer transition-all"
                              >
                                APPROVE PAID
                              </button>
                            )}
                            <button
                              onClick={() => handleManualApprove(order.orderId, !order.checkedIn)}
                              className={`px-2.5 py-1 font-bold rounded-sm border transition-all cursor-pointer ${
                                order.checkedIn 
                                  ? "bg-zinc-900 text-zinc-400 border-neutral-800"
                                  : "bg-emerald-950 text-emerald-400 border-emerald-930 hover:bg-emerald-900/40"
                              }`}
                            >
                              {order.checkedIn ? "RESET SCAN" : "MARK CHECKED-IN"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};
