import { Router, Request, Response } from "express";
import { createPaymentPayload, verifyPayment } from "../utils/esewa.utils";

export const paymentRouter = Router();

// In-Memory store for ticket orders and reservations
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

/**
 * Endpoint to initiate eSewa deposit payload
 * Body accepts: { amount: number, orderId: string, guestName: string, guestEmail: string, type: "ticket" | "vip", typeName: string, count: number }
 */
paymentRouter.post("/initiate", (req: Request, res: Response): void => {
  const { amount, orderId, guestName, guestEmail, type, typeName, count, successUrl, failureUrl } = req.body;

  if (!amount || !orderId) {
    res.status(400).json({ error: "Amount and orderId are required" });
    return;
  }

  // Create or update record in database
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

  // Calculate eSewa payload details with dynamic redirect urls
  const payload = createPaymentPayload(Number(amount), orderId, successUrl, failureUrl);

  res.json({
    success: true,
    payload
  });
});

/**
 * Endpoint to verify payment query data from eSewa redirect
 * Accepts standard query param: ?data=...
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
    const order = ordersDatabase.get(transactionUuid);

    if (order) {
      order.status = "PAID";
      order.transactionCode = result.data.transaction_code;
      order.verifiedAt = new Date().toISOString();
      ordersDatabase.set(transactionUuid, order);
    } else {
      // If payment arrives for unregistered order, create dynamic entry so they get ticket access safely
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
        verifiedAt: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: "Payment successfully verified and ticket authorized",
      order: ordersDatabase.get(transactionUuid) || result.data
    });
  } else {
    // If signature fails or status incomplete
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

/**
 * Route to fetch active order details directly by orderId
 */
paymentRouter.get("/order/:orderId", (req: Request, res: Response): void => {
  const { orderId } = req.params;
  const order = ordersDatabase.get(orderId);

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json({ success: true, order });
});
