import Link from "next/link";
import { Bell, MessageCircle, PackagePlus, Settings, ShoppingBag, Store, UserRound } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Badge, ButtonLink, PageHeader, PolishedEmptyState, Section, StatCard } from "@/components/ui/primitives";
import { formatCurrency } from "@/lib/format";
import { requireUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const actions = [
  { href: "/dashboard/vendedor", label: "Painel vendedor", description: "Saldo, anúncios e vendas", icon: Store },
  { href: "/dashboard/vendedor/anuncios/novo", label: "Criar anúncio", description: "Publique um produto digital", icon: PackagePlus },
  { href: "/dashboard/pedidos", label: "Pedidos", description: "Compras e vendas registradas", icon: ShoppingBag },
  { href: "/dashboard/mensagens", label: "Mensagens", description: "Conversas de pedidos", icon: MessageCircle },
  { href: "/dashboard/notificacoes", label: "Notificações", description: "Avisos importantes", icon: Bell },
  { href: "/dashboard/configuracoes", label: "Configurações", description: "Perfil e preferências", icon: Settings }
];

export default async function DashboardPage() {
  const session = await requireUser("/dashboard");
  const [orders, listings, notifications] = await Promise.all([
    prisma.order.findMany({ where: { OR: [{ buyerId: session.user.id }, { sellerId: session.user.id }] }, include: { listing: true }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.listing.findMany({ where: { sellerId: session.user.id }, orderBy: { createdAt: "desc" }, take: 4 }),
    prisma.notification.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, take: 4 })
  ]);
  const totalOrders = orders.reduce((sum, order) => sum + order.amountCents, 0);

  return (
    <MobileShell>
      <PageHeader
        eyebrow="Dashboard"
        title={`Olá${session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}.`}
        description="Seu ponto de partida para vender, comprar, responder pedidos e cuidar do perfil WisePix."
        action={<ButtonLink href="/dashboard/vendedor/anuncios/novo">Criar anúncio</ButtonLink>}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Pedidos recentes" value={String(orders.length)} detail="Últimas movimentações" icon={ShoppingBag} />
        <StatCard label="Anúncios" value={String(listings.length)} detail="Produtos publicados" icon={PackagePlus} />
        <StatCard label="Volume recente" value={formatCurrency(totalOrders)} detail="Pedidos listados" icon={Store} />
      </div>

      <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map(({ href, label, description, icon: Icon }) => (
          <Link key={href} href={href} className="group rounded-lg border border-blue-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-wisepix-200 hover:shadow-lift">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-wisepix-50 text-wisepix-700 transition group-hover:bg-wisepix-600 group-hover:text-white">
                <Icon size={20} />
              </div>
              <div>
                <p className="font-black text-wisepix-950">{label}</p>
                <p className="mt-1 text-sm font-medium leading-5 text-slate-500">{description}</p>
              </div>
            </div>
          </Link>
        ))}
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Section>
          <h2 className="text-xl font-black text-wisepix-950">Atividade recente</h2>
          {orders.length ? (
            <div className="mt-4 divide-y divide-blue-50">
              {orders.map((order) => (
                <Link key={order.id} href={`/anuncio/${order.listing.slug}`} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-bold text-wisepix-950">{order.listing.title}</p>
                    <p className="text-xs font-semibold text-slate-500">{order.status}</p>
                  </div>
                  <p className="font-black text-wisepix-700">{formatCurrency(order.amountCents)}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <PolishedEmptyState icon={ShoppingBag} title="Você ainda não tem pedidos." description="Compras e vendas registradas aparecerão aqui." />
            </div>
          )}
        </Section>

        <Section>
          <h2 className="text-xl font-black text-wisepix-950">Conta</h2>
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-slate-50 p-4">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-premium-black text-lg font-black text-white">
              {session.user.name?.[0]?.toUpperCase() ?? session.user.username?.[0]?.toUpperCase() ?? "W"}
            </div>
            <div>
              <p className="font-black text-wisepix-950">@{session.user.username ?? "sem_username"}</p>
              <p className="text-sm font-medium text-slate-500">{session.user.sellerLevel}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>{notifications.length} notificação(ões)</Badge>
            <Badge tone="slate">{session.user.roles?.join(", ") ?? "USER"}</Badge>
          </div>
          <ButtonLink href={session.user.username ? `/perfil/${session.user.username}` : "/onboarding"} variant="secondary" className="mt-4 w-full">
            <UserRound size={18} /> Abrir meu perfil
          </ButtonLink>
        </Section>
      </div>
    </MobileShell>
  );
}
