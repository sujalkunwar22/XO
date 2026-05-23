import { Router, Request, Response } from "express";
import { ClubEvent, VIPPackage, PhotoGroup } from "../../frontend/types";
import { CLUB_EVENTS, VIP_PACKAGES, PHOTO_GROUPS } from "../../frontend/data";
import { ordersDatabase } from "./payment.routes";

export const adminRouter = Router();

// Express 5.0 compatible routing support
// Real-time backend database representations loaded in-memory
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

// Extend OrderRecord check-in metadata
export const orderCheckins: Map<string, { checkedIn: boolean; checkedInAt?: string }> = new Map();

// Helper to check and autocheck paid VIP bookings into tables
function syncVIPBookings() {
  for (const [orderId, order] of ordersDatabase.entries()) {
    if (order.status === "PAID" && order.type === "vip") {
      // Find matches in VIP Tables - if already mapped, skip
      const tableAssigned = dbVIPTables.find(t => t.orderId === orderId);
      if (!tableAssigned) {
        // Automatically occupy a vacant table of matching category
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
adminRouter.get("/events", (req: Request, res: Response) => {
  res.json({ success: true, data: dbEvents });
});

// Create or update event
adminRouter.post("/events", (req: Request, res: Response) => {
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

  if (existingIdx > -1) {
    dbEvents[existingIdx] = finalizedEvent;
  } else {
    dbEvents.push(finalizedEvent);
  }

  res.json({ success: true, message: "Event saved successfully", data: finalizedEvent });
});

// Delete event
adminRouter.delete("/events/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  dbEvents = dbEvents.filter(e => e.id !== id);
  res.json({ success: true, message: "Event deleted from registry" });
});


/* =========================================================================
   PHOTOS ENDPOINTS
   ========================================================================= */

// Query photos
adminRouter.get("/photos", (req: Request, res: Response) => {
  res.json({ success: true, data: dbPhotoGroups });
});

// Post/Add image group or images
adminRouter.post("/photos", (req: Request, res: Response) => {
  const payload = req.body; // { id?, title, date, description, coverImage, images: [] }

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

  if (existingIdx > -1) {
    dbPhotoGroups[existingIdx] = finalizedGroup;
  } else {
    dbPhotoGroups.unshift(finalizedGroup); // put newest first
  }

  res.json({ success: true, data: finalizedGroup });
});

// Delete Photo Group
adminRouter.delete("/photos/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  dbPhotoGroups = dbPhotoGroups.filter(g => g.id !== id);
  res.json({ success: true, message: "Folder deleted from sensory grid" });
});


/* =========================================================================
   VIP TABLES ENDPOINTS
   ========================================================================= */

// Query tables & check reservation state
adminRouter.get("/tables", (req: Request, res: Response) => {
  syncVIPBookings();
  res.json({ success: true, data: dbVIPTables });
});

// Save or occupy Table
adminRouter.post("/tables", (req: Request, res: Response) => {
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

  if (existingIdx > -1) {
    dbVIPTables[existingIdx] = finalizedTable;
  } else {
    dbVIPTables.push(finalizedTable);
  }

  res.json({ success: true, data: finalizedTable });
});

// Delete Table
adminRouter.delete("/tables/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  dbVIPTables = dbVIPTables.filter(t => t.id !== id);
  res.json({ success: true, message: "Table removed from registry" });
});


/* =========================================================================
   ORDERS DATABASE & QR CHECK-INS
   ========================================================================= */

// Get all orders (including simulated ones)
adminRouter.get("/orders", (req: Request, res: Response) => {
  const ordersList: any[] = [];
  
  ordersDatabase.forEach((order, key) => {
    const scanStatus = orderCheckins.get(key) || { checkedIn: false };
    ordersList.push({
      ...order,
      checkedIn: scanStatus.checkedIn,
      checkedInAt: scanStatus.checkedInAt
    });
  });

  // Sort by verified time or orderId desc
  ordersList.sort((a, b) => b.orderId.localeCompare(a.orderId));

  res.json({ success: true, data: ordersList });
});

// Scan / Verify QR Code check-in
adminRouter.post("/orders/verify-qr", (req: Request, res: Response) => {
  const { orderId } = req.body;

  if (!orderId) {
    res.status(400).json({ success: false, error: "Order ID is mandatory to confirm validation." });
    return;
  }

  const order = ordersDatabase.get(orderId);

  // Fallback support if they check custom simulated offline orders
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

  const existingCheckin = orderCheckins.get(orderId);
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

  // Record successful checkin
  const now = new Date().toISOString();
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
adminRouter.post("/orders/manually-set-paid", (req: Request, res: Response) => {
  const { orderId, status, checkedIn } = req.body;
  
  const order = ordersDatabase.get(orderId);
  if (order) {
    order.status = status || "PAID";
    if (status === "PAID" && !order.verifiedAt) {
      order.verifiedAt = new Date().toISOString();
    }
    ordersDatabase.set(orderId, order);
  } else {
    // Add dynamically
    ordersDatabase.set(orderId, {
      orderId,
      amount: 2000,
      guestName: "MANUALLY APPROVED GUEST",
      guestEmail: "admin@club-xo.com",
      type: "ticket",
      typeName: "XO GENERAL TICKET",
      count: 1,
      status: "PAID",
      verifiedAt: new Date().toISOString()
    });
  }

  if (checkedIn !== undefined) {
    orderCheckins.set(orderId, {
      checkedIn: !!checkedIn,
      checkedInAt: !!checkedIn ? new Date().toISOString() : undefined
    });
  }

  res.json({ success: true, message: "Order records updated" });
});
