import { Router, Request, Response } from "express";
import { ClubEvent, VIPPackage, PhotoGroup } from "../../frontend/types";
import { CLUB_EVENTS, VIP_PACKAGES, PHOTO_GROUPS } from "../../frontend/data";
import { ordersDatabase } from "./payment.routes";
import { supabase } from "../config/database.config";

export const adminRouter = Router();

// Express 5.0 compatible routing support
// Real-time backend database representations loaded in-memory (fallback layer)
export let dbEvents: ClubEvent[] = [...CLUB_EVENTS];
export let dbPhotoGroups: PhotoGroup[] = [...PHOTO_GROUPS];

export interface VIPTable {
  id: string; // e.g. "T-01"
  name: string; // e.g. "PLATINUM TABLE 01"
  category: string; // "Platinum", "Prestige", "Adamson"
  capacity: number;
  status: "VACANT" | "TAKEN";
  guestName?: string;
  guestEmail?: string;
  orderId?: string; // If paid via eSewa
  assignedAt?: string;
  bottleNotes?: string; // Special bottle requests
}

// Initial VIP Tables setup
export let dbVIPTables: VIPTable[] = [
  { id: "T-01", name: "PLATINUM DECK 01", category: "PLATINUM MAIN ROOM BOOTH", capacity: 12, status: "VACANT" },
  { id: "T-02", name: "PLATINUM DECK 02", category: "PLATINUM MAIN ROOM BOOTH", capacity: 12, status: "VACANT" },
  { id: "T-03", name: "PLATINUM DECK 03", category: "PLATINUM MAIN ROOM BOOTH", capacity: 12, status: "TAKEN", guestName: "Sujal Kunwar", guestEmail: "sujalkunwar22@gmail.com", bottleNotes: "2x Dom Pérignon, 1x Don Julio 1942", assignedAt: "2026-05-23T22:00:00Z" },
  { id: "T-04", name: "PLATINUM VIP SUITE A", category: "XO PRESTIGE VIP LOUNGE", capacity: 15, status: "VACANT" },
  { id: "T-05", name: "PLATINUM VIP SUITE B", category: "XO PRESTIGE VIP LOUNGE", capacity: 15, status: "VACANT" },
  { id: "T-06", name: "ADAMSON ACOUSTIC 01", category: "ADAMSON CONSOLE DECK", capacity: 8, status: "VACANT" },
  { id: "T-07", name: "ADAMSON ACOUSTIC 02", category: "ADAMSON CONSOLE DECK", capacity: 8, status: "VACANT" }
];

// Extend OrderRecord check-in metadata (fallback layer)
export const orderCheckins: Map<string, { checkedIn: boolean; checkedInAt?: string }> = new Map();

/* =========================================================================
   DATABASE SEED & AUTO-SYNCHRONIZATION HELPERS
   ========================================================================= */

// Seed default events if Supabase table is empty
async function seedEventsIfNeeded() {
  if (!supabase) return;
  try {
    const { count, error } = await supabase.from("events").select("*", { count: "exact", head: true });
    if (!error && count === 0) {
      console.log("DB SEED: Seeding default events lineup...");
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
  } catch (err: any) {
    console.error("DB SEED WARNING: Events auto-seeding failed:", err.message || err);
  }
}

// Seed default photo groups if Supabase table is empty
async function seedPhotosIfNeeded() {
  if (!supabase) return;
  try {
    const { count, error } = await supabase.from("photo_groups").select("*", { count: "exact", head: true });
    if (!error && count === 0) {
      console.log("DB SEED: Seeding default photo gallery categories...");
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
  } catch (err: any) {
    console.error("DB SEED WARNING: Photos auto-seeding failed:", err.message || err);
  }
}

// Seed default VIP tables if Supabase table is empty
async function seedTablesIfNeeded() {
  if (!supabase) return;
  try {
    const { count, error } = await supabase.from("vip_tables").select("*", { count: "exact", head: true });
    if (!error && count === 0) {
      console.log("DB SEED: Seeding default VIP tables registry...");
      const payload = dbVIPTables.map(t => ({
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
  } catch (err: any) {
    console.error("DB SEED WARNING: VIP tables auto-seeding failed:", err.message || err);
  }
}

// Trigger lazy seeds asynchronously in background
function runBackgroundSeeds() {
  seedEventsIfNeeded();
  seedPhotosIfNeeded();
  seedTablesIfNeeded();
}

// Helper to check and autocheck paid VIP bookings into tables (Supabase + Local fallback)
async function syncVIPBookings() {
  if (supabase) {
    try {
      // 1. Fetch paid VIP orders
      const { data: paidVipOrders, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("status", "PAID")
        .eq("type", "vip");

      if (!orderError && paidVipOrders) {
        // 2. Fetch VIP Tables
        const { data: tables, error: tableError } = await supabase
          .from("vip_tables")
          .select("*");

        if (!tableError && tables) {
          for (const order of paidVipOrders) {
            const orderId = order.order_id;
            const tableAssigned = tables.find(t => t.order_id === orderId);

            if (!tableAssigned) {
              // Find a vacant table of matching category
              const vacantTable = tables.find(t => t.status === "VACANT" && t.category === order.type_name);
              if (vacantTable) {
                const now = order.verified_at || new Date().toISOString();
                // Assign vacant table in database
                await supabase
                  .from("vip_tables")
                  .update({
                    status: "TAKEN",
                    guest_name: order.guest_name,
                    guest_email: order.guest_email,
                    order_id: orderId,
                    assigned_at: now,
                    bottle_notes: "eSewa VIP package digital allocation"
                  })
                  .eq("id", vacantTable.id);

                // Reflect update locally inside loop
                vacantTable.status = "TAKEN";
                vacantTable.order_id = orderId;
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.warn("DB WARNING: VIP Table synchronization failed, using memory:", err.message || err);
    }
  }

  // Keep in-memory fallback in sync
  for (const [orderId, order] of ordersDatabase.entries()) {
    if (order.status === "PAID" && order.type === "vip") {
      const tableAssigned = dbVIPTables.find(t => t.orderId === orderId);
      if (!tableAssigned) {
        const vacantTable = dbVIPTables.find(t => t.status === "VACANT" && t.category === order.typeName);
        if (vacantTable) {
          vacantTable.status = "TAKEN";
          vacantTable.guestName = order.guestName;
          vacantTable.guestEmail = order.guestEmail;
          vacantTable.orderId = orderId;
          vacantTable.assignedAt = order.verifiedAt || new Date().toISOString();
          vacantTable.bottleNotes = "eSewa VIP package digital allocation";
        }
      }
    }
  }
}

/* =========================================================================
   EVENTS ENDPOINTS
   ========================================================================= */

// Query events
adminRouter.get("/events", async (req: Request, res: Response) => {
  runBackgroundSeeds();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error && data) {
        const mappedEvents: ClubEvent[] = data.map(e => ({
          id: e.id,
          title: e.title,
          date: e.date,
          time: e.time,
          headliner: e.headliner || undefined,
          support: e.support || [],
          subgenre: e.subgenre || undefined,
          bpm: Number(e.bpm),
          ticketPrice: Number(e.ticket_price),
          availableTickets: Number(e.available_tickets),
          accentColor: e.accent_color || undefined,
          rawAccent: e.raw_accent || undefined,
          doorPolicy: e.door_policy || undefined,
          graphicStyle: e.graphic_style || undefined,
          targetDate: e.target_date || undefined,
          gifUrl: e.gif_url || undefined
        }));
        
        // Update local memory cache
        dbEvents = mappedEvents;
        res.json({ success: true, data: mappedEvents });
        return;
      }
    } catch (err: any) {
      console.warn("DB WARNING: Events query failed, using memory:", err.message || err);
    }
  }

  res.json({ success: true, data: dbEvents });
});

// Create or update event
adminRouter.post("/events", async (req: Request, res: Response) => {
  const eventData: Partial<ClubEvent> = req.body;

  if (!eventData.title || !eventData.date || !eventData.time) {
    res.status(400).json({ success: false, error: "Title, date, and time are required." });
    return;
  }

  const existingIdx = dbEvents.findIndex(e => e.id === eventData.id);
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
    gifUrl: eventData.gifUrl || "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExZG5pczByNGNrbXB2OXUwdXR3d3loNzNqdzFycWR2dzBvdWhhczZ5MiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0O9zk3Tq6V1zZ0oE/giphy.gif"
  };

  if (supabase) {
    try {
      const { error } = await supabase
        .from("events")
        .upsert({
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

      if (!error) {
        console.log("DB: Event saved successfully in Supabase.");
      } else {
        console.error("DB ERROR: Failed saving event to Supabase:", error.message);
      }
    } catch (err: any) {
      console.error("DB EXCEPTION: Event saving failed:", err.message || err);
    }
  }

  // Update in-memory fallback
  if (existingIdx > -1) {
    dbEvents[existingIdx] = finalizedEvent;
  } else {
    dbEvents.push(finalizedEvent);
  }

  res.json({ success: true, message: "Event saved successfully", data: finalizedEvent });
});

// Delete event
adminRouter.delete("/events/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (supabase) {
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", id);

      if (!error) {
        console.log(`DB: Deleted event ${id} from Supabase.`);
      } else {
        console.error("DB ERROR: Failed deleting event:", error.message);
      }
    } catch (err: any) {
      console.error("DB EXCEPTION: Event deleting failed:", err.message || err);
    }
  }

  dbEvents = dbEvents.filter(e => e.id !== id);
  res.json({ success: true, message: "Event deleted from registry" });
});

/* =========================================================================
   PHOTOS ENDPOINTS
   ========================================================================= */

// Query photos
adminRouter.get("/photos", async (req: Request, res: Response) => {
  runBackgroundSeeds();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("photo_groups")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const mappedPhotos: PhotoGroup[] = data.map(p => ({
          id: p.id,
          title: p.title,
          date: p.date || undefined,
          description: p.description || undefined,
          coverImage: p.cover_image,
          images: p.images || []
        }));
        
        dbPhotoGroups = mappedPhotos;
        res.json({ success: true, data: mappedPhotos });
        return;
      }
    } catch (err: any) {
      console.warn("DB WARNING: Photos query failed, using memory:", err.message || err);
    }
  }

  res.json({ success: true, data: dbPhotoGroups });
});

// Post/Add image group or images
adminRouter.post("/photos", async (req: Request, res: Response) => {
  const payload = req.body;

  if (!payload.title || !payload.coverImage) {
    res.status(400).json({ success: false, error: "Title and Cover Image are required for photo folders." });
    return;
  }

  const existingIdx = dbPhotoGroups.findIndex(g => g.id === payload.id);
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
      const { error } = await supabase
        .from("photo_groups")
        .upsert({
          id: finalizedGroup.id,
          title: finalizedGroup.title,
          date: finalizedGroup.date,
          description: finalizedGroup.description,
          cover_image: finalizedGroup.coverImage,
          images: finalizedGroup.images
        });

      if (!error) {
        console.log("DB: Photo group saved successfully in Supabase.");
      } else {
        console.error("DB ERROR: Failed saving photo group:", error.message);
      }
    } catch (err: any) {
      console.error("DB EXCEPTION: Photo saving failed:", err.message || err);
    }
  }

  if (existingIdx > -1) {
    dbPhotoGroups[existingIdx] = finalizedGroup;
  } else {
    dbPhotoGroups.unshift(finalizedGroup);
  }

  res.json({ success: true, data: finalizedGroup });
});

// Delete Photo Group
adminRouter.delete("/photos/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (supabase) {
    try {
      const { error } = await supabase
        .from("photo_groups")
        .delete()
        .eq("id", id);

      if (!error) {
        console.log(`DB: Deleted photo group ${id} from Supabase.`);
      } else {
        console.error("DB ERROR: Failed deleting photo group:", error.message);
      }
    } catch (err: any) {
      console.error("DB EXCEPTION: Photo folder deleting failed:", err.message || err);
    }
  }

  dbPhotoGroups = dbPhotoGroups.filter(g => g.id !== id);
  res.json({ success: true, message: "Folder deleted from sensory grid" });
});

/* =========================================================================
   VIP TABLES ENDPOINTS
   ========================================================================= */

// Query tables & check reservation state
adminRouter.get("/tables", async (req: Request, res: Response) => {
  runBackgroundSeeds();
  await syncVIPBookings();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("vip_tables")
        .select("*")
        .order("id", { ascending: true });

      if (!error && data) {
        const mappedTables: VIPTable[] = data.map(t => ({
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

        dbVIPTables = mappedTables;
        res.json({ success: true, data: mappedTables });
        return;
      }
    } catch (err: any) {
      console.warn("DB WARNING: VIP tables query failed, using memory:", err.message || err);
    }
  }

  res.json({ success: true, data: dbVIPTables });
});

// Save or occupy Table
adminRouter.post("/tables", async (req: Request, res: Response) => {
  const data: Partial<VIPTable> = req.body;

  if (!data.name || !data.category) {
    res.status(400).json({ success: false, error: "Table name and category are required." });
    return;
  }

  const existingIdx = dbVIPTables.findIndex(t => t.id === data.id);
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
      const { error } = await supabase
        .from("vip_tables")
        .upsert({
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

      if (!error) {
        console.log("DB: VIP Table state updated in Supabase.");
      } else {
        console.error("DB ERROR: Failed updating VIP table state:", error.message);
      }
    } catch (err: any) {
      console.error("DB EXCEPTION: VIP table save failed:", err.message || err);
    }
  }

  if (existingIdx > -1) {
    dbVIPTables[existingIdx] = finalizedTable;
  } else {
    dbVIPTables.push(finalizedTable);
  }

  res.json({ success: true, data: finalizedTable });
});

// Delete Table
adminRouter.delete("/tables/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (supabase) {
    try {
      const { error } = await supabase
        .from("vip_tables")
        .delete()
        .eq("id", id);

      if (!error) {
        console.log(`DB: Deleted VIP table ${id} from Supabase.`);
      } else {
        console.error("DB ERROR: Failed deleting VIP table:", error.message);
      }
    } catch (err: any) {
      console.error("DB EXCEPTION: VIP table deletion failed:", err.message || err);
    }
  }

  dbVIPTables = dbVIPTables.filter(t => t.id !== id);
  res.json({ success: true, message: "Table removed from registry" });
});

/* =========================================================================
   ORDERS DATABASE & QR CHECK-INS
   ========================================================================= */

// Get all orders (including simulated ones)
adminRouter.get("/orders", async (req: Request, res: Response) => {
  if (supabase) {
    try {
      // Fetch all orders
      const { data: dbOrders, error: ordersError } = await supabase
        .from("orders")
        .select("*");

      // Fetch checkins
      const { data: dbCheckins, error: checkinsError } = await supabase
        .from("checkins")
        .select("*");

      if (!ordersError && dbOrders) {
        const ordersList = dbOrders.map(o => {
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
            transactionCode: o.transaction_code || undefined,
            verifiedAt: o.verified_at || undefined,
            checkedIn: scan.checked_in,
            checkedInAt: scan.checked_in_at || undefined
          };
        });

        // Sync local memory database
        ordersList.forEach(item => {
          ordersDatabase.set(item.orderId, {
            orderId: item.orderId,
            amount: item.amount,
            guestName: item.guestName,
            guestEmail: item.guestEmail,
            type: item.type as "ticket" | "vip",
            typeName: item.typeName,
            count: item.count,
            status: item.status as "PENDING" | "PAID" | "FAILED",
            transactionCode: item.transactionCode,
            verifiedAt: item.verifiedAt
          });
          
          orderCheckins.set(item.orderId, {
            checkedIn: item.checkedIn,
            checkedInAt: item.checkedInAt
          });
        });

        ordersList.sort((a, b) => b.orderId.localeCompare(a.orderId));
        res.json({ success: true, data: ordersList });
        return;
      }
    } catch (err: any) {
      console.warn("DB WARNING: Orders fetching failed, using memory:", err.message || err);
    }
  }

  // Memory fallback
  const ordersList: any[] = [];
  ordersDatabase.forEach((order, key) => {
    const scanStatus = orderCheckins.get(key) || { checkedIn: false };
    ordersList.push({
      ...order,
      checkedIn: scanStatus.checkedIn,
      checkedInAt: scanStatus.checkedInAt
    });
  });

  ordersList.sort((a, b) => b.orderId.localeCompare(a.orderId));
  res.json({ success: true, data: ordersList });
});

// Scan / Verify QR Code check-in
adminRouter.post("/orders/verify-qr", async (req: Request, res: Response) => {
  const { orderId } = req.body;

  if (!orderId) {
    res.status(400).json({ success: false, error: "Order ID is mandatory to confirm validation." });
    return;
  }

  // Use memory lookup if Supabase is offline
  let order: any = null;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("order_id", orderId)
        .maybeSingle();

      if (!error && data) {
        order = {
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
    } catch (err: any) {
      console.warn("DB WARNING: Order lookup during verify failed, checking memory:", err.message || err);
    }
  }

  // Fallback to memory
  if (!order) {
    order = ordersDatabase.get(orderId);
  }

  if (!order) {
    res.status(404).json({ success: false, error: "QR Code unrecognized. Secure database contains no record for this pass." });
    return;
  }

  if (order.status !== "PAID") {
    res.status(400).json({ 
      success: false, 
      error: `Pass belongs to incomplete status: ${order.status}`,
      order 
    });
    return;
  }

  // Check checkins table
  let existingCheckin: { checkedIn: boolean; checkedInAt?: string } | null = null;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("checkins")
        .select("*")
        .eq("order_id", orderId)
        .maybeSingle();

      if (!error && data) {
        existingCheckin = {
          checkedIn: data.checked_in,
          checkedInAt: data.checked_in_at || undefined
        };
      }
    } catch (err: any) {
      console.warn("DB WARNING: Checkin lookup failed, using memory:", err.message || err);
    }
  }

  if (!existingCheckin) {
    existingCheckin = orderCheckins.get(orderId) || null;
  }

  if (existingCheckin?.checkedIn) {
    res.status(409).json({ 
      success: false, 
      error: "TICKET ALREADY SCAN-CLAIMED", 
      message: `Already validated on ${new Date(existingCheckin.checkedInAt!).toLocaleTimeString()}`,
      order,
      checkedInAt: existingCheckin.checkedInAt
    });
    return;
  }

  const now = new Date().toISOString();

  // Record checkin in Supabase
  if (supabase) {
    try {
      await supabase
        .from("checkins")
        .upsert({
          order_id: orderId,
          checked_in: true,
          checked_in_at: now
        });
    } catch (err: any) {
      console.error("DB EXCEPTION: Saving checkin failed:", err.message || err);
    }
  }

  // Record locally
  orderCheckins.set(orderId, {
    checkedIn: true,
    checkedInAt: now
  });

  res.json({
    success: true,
    message: "TICKET VALIDATED & ACCESS AUTHORIZED",
    order: {
      ...order,
      checkedIn: true,
      checkedInAt: now
    }
  });
});

// Reset checkin state or manually edit status
adminRouter.post("/orders/manually-set-paid", async (req: Request, res: Response) => {
  const { orderId, status, checkedIn } = req.body;
  const isPaid = (status || "PAID") === "PAID";
  const verifiedTime = new Date().toISOString();
  
  let orderObj: any = null;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("order_id", orderId)
        .maybeSingle();

      if (!error && data) {
        orderObj = data;
      }
    } catch (err: any) {
      console.warn("DB WARNING: Manually set paid query lookup failed:", err.message || err);
    }
  }

  if (!orderObj) {
    orderObj = ordersDatabase.get(orderId);
  }

  const finalizedOrder = orderObj
    ? {
        orderId: orderObj.orderId || orderObj.order_id,
        amount: Number(orderObj.amount),
        guestName: orderObj.guestName || orderObj.guest_name,
        guestEmail: orderObj.guestEmail || orderObj.guest_email,
        type: orderObj.type as "ticket" | "vip",
        typeName: orderObj.typeName || orderObj.type_name,
        count: Number(orderObj.count),
        status: (status || "PAID") as "PENDING" | "PAID" | "FAILED",
        transactionCode: orderObj.transactionCode || orderObj.transaction_code || "MANUAL_APPROVAL",
        verifiedAt: orderObj.verifiedAt || orderObj.verified_at || (isPaid ? verifiedTime : undefined)
      }
    : {
        orderId,
        amount: 2000,
        guestName: "MANUALLY APPROVED GUEST",
        guestEmail: "admin@club-xo.com",
        type: "ticket" as "ticket" | "vip",
        typeName: "XO GENERAL TICKET",
        count: 1,
        status: (status || "PAID") as "PENDING" | "PAID" | "FAILED",
        transactionCode: "MANUAL_APPROVAL",
        verifiedAt: isPaid ? verifiedTime : undefined
      };

  // 1. Save order
  if (supabase) {
    try {
      await supabase
        .from("orders")
        .upsert({
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
    } catch (err: any) {
      console.error("DB EXCEPTION: Saving manual paid order failed:", err.message || err);
    }
  }
  ordersDatabase.set(orderId, finalizedOrder);

  // 2. Save checkin
  if (checkedIn !== undefined) {
    const isChecked = !!checkedIn;
    const checkinTime = isChecked ? new Date().toISOString() : null;

    if (supabase) {
      try {
        if (isChecked) {
          await supabase
            .from("checkins")
            .upsert({
              order_id: orderId,
              checked_in: true,
              checked_in_at: checkinTime
            });
        } else {
          await supabase
            .from("checkins")
            .delete()
            .eq("order_id", orderId);
        }
      } catch (err: any) {
        console.error("DB EXCEPTION: Saving manual checkin failed:", err.message || err);
      }
    }
    
    orderCheckins.set(orderId, {
      checkedIn: isChecked,
      checkedInAt: checkinTime || undefined
    });
  }

  res.json({ success: true, message: "Order records updated" });
});
