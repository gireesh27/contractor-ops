"use client";

import { useState } from "react";
import { CreditCard, Landmark, Loader2, ShieldCheck } from "lucide-react";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function toast(title: string, type: "success" | "error" | "info" = "info") {
  window.dispatchEvent(new CustomEvent("contractorops:toast", { detail: { title, type } }));
}

async function loadScript(src: string) {
  if (document.querySelector(`script[src="${src}"]`)) return true;
  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function PaymentActionButtons({ amount, label, planName }: { amount: number; label?: string; planName?: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [reference, setReference] = useState("");
  const [showBank, setShowBank] = useState(false);

  async function startGateway(gateway: "razorpay" | "cashfree") {
    setLoading(gateway);
    try {
      const response = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          gateway,
          receipt: `sub-${planName || "plan"}-${Date.now()}`,
          notes: { description: `${planName || "ContractorOps"} subscription payment` }
        })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to create payment order.");
      const data = payload.data;

      if (data.gateway === "razorpay") {
        const loaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        if (!loaded || !window.Razorpay) throw new Error("Razorpay Checkout could not be loaded.");
        const order = data.order;
        const checkout = new window.Razorpay({
          key: data.publicKey,
          amount: order.amount,
          currency: order.currency || "INR",
          name: "ContractorOps",
          description: label || "Subscription payment",
          order_id: order.id,
          handler: async (result: any) => {
            const verification = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                gateway: "razorpay",
                paymentRecordId: data.paymentId,
                orderId: result.razorpay_order_id,
                razorpayPaymentId: result.razorpay_payment_id,
                signature: result.razorpay_signature
              })
            });
            if (!verification.ok) throw new Error("Payment verification failed.");
            toast("Payment verified and saved.", "success");
            window.location.reload();
          },
          modal: {
            ondismiss: () => toast("Payment checkout was closed.", "info")
          }
        });
        checkout.open();
      } else if (data.gateway === "cashfree") {
        const link = data.order?.payment_link || data.order?.payments?.url;
        if (link) {
          window.location.href = link;
          return;
        }
        toast("Cashfree order created. Use the payment session from gateway logs if SDK checkout is enabled.", "success");
      } else {
        setShowBank(true);
        toast("Online gateway is not configured. Use bank transfer/manual payment.", "info");
      }
    } catch (error) {
      toast(error instanceof Error ? error.message : "Payment failed to start.", "error");
    } finally {
      setLoading(null);
    }
  }

  async function submitBankTransfer() {
    if (!reference.trim()) {
      toast("Enter bank transfer reference or transaction ID.", "error");
      return;
    }
    setLoading("bank");
    try {
      const response = await fetch("/api/payments/bank-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          transactionId: reference.trim(),
          notes: `${planName || "Subscription"} manual bank transfer`
        })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to save bank transfer.");
      setReference("");
      toast("Bank transfer submitted for verification.", "success");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Bank transfer failed.", "error");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mt-6 grid gap-2">
      <button className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 text-sm font-black text-white shadow-glow disabled:opacity-60 dark:bg-safety-yellow dark:text-slate-950" disabled={Boolean(loading)} onClick={() => startGateway("razorpay")} type="button">
        {loading === "razorpay" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
        Razorpay
      </button>
      <button className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-current/20 text-sm font-black disabled:opacity-60" disabled={Boolean(loading)} onClick={() => startGateway("cashfree")} type="button">
        {loading === "cashfree" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
        Cashfree
      </button>
      <button className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-current/20 text-sm font-black disabled:opacity-60" disabled={Boolean(loading)} onClick={() => setShowBank((value) => !value)} type="button">
        <Landmark className="h-4 w-4" />
        Bank transfer
      </button>
      {showBank ? (
        <div className="grid gap-2 rounded-2xl border border-current/10 bg-white/55 p-3 dark:bg-white/5">
          <input className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:border-blueprint dark:border-white/10 dark:bg-slate-950 dark:text-white" onChange={(event) => setReference(event.target.value)} placeholder="Reference / UTR / transaction ID" value={reference} />
          <button className="h-10 rounded-xl bg-blueprint text-xs font-black text-white disabled:opacity-60" disabled={loading === "bank"} onClick={submitBankTransfer} type="button">
            {loading === "bank" ? "Submitting..." : "Submit for verification"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
