"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, ImagePlus, PackageCheck, PlusCircle, Save } from "lucide-react";
import { Badge, Button, Card, Field, Input, Select, Textarea, Toast } from "@/components/ui/primitives";
import { formatCurrency } from "@/lib/format";

type Category = { id: string; name: string };
type ListingInitial = {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  priceCents: number;
  negotiable: boolean;
  deliveryType: string;
  images: string[];
  stockCount: number;
};

async function safeJson(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function ListingForm({ categories, initial }: { categories: Category[]; initial?: ListingInitial }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial ? String(initial.priceCents / 100).replace(".", ",") : "");
  const [deliveryType, setDeliveryType] = useState(initial?.deliveryType ?? "MANUAL");
  const [imagesText, setImagesText] = useState(initial?.images.join("\n") ?? "");

  const previewPrice = useMemo(() => {
    const cents = Math.round(Number(price.replace(",", ".") || "0") * 100);
    return Number.isFinite(cents) ? formatCurrency(cents) : "R$ 0,00";
  }, [price]);

  async function onSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);
    setLoading(true);

    const parsedPrice = Number(String(formData.get("price") ?? "0").replace(",", "."));
    const stockSecrets = String(formData.get("stockSecrets") || "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    const payload = {
      title: formData.get("title"),
      description: formData.get("description"),
      categoryId: formData.get("categoryId"),
      priceCents: Math.round(parsedPrice * 100),
      negotiable: formData.get("negotiable") === "on",
      deliveryType: formData.get("deliveryType"),
      secretType: formData.get("secretType") || "texto",
      stockSecrets,
      images: String(formData.get("imageUrl") || "")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)
    };

    const response = await fetch(initial ? `/api/listings/${initial.id}` : "/api/listings", {
      method: initial ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const body = await safeJson(response);
    setLoading(false);
    if (!response.ok) {
      setError(body?.error ?? "Não foi possível salvar o anúncio. Confira os campos e tente novamente.");
      return;
    }
    if (!body?.listing?.slug) {
      setSuccess("Anúncio salvo com sucesso.");
      return;
    }
    setSuccess(initial ? "Anúncio atualizado." : "Anúncio publicado.");
    router.push(`/anuncio/${body.listing.slug}`);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <form action={onSubmit} className="grid gap-4 rounded-lg border border-blue-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-wisepix-950">{initial ? "Editar anúncio" : "Novo anúncio"}</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">Informações claras ajudam o comprador a decidir com segurança.</p>
          </div>
          <Badge tone={deliveryType === "AUTOMATIC" ? "green" : "blue"}>{deliveryType === "AUTOMATIC" ? "Auto" : "Manual"}</Badge>
        </div>

        <Field label="Nome do produto">
          <Input name="title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex: Bot Discord para atendimento" required minLength={5} maxLength={120} />
        </Field>

        <Field label="Descrição" hint="Explique o que será entregue, prazos, requisitos e regras. Evite promessas vagas.">
          <Textarea name="description" value={description} onChange={(event) => setDescription(event.target.value)} rows={7} placeholder="Descreva o produto de forma simples e objetiva." required minLength={20} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Categoria">
            <Select name="categoryId" defaultValue={initial?.categoryId ?? ""} required>
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Preço">
            <Input name="price" inputMode="decimal" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="49,90" required />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tipo de entrega">
            <Select name="deliveryType" value={deliveryType} onChange={(event) => setDeliveryType(event.target.value)}>
              <option value="MANUAL">Manual / X1</option>
              <option value="AUTOMATIC">Automática</option>
            </Select>
          </Field>
          <label className="mt-6 flex h-11 items-center gap-2 rounded-lg border border-blue-100 px-3 text-sm font-bold text-slate-700">
            <input name="negotiable" type="checkbox" defaultChecked={initial?.negotiable ?? false} className="rounded border-blue-200 text-wisepix-600 focus:ring-wisepix-200" />
            Aceitar negociação
          </label>
        </div>

        <Field label="Imagens do anúncio" hint="Cole URLs de imagens, uma por linha. A primeira vira capa.">
          <Textarea name="imageUrl" value={imagesText} onChange={(event) => setImagesText(event.target.value)} rows={3} placeholder="https://..." />
        </Field>

        {deliveryType === "AUTOMATIC" ? (
          <div className="rounded-lg border border-blue-100 bg-wisepix-50 p-4">
            <div className="flex items-center gap-2">
              <PackageCheck size={18} className="text-wisepix-700" />
              <p className="font-black text-wisepix-950">Estoque automático</p>
            </div>
            <div className="mt-3 grid gap-4 sm:grid-cols-[180px_1fr]">
              <Field label="Tipo do segredo">
                <Select name="secretType" defaultValue="texto">
                  <option value="texto">Texto</option>
                  <option value="key">Key/código</option>
                  <option value="link">Link</option>
                  <option value="login">Usuário/senha</option>
                </Select>
              </Field>
              <Field label={initial ? "Adicionar novos itens" : "Itens de estoque"} hint={initial ? `${initial.stockCount} item(ns) cadastrados. Novas linhas serão adicionadas ao estoque.` : "Um item por linha. Eles serão criptografados antes de salvar."}>
                <Textarea name="stockSecrets" rows={5} placeholder="KEY-123&#10;KEY-456&#10;https://link-secreto..." required={!initial && deliveryType === "AUTOMATIC"} />
              </Field>
            </div>
          </div>
        ) : null}

        {success ? <Toast>{success}</Toast> : null}
        {error ? <Toast tone="red">{error}</Toast> : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {initial ? <Save size={18} /> : <PlusCircle size={18} />}
            {loading ? "Salvando..." : initial ? "Salvar anúncio" : "Publicar anúncio"}
          </Button>
        </div>
      </form>

      <Card className="h-fit overflow-hidden">
        <div className="aspect-[4/3] bg-gradient-to-br from-wisepix-50 to-white">
          {imagesText.split("\n").map((item) => item.trim()).filter(Boolean)[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagesText.split("\n").map((item) => item.trim()).filter(Boolean)[0]} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-wisepix-500">
              <ImagePlus size={44} />
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase text-wisepix-700">
            <Eye size={15} /> Preview
          </div>
          <h3 className="line-clamp-2 text-lg font-black text-wisepix-950">{title || "Nome do produto"}</h3>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{description || "A descrição do anúncio aparecerá aqui enquanto você preenche."}</p>
          <p className="mt-4 text-2xl font-black text-wisepix-700">{previewPrice}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>{deliveryType === "AUTOMATIC" ? "Entrega automática" : "Entrega manual"}</Badge>
            <Badge tone="slate">WisePix</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
