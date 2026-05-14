import Link from "next/link";
import { ArrowRight, BadgeCheck, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { ListingCard } from "@/components/listing-card";
import { StatCard } from "@/components/stat-card";
import { formatCurrency } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [listings, posts, stats] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "ACTIVE" },
      include: {
        category: true,
        seller: { select: { username: true, name: true, sellerLevel: true, kycStatus: true } },
        store: { select: { name: true, slug: true, subdomain: true, verified: true } }
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 8
    }),
    prisma.feedPost.findMany({
      include: {
        author: { select: { username: true, name: true, image: true, sellerLevel: true } },
        media: true,
        likes: true
      },
      orderBy: { createdAt: "desc" },
      take: 6
    }),
    prisma.$transaction([
      prisma.listing.count({ where: { status: "ACTIVE" } }),
      prisma.user.count(),
      prisma.order.aggregate({ _sum: { amountCents: true }, where: { status: { in: ["PAID", "DELIVERED", "COMPLETED"] } } })
    ])
  ]);

  return (
    <MobileShell>
      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg bg-premium-black p-5 text-white shadow-soft sm:p-8">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-lg bg-white/10 px-3 py-1 text-xs font-bold">Pix-first</span>
            <span className="rounded-lg bg-white/10 px-3 py-1 text-xs font-bold">Discord-first</span>
            <span className="rounded-lg bg-white/10 px-3 py-1 text-xs font-bold">Mobile-first</span>
          </div>
          <h1 className="mt-7 max-w-2xl text-4xl font-black leading-tight tracking-normal sm:text-6xl">
            WisePix
          </h1>
          <p className="mt-4 max-w-xl text-base font-medium leading-7 text-blue-100 sm:text-lg">
            Venda produtos digitais, serviços, automações, bots, licenças, streamings autorizados e gift cards com checkout Pix, proteção e social commerce.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/vender" className="flex h-12 items-center justify-center gap-2 rounded-lg bg-wisepix-500 px-5 font-bold text-white">
              Começar a vender <ArrowRight size={19} />
            </Link>
            <Link href="/marketplace" className="flex h-12 items-center justify-center rounded-lg border border-white/20 px-5 font-bold text-white">
              Ver marketplace
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <StatCard label="Anúncios ativos" value={String(stats[0])} detail="Produtos digitais prontos para comprar" />
          <StatCard label="Comunidade" value={String(stats[1])} detail="Vendedores, parceiros e compradores" />
          <StatCard label="GMV confirmado" value={formatCurrency(stats[2]._sum.amountCents ?? 0)} detail="Pedidos pagos e concluídos" />
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-black text-wisepix-950">Marketplace</h2>
          <Link href="/marketplace" className="text-sm font-bold text-wisepix-700">Ver tudo</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[0.72fr_0.28fr]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-black text-wisepix-950">Feed social</h2>
            <Sparkles size={20} className="text-wisepix-600" />
          </div>
          <div className="space-y-3">
            {posts.map((post) => (
              <article key={post.id} className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-black text-wisepix-950">@{post.author.username ?? "user"}</p>
                    <p className="text-xs font-bold text-slate-500">{post.author.sellerLevel}</p>
                  </div>
                  {post.automatic ? <BadgeCheck size={18} className="text-wisepix-600" /> : null}
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{post.text}</p>
                <p className="mt-3 text-xs font-bold text-slate-500">{post.likes.length} curtidas</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
          <h3 className="flex items-center gap-2 text-base font-black text-wisepix-950">
            <ShieldCheck size={18} /> Proteção WisePix
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Pagamento Pix confirmado por webhook, entrega manual com confirmação do comprador e estoque automático com reveal registrado por IP e horário.
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-wisepix-50 p-3 text-sm font-bold text-wisepix-900">
            <TrendingUp size={18} /> Taxas por nível configuráveis pelo OWNER.
          </div>
        </aside>
      </section>
    </MobileShell>
  );
}
