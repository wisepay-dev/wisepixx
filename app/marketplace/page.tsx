import { Search } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { ListingCard } from "@/components/listing-card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MarketplacePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const q = params.q;
  const category = params.category;
  const [categories, listings] = await Promise.all([
    prisma.category.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.listing.findMany({
      where: {
        status: "ACTIVE",
        ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] } : {}),
        ...(category ? { category: { slug: category } } : {})
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
      <div className="mb-5">
        <h1 className="text-3xl font-black text-wisepix-950">Marketplace</h1>
        <p className="mt-2 text-sm font-medium text-slate-600">Busque produtos digitais com entrega manual ou automática.</p>
      </div>
      <form className="mb-4 grid gap-3 rounded-lg border border-blue-100 bg-white p-3 shadow-sm sm:grid-cols-[1fr_220px_auto]">
        <label className="relative">
          <Search size={18} className="absolute left-3 top-3.5 text-slate-400" />
          <input name="q" defaultValue={q} placeholder="Buscar bots, gift cards, design..." className="h-12 w-full rounded-lg border-blue-100 pl-10" />
        </label>
        <select name="category" defaultValue={category} className="h-12 rounded-lg border-blue-100">
          <option value="">Todas categorias</option>
          {categories.map((item) => (
            <option key={item.id} value={item.slug}>{item.name}</option>
          ))}
        </select>
        <button className="h-12 rounded-lg bg-wisepix-600 px-5 font-bold text-white">Filtrar</button>
      </form>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
      </div>
    </MobileShell>
  );
}
