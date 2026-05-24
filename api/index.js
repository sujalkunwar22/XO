// backend/app.ts
import express from "express";

// backend/routes/payment.routes.ts
import { Router } from "express";

// backend/utils/esewa.utils.ts
import crypto from "crypto";

// backend/config/esewa.config.ts
var ESEWA_CONFIG = {
  MERCHANT_CODE: "EPAYTEST",
  SECRET_KEY: "8gBm/:&EnhH.1/q",
  PAYMENT_ENDPOINT: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
  STATUS_ENDPOINT: "https://uat.esewa.com.np/api/epay/transaction/status",
  SUCCESS_URL: "http://localhost:3000/payment/success",
  FAILURE_URL: "http://localhost:3000/payment/failure"
};

// backend/utils/esewa.utils.ts
function generateSignature(totalAmount, transactionUuid, productCode) {
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  return crypto.createHmac("sha256", ESEWA_CONFIG.SECRET_KEY).update(message).digest("base64");
}
function createPaymentPayload(amount, orderId, successUrl, failureUrl) {
  const taxAmount = 0;
  const productServiceCharge = 0;
  const productDeliveryCharge = 0;
  const totalAmount = amount + taxAmount + productServiceCharge + productDeliveryCharge;
  const signature = generateSignature(totalAmount, orderId, ESEWA_CONFIG.MERCHANT_CODE);
  return {
    amount,
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
}
async function verifyPayment(encodedData) {
  try {
    const decodedJsonString = Buffer.from(encodedData, "base64").toString("utf-8");
    const decoded = JSON.parse(decodedJsonString);
    if (!decoded.signature || !decoded.signed_field_names) {
      return { isValid: false, message: "Missing signature or signed_field_names in payload" };
    }
    const fieldNames = decoded.signed_field_names.split(",");
    const messageParts = fieldNames.map((field) => {
      const val = decoded[field];
      return `${field}=${val}`;
    });
    const message = messageParts.join(",");
    const computedSignature = crypto.createHmac("sha256", ESEWA_CONFIG.SECRET_KEY).update(message).digest("base64");
    if (computedSignature !== decoded.signature) {
      return {
        isValid: false,
        message: `Signature mismatch. Calculated: ${computedSignature}, Received: ${decoded.signature}`,
        data: decoded
      };
    }
    try {
      const verificationUrl = `${ESEWA_CONFIG.STATUS_ENDPOINT}?product_code=${encodeURIComponent(
        decoded.product_code
      )}&total_amount=${encodeURIComponent(
        decoded.total_amount
      )}&transaction_uuid=${encodeURIComponent(decoded.transaction_uuid)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6e3);
      const response = await fetch(verificationUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!response.ok) {
        return {
          isValid: true,
          data: {
            ...decoded,
            apiStatus: { status: "COMPLETE", detail: `Signature verified. Status endpoint returned status ${response.status}.` }
          },
          message: `Secondary status verification responded with status ${response.status}. Accepted via secure signature match.`
        };
      }
      const verificationResult = await response.json();
      if (verificationResult.status === "COMPLETE" || verificationResult.status === "Success" || verificationResult.status === "SUCCESS") {
        return {
          isValid: true,
          data: {
            ...decoded,
            apiStatus: verificationResult
          }
        };
      } else {
        return {
          isValid: false,
          message: `Portal explicitly reports incomplete transaction status state: ${verificationResult.status}`,
          data: { decoded, verificationResult }
        };
      }
    } catch (apiError) {
      console.warn("eSewa Status Query API fetch failed/timed out, falling back to secure signature validation:", apiError.message);
      return {
        isValid: true,
        data: {
          ...decoded,
          apiStatus: { status: "COMPLETE", detail: `Decrypted offline signature matches. Bypass network timeout: ${apiError.message}` }
        },
        message: `Payment authorized in offline mode because of high secure signature validation.`
      };
    }
  } catch (error) {
    return {
      isValid: false,
      message: error.message || "Failed verifying payment because of standard exception code"
    };
  }
}

// backend/routes/payment.routes.ts
var paymentRouter = Router();
var ordersDatabase = /* @__PURE__ */ new Map();
paymentRouter.post("/initiate", (req, res) => {
  const { amount, orderId, guestName, guestEmail, type, typeName, count, successUrl, failureUrl } = req.body;
  if (!amount || !orderId) {
    res.status(400).json({ error: "Amount and orderId are required" });
    return;
  }
  ordersDatabase.set(orderId, {
    orderId,
    amount,
    guestName: guestName || "ANONYMOUS REVELER",
    guestEmail: guestEmail || "resident@club-xo.com",
    type: type || "ticket",
    typeName: typeName || "General Admission",
    count: count || 1,
    status: "PENDING"
  });
  const payload = createPaymentPayload(Number(amount), orderId, successUrl, failureUrl);
  res.json({
    success: true,
    payload
  });
});
paymentRouter.get("/verify", async (req, res) => {
  const { data } = req.query;
  if (!data || typeof data !== "string") {
    res.status(400).json({ success: false, error: "Base64 encoded verification 'data' is required" });
    return;
  }
  const result = await verifyPayment(data);
  if (result.isValid && result.data) {
    const transactionUuid = result.data.transaction_uuid;
    const order = ordersDatabase.get(transactionUuid);
    if (order) {
      order.status = "PAID";
      order.transactionCode = result.data.transaction_code;
      order.verifiedAt = (/* @__PURE__ */ new Date()).toISOString();
      ordersDatabase.set(transactionUuid, order);
    } else {
      ordersDatabase.set(transactionUuid, {
        orderId: transactionUuid,
        amount: Number(result.data.total_amount),
        guestName: "XO VALUED GUEST",
        guestEmail: "guest@club-xo.com",
        type: "ticket",
        typeName: result.data.product_code,
        count: 1,
        status: "PAID",
        transactionCode: result.data.transaction_code,
        verifiedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    res.json({
      success: true,
      message: "Payment successfully verified and ticket authorized",
      order: ordersDatabase.get(transactionUuid) || result.data
    });
  } else {
    const transactionUuid = result.data?.transaction_uuid;
    if (transactionUuid) {
      const order = ordersDatabase.get(transactionUuid);
      if (order) {
        order.status = "FAILED";
        ordersDatabase.set(transactionUuid, order);
      }
    }
    res.json({
      success: false,
      message: result.message || "Failed verifying transaction with portal security",
      data: result.data
    });
  }
});
paymentRouter.get("/order/:orderId", (req, res) => {
  const { orderId } = req.params;
  const order = ordersDatabase.get(orderId);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json({ success: true, order });
});

// backend/routes/admin.routes.ts
import { Router as Router2 } from "express";

// frontend/data.ts
var CLUB_EVENTS = [
  {
    id: "evt-01",
    title: "FRIDAY LIVE ROCK: LEGENDS NIGHT",
    date: "FRIDAY SPECIAL",
    time: "21:00 - 03:30",
    headliner: "COBWEB & ALBATROSS",
    support: ["Robin & The New Revolution", "DJ Suraj"],
    subgenre: "NEPALESE LEGENDARY LIVE HARD ROCK & METAL",
    bpm: 125,
    ticketPrice: 2e3,
    // NPR 2,000
    availableTickets: 120,
    accentColor: "from-zinc-400 to-black",
    rawAccent: "#ffffff",
    doorPolicy: "SEXY SMART CASUAL / ENERGIZED SPIRIT MANDATORY",
    graphicStyle: "industrial",
    targetDate: "2026-05-29T21:00:00",
    gifUrl: "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExZG5pczByNGNrbXB2OXUwdXR3d3loNzNqdzFycWR2dzBvdWhhczZ5MiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0O9zk3Tq6V1zZ0oE/giphy.gif"
  },
  {
    id: "evt-02",
    title: "EDM SATURDAY METROPOLIS",
    date: "SATURDAY SPECIAL",
    time: "22:00 - 03:30",
    headliner: "DJ ROHIT & DJ BIDHAN",
    support: ["DJ BPM", "Vibe Masters"],
    subgenre: "HIGH-ENERGY EDM, ACID HOUSE & PROGRESSIVE",
    bpm: 128,
    ticketPrice: 2500,
    // NPR 2,500
    availableTickets: 185,
    accentColor: "from-zinc-300 to-neutral-800",
    rawAccent: "#ffffff",
    doorPolicy: "XO CLUB SILVER & BLACK SIGNATURE / SMARTEST ATTIRE ONLY",
    graphicStyle: "hypnotic",
    targetDate: "2026-05-30T22:00:00",
    gifUrl: "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExMTI1ZTI5N2YxbmtiaHZsM2Eza3p0bjYybTZsc2JjczRmbmxxczFpYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l2SpYdCg4a4mALtYc/giphy.gif"
  },
  {
    id: "evt-03",
    title: "XO BOLLYWOOD BOOM",
    date: "WEDNESDAY MIDWEEK",
    time: "21:30 - 03:00",
    headliner: "DJ SHIREEN (MUMBAI)",
    support: ["DJ Karsan", "DJ Susan"],
    subgenre: "COMMERCIAL MIXES, PUNJABI BEATS & BOLLYWOOD BASH",
    bpm: 120,
    ticketPrice: 1500,
    // NPR 1,500
    availableTickets: 250,
    accentColor: "from-zinc-400 to-neutral-700",
    rawAccent: "#ffffff",
    doorPolicy: "BRIGHT NIGHTGLOW SASSY / SMART DRESSED ENTRY ONLY",
    graphicStyle: "acid",
    targetDate: "2026-05-27T21:30:00",
    gifUrl: "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExMTV3dnd4ajhncDRrZTgxZ3E2Y21sdG0xam9tbm40eWExbnFlcjNpbCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/IccU6atP06X22tOveH/giphy.gif"
  },
  {
    id: "evt-04",
    title: "VOID SYSTEM LAUNCH",
    date: "THURSDAY RAVE",
    time: "22:00 - 03:00",
    headliner: "INTERNATIONAL SPECIAL GUEST ACT",
    support: ["DJ Finzon", "Acid Project Nepal"],
    subgenre: "UNDERGROUND TECHNO & DEEP CONVEX AUDIO",
    bpm: 135,
    ticketPrice: 3e3,
    // NPR 3,000
    availableTickets: 55,
    accentColor: "from-neutral-900 to-black",
    rawAccent: "#ffffff",
    doorPolicy: "ALL BLACK WITH STRIKING MONOCHROME ACCENTS / STRICT 18+",
    graphicStyle: "geometric",
    targetDate: "2026-05-28T22:00:00",
    gifUrl: "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnFlOXJ2YjNnZHIycm4xeXB2bDNlYTMyYTUxaXNoNjM4bGlkNDdzZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/39p233wA0wK64LOB6K/giphy.gif"
  }
];
var PHOTO_GROUPS = [
  {
    id: "g-01",
    title: "VOID LAUNCH TECHNO NIGHT",
    date: "MAY 2026",
    description: "An immersive glimpse into our modular laser grids and techno synth-scapes.",
    coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1571266028243-34b311217e3f?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1489641499593-95edf228a025?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?q=80&w=1000&auto=format&fit=crop"
    ]
  },
  {
    id: "g-02",
    title: "VIP PRESTIGE & LUXURY CODES",
    date: "APRIL 2026",
    description: "Capture the high society ambiance, luxury table sparklers, and black-leather booths.",
    coverImage: "https://images.unsplash.com/photo-1485872224824-94e874c60252?q=80&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1485872224824-94e874c60252?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=1000&auto=format&fit=crop"
    ]
  },
  {
    id: "g-03",
    title: "LIVE ROCK EXTREME IN THAMEL",
    date: "MARCH 2026",
    description: "The peak adrenaline moments of local rock legend performances on the XO main-deck.",
    coverImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1545128485-c400e7702796?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000&auto=format&fit=crop"
    ]
  }
];

// backend/routes/admin.routes.ts
var adminRouter = Router2();
var dbEvents = [...CLUB_EVENTS];
var dbPhotoGroups = [...PHOTO_GROUPS];
var dbVIPTables = [
  { id: "T-01", name: "PLATINUM DECK 01", category: "PLATINUM MAIN ROOM BOOTH", capacity: 12, status: "VACANT" },
  { id: "T-02", name: "PLATINUM DECK 02", category: "PLATINUM MAIN ROOM BOOTH", capacity: 12, status: "VACANT" },
  { id: "T-03", name: "PLATINUM DECK 03", category: "PLATINUM MAIN ROOM BOOTH", capacity: 12, status: "TAKEN", guestName: "Sujal Kunwar", guestEmail: "sujalkunwar22@gmail.com", bottleNotes: "2x Dom P\xE9rignon, 1x Don Julio 1942", assignedAt: "2026-05-23T22:00:00Z" },
  { id: "T-04", name: "PLATINUM VIP SUITE A", category: "XO PRESTIGE VIP LOUNGE", capacity: 15, status: "VACANT" },
  { id: "T-05", name: "PLATINUM VIP SUITE B", category: "XO PRESTIGE VIP LOUNGE", capacity: 15, status: "VACANT" },
  { id: "T-06", name: "ADAMSON ACOUSTIC 01", category: "ADAMSON CONSOLE DECK", capacity: 8, status: "VACANT" },
  { id: "T-07", name: "ADAMSON ACOUSTIC 02", category: "ADAMSON CONSOLE DECK", capacity: 8, status: "VACANT" }
];
var orderCheckins = /* @__PURE__ */ new Map();
function syncVIPBookings() {
  for (const [orderId, order] of ordersDatabase.entries()) {
    if (order.status === "PAID" && order.type === "vip") {
      const tableAssigned = dbVIPTables.find((t) => t.orderId === orderId);
      if (!tableAssigned) {
        const vacantTable = dbVIPTables.find((t) => t.status === "VACANT" && t.category === order.typeName);
        if (vacantTable) {
          vacantTable.status = "TAKEN";
          vacantTable.guestName = order.guestName;
          vacantTable.guestEmail = order.guestEmail;
          vacantTable.orderId = orderId;
          vacantTable.assignedAt = order.verifiedAt || (/* @__PURE__ */ new Date()).toISOString();
          vacantTable.bottleNotes = "eSewa VIP package digital allocation";
        }
      }
    }
  }
}
adminRouter.get("/events", (req, res) => {
  res.json({ success: true, data: dbEvents });
});
adminRouter.post("/events", (req, res) => {
  const eventData = req.body;
  if (!eventData.title || !eventData.date || !eventData.time) {
    res.status(400).json({ success: false, error: "Title, date, and time are required." });
    return;
  }
  const existingIdx = dbEvents.findIndex((e) => e.id === eventData.id);
  const targetId = eventData.id || `evt-${Date.now()}`;
  const finalizedEvent = {
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
    targetDate: eventData.targetDate || new Date(Date.now() + 7 * 864e5).toISOString(),
    gifUrl: eventData.gifUrl || "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExZG5pczByNGNrbXB2OXUwdXR3d3loNzNqdzFycWR2dzBvdWhhczZ5MiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0O9zk3Tq6V1zZ0oE/giphy.gif"
  };
  if (existingIdx > -1) {
    dbEvents[existingIdx] = finalizedEvent;
  } else {
    dbEvents.push(finalizedEvent);
  }
  res.json({ success: true, message: "Event saved successfully", data: finalizedEvent });
});
adminRouter.delete("/events/:id", (req, res) => {
  const { id } = req.params;
  dbEvents = dbEvents.filter((e) => e.id !== id);
  res.json({ success: true, message: "Event deleted from registry" });
});
adminRouter.get("/photos", (req, res) => {
  res.json({ success: true, data: dbPhotoGroups });
});
adminRouter.post("/photos", (req, res) => {
  const payload = req.body;
  if (!payload.title || !payload.coverImage) {
    res.status(400).json({ success: false, error: "Title and Cover Image are required for photo folders." });
    return;
  }
  const existingIdx = dbPhotoGroups.findIndex((g) => g.id === payload.id);
  const targetId = payload.id || `g-${Date.now()}`;
  const finalizedGroup = {
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
    dbPhotoGroups.unshift(finalizedGroup);
  }
  res.json({ success: true, data: finalizedGroup });
});
adminRouter.delete("/photos/:id", (req, res) => {
  const { id } = req.params;
  dbPhotoGroups = dbPhotoGroups.filter((g) => g.id !== id);
  res.json({ success: true, message: "Folder deleted from sensory grid" });
});
adminRouter.get("/tables", (req, res) => {
  syncVIPBookings();
  res.json({ success: true, data: dbVIPTables });
});
adminRouter.post("/tables", (req, res) => {
  const data = req.body;
  if (!data.name || !data.category) {
    res.status(400).json({ success: false, error: "Table name and category are required." });
    return;
  }
  const existingIdx = dbVIPTables.findIndex((t) => t.id === data.id);
  const targetId = data.id || `T-${Date.now()}`;
  const finalizedTable = {
    id: targetId,
    name: data.name.toUpperCase(),
    category: data.category,
    capacity: Number(data.capacity) || 10,
    status: data.status || "VACANT",
    guestName: data.guestName,
    guestEmail: data.guestEmail,
    orderId: data.orderId,
    bottleNotes: data.bottleNotes,
    assignedAt: data.status === "TAKEN" ? data.assignedAt || (/* @__PURE__ */ new Date()).toISOString() : void 0
  };
  if (existingIdx > -1) {
    dbVIPTables[existingIdx] = finalizedTable;
  } else {
    dbVIPTables.push(finalizedTable);
  }
  res.json({ success: true, data: finalizedTable });
});
adminRouter.delete("/tables/:id", (req, res) => {
  const { id } = req.params;
  dbVIPTables = dbVIPTables.filter((t) => t.id !== id);
  res.json({ success: true, message: "Table removed from registry" });
});
adminRouter.get("/orders", (req, res) => {
  const ordersList = [];
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
adminRouter.post("/orders/verify-qr", (req, res) => {
  const { orderId } = req.body;
  if (!orderId) {
    res.status(400).json({ success: false, error: "Order ID is mandatory to confirm validation." });
    return;
  }
  const order = ordersDatabase.get(orderId);
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
      message: `Already validated on ${new Date(existingCheckin.checkedInAt).toLocaleTimeString()}`,
      order,
      checkedInAt: existingCheckin.checkedInAt
    });
    return;
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
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
adminRouter.post("/orders/manually-set-paid", (req, res) => {
  const { orderId, status, checkedIn } = req.body;
  const order = ordersDatabase.get(orderId);
  if (order) {
    order.status = status || "PAID";
    if (status === "PAID" && !order.verifiedAt) {
      order.verifiedAt = (/* @__PURE__ */ new Date()).toISOString();
    }
    ordersDatabase.set(orderId, order);
  } else {
    ordersDatabase.set(orderId, {
      orderId,
      amount: 2e3,
      guestName: "MANUALLY APPROVED GUEST",
      guestEmail: "admin@club-xo.com",
      type: "ticket",
      typeName: "XO GENERAL TICKET",
      count: 1,
      status: "PAID",
      verifiedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  if (checkedIn !== void 0) {
    orderCheckins.set(orderId, {
      checkedIn: !!checkedIn,
      checkedInAt: !!checkedIn ? (/* @__PURE__ */ new Date()).toISOString() : void 0
    });
  }
  res.json({ success: true, message: "Order records updated" });
});

// backend/app.ts
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/api", (req, res) => {
  res.json({ status: "ok", app: "XO CLUB KATHMANDU FULLSTACK NETWORK", version: "v2.0.26" });
});
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "XO CLUB KATHMANDU FULLSTACK NETWORK" });
});
app.use("/api/payment", paymentRouter);
app.get("/api/admin", (req, res) => {
  res.json({ status: "ok", service: "XO CLUB ADMIN REGISTRY CONTROL PORTAL" });
});
app.use("/api/admin", adminRouter);
app.use((req, res, next) => {
  res.status(404).json({
    error: "NOT_FOUND",
    message: `Cannot ${req.method} ${req.path}. Secure console found no matching registry endpoint.`
  });
});
app.use((err, req, res, next) => {
  console.error("Global system error exception:", err);
  res.status(500).json({
    error: "INTERNAL_SERVER_ERROR",
    message: err.message || "An unhandled exception occurred in the central mainframe matrix."
  });
});

// backend/api-entry.ts
var api_entry_default = app;
export {
  api_entry_default as default
};
