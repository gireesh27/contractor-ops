import crypto from "node:crypto";
import Razorpay from "razorpay";
import { env, configuredPaymentGateway } from "@/lib/env";

export function getPaymentMode() {
  return configuredPaymentGateway();
}

export async function createPaymentOrder(input: {
  amount: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}) {
  const gateway = configuredPaymentGateway();

  if (gateway === "razorpay") {
    const razorpay = new Razorpay({
      key_id: env.razorpayKeyId!,
      key_secret: env.razorpayKeySecret!
    });

    const order = await razorpay.orders.create({
      amount: Math.round(input.amount * 100),
      currency: input.currency || "INR",
      receipt: input.receipt,
      notes: input.notes
    });

    return { gateway, order };
  }

  if (gateway === "cashfree") {
    const response = await fetch("https://sandbox.cashfree.com/pg/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": env.cashfreeAppId!,
        "x-client-secret": env.cashfreeSecretKey!,
        "x-api-version": "2023-08-01"
      },
      body: JSON.stringify({
        order_amount: input.amount,
        order_currency: input.currency || "INR",
        order_id: input.receipt,
        order_note: input.notes?.description || "ContractorOps payment"
      })
    });

    const order = await response.json();
    return { gateway, order };
  }

  return {
    gateway: "manual",
    order: {
      status: "manual",
      message: "Payment gateway not configured. Use UPI, bank transfer, cash, or cheque manual entry."
    }
  };
}

export function verifyRazorpaySignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  if (!env.razorpayKeySecret) return false;
  const expected = crypto
    .createHmac("sha256", env.razorpayKeySecret)
    .update(`${input.orderId}|${input.paymentId}`)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(input.signature));
}

export async function verifyCashfreePayment(orderId: string) {
  if (!env.cashfreeAppId || !env.cashfreeSecretKey) return { configured: false };
  const response = await fetch(`https://sandbox.cashfree.com/pg/orders/${orderId}`, {
    headers: {
      "x-client-id": env.cashfreeAppId,
      "x-client-secret": env.cashfreeSecretKey,
      "x-api-version": "2023-08-01"
    }
  });
  return response.json();
}
