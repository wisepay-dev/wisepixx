import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, ShieldCheck, ShoppingBag, Star } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { formatCurrency } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await prisma.listing.findUnique({ where: { slug }, select: { title: true, description: true, images: true } });
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

        <aside className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase text-wisepix-700">{listing.category.name}</p>
          <h1 className="mt-2 text-3xl font-black leading-tight text-wisepix-950">{listing.title}</h1>
          <p className="mt-3 text-3xl font-black text-wisepix-700">{formatCurrency(listing.priceCents)}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-lg bg-wisepix-50 px-3 py-1 text-wisepix-800">{listing.deliveryType === "AUTOMATIC" ? "Entrega automática" : "Entrega manual / X1"}</span>
            <span className="rounded-lg bg-slate-100 px-3 py-1 text-slate-700">{listing.negotiable ? "Negociável" : "Preço fixo"}</span>
          </div>
          <div className="mt-5 rounded-lg bg-wisepix-50 p-3">
            <p className="flex items-center gap-2 text-sm font-black text-wisepix-950">
              <ShieldCheck size={18} /> Proteção WisePix
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">O vendedor só recebe após pagamento confirmado e fluxo de entrega registrado.</p>
          </div>
          <form action="/api/checkout/pix" method="post" className="mt-5">
            <Link href={`/checkout?listingId=${listing.id}`} className="flex h-12 items-center justify-center gap-2 rounded-lg bg-wisepix-600 font-bold text-white">
              <ShoppingBag size={20} /> Comprar com Pix
            </Link>
          </form>
          <button className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-blue-100 font-bold text-wisepix-900">
            <MessageCircle size={20} /> Negociar no chat
          </button>
          <div className="mt-5 border-t border-blue-100 pt-4">
            <p className="text-sm font-bold text-slate-500">Vendedor</p>
            <Link href={`/@${listing.seller.username ?? listing.seller.id}`} className="mt-2 block text-lg font-black text-wisepix-950">
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

      <section className="mt-6 rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
        <h2 className="text-xl font-black text-wisepix-950">Descrição</h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">{listing.description}</p>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-xl font-black text-wisepix-950">Avaliações</h2>
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
      </section>
    </MobileShell>
  );
}
