import crypto from "node:crypto";
import Razorpay from "razorpay";
import { cashfreeBaseUrl, configuredPaymentGateway, env } from "@/lib/env";

export function getPaymentMode() {
  return configuredPaymentGateway();
}

export async function createPaymentOrder(input: {
  amount: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
  customer?: { name?: string; email?: string; phone?: string };
  gateway?: "razorpay" | "cashfree" | "manual";
}) {
  const gateway = input.gateway && input.gateway !== "manual" ? input.gateway : configuredPaymentGateway();

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("Payment amount must be greater than zero.");
  }

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

    return { gateway, order, publicKey: env.razorpayKeyId };
  }

  if (gateway === "cashfree") {
    const response = await fetch(`${cashfreeBaseUrl()}/orders`, {
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
        order_note: input.notes?.description || "ContractorOps payment",
        customer_details: {
          customer_id: input.notes?.customerId || input.customer?.email || input.customer?.phone || input.receipt,
          customer_name: input.customer?.name || "ContractorOps customer",
          customer_email: input.customer?.email || "customer@example.com",
          customer_phone: input.customer?.phone || "9999999999"
        }
      })
    });

    const order = await response.json();
    if (!response.ok) throw new Error(order?.message || "Cashfree order creation failed.");
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
  if (expected.length !== input.signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(input.signature));
}

export async function verifyCashfreePayment(orderId: string) {
  if (!env.cashfreeAppId || !env.cashfreeSecretKey) return { configured: false };
  const response = await fetch(`${cashfreeBaseUrl()}/orders/${orderId}`, {
    headers: {
      "x-client-id": env.cashfreeAppId,
      "x-client-secret": env.cashfreeSecretKey,
      "x-api-version": "2023-08-01"
    }
  });
  return response.json();
}
