"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export function WaitlistForm() {
  const [status, setStatus] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const discord = String(formData.get("discord") ?? "").trim();
    const type = String(formData.get("type") ?? "").trim();

    const body = [
      `Nome: ${name}`,
      `Email: ${email}`,
      `Discord: ${discord || "Não informado"}`,
      `Perfil: ${type}`,
      "",
      "Quero entrar na lista de espera da WisePix."
    ].join("\n");

    window.location.href = `mailto:contato@wisepix.online?subject=${encodeURIComponent("Lista de espera WisePix")}&body=${encodeURIComponent(body)}`;
    setStatus("Preparamos seu email para a lista de espera.");
  }

  return (
    <form action={onSubmit} className="grid gap-3 rounded-lg border border-blue-100 bg-white p-4 shadow-soft">
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" required placeholder="Seu nome" className="h-12 rounded-lg border-blue-100" />
        <input name="email" required type="email" placeholder="email@exemplo.com" className="h-12 rounded-lg border-blue-100" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="discord" placeholder="Discord opcional" className="h-12 rounded-lg border-blue-100" />
        <select name="type" defaultValue="vendedor" className="h-12 rounded-lg border-blue-100">
          <option value="comprador">Comprador</option>
          <option value="vendedor">Vendedor</option>
          <option value="loja-parceiro">Loja / parceiro</option>
        </select>
      </div>
      <button className="flex h-12 items-center justify-center gap-2 rounded-lg bg-wisepix-600 font-bold text-white">
        <Send size={18} /> Entrar na lista de espera
      </button>
      {status ? <p className="text-sm font-semibold text-wisepix-800">{status}</p> : null}
    </form>
  );
}
