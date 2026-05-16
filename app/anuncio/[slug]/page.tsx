import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, ShieldCheck, ShoppingBag, Star } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { MobileShell } from "@/components/mobile-shell";
import { Badge, ButtonLink, Section } from "@/components/ui/primitives";
import { canShowPublicSeedData, isSeedEmail } from "@/lib/environment";
import { formatCurrency } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await prisma.listing.findUnique({ where: { slug }, select: { title: true, description: true, images: true, seller: { select: { email: true } } } });
  if (listing && !canShowPublicSeedData && isSeedEmail(listing.seller.email)) return {};
  if (!listing) return {};
  return {
    title: listing.title,
    description: listing.description.slice(0, 155),
    openGraph: { images: listing.images }
  };
}

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await prisma.listing.findUnique({
    where: { slug },
    include: {
      category: true,
      seller: { include: { profile: true, badges: { include: { badge: true } } } },
      reviews: { include: { author: { select: { username: true, name: true } } }, take: 10, orderBy: { createdAt: "desc" } },
      store: true
    }
  });
  if (!listing) notFound();
  if (!canShowPublicSeedData && isSeedEmail(listing.seller.email)) notFound();

  return (
    <MobileShell>
      <div className="grid gap-5 lg:grid-cols-[0.58fr_0.42fr]">
        <section className="space-y-3">
          <div className="aspect-[4/3] overflow-hidden rounded-lg border border-blue-100 bg-white">
            {listing.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={listing.images[0]} alt={listing.title} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center bg-wisepix-50 text-wisepix-600"><ShoppingBag size={56} /></div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {listing.images.slice(1, 5).map((image) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={image} src={image} alt="" className="aspect-square rounded-lg border border-blue-100 object-cover" />
            ))}
          </div>
        </section>

        <aside className="rounded-lg border border-blue-100 bg-white p-4 shadow-lift">
          <p className="text-xs font-black uppercase text-wisepix-700">{listing.category.name}</p>
          <h1 className="mt-2 text-3xl font-black leading-tight text-wisepix-950">{listing.title}</h1>
          <p className="mt-3 text-3xl font-black text-wisepix-700">{formatCurrency(listing.priceCents)}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
            <Badge tone={listing.deliveryType === "AUTOMATIC" ? "green" : "blue"}>{listing.deliveryType === "AUTOMATIC" ? "Entrega automática" : "Entrega manual / X1"}</Badge>
            <Badge tone="slate">{listing.negotiable ? "Negociável" : "Preço fixo"}</Badge>
          </div>
          <div className="mt-5 rounded-lg bg-wisepix-50 p-3">
            <p className="flex items-center gap-2 text-sm font-black text-wisepix-950">
              <ShieldCheck size={18} /> Proteção WisePix
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">A WisePix registra pedidos, pagamentos e entregas para trazer mais segurança.</p>
          </div>
          <ButtonLink href={`/checkout?listingId=${listing.id}`} className="mt-5 h-12 w-full">
            <ShoppingBag size={20} /> Comprar com Pix
          </ButtonLink>
          {listing.negotiable ? (
            <ButtonLink href="/dashboard/mensagens" variant="secondary" className="mt-3 h-12 w-full">
              <MessageCircle size={20} /> Conversar sobre o anúncio
            </ButtonLink>
          ) : null}
          <div className="mt-5 border-t border-blue-100 pt-4">
            <p className="text-sm font-bold text-slate-500">Vendedor</p>
            <Link href={listing.seller.username ? `/perfil/${listing.seller.username}` : "/explorar"} className="mt-2 block text-lg font-black text-wisepix-950">
              @{listing.seller.username ?? "seller"}
            </Link>
            <p className="text-sm font-semibold text-slate-500">{listing.seller.sellerLevel}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {listing.seller.badges.map(({ badge }) => (
                <span key={badge.id} className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">{badge.name}</span>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <Section className="mt-6">
        <h2 className="text-xl font-black text-wisepix-950">Descrição</h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">{listing.description}</p>
      </Section>

      <section className="mt-6">
        <h2 className="mb-3 text-xl font-black text-wisepix-950">Avaliações</h2>
        {listing.reviews.length ? (
          <div className="space-y-3">
            {listing.reviews.map((review) => (
              <article key={review.id} className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
                <p className="flex items-center gap-1 font-black text-wisepix-950">
                  <Star size={16} className="fill-wisepix-500 text-wisepix-500" /> {review.rating}/5
                </p>
                <p className="mt-2 text-sm text-slate-700">{review.comment}</p>
                <p className="mt-2 text-xs font-bold text-slate-500">@{review.author.username ?? "comprador"}</p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState icon={Star} title="Este anúncio ainda não tem avaliações." description="As primeiras avaliações aparecerão após pedidos concluídos." />
        )}
      </section>
    </MobileShell>
  );
}
