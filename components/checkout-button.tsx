"use client";

import { useState } from "react";

export function CheckoutButton({ listingId }: { listingId: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function createPayment() {
    setLoading(true);
    setMessage(null);
    const response = await fetch("/api/checkout/pix", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId })
    });
    const body = await response.json();
    setLoading(false);
    if (!response.ok) {
      setMessage(body.error ?? "Falha ao gerar Pix.");
      return;
    }
    setMessage("Pedido criado. Aguardando retorno da Miuse.");
  }

  return (
    <div>
      <button onClick={createPayment} disabled={loading} className="h-12 w-full rounded-lg bg-wisepix-600 font-bold text-white disabled:opacity-60">
        {loading ? "Gerando Pix..." : "Gerar Pix real"}
      </button>
      {message ? <p className="mt-3 rounded-lg bg-slate-100 p-3 text-sm font-semibold text-slate-700">{message}</p> : null}
    </div>
  );
}
