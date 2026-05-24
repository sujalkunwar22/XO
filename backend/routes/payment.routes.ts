import { Router, Request, Response } from "express";
import { createPaymentPayload, verifyPayment } from "../utils/esewa.utils";
import { supabase } from "../config/database.config";

export const paymentRouter = Router();

// In-Memory store for ticket orders and reservations (acting as fallback)
export interface OrderRecord {
  orderId: string;
  amount: number;
  guestName: string;
  guestEmail: string;
  type: "ticket" | "vip";
  typeName: string; // Event title or table name
  count: number;
  status: "PENDING" | "PAID" | "FAILED";
  transactionCode?: string;
  verifiedAt?: string;
}

export const ordersDatabase: Map<string, OrderRecord> = new Map();

// Helper to retrieve an order with hybrid fallback
export async function getOrderRecord(orderId: string): Promise<OrderRecord | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("order_id", orderId)
        .maybeSingle();

      if (!error && data) {
        return {
          orderId: data.order_id,
          amount: Number(data.amount),
          guestName: data.guest_name,
          guestEmail: data.guest_email,
          type: data.type,
          typeName: data.type_name,
          count: Number(data.count),
          status: data.status,
          transactionCode: data.transaction_code || undefined,
          verifiedAt: data.verified_at || undefined
        };
      }
    } catch (err: any) {
      console.warn("DB WARNING: Supabase query failed, falling back to local memory:", err.message || err);
    }
  }
  return ordersDatabase.get(orderId) || null;
}

// Helper to save/update an order with hybrid fallback
export async function saveOrderRecord(order: OrderRecord): Promise<void> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from("orders")
        .upsert({
          order_id: order.orderId,
          amount: order.amount,
          guest_name: order.guestName,
          guest_email: order.guestEmail,
          type: order.type,
          type_name: order.typeName,
          count: order.count,
          status: order.status,
          transaction_code: order.transactionCode || null,
          verified_at: order.verifiedAt || null
        });

      if (!error) {
        // Keep in-memory in sync too for super fast queries
        ordersDatabase.set(order.orderId, order);
        return;
      }
      console.error("DB ERROR: Failed saving order to Supabase:", error.message);
    } catch (err: any) {
      console.error("DB EXCEPTION: Failed saving order to Supabase, writing to memory:", err.message || err);
    }
  }
  ordersDatabase.set(order.orderId, order);
}

/**
 * Endpoint to initiate eSewa deposit payload
 */
paymentRouter.post("/initiate", async (req: Request, res: Response): Promise<void> => {
  const { amount, orderId, guestName, guestEmail, type, typeName, count, successUrl, failureUrl } = req.body;

  if (!amount || !orderId) {
    res.status(400).json({ error: "Amount and orderId are required" });
    return;
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

  // Create or update record in database
  await saveOrderRecord(record);

  // Calculate eSewa payload details with dynamic redirect urls
  const payload = createPaymentPayload(Number(amount), orderId, successUrl, failureUrl);

  res.json({
    success: true,
    payload
  });
});

/**
 * Endpoint to verify payment query data from eSewa redirect
 */
paymentRouter.get("/verify", async (req: Request, res: Response): Promise<void> => {
  const { data } = req.query;

  if (!data || typeof data !== "string") {
    res.status(400).json({ success: false, error: "Base64 encoded verification 'data' is required" });
    return;
  }

  const result = await verifyPayment(data);

  if (result.isValid && result.data) {
    const transactionUuid = result.data.transaction_uuid;
    const order = await getOrderRecord(transactionUuid);

    const updatedOrder: OrderRecord = order 
      ? {
          ...order,
          status: "PAID",
          transactionCode: result.data.transaction_code,
          verifiedAt: new Date().toISOString()
        }
      : {
          orderId: transactionUuid,
          amount: Number(result.data.total_amount),
          guestName: "XO GUEST",
          guestEmail: "guest@club-xo.com",
          type: "ticket",
          typeName: result.data.product_code || "eSewa Direct Payment",
          count: 1,
          status: "PAID",
          transactionCode: result.data.transaction_code,
          verifiedAt: new Date().toISOString()
        };

    await saveOrderRecord(updatedOrder);

    res.json({
      success: true,
      message: "Payment successfully verified and ticket authorized",
      order: updatedOrder
    });
  } else {
    // If signature fails or status incomplete
    const transactionUuid = result.data?.transaction_uuid;
    if (transactionUuid) {
      const order = await getOrderRecord(transactionUuid);
      if (order) {
        order.status = "FAILED";
        await saveOrderRecord(order);
      }
    }

    res.json({
      success: false,
      message: result.message || "Failed verifying transaction with portal security",
      data: result.data
    });
  }
});

/**
 * Route to fetch active order details directly by orderId
 */
paymentRouter.get("/order/:orderId", async (req: Request, res: Response): Promise<void> => {
  const { orderId } = req.params;
  const order = await getOrderRecord(orderId);

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json({ success: true, order });
});

