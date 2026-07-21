import React, { useState } from "react";
import { Loader2 } from "lucide-react";

interface EsewaPaymentButtonProps {
  amount: number;
  orderId: string;
  guestName: string;
  guestEmail: string;
  bookingType: "ticket" | "vip";
  typeName: string;
  count: number;
  onInitiateProgress?: (message: string) => void;
  onError?: (err: string) => void;
}

export const EsewaPaymentButton: React.FC<EsewaPaymentButtonProps> = ({
  amount,
  orderId,
  guestName,
  guestEmail,
  bookingType,
  typeName,
  count,
  onInitiateProgress,
  onError
}) => {
  const [loading, setLoading] = useState(false);

  const handleEsewaPayment = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    if (onInitiateProgress) {
      onInitiateProgress("INITIALIZING ELECTRONIC ESCROW LINK WITH ESEWA...");
    }

    try {
      // Dynamic success and failure routes matching active web hostname (works both on localhost or production live previews)
      const dynamicSuccessUrl = `${window.location.origin}/payment/success`;
      const dynamicFailureUrl = `${window.location.origin}/payment/failure`;

      // 1. Call Backend to register order and generate payload
      const response = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount,
          orderId,
          guestName,
          guestEmail,
          type: bookingType,
          typeName,
          count,
          successUrl: dynamicSuccessUrl,
          failureUrl: dynamicFailureUrl
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned error: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success || !data.payload) {
        throw new Error(data.error || "Failed preparing secure eSewa payload block");
      }

      if (onInitiateProgress) {
        onInitiateProgress("PAYLOAD GENERATED. REDIRECTING TO ESEWA GATEWAY...");
      }

      // 2. Dynamically construct hidden HTML form
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.paymentEndpoint || "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
      form.target = "_blank"; // Escape standard iframe sandbox blocking
      form.style.display = "none";

      // Append payload keys as form fields
      Object.entries(data.payload).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      // Append and submit
      document.body.appendChild(form);
      form.submit();
    } catch (err: any) {
      console.error(err);
      setLoading(false);
      if (onError) {
        onError(err.message || "eSewa connection failed");
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleEsewaPayment}
      disabled={loading}
      className="relative overflow-hidden w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded bg-[#60bb46] hover:bg-[#52ad39] text-xs font-mono tracking-widest uppercase text-white font-extrabold transition-all duration-300 shadow-[0_0_20px_rgba(96,187,70,0.15)] hover:shadow-[0_0_25px_rgba(96,187,70,0.3)] hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <Loader2 size={13} className="animate-spin text-white" />
          ESTABLISHING PORTAL CODE...
        </>
      ) : (
        <>
          <img
            src="https://elg.com.np/wp-content/uploads/2021/08/esewa.png"
            alt="eSewa Logo"
            className="h-3.5 w-auto object-contain filter brightness-100 contrast-125"
            onError={(e) => {
              // Fallback simple asset if default url is unavailable
              e.currentTarget.style.display = "none";
            }}
          />
          PAY WITH ESEWA // INSTANT ADMIT
        </>
      )}
    </button>
  );
};
