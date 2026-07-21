import { createClient } from "@supabase/supabase-js";
import { CLUB_EVENTS, PHOTO_GROUPS } from "./data";
import { ClubEvent, PhotoGroup, VIPTable } from "./types";

// =========================================================================
// 1. SUPABASE CLIENT & MOCK BASELINE CONFIGURATION
// =========================================================================

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || "").trim();
const supabaseKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();

export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false
      }
    })
  : null;

console.log("[XO Mainframe Interceptor] Initialization baseline:", {
  url: supabaseUrl,
  hasKey: !!supabaseKey,
  active: !!supabase
});

const ESEWA_CONFIG = {
  MERCHANT_CODE: (import.meta.env.VITE_ESEWA_MERCHANT_CODE || "EPAYTEST").trim(),
  SECRET_KEY: (import.meta.env.VITE_ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q").trim(),
  PAYMENT_ENDPOINT: (import.meta.env.VITE_ESEWA_ENDPOINT || "https://rc-epay.esewa.com.np/api/epay/main/v2/form").trim(),
  SUCCESS_URL: "http://localhost:3000/payment/success",
  FAILURE_URL: "http://localhost:3000/payment/failure"
};

export interface OrderRecord {
  orderId: string;
  amount: number;
  guestName: string;
  guestEmail: string;
  type: "ticket" | "vip";
  typeName: string;
  count: number;
  status: "PENDING" | "PAID" | "FAILED";
  transactionCode?: string;
  verifiedAt?: string;
}

// Ensure local storage keys are initialized with baseline data for simulations
function initLocalStorageBaseline() {
  const storedEventsStr = localStorage.getItem("xo_events");
  if (storedEventsStr) {
    try {
      const stored = JSON.parse(storedEventsStr);
      const firstEvt = stored[0];
      if (firstEvt && new Date(firstEvt.targetDate).getTime() < new Date("2026-06-01").getTime()) {
        localStorage.removeItem("xo_events");
      }
    } catch {
      localStorage.removeItem("xo_events");
    }
  }

  if (!localStorage.getItem("xo_events")) {
    localStorage.setItem("xo_events", JSON.stringify(CLUB_EVENTS));
  }
  if (!localStorage.getItem("xo_photos")) {
    localStorage.setItem("xo_photos", JSON.stringify(PHOTO_GROUPS));
  }
  if (!localStorage.getItem("xo_tables")) {
    const defaultTables: VIPTable[] = [
      // GROUND FLOOR MAIN ROOM (G1-G6)
      { id: "G1", name: "TABLE G1", category: "GROUND FLOOR MAIN ROOM", capacity: 12, status: "VACANT" },
      { id: "G2", name: "TABLE G2", category: "GROUND FLOOR MAIN ROOM", capacity: 12, status: "VACANT" },
      { id: "G3", name: "TABLE G3", category: "GROUND FLOOR MAIN ROOM", capacity: 12, status: "TAKEN", guestName: "Sujal Kunwar", guestEmail: "sujalkunwar22@gmail.com", bottleNotes: "2x Dom Pérignon, 1x Don Julio 1942", assignedAt: "2026-05-23T22:00:00Z" },
      { id: "G4", name: "TABLE G4", category: "GROUND FLOOR MAIN ROOM", capacity: 12, status: "VACANT" },
      { id: "G5", name: "TABLE G5", category: "GROUND FLOOR MAIN ROOM", capacity: 12, status: "VACANT" },
      { id: "G6", name: "TABLE G6", category: "GROUND FLOOR MAIN ROOM", capacity: 12, status: "VACANT" },
      
      // VVIP ZONE (VVIP 1-4)
      { id: "VVIP1", name: "TABLE VVIP 1", category: "VVIP ZONE", capacity: 15, status: "VACANT" },
      { id: "VVIP2", name: "TABLE VVIP 2", category: "VVIP ZONE", capacity: 15, status: "VACANT" },
      { id: "VVIP3", name: "TABLE VVIP 3", category: "VVIP ZONE", capacity: 15, status: "VACANT" },
      { id: "VVIP4", name: "TABLE VVIP 4", category: "VVIP ZONE", capacity: 12, status: "VACANT" },
      
      // VIP BALCONY / DECK (VIP 5-7)
      { id: "VIP5", name: "TABLE VIP 5", category: "VIP BALCONY / DECK", capacity: 10, status: "VACANT" },
      { id: "VIP6", name: "TABLE VIP 6", category: "VIP BALCONY / DECK", capacity: 10, status: "VACANT" },
      { id: "VIP7", name: "TABLE VIP 7", category: "VIP BALCONY / DECK", capacity: 10, status: "VACANT" },
      
      // STAGE PRIVATE DECK (STAGE PRIVATE TABLE)
      { id: "STAGE1", name: "STAGE PRIVATE TABLE", category: "STAGE PRIVATE DECK", capacity: 12, status: "VACANT" },
      
      // FIRST FLOOR BALCONY (A1-A5)
      { id: "A1", name: "TABLE A1", category: "FIRST FLOOR BALCONY", capacity: 8, status: "VACANT" },
      { id: "A2", name: "TABLE A2", category: "FIRST FLOOR BALCONY", capacity: 8, status: "VACANT" },
      { id: "A3", name: "TABLE A3", category: "FIRST FLOOR BALCONY", capacity: 8, status: "VACANT" },
      { id: "A4", name: "TABLE A4", category: "FIRST FLOOR BALCONY", capacity: 8, status: "VACANT" },
      { id: "A5", name: "TABLE A5", category: "FIRST FLOOR BALCONY", capacity: 8, status: "VACANT" },
      
      // FIRST FLOOR COCKTAIL STANDING (A6-A8)
      { id: "A6", name: "TABLE A6", category: "FIRST FLOOR COCKTAIL STANDING", capacity: 4, status: "VACANT" },
      { id: "A7", name: "TABLE A7", category: "FIRST FLOOR COCKTAIL STANDING", capacity: 4, status: "VACANT" },
      { id: "A8", name: "TABLE A8", category: "FIRST FLOOR COCKTAIL STANDING", capacity: 4, status: "VACANT" },
      
      // SECOND FLOOR VIP (C1-C2, C6-C8)
      { id: "C1", name: "TABLE C1", category: "SECOND FLOOR VIP", capacity: 10, status: "VACANT" },
      { id: "C2", name: "TABLE C2", category: "SECOND FLOOR VIP", capacity: 10, status: "VACANT" },
      { id: "C6", name: "TABLE C6", category: "SECOND FLOOR VIP", capacity: 10, status: "VACANT" },
      { id: "C7", name: "TABLE C7", category: "SECOND FLOOR VIP", capacity: 10, status: "VACANT" },
      { id: "C8", name: "TABLE C8", category: "SECOND FLOOR VIP", capacity: 10, status: "VACANT" },
      
      // SECOND FLOOR VIP STANDING (C3-C5)
      { id: "C3", name: "TABLE C3", category: "SECOND FLOOR VIP STANDING", capacity: 4, status: "VACANT" },
      { id: "C4", name: "TABLE C4", category: "SECOND FLOOR VIP STANDING", capacity: 4, status: "VACANT" },
      { id: "C5", name: "TABLE C5", category: "SECOND FLOOR VIP STANDING", capacity: 4, status: "VACANT" }
    ];
    localStorage.setItem("xo_tables", JSON.stringify(defaultTables));
  }
  if (!localStorage.getItem("xo_orders")) {
    localStorage.setItem("xo_orders", JSON.stringify([]));
  }
  if (!localStorage.getItem("xo_checkins")) {
    localStorage.setItem("xo_checkins", JSON.stringify({}));
  }
}

initLocalStorageBaseline();

// =========================================================================
// 2. CRYPTOGRAPHIC SIGNATURE GENERATORS (WEB CRYPTO API)
// =========================================================================

async function computeHmacSha256(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await window.crypto.subtle.sign("HMAC", cryptoKey, messageData);
  
  // Convert ArrayBuffer to Base64 manually
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const hashString = hashArray.map(b => String.fromCharCode(b)).join("");
  return btoa(hashString);
}

// =========================================================================
// 3. BACKGROUND DATABASE SYNCHRONIZATIONS & SEEDING (SUPABASE)
// =========================================================================

async function seedSupabaseIfNeeded() {
  if (!supabase) return;
  try {
    // First, verify and purge past events in Supabase to sync fresh date-fixed tickets
    const { data: dbEvts, error: dbEvErr } = await supabase.from("events").select("id, target_date");
    if (!dbEvErr && dbEvts) {
      const hasOldEvents = dbEvts.some(e => new Date(e.target_date).getTime() < new Date("2026-06-01").getTime());
      if (hasOldEvents) {
        console.log("[XO Mainframe Interceptor] Purging old events from Supabase to refresh dates");
        await supabase.from("events").delete().in("id", dbEvts.map(e => e.id));
      }
    }

    // 1. Seed events
    const { count: eventCount, error: evErr } = await supabase.from("events").select("*", { count: "exact", head: true });
    if (!evErr && eventCount === 0) {
      const payload = CLUB_EVENTS.map(e => ({
        id: e.id,
        title: e.title,
        date: e.date,
        time: e.time,
        headliner: e.headliner,
        support: e.support,
        subgenre: e.subgenre,
        bpm: e.bpm,
        ticket_price: e.ticketPrice,
        available_tickets: e.availableTickets,
        accent_color: e.accentColor,
        raw_accent: e.rawAccent,
        door_policy: e.doorPolicy,
        graphic_style: e.graphicStyle,
        target_date: e.targetDate,
        gif_url: e.gifUrl
      }));
      await supabase.from("events").insert(payload);
    }

    // 2. Seed photos
    const { count: photoCount, error: phErr } = await supabase.from("photo_groups").select("*", { count: "exact", head: true });
    if (!phErr && photoCount === 0) {
      const payload = PHOTO_GROUPS.map(p => ({
        id: p.id,
        title: p.title,
        date: p.date,
        description: p.description,
        cover_image: p.coverImage,
        images: p.images
      }));
      await supabase.from("photo_groups").insert(payload);
    }

    // 3. Seed VIP tables
    const { count: tableCount, error: tbErr } = await supabase.from("vip_tables").select("*", { count: "exact", head: true });
    if (!tbErr && tableCount === 0) {
      const localTables: VIPTable[] = JSON.parse(localStorage.getItem("xo_tables") || "[]");
      const payload = localTables.map(t => ({
        id: t.id,
        name: t.name,
        category: t.category,
        capacity: t.capacity,
        status: t.status,
        guest_name: t.guestName || null,
        guest_email: t.guestEmail || null,
        order_id: t.orderId || null,
        bottle_notes: t.bottleNotes || null,
        assigned_at: t.assignedAt || null
      }));
      await supabase.from("vip_tables").insert(payload);
    }
  } catch (err) {
    console.warn("Supabase auto-seeding bypass/fail:", err);
  }
}

// Sync VIP orders dynamically to unoccupied VIP Tables
async function syncVIPBookings() {
  // Read all orders
  let ordersList: OrderRecord[] = [];
  if (supabase) {
    try {
      const { data, error } = await supabase.from("orders").select("*").eq("status", "PAID").eq("type", "vip");
      if (!error && data) {
        ordersList = data.map(o => ({
          orderId: o.order_id,
          amount: Number(o.amount),
          guestName: o.guest_name,
          guestEmail: o.guest_email,
          type: o.type as "ticket" | "vip",
          typeName: o.type_name,
          count: Number(o.count),
          status: o.status as "PENDING" | "PAID" | "FAILED",
          transactionCode: o.transaction_code,
          verifiedAt: o.verified_at
        }));
      }
    } catch (err) {
      console.warn("Supabase orders sync failed, fall back to memory:", err);
    }
  }
  
  // Also append local paid VIP orders
  const localOrders: OrderRecord[] = JSON.parse(localStorage.getItem("xo_orders") || "[]");
  localOrders.forEach(lo => {
    if (lo.status === "PAID" && lo.type === "vip" && !ordersList.find(o => o.orderId === lo.orderId)) {
      ordersList.push(lo);
    }
  });

  // Load current tables
  let tablesList: VIPTable[] = [];
  if (supabase) {
    try {
      const { data, error } = await supabase.from("vip_tables").select("*");
      if (!error && data) {
        tablesList = data.map(t => ({
          id: t.id,
          name: t.name,
          category: t.category,
          capacity: Number(t.capacity),
          status: t.status as "VACANT" | "TAKEN",
          guestName: t.guest_name || undefined,
          guestEmail: t.guest_email || undefined,
          orderId: t.order_id || undefined,
          bottleNotes: t.bottle_notes || undefined,
          assignedAt: t.assigned_at || undefined
        }));
      }
    } catch (err) {
      console.warn("Supabase VIP tables sync failed:", err);
    }
  }
  if (tablesList.length === 0) {
    tablesList = JSON.parse(localStorage.getItem("xo_tables") || "[]");
  }

  let tableUpdated = false;

  // Load list of manually discharged orders
  const dischargedIds: string[] = JSON.parse(localStorage.getItem("xo_discharged_orders") || "[]");

  for (const order of ordersList) {
    if (dischargedIds.includes(order.orderId)) {
      continue; // Skip automatically allocating this order since it was manually freed!
    }
    const isAssigned = tablesList.some(t => t.orderId === order.orderId);
    if (!isAssigned) {
      // Find vacant table for package
      const vacantTable = tablesList.find(t => t.status === "VACANT" && t.category === order.typeName);
      if (vacantTable) {
        const assignedTime = order.verifiedAt || new Date().toISOString();
        vacantTable.status = "TAKEN";
        vacantTable.guestName = order.guestName;
        vacantTable.guestEmail = order.guestEmail;
        vacantTable.orderId = order.orderId;
        vacantTable.assignedAt = assignedTime;
        vacantTable.bottleNotes = "eSewa VIP package digital allocation";
        tableUpdated = true;

        if (supabase) {
          try {
            await supabase.from("vip_tables").update({
              status: "TAKEN",
              guest_name: order.guestName,
              guest_email: order.guestEmail,
              order_id: order.orderId,
              assigned_at: assignedTime,
              bottle_notes: "eSewa VIP package digital allocation"
            }).eq("id", vacantTable.id);
          } catch (dbErr) {
            console.error("Failed saving table updates to Supabase:", dbErr);
          }
        }
      }
    }
  }

  if (tableUpdated || !supabase) {
    localStorage.setItem("xo_tables", JSON.stringify(tablesList));
  }
}

// Trigger background seeders asynchronously
setTimeout(() => {
  seedSupabaseIfNeeded();
  syncVIPBookings();
}, 2000);

// =========================================================================
// 4. API MOCK INTERCEPTOR CONTROLLERS
// =========================================================================

interface MockResponse {
  status?: number;
  body: any;
}

async function handleMockRoute(urlStr: string, init?: RequestInit): Promise<MockResponse> {
  const url = new URL(urlStr, window.location.origin);
  const path = url.pathname;
  const method = init?.method || "GET";
  
  let reqBody: any = {};
  if (init?.body) {
    try {
      reqBody = JSON.parse(init.body as string);
    } catch {
      // Body not JSON
    }
  }

  // A. SYSTEM & HEALTH CHECKS
  if (path === "/api" || path === "/api/health") {
    return {
      body: {
        status: "ok",
        app: "XO CLUB KATHMANDU EMULATED CLIENT NETWORK",
        version: "v2.0.26-client",
        database: supabase ? "supabase" : "local-storage"
      }
    };
  }

  // B. CALENDAR EVENTS ENDPOINTS
  if (path === "/api/admin/events") {
    if (method === "GET") {
      let eventsList: ClubEvent[] = [];
      if (supabase) {
        try {
          const { data, error } = await supabase.from("events").select("*").order("created_at", { ascending: true });
          if (error) {
            console.error("[XO Mainframe Interceptor] Supabase GET events failed:", error);
          } else if (data) {
            console.log("[XO Mainframe Interceptor] Supabase GET events loaded:", data.length);
            eventsList = data.map(e => ({
              id: e.id,
              title: e.title,
              date: e.date,
              time: e.time,
              headliner: e.headliner,
              support: e.support || [],
              subgenre: e.subgenre,
              bpm: Number(e.bpm),
              ticketPrice: Number(e.ticket_price),
              availableTickets: Number(e.available_tickets),
              accentColor: e.accent_color,
              rawAccent: e.raw_accent,
              doorPolicy: e.door_policy,
              graphicStyle: e.graphic_style,
              targetDate: e.target_date,
              gifUrl: e.gif_url,
              showEsewa: e.show_esewa !== false,
              showCustomPayment: e.show_custom_payment === true,
              customPaymentLabel: e.custom_payment_label || "",
              customPaymentLink: e.custom_payment_link || ""
            }));
            localStorage.setItem("xo_events", JSON.stringify(eventsList));
          }
        } catch (err) {
          console.warn("Supabase query failed, reading local events:", err);
        }
      }
      if (eventsList.length === 0) {
        eventsList = JSON.parse(localStorage.getItem("xo_events") || "[]");
      }
      return { body: { success: true, data: eventsList } };
    }

    if (method === "POST") {
      const eventData: Partial<ClubEvent> = reqBody;
      if (!eventData.title || !eventData.date || !eventData.time) {
        return { status: 400, body: { success: false, error: "Title, date, and time are required." } };
      }

      const targetId = eventData.id || `evt-${Date.now()}`;
      const finalizedEvent: ClubEvent = {
        id: targetId,
        title: eventData.title.toUpperCase(),
        date: eventData.date.toUpperCase(),
        time: eventData.time,
        headliner: (eventData.headliner || "XO RESIDENT DJ").toUpperCase(),
        support: eventData.support || [],
        subgenre: (eventData.subgenre || "Sensory Melodic techno").toUpperCase(),
        bpm: Number(eventData.bpm) || 128,
        ticketPrice: Number(eventData.ticketPrice) || 1500,
        availableTickets: Number(eventData.availableTickets) || 100,
        accentColor: eventData.accentColor || "from-zinc-400 to-black",
        rawAccent: eventData.rawAccent || "#ffffff",
        doorPolicy: eventData.doorPolicy || "SMART DRESSED ATTIRE",
        graphicStyle: eventData.graphicStyle || "industrial",
        targetDate: eventData.targetDate || new Date(Date.now() + 7 * 86400000).toISOString(),
        gifUrl: eventData.gifUrl || "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExZG5pczByNGNrbXB2OXUwdXR3d3loNzNqdzFycWR2dzBvdWhhczZ5MiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0O9zk3Tq6V1zZ0oE/giphy.gif",
        showEsewa: eventData.showEsewa !== false,
        showCustomPayment: eventData.showCustomPayment === true,
        customPaymentLabel: eventData.customPaymentLabel || "",
        customPaymentLink: eventData.customPaymentLink || ""
      };

      if (supabase) {
        try {
          const { error } = await supabase.from("events").upsert({
            id: finalizedEvent.id,
            title: finalizedEvent.title,
            date: finalizedEvent.date,
            time: finalizedEvent.time,
            headliner: finalizedEvent.headliner,
            support: finalizedEvent.support,
            subgenre: finalizedEvent.subgenre,
            bpm: finalizedEvent.bpm,
            ticket_price: finalizedEvent.ticketPrice,
            available_tickets: finalizedEvent.availableTickets,
            accent_color: finalizedEvent.accentColor,
            raw_accent: finalizedEvent.rawAccent,
            door_policy: finalizedEvent.doorPolicy,
            graphic_style: finalizedEvent.graphicStyle,
            target_date: finalizedEvent.targetDate,
            gif_url: finalizedEvent.gifUrl,
            show_esewa: finalizedEvent.showEsewa,
            show_custom_payment: finalizedEvent.showCustomPayment,
            custom_payment_label: finalizedEvent.customPaymentLabel,
            custom_payment_link: finalizedEvent.customPaymentLink
          });

          if (error && error.message.includes("column")) {
            console.warn("Supabase: Retrying event save without custom columns due to DB schema mismatch:", error.message);
            await supabase.from("events").upsert({
              id: finalizedEvent.id,
              title: finalizedEvent.title,
              date: finalizedEvent.date,
              time: finalizedEvent.time,
              headliner: finalizedEvent.headliner,
              support: finalizedEvent.support,
              subgenre: finalizedEvent.subgenre,
              bpm: finalizedEvent.bpm,
              ticket_price: finalizedEvent.ticketPrice,
              available_tickets: finalizedEvent.availableTickets,
              accent_color: finalizedEvent.accentColor,
              raw_accent: finalizedEvent.rawAccent,
              door_policy: finalizedEvent.doorPolicy,
              graphic_style: finalizedEvent.graphicStyle,
              target_date: finalizedEvent.targetDate,
              gif_url: finalizedEvent.gifUrl
            });
          }
        } catch (err) {
          console.error("Supabase event saving failed:", err);
        }
      }

      // Sync local
      const localEvents: ClubEvent[] = JSON.parse(localStorage.getItem("xo_events") || "[]");
      const idx = localEvents.findIndex(e => e.id === finalizedEvent.id);
      if (idx > -1) {
        localEvents[idx] = finalizedEvent;
      } else {
        localEvents.push(finalizedEvent);
      }
      localStorage.setItem("xo_events", JSON.stringify(localEvents));

      return { body: { success: true, message: "Event saved successfully", data: finalizedEvent } };
    }
  }

  // DELETE EVENT
  if (path.startsWith("/api/admin/events/") && method === "DELETE") {
    const id = path.substring("/api/admin/events/".length);
    if (supabase) {
      try {
        await supabase.from("events").delete().eq("id", id);
      } catch (err) {
        console.error("Supabase delete event failed:", err);
      }
    }
    const localEvents: ClubEvent[] = JSON.parse(localStorage.getItem("xo_events") || "[]");
    const updated = localEvents.filter(e => e.id !== id);
    localStorage.setItem("xo_events", JSON.stringify(updated));

    return { body: { success: true, message: "Event deleted from registry" } };
  }

  // C. PHOTOS GALLERY CATEGORIES ENDPOINTS
  if (path === "/api/admin/photos") {
    if (method === "GET") {
      let photosList: PhotoGroup[] = [];
      if (supabase) {
        try {
          const { data, error } = await supabase.from("photo_groups").select("*").order("created_at", { ascending: false });
          if (error) {
            console.error("[XO Mainframe Interceptor] Supabase GET photo_groups failed:", error);
          } else if (data) {
            console.log("[XO Mainframe Interceptor] Supabase GET photo_groups loaded:", data.length);
            photosList = data.map(p => ({
              id: p.id,
              title: p.title,
              date: p.date,
              description: p.description,
              coverImage: p.cover_image,
              images: p.images || []
            }));
            localStorage.setItem("xo_photos", JSON.stringify(photosList));
          }
        } catch (err) {
          console.warn("Supabase photo groups query failed:", err);
        }
      }
      if (photosList.length === 0) {
        photosList = JSON.parse(localStorage.getItem("xo_photos") || "[]");
      }
      return { body: { success: true, data: photosList } };
    }

    if (method === "POST") {
      const payload = reqBody;
      if (!payload.title || !payload.coverImage) {
        return { status: 400, body: { success: false, error: "Title and Cover Image are required for photo folders." } };
      }

      const targetId = payload.id || `g-${Date.now()}`;
      const finalizedGroup: PhotoGroup = {
        id: targetId,
        title: payload.title.toUpperCase(),
        date: (payload.date || "TODAY").toUpperCase(),
        description: payload.description || "",
        coverImage: payload.coverImage,
        images: payload.images || []
      };

      if (supabase) {
        try {
          await supabase.from("photo_groups").upsert({
            id: finalizedGroup.id,
            title: finalizedGroup.title,
            date: finalizedGroup.date,
            description: finalizedGroup.description,
            cover_image: finalizedGroup.coverImage,
            images: finalizedGroup.images
          });
        } catch (err) {
          console.error("Supabase photo save failed:", err);
        }
      }

      const localPhotos: PhotoGroup[] = JSON.parse(localStorage.getItem("xo_photos") || "[]");
      const idx = localPhotos.findIndex(g => g.id === finalizedGroup.id);
      if (idx > -1) {
        localPhotos[idx] = finalizedGroup;
      } else {
        localPhotos.unshift(finalizedGroup);
      }
      localStorage.setItem("xo_photos", JSON.stringify(localPhotos));

      return { body: { success: true, data: finalizedGroup } };
    }
  }

  // DELETE PHOTO ALBUM
  if (path.startsWith("/api/admin/photos/") && method === "DELETE") {
    const id = path.substring("/api/admin/photos/".length);
    if (supabase) {
      try {
        await supabase.from("photo_groups").delete().eq("id", id);
      } catch (err) {
        console.error("Supabase photo delete failed:", err);
      }
    }
    const localPhotos: PhotoGroup[] = JSON.parse(localStorage.getItem("xo_photos") || "[]");
    const updated = localPhotos.filter(g => g.id !== id);
    localStorage.setItem("xo_photos", JSON.stringify(updated));

    return { body: { success: true, message: "Folder deleted from sensory grid" } };
  }

  // D. VIP TABLES ENDPOINTS
  if (path === "/api/admin/tables") {
    if (method === "GET") {
      await syncVIPBookings();
      let tablesList: VIPTable[] = [];
      if (supabase) {
        try {
          const { data, error } = await supabase.from("vip_tables").select("*").order("id", { ascending: true });
          if (error) {
            console.error("[XO Mainframe Interceptor] Supabase GET vip_tables failed:", error);
          } else if (data) {
            console.log("[XO Mainframe Interceptor] Supabase GET vip_tables loaded:", data.length);
            tablesList = data.map(t => ({
              id: t.id,
              name: t.name,
              category: t.category,
              capacity: Number(t.capacity),
              status: t.status as "VACANT" | "TAKEN",
              guestName: t.guest_name || undefined,
              guestEmail: t.guest_email || undefined,
              orderId: t.order_id || undefined,
              bottleNotes: t.bottle_notes || undefined,
              assignedAt: t.assigned_at || undefined
            }));
            localStorage.setItem("xo_tables", JSON.stringify(tablesList));
          }
        } catch (err) {
          console.warn("Supabase tables query failed:", err);
        }
      }
      if (tablesList.length === 0) {
        tablesList = JSON.parse(localStorage.getItem("xo_tables") || "[]");
      }
      return { body: { success: true, data: tablesList } };
    }

    if (method === "POST") {
      const data: Partial<VIPTable> = reqBody;
      if (!data.name || !data.category) {
        return { status: 400, body: { success: false, error: "Table name and category are required." } };
      }

      const targetId = data.id || `T-${Date.now()}`;
      const finalizedTable: VIPTable = {
        id: targetId,
        name: data.name.toUpperCase(),
        category: data.category,
        capacity: Number(data.capacity) || 10,
        status: data.status || "VACANT",
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        orderId: data.orderId,
        bottleNotes: data.bottleNotes,
        assignedAt: data.status === "TAKEN" ? (data.assignedAt || new Date().toISOString()) : undefined
      };

      if (supabase) {
        try {
          await supabase.from("vip_tables").upsert({
            id: finalizedTable.id,
            name: finalizedTable.name,
            category: finalizedTable.category,
            capacity: finalizedTable.capacity,
            status: finalizedTable.status,
            guest_name: finalizedTable.guestName || null,
            guest_email: finalizedTable.guestEmail || null,
            order_id: finalizedTable.orderId || null,
            bottle_notes: finalizedTable.bottleNotes || null,
            assigned_at: finalizedTable.assignedAt || null
          });
        } catch (err) {
          console.error("Supabase table save failed:", err);
        }
      }

      // Check if this table was occupied by an order, but is now manually vacated/discharged
      const localTablesForCheck: VIPTable[] = JSON.parse(localStorage.getItem("xo_tables") || "[]");
      const existingTable = localTablesForCheck.find(t => t.id === targetId);
      if (existingTable && existingTable.status === "TAKEN" && finalizedTable.status === "VACANT" && existingTable.orderId) {
        const discharged: string[] = JSON.parse(localStorage.getItem("xo_discharged_orders") || "[]");
        if (!discharged.includes(existingTable.orderId)) {
          discharged.push(existingTable.orderId);
          localStorage.setItem("xo_discharged_orders", JSON.stringify(discharged));
        }
      }

      const localTables: VIPTable[] = JSON.parse(localStorage.getItem("xo_tables") || "[]");
      const idx = localTables.findIndex(t => t.id === finalizedTable.id);
      if (idx > -1) {
        localTables[idx] = finalizedTable;
      } else {
        localTables.push(finalizedTable);
      }
      localStorage.setItem("xo_tables", JSON.stringify(localTables));

      return { body: { success: true, data: finalizedTable } };
    }
  }

  // DELETE VIP TABLE
  if (path.startsWith("/api/admin/tables/") && method === "DELETE") {
    const id = path.substring("/api/admin/tables/".length);
    if (supabase) {
      try {
        await supabase.from("vip_tables").delete().eq("id", id);
      } catch (err) {
        console.error("Supabase table deletion failed:", err);
      }
    }
    const localTables: VIPTable[] = JSON.parse(localStorage.getItem("xo_tables") || "[]");
    const updated = localTables.filter(t => t.id !== id);
    localStorage.setItem("xo_tables", JSON.stringify(updated));

    return { body: { success: true, message: "Table removed from registry" } };
  }

  // E. ORDERS LIST & OPERATIONS ENDPOINTS
  if (path === "/api/admin/orders" && method === "GET") {
    let ordersList: any[] = [];
    let checkinsRecord: Record<string, { checkedIn: boolean; checkedInAt?: string }> = {};

    if (supabase) {
      try {
        const { data: dbOrders, error: ordErr } = await supabase.from("orders").select("*");
        const { data: dbCheckins, error: chkErr } = await supabase.from("checkins").select("*");

        if (ordErr) {
          console.error("[XO Mainframe Interceptor] Supabase GET orders failed:", ordErr);
        }
        if (chkErr) {
          console.error("[XO Mainframe Interceptor] Supabase GET checkins failed:", chkErr);
        }

        if (!ordErr && dbOrders) {
          console.log("[XO Mainframe Interceptor] Supabase GET orders loaded:", dbOrders.length);
          ordersList = dbOrders.map(o => {
            const scan = dbCheckins?.find(c => c.order_id === o.order_id) || { checked_in: false, checked_in_at: null };
            return {
              orderId: o.order_id,
              amount: Number(o.amount),
              guestName: o.guest_name,
              guestEmail: o.guest_email,
              type: o.type,
              typeName: o.type_name,
              count: Number(o.count),
              status: o.status,
              transactionCode: o.transaction_code,
              verifiedAt: o.verified_at,
              checkedIn: scan.checked_in,
              checkedInAt: scan.checked_in_at
            };
          });

          // Sync local caches
          const syncOrders: OrderRecord[] = dbOrders.map(o => ({
            orderId: o.order_id,
            amount: Number(o.amount),
            guestName: o.guest_name,
            guestEmail: o.guest_email,
            type: o.type as "ticket" | "vip",
            typeName: o.type_name,
            count: Number(o.count),
            status: o.status as "PENDING" | "PAID" | "FAILED",
            transactionCode: o.transaction_code || undefined,
            verifiedAt: o.verified_at || undefined
          }));
          localStorage.setItem("xo_orders", JSON.stringify(syncOrders));

          const syncCheckins: Record<string, { checkedIn: boolean; checkedInAt?: string }> = {};
          dbCheckins?.forEach(c => {
            syncCheckins[c.order_id] = { checkedIn: c.checked_in, checkedInAt: c.checked_in_at || undefined };
          });
          localStorage.setItem("xo_checkins", JSON.stringify(syncCheckins));
        }
      } catch (err) {
        console.warn("Supabase orders query failed:", err);
      }
    }

    if (ordersList.length === 0) {
      const localOrds: OrderRecord[] = JSON.parse(localStorage.getItem("xo_orders") || "[]");
      checkinsRecord = JSON.parse(localStorage.getItem("xo_checkins") || "{}");
      ordersList = localOrds.map(o => {
        const scan = checkinsRecord[o.orderId] || { checkedIn: false };
        return {
          ...o,
          checkedIn: scan.checkedIn,
          checkedInAt: scan.checkedInAt
        };
      });
    }

    ordersList.sort((a, b) => b.orderId.localeCompare(a.orderId));
    return { body: { success: true, data: ordersList } };
  }

  // DELETE ORDER
  if (path.startsWith("/api/admin/orders/") && method === "DELETE") {
    const id = path.substring("/api/admin/orders/".length);
    if (supabase) {
      try {
        await supabase.from("orders").delete().eq("order_id", id);
        await supabase.from("checkins").delete().eq("order_id", id);
        await supabase.from("vip_tables").update({
          status: "VACANT",
          guest_name: null,
          guest_email: null,
          order_id: null,
          assigned_at: null,
          bottle_notes: null
        }).eq("order_id", id);
      } catch (err) {
        console.error("Supabase delete order failed:", err);
      }
    }
    const localOrds: OrderRecord[] = JSON.parse(localStorage.getItem("xo_orders") || "[]");
    const updatedOrds = localOrds.filter(o => o.orderId !== id);
    localStorage.setItem("xo_orders", JSON.stringify(updatedOrds));

    const checkinsRecord: Record<string, { checkedIn: boolean; checkedInAt?: string }> = JSON.parse(localStorage.getItem("xo_checkins") || "{}");
    delete checkinsRecord[id];
    localStorage.setItem("xo_checkins", JSON.stringify(checkinsRecord));

    const localTables: VIPTable[] = JSON.parse(localStorage.getItem("xo_tables") || "[]");
    const updatedTables = localTables.map(t => {
      if (t.orderId === id) {
        return {
          ...t,
          status: "VACANT" as const,
          guestName: undefined,
          guestEmail: undefined,
          orderId: undefined,
          assignedAt: undefined,
          bottleNotes: undefined
        };
      }
      return t;
    });
    localStorage.setItem("xo_tables", JSON.stringify(updatedTables));

    // Also clean up from discharged list if present
    const discharged: string[] = JSON.parse(localStorage.getItem("xo_discharged_orders") || "[]");
    const updatedDischarged = discharged.filter(itemId => itemId !== id);
    localStorage.setItem("xo_discharged_orders", JSON.stringify(updatedDischarged));

    return { body: { success: true, message: "Order deleted from registry" } };
  }

  // F. eSewa MANUAL AND AUTOMATED ORDER VERIFICATIONS
  if (path === "/api/admin/orders/manually-set-paid" && method === "POST") {
    const { orderId, status, checkedIn } = reqBody;
    const isPaid = (status || "PAID") === "PAID";
    const verifiedTime = new Date().toISOString();

    // 1. Get existing order
    let orderObj: any = null;
    if (supabase) {
      try {
        const { data, error } = await supabase.from("orders").select("*").eq("order_id", orderId).maybeSingle();
        if (!error && data) {
          orderObj = {
            orderId: data.order_id,
            amount: Number(data.amount),
            guestName: data.guest_name,
            guestEmail: data.guest_email,
            type: data.type,
            typeName: data.type_name,
            count: Number(data.count),
            status: data.status,
            transactionCode: data.transaction_code,
            verifiedAt: data.verified_at
          };
        }
      } catch (err) {
        console.warn("Manual check Supabase failed:", err);
      }
    }
    if (!orderObj) {
      const localOrds: OrderRecord[] = JSON.parse(localStorage.getItem("xo_orders") || "[]");
      orderObj = localOrds.find(o => o.orderId === orderId);
    }

    const finalizedOrder: OrderRecord = orderObj
      ? {
          ...orderObj,
          status: (status || "PAID") as "PENDING" | "PAID" | "FAILED",
          transactionCode: orderObj.transactionCode || "MANUAL_APPROVAL",
          verifiedAt: orderObj.verifiedAt || (isPaid ? verifiedTime : undefined)
        }
      : {
          orderId,
          amount: 2000,
          guestName: "MANUALLY APPROVED GUEST",
          guestEmail: "admin@club-xo.com",
          type: "ticket",
          typeName: "XO GENERAL TICKET",
          count: 1,
          status: (status || "PAID") as "PENDING" | "PAID" | "FAILED",
          transactionCode: "MANUAL_APPROVAL",
          verifiedAt: isPaid ? verifiedTime : undefined
        };

    // Save order
    if (supabase) {
      try {
        await supabase.from("orders").upsert({
          order_id: finalizedOrder.orderId,
          amount: finalizedOrder.amount,
          guest_name: finalizedOrder.guestName,
          guest_email: finalizedOrder.guestEmail,
          type: finalizedOrder.type,
          type_name: finalizedOrder.typeName,
          count: finalizedOrder.count,
          status: finalizedOrder.status,
          transaction_code: finalizedOrder.transactionCode,
          verified_at: finalizedOrder.verifiedAt || null
        });
      } catch (dbErr) {
        console.error("Supabase manual save failed:", dbErr);
      }
    }

    const localOrds: OrderRecord[] = JSON.parse(localStorage.getItem("xo_orders") || "[]");
    const ordIdx = localOrds.findIndex(o => o.orderId === finalizedOrder.orderId);
    if (ordIdx > -1) {
      localOrds[ordIdx] = finalizedOrder;
    } else {
      localOrds.push(finalizedOrder);
    }
    localStorage.setItem("xo_orders", JSON.stringify(localOrds));

    // Save checkin
    if (checkedIn !== undefined) {
      const isChecked = !!checkedIn;
      const checkinTime = isChecked ? new Date().toISOString() : null;

      if (supabase) {
        try {
          if (isChecked) {
            await supabase.from("checkins").upsert({
              order_id: orderId,
              checked_in: true,
              checked_in_at: checkinTime
            });
          } else {
            await supabase.from("checkins").delete().eq("order_id", orderId);
          }
        } catch (dbErr) {
          console.error("Supabase manual checkin failed:", dbErr);
        }
      }

      const checkinsRecord: Record<string, { checkedIn: boolean; checkedInAt?: string }> = JSON.parse(localStorage.getItem("xo_checkins") || "{}");
      checkinsRecord[orderId] = { checkedIn: isChecked, checkedInAt: checkinTime || undefined };
      localStorage.setItem("xo_checkins", JSON.stringify(checkinsRecord));
    }

    // Trigger VIP sync to re-allocate tables
    await syncVIPBookings();

    return { body: { success: true, message: "Order records updated" } };
  }

  // QR CHECKIN VALIDATION
  if (path === "/api/admin/orders/verify-qr" && method === "POST") {
    const { orderId } = reqBody;
    if (!orderId) {
      return { status: 400, body: { success: false, error: "Order ID is mandatory to confirm validation." } };
    }

    let order: OrderRecord | null = null;
    if (supabase) {
      try {
        const { data, error } = await supabase.from("orders").select("*").eq("order_id", orderId).maybeSingle();
        if (!error && data) {
          order = {
            orderId: data.order_id,
            amount: Number(data.amount),
            guestName: data.guest_name,
            guestEmail: data.guest_email,
            type: data.type as "ticket" | "vip",
            typeName: data.type_name,
            count: Number(data.count),
            status: data.status as "PENDING" | "PAID" | "FAILED",
            transactionCode: data.transaction_code,
            verifiedAt: data.verified_at
          };
        }
      } catch (err) {
        console.warn("Supabase order QR lookup failed:", err);
      }
    }
    if (!order) {
      const localOrds: OrderRecord[] = JSON.parse(localStorage.getItem("xo_orders") || "[]");
      order = localOrds.find(o => o.orderId === orderId) || null;
    }

    if (!order) {
      return { status: 404, body: { success: false, error: "QR Code unrecognized. Secure database contains no record for this pass." } };
    }

    if (order.status !== "PAID") {
      return { status: 400, body: { success: false, error: `Pass belongs to incomplete status: ${order.status}`, order } };
    }

    // Check if the event for this ticket has ended (6-hour buffer)
    let eventsList: ClubEvent[] = [];
    if (supabase) {
      try {
        const { data } = await supabase.from("events").select("*");
        if (data) {
          eventsList = data.map(e => ({
            id: e.id,
            title: e.title,
            date: e.date,
            time: e.time,
            headliner: e.headliner,
            support: e.support || [],
            subgenre: e.subgenre,
            bpm: Number(e.bpm),
            ticketPrice: Number(e.ticket_price),
            availableTickets: Number(e.available_tickets),
            accentColor: e.accent_color,
            rawAccent: e.raw_accent,
            doorPolicy: e.door_policy,
            graphicStyle: e.graphic_style,
            targetDate: e.target_date,
            gifUrl: e.gif_url
          }));
        }
      } catch (err) {
        console.warn("Supabase query failed, reading local events:", err);
      }
    }
    if (eventsList.length === 0) {
      eventsList = JSON.parse(localStorage.getItem("xo_events") || "[]");
    }

    const matchingEvt = eventsList.find(e => e.title.toUpperCase() === order!.typeName.toUpperCase());
    if (matchingEvt) {
      const nowTime = new Date().getTime();
      const eventEndTime = new Date(matchingEvt.targetDate).getTime() + (6 * 60 * 60 * 1000); // 6 hours buffer
      if (nowTime > eventEndTime) {
        return {
          status: 400,
          body: {
            success: false,
            error: "TICKET EXPIRED // EVENT ENDED",
            message: `This event (${matchingEvt.title}) has ended. Ticket pass is no longer valid.`,
            order
          }
        };
      }
    }

    let checkedIn = false;
    let checkedInAt: string | undefined = undefined;

    if (supabase) {
      try {
        const { data, error } = await supabase.from("checkins").select("*").eq("order_id", orderId).maybeSingle();
        if (!error && data) {
          checkedIn = data.checked_in;
          checkedInAt = data.checked_in_at || undefined;
        }
      } catch (err) {
        console.warn("Supabase checkin scan lookup failed:", err);
      }
    } else {
      const checkinsRecord: Record<string, { checkedIn: boolean; checkedInAt?: string }> = JSON.parse(localStorage.getItem("xo_checkins") || "{}");
      const localChk = checkinsRecord[orderId];
      if (localChk) {
        checkedIn = localChk.checkedIn;
        checkedInAt = localChk.checkedInAt;
      }
    }

    if (checkedIn) {
      return {
        status: 409,
        body: {
          success: false,
          error: "TICKET ALREADY SCAN-CLAIMED",
          message: `Already validated on ${new Date(checkedInAt!).toLocaleTimeString()}`,
          order,
          checkedInAt
        }
      };
    }

    const now = new Date().toISOString();
    if (supabase) {
      try {
        await supabase.from("checkins").upsert({
          order_id: orderId,
          checked_in: true,
          checked_in_at: now
        });
      } catch (err) {
        console.error("Supabase qr scan saving failed:", err);
      }
    }

    const checkinsRecord: Record<string, { checkedIn: boolean; checkedInAt?: string }> = JSON.parse(localStorage.getItem("xo_checkins") || "{}");
    checkinsRecord[orderId] = { checkedIn: true, checkedInAt: now };
    localStorage.setItem("xo_checkins", JSON.stringify(checkinsRecord));

    return {
      body: {
        success: true,
        message: "TICKET VALIDATED & ACCESS AUTHORIZED",
        order: {
          ...order,
          checkedIn: true,
          checkedInAt: now
        }
      }
    };
  }

  // GET ORDER DIRECT BY ID
  if (path.startsWith("/api/payment/order/") && method === "GET") {
    const orderId = path.substring("/api/payment/order/".length);
    let order: OrderRecord | null = null;

    if (supabase) {
      try {
        const { data, error } = await supabase.from("orders").select("*").eq("order_id", orderId).maybeSingle();
        if (!error && data) {
          order = {
            orderId: data.order_id,
            amount: Number(data.amount),
            guestName: data.guest_name,
            guestEmail: data.guest_email,
            type: data.type as "ticket" | "vip",
            typeName: data.type_name,
            count: Number(data.count),
            status: data.status as "PENDING" | "PAID" | "FAILED",
            transactionCode: data.transaction_code,
            verifiedAt: data.verified_at
          };
        }
      } catch (err) {
        console.warn("Supabase direct order lookup failed:", err);
      }
    }
    if (!order) {
      const localOrds: OrderRecord[] = JSON.parse(localStorage.getItem("xo_orders") || "[]");
      order = localOrds.find(o => o.orderId === orderId) || null;
    }

    if (!order) {
      return { status: 404, body: { error: "Order not found" } };
    }
    return { body: { success: true, order } };
  }

  // G. eSewa PAYMENT GATEWAY INITIATIONS
  if (path === "/api/payment/initiate" && method === "POST") {
    const { amount, orderId, guestName, guestEmail, type, typeName, count, successUrl, failureUrl } = reqBody;
    if (!amount || !orderId) {
      return { status: 400, body: { error: "Amount and orderId are required" } };
    }

    const record: OrderRecord = {
      orderId,
      amount: Number(amount),
      guestName: guestName || "ANONYMOUS REVELER",
      guestEmail: guestEmail || "resident@club-xo.com",
      type: type || "ticket",
      typeName: typeName || "General Admission",
      count: count || 1,
      status: "PENDING"
    };

    // Save record to DB
    if (supabase) {
      try {
        await supabase.from("orders").upsert({
          order_id: record.orderId,
          amount: record.amount,
          guest_name: record.guestName,
          guest_email: record.guestEmail,
          type: record.type,
          type_name: record.typeName,
          count: record.count,
          status: record.status
        });
      } catch (err) {
        console.error("Supabase order initiate failed:", err);
      }
    }

    const localOrds: OrderRecord[] = JSON.parse(localStorage.getItem("xo_orders") || "[]");
    const idx = localOrds.findIndex(o => o.orderId === record.orderId);
    if (idx > -1) {
      localOrds[idx] = record;
    } else {
      localOrds.push(record);
    }
    localStorage.setItem("xo_orders", JSON.stringify(localOrds));

    // eSewa signature calculations
    const taxAmount = 0;
    const productServiceCharge = 0;
    const productDeliveryCharge = 0;
    const totalAmount = Number(amount) + taxAmount + productServiceCharge + productDeliveryCharge;

    const signature = await computeHmacSha256(ESEWA_CONFIG.SECRET_KEY, `total_amount=${totalAmount},transaction_uuid=${orderId},product_code=${ESEWA_CONFIG.MERCHANT_CODE}`);

    const payload = {
      amount: Number(amount),
      tax_amount: taxAmount,
      total_amount: totalAmount,
      transaction_uuid: orderId,
      product_code: ESEWA_CONFIG.MERCHANT_CODE,
      product_service_charge: productServiceCharge,
      product_delivery_charge: productDeliveryCharge,
      success_url: successUrl || ESEWA_CONFIG.SUCCESS_URL,
      failure_url: failureUrl || ESEWA_CONFIG.FAILURE_URL,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature
    };

    return { body: { success: true, payload, paymentEndpoint: ESEWA_CONFIG.PAYMENT_ENDPOINT } };
  }

  // H. eSewa PAYMENT VERIFICATION CALLBACK
  if (path === "/api/payment/verify" && method === "GET") {
    const dataToken = url.searchParams.get("data");
    if (!dataToken) {
      return { status: 400, body: { success: false, error: "Base64 encoded verification 'data' is required" } };
    }

    try {
      // 1. Decode base64 callback
      const decodedJsonString = atob(dataToken);
      const decoded = JSON.parse(decodedJsonString);

      if (!decoded.signature || !decoded.signed_field_names) {
        return { status: 400, body: { success: false, error: "Missing signature or signed fields" } };
      }

      // 2. Compute offline signature matching
      const fieldNames = decoded.signed_field_names.split(",");
      const messageParts = fieldNames.map((field: string) => {
        const val = decoded[field];
        return `${field}=${val}`;
      });
      const message = messageParts.join(",");

      const computedSignature = await computeHmacSha256(ESEWA_CONFIG.SECRET_KEY, message);

      if (computedSignature !== decoded.signature) {
        // Failed signature matching, mark order failed
        const orderId = decoded.transaction_uuid;
        if (orderId) {
          await markOrderFailed(orderId);
        }
        return {
          status: 400,
          body: {
            success: false,
            error: "Signature mismatch. Verification check failed.",
            computed: computedSignature,
            received: decoded.signature
          }
        };
      }

      // 3. Signature matched! Update paid order in database
      const orderId = decoded.transaction_uuid;
      const updatedOrder = await markOrderPaid(orderId, decoded);

      return {
        body: {
          success: true,
          message: "Payment successfully verified and ticket authorized",
          order: updatedOrder
        }
      };
    } catch (err: any) {
      return { status: 500, body: { success: false, error: err.message || "Failed decoding callback payload" } };
    }
  }

  // Match catch-all
  return {
    status: 404,
    body: {
      error: "NOT_FOUND",
      message: `Cannot ${method} ${path}. Secure console found no matching registry endpoint.`
    }
  };
}

// Helpers for Order state updates during eSewa callback
async function markOrderFailed(orderId: string) {
  let orderObj: OrderRecord | null = null;
  if (supabase) {
    try {
      const { data } = await supabase.from("orders").select("*").eq("order_id", orderId).maybeSingle();
      if (data) {
        await supabase.from("orders").update({ status: "FAILED" }).eq("order_id", orderId);
        orderObj = {
          orderId: data.order_id,
          amount: Number(data.amount),
          guestName: data.guest_name,
          guestEmail: data.guest_email,
          type: data.type as "ticket" | "vip",
          typeName: data.type_name,
          count: Number(data.count),
          status: "FAILED"
        };
      }
    } catch (err) {
      console.warn("Direct order fail update failed:", err);
    }
  }
  
  const localOrds: OrderRecord[] = JSON.parse(localStorage.getItem("xo_orders") || "[]");
  const idx = localOrds.findIndex(o => o.orderId === orderId);
  if (idx > -1) {
    localOrds[idx].status = "FAILED";
  } else if (orderObj) {
    localOrds.push(orderObj);
  }
  localStorage.setItem("xo_orders", JSON.stringify(localOrds));
}

async function markOrderPaid(orderId: string, decoded: any) {
  let orderObj: OrderRecord | null = null;
  if (supabase) {
    try {
      const { data } = await supabase.from("orders").select("*").eq("order_id", orderId).maybeSingle();
      if (data) {
        const verifiedTime = new Date().toISOString();
        const txCode = decoded.transaction_code || "ESEWA_ONLINE";
        await supabase.from("orders").update({
          status: "PAID",
          transaction_code: txCode,
          verified_at: verifiedTime
        }).eq("order_id", orderId);

        orderObj = {
          orderId: data.order_id,
          amount: Number(data.amount),
          guestName: data.guest_name,
          guestEmail: data.guest_email,
          type: data.type as "ticket" | "vip",
          typeName: data.type_name,
          count: Number(data.count),
          status: "PAID",
          transactionCode: txCode,
          verifiedAt: verifiedTime
        };
      }
    } catch (err) {
      console.warn("Direct order paid update failed:", err);
    }
  }

  const verifiedTime = new Date().toISOString();
  const txCode = decoded.transaction_code || "ESEWA_ONLINE";

  const localOrds: OrderRecord[] = JSON.parse(localStorage.getItem("xo_orders") || "[]");
  const idx = localOrds.findIndex(o => o.orderId === orderId);
  
  let finalizedOrder: OrderRecord;
  if (idx > -1) {
    localOrds[idx].status = "PAID";
    localOrds[idx].transactionCode = txCode;
    localOrds[idx].verifiedAt = verifiedTime;
    finalizedOrder = localOrds[idx];
  } else if (orderObj) {
    localOrds.push(orderObj);
    finalizedOrder = orderObj;
  } else {
    finalizedOrder = {
      orderId,
      amount: Number(decoded.total_amount) || 2000,
      guestName: "XO DIRECT GUEST",
      guestEmail: "guest@club-xo.com",
      type: "ticket",
      typeName: decoded.product_code || "eSewa Direct Payment",
      count: 1,
      status: "PAID",
      transactionCode: txCode,
      verifiedAt: verifiedTime
    };
    localOrds.push(finalizedOrder);
  }
  localStorage.setItem("xo_orders", JSON.stringify(localOrds));

  // Trigger VIP table sync since a booking has been confirmed paid!
  await syncVIPBookings();

  return finalizedOrder;
}

// =========================================================================
// 5. FETCH HIJACKING REGISTER
// =========================================================================

const originalFetch = window.fetch;
window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const urlStr = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;

  if (urlStr.startsWith("/api") || urlStr.includes("/api/")) {
    try {
      const response = await handleMockRoute(urlStr, init);
      return new Response(JSON.stringify(response.body), {
        status: response.status || 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (err: any) {
      return new Response(
        JSON.stringify({
          error: "INTERNAL_SERVER_ERROR",
          message: err.message || "Central mainframe failed executing emulated route."
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
  }

  return originalFetch.apply(this, arguments as any);
};
