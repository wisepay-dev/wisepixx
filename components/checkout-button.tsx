"use client";

import { useState } from "react";
import { Copy, QrCode } from "lucide-react";
import { Button, Toast } from "@/components/ui/primitives";

type CheckoutResponse = {
  orderId?: string;
  paymentId?: string | null;
  status?: string | null;
  pixQrCode?: string | null;
  pixCopyPaste?: string | null;
  error?: string;
};

async function safeJson(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as CheckoutResponse;
  } catch {
    return null;
  }
}

export function CheckoutButton({ listingId }: { listingId: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [payment, setPayment] = useState<CheckoutResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function createPayment() {
    setLoading(true);
    setMessage(null);
    const response = await fetch("/api/checkout/pix", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId })
    });
    const body = await safeJson(response);
    setLoading(false);
    if (!response.ok) {
      setMessage(body?.error ?? "Falha ao gerar Pix.");
      return;
    }
    setPayment(body);
    setMessage("Pedido criado. Aguardando confirmação do pagamento.");
  }

  async function copyPix() {
    if (!payment?.pixCopyPaste) return;
    await navigator.clipboard.writeText(payment.pixCopyPaste);
    setMessage("Pix copia e cola copiado.");
  }

  return (
    <div className="space-y-3">
      <Button onClick={createPayment} disabled={loading} className="h-12 w-full">
        <QrCode size={20} /> {loading ? "Gerando Pix..." : "Gerar Pix"}
      </Button>
      {message ? <Toast tone={payment ? "green" : "red"}>{message}</Toast> : null}
      {payment?.pixQrCode || payment?.pixCopyPaste ? (
        <div className="rounded-lg border border-blue-100 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-black text-wisepix-950">Pagamento Pix</p>
              <p className="text-xs font-semibold text-slate-500">Status: {payment.status ?? "aguardando"}</p>
            </div>
            <span className="rounded-lg bg-wisepix-50 px-2 py-1 text-xs font-black text-wisepix-800">Seguro</span>
          </div>
          {payment.pixQrCode ? (
            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs font-semibold leading-5 text-slate-600">
              QR Code recebido do parceiro de pagamento.
            </div>
          ) : null}
          {payment.pixCopyPaste ? (
            <div className="mt-4">
              <p className="text-xs font-black uppercase text-slate-500">Pix copia e cola</p>
              <p className="mt-2 max-h-28 overflow-auto rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-700">{payment.pixCopyPaste}</p>
              <Button onClick={copyPix} variant="secondary" className="mt-3 w-full">
                <Copy size={18} /> Copiar código Pix
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
