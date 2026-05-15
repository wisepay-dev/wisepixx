import { notFound } from "next/navigation";
import { ExternalLink, Store } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { MobileShell } from "@/components/mobile-shell";
import { ListingCard } from "@/components/listing-card";
import { canShowPublicSeedData, isSeedEmail } from "@/lib/environment";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await prisma.store.findFirst({
    where: { OR: [{ slug }, { subdomain: slug }], status: "ACTIVE" },
    include: {
      owner: { select: { email: true } },
      theme: true,
      listings: {
        where: {
          status: "ACTIVE",
          ...(!canShowPublicSeedData ? { seller: { email: { not: { endsWith: "@wisepix.dev" } } } } : {})
        },
        include: {
          category: true,
          seller: { select: { username: true, name: true, sellerLevel: true, kycStatus: true } },
          store: { select: { name: true, slug: true, subdomain: true, verified: true } }
        },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }]
      },
      feedPosts: { include: { author: true }, orderBy: { createdAt: "desc" }, take: 4 }
    }
  });
  if (!store) notFound();
  if (!canShowPublicSeedData && isSeedEmail(store.owner.email)) notFound();

  return (
    <MobileShell>
      <section className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-soft">
        <div className="h-36 bg-wisepix-600 sm:h-56">
          {store.bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={store.bannerUrl} alt={store.name} className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-wisepix-950">{store.name}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{store.description ?? "Store parceira WisePix com catálogo digital e checkout Pix."}</p>
            </div>
            {store.discordInvite ? (
              <a href={store.discordInvite} className="flex h-10 items-center gap-2 rounded-lg bg-premium-black px-3 text-sm font-bold text-white">
                Discord <ExternalLink size={15} />
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-xl font-black text-wisepix-950">Catálogo</h2>
        {store.listings.length ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {store.listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
          </div>
        ) : (
          <EmptyState icon={Store} title="Lojas parceiras serão exibidas aqui em breve." description="Esta store ainda não possui catálogo público disponível." />
        )}
      </section>
    </MobileShell>
  );
}
