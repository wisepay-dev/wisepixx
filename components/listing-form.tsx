"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";

type Category = { id: string; name: string };

export function ListingForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setError(null);
    const price = Number(String(formData.get("price") ?? "0").replace(",", "."));
    const response = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        description: formData.get("description"),
        categoryId: formData.get("categoryId"),
        priceCents: Math.round(price * 100),
        negotiable: formData.get("negotiable") === "on",
        deliveryType: formData.get("deliveryType"),
        images: String(formData.get("imageUrl") || "")
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean)
      })
    });

    const body = await response.json();
    if (!response.ok) {
      setError(body.error ?? "Não foi possível criar o anúncio.");
      return;
    }
    router.push(`/anuncio/${body.listing.slug}`);
  }

  return (
    <form action={onSubmit} className="grid gap-4 rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
      <input name="title" placeholder="Nome do produto digital" required className="h-12 rounded-lg border-blue-100" />
      <textarea name="description" placeholder="Descrição, regras de entrega, requisitos e garantias" required rows={6} className="rounded-lg border-blue-100" />
      <div className="grid gap-3 sm:grid-cols-2">
        <select name="categoryId" required className="h-12 rounded-lg border-blue-100">
          <option value="">Categoria</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <input name="price" inputMode="decimal" placeholder="Preço em R$" required className="h-12 rounded-lg border-blue-100" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <select name="deliveryType" defaultValue="MANUAL" className="h-12 rounded-lg border-blue-100">
          <option value="MANUAL">Entrega manual / X1</option>
          <option value="AUTOMATIC">Entrega automática</option>
        </select>
        <label className="flex h-12 items-center gap-2 rounded-lg border border-blue-100 px-3 text-sm font-bold text-slate-700">
          <input name="negotiable" type="checkbox" className="rounded border-blue-200 text-wisepix-600" />
          Aceitar negociação
        </label>
      </div>
      <textarea name="imageUrl" placeholder="URLs de imagens, uma por linha" rows={3} className="rounded-lg border-blue-100" />
      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      <button className="flex h-12 items-center justify-center gap-2 rounded-lg bg-wisepix-600 font-bold text-white">
        <PlusCircle size={20} /> Publicar anúncio
      </button>
    </form>
  );
}
