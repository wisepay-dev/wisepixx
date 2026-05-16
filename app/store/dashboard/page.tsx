import Link from "next/link";
import { PackagePlus, Store } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Badge, ButtonLink, PageHeader, PolishedEmptyState, Section, StatCard } from "@/components/ui/primitives";
import { formatCurrency } from "@/lib/format";
import { requirePartnerOrOwner } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StoreDashboardPage() {
  const session = await requirePartnerOrOwner("/store/dashboard");
  const store = await prisma.store.findFirst({
    where: session.user.roles?.includes("OWNER") ? {} : { ownerId: session.user.id },
    include: { listings: { include: { orders: true }, orderBy: { createdAt: "desc" } }, reviews: true, theme: true }
  });

  return (
    <MobileShell>
      <PageHeader eyebrow="Store" title="Painel da loja" description="Acompanhe catálogo, pedidos e presença pública da sua store parceira." />
      {store ? (
        <>
          <Section>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-black text-wisepix-950">{store.name}</h2>
                  <Badge tone={store.status === "ACTIVE" ? "green" : "slate"}>{store.status}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{store.description ?? "Store parceira WisePix com catálogo digital e vitrine pública."}</p>
                <p className="mt-2 text-xs font-bold text-slate-500">{store.subdomain}.wisepix.online · Tema {store.theme?.name ?? "padrão"}</p>
              </div>
              <ButtonLink href={`/loja/${store.slug}`} variant="secondary">Abrir vitrine</ButtonLink>
            </div>
          </Section>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <StatCard label="Produtos" value={String(store.listings.length)} detail="No catálogo da store" icon={Store} />
            <StatCard label="Pedidos" value={String(store.listings.reduce((sum, listing) => sum + listing.orders.length, 0))} detail="Ligados aos produtos" icon={PackagePlus} />
            <StatCard label="GMV" value={formatCurrency(store.listings.flatMap((listing) => listing.orders).reduce((sum, order) => sum + order.amountCents, 0))} detail="Pedidos registrados" icon={Store} />
          </div>

          <Section className="mt-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-wisepix-950">Produtos da store</h2>
              <ButtonLink href="/dashboard/vendedor/anuncios/novo" variant="secondary">Adicionar produto</ButtonLink>
            </div>
            {store.listings.length ? (
              <div className="mt-4 divide-y divide-blue-50">
                {store.listings.map((listing) => (
                  <Link key={listing.id} href={`/anuncio/${listing.slug}`} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <p className="font-bold text-wisepix-950">{listing.title}</p>
                      <p className="text-xs font-semibold text-slate-500">{listing.status} · {listing.deliveryType}</p>
                    </div>
                    <p className="font-black text-wisepix-700">{formatCurrency(listing.priceCents)}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <PolishedEmptyState icon={Store} title="Nenhum produto vinculado à store." description="Crie anúncios e vincule-os à loja para montar o catálogo público." action={<ButtonLink href="/dashboard/vendedor/anuncios/novo">Criar anúncio</ButtonLink>} />
              </div>
            )}
          </Section>
        </>
      ) : (
        <PolishedEmptyState icon={Store} title="Nenhuma store vinculada à sua conta." description="Quando uma loja parceira for criada pelo OWNER, ela aparecerá aqui com catálogo, vitrine e métricas." />
      )}
    </MobileShell>
  );
}
