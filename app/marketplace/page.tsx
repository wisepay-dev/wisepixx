import { PackagePlus, PackageSearch, Search, SlidersHorizontal } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { MobileShell } from "@/components/mobile-shell";
import { ListingCard } from "@/components/listing-card";
import { ButtonLink, PageHeader, Select } from "@/components/ui/primitives";
import { canShowPublicSeedData } from "@/lib/environment";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MarketplacePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const q = params.q;
  const category = params.category;
  const deliveryType = params.deliveryType;
  const negotiable = params.negotiable;
  const [categories, listings] = await Promise.all([
    prisma.category.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.listing.findMany({
      where: {
        status: "ACTIVE",
        ...(!canShowPublicSeedData ? { seller: { email: { not: { endsWith: "@wisepix.dev" } } } } : {}),
        ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] } : {}),
        ...(category ? { category: { slug: category } } : {}),
        ...(deliveryType ? { deliveryType: deliveryType as never } : {}),
        ...(negotiable ? { negotiable: negotiable === "true" } : {})
      },
      include: {
        category: true,
        seller: { select: { username: true, name: true, sellerLevel: true, kycStatus: true } },
        store: { select: { name: true, slug: true, subdomain: true, verified: true } }
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }]
    })
  ]);

  return (
    <MobileShell>
      <PageHeader
        eyebrow="Explorar"
        title="Marketplace WisePix"
        description="Encontre produtos digitais, serviços e automações com pedido registrado e reputação pública."
        action={<ButtonLink href="/dashboard/vendedor/anuncios/novo"><PackagePlus size={18} /> Vender</ButtonLink>}
      />
      <form className="mb-5 grid gap-3 rounded-lg border border-blue-100 bg-white p-3 shadow-sm lg:grid-cols-[1fr_190px_170px_150px_auto]">
        <label className="relative lg:col-span-2">
          <Search size={18} className="absolute left-3 top-3.5 text-slate-400" />
          <input name="q" defaultValue={q} placeholder="Buscar bots, gift cards, design, social media..." className="h-12 w-full rounded-lg border-blue-100 pl-10 text-sm focus:border-wisepix-500 focus:ring-wisepix-200" />
        </label>
        <Select name="category" defaultValue={category}>
          <option value="">Todas categorias</option>
          {categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
        </Select>
        <Select name="deliveryType" defaultValue={deliveryType}>
          <option value="">Toda entrega</option>
          <option value="AUTOMATIC">Automática</option>
          <option value="MANUAL">Manual</option>
        </Select>
        <Select name="negotiable" defaultValue={negotiable}>
          <option value="">Preço</option>
          <option value="false">Fixo</option>
          <option value="true">Negociável</option>
        </Select>
        <button className="flex h-12 items-center justify-center gap-2 rounded-lg bg-wisepix-600 px-5 font-bold text-white transition hover:bg-wisepix-700">
          <SlidersHorizontal size={18} /> Filtrar
        </button>
      </form>
      {listings.length ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
        </div>
      ) : (
        <EmptyState
          icon={PackageSearch}
          title="Nenhum anúncio publicado ainda."
          description="Os primeiros vendedores começarão a aparecer aqui em breve."
          action={<ButtonLink href="/dashboard/vendedor/anuncios/novo">Criar primeiro anúncio</ButtonLink>}
        />
      )}
    </MobileShell>
  );
}
