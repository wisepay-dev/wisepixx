import Link from "next/link";
import { BarChart3, Package, PlusCircle, Star, Wallet } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Badge, ButtonLink, PageHeader, PolishedEmptyState, Section, StatCard } from "@/components/ui/primitives";
import { formatCurrency, formatPercent } from "@/lib/format";
import { getSellerFees } from "@/lib/fees";
import { requireUser } from "@/lib/guards";
import { getMiuseBalance, type MiuseBalanceView } from "@/lib/miuse";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SellerDashboardPage() {
  const session = await requireUser("/dashboard/vendedor");

  const [wallet, listings, orders, reviews, fees] = await Promise.all([
    prisma.sellerWallet.upsert({
      where: { userId: session.user.id },
      update: {},
      create: { userId: session.user.id, walletId: `seller_${session.user.id}` }
    }),
    prisma.listing.findMany({ where: { sellerId: session.user.id }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.order.findMany({ where: { sellerId: session.user.id }, include: { listing: true }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.review.findMany({ where: { sellerId: session.user.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    getSellerFees(session.user.sellerLevel as never)
  ]);
  let miuseBalance: MiuseBalanceView = { available: 0, locked: 0, pending: 0, scheduled: 0 };
  let balanceError: string | null = null;
  try {
    miuseBalance = await getMiuseBalance(wallet.walletId);
  } catch {
    balanceError = "Saldo temporariamente indisponível. Tente novamente em instantes.";
  }

  const soldToday = orders
    .filter((order) => order.paidAt && order.paidAt.toDateString() === new Date().toDateString())
    .reduce((sum, order) => sum + order.amountCents, 0);
  const soldMonth = orders.reduce((sum, order) => sum + order.amountCents, 0);

  return (
    <MobileShell>
      <PageHeader
        eyebrow="Vendedor"
        title="Painel vendedor"
        description="Uma visão simples de saldo, anúncios, pedidos e reputação para operar pelo celular."
        action={<ButtonLink href="/dashboard/vendedor/anuncios/novo"><PlusCircle size={18} /> Criar anúncio</ButtonLink>}
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Saldo disponível" value={formatCurrency(miuseBalance.available)} detail="Pronto para saque" icon={Wallet} />
        <StatCard label="Saldo travado" value={formatCurrency(miuseBalance.locked)} detail="Em análise/disputa" icon={Wallet} />
        <StatCard label="Aguardando" value={formatCurrency(miuseBalance.pending)} detail="Confirmação financeira" icon={Wallet} />
        <StatCard label="Liberação futura" value={formatCurrency(miuseBalance.scheduled)} detail="Agendado" icon={Wallet} />
      </section>
      {balanceError ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-900">{balanceError}</p>
      ) : null}

      <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Vendido hoje" value={formatCurrency(soldToday)} detail="Pedidos pagos" icon={BarChart3} />
        <StatCard label="Vendido no mês" value={formatCurrency(soldMonth)} detail="Pedidos recentes" icon={BarChart3} />
        <StatCard label="Taxa atual" value={formatPercent(fees.saleFeePercent)} detail={`Nível ${session.user.sellerLevel}`} icon={Star} />
        <StatCard label="Anúncios" value={String(listings.length)} detail="Catálogo do vendedor" icon={Package} />
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <Section>
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-xl font-black text-wisepix-950"><Package size={20} /> Anúncios</h2>
            <ButtonLink href="/dashboard/vendedor/anuncios/novo" variant="secondary">Novo</ButtonLink>
          </div>
          {listings.length ? (
            <div className="mt-4 divide-y divide-blue-50">
              {listings.map((listing) => (
                <div key={listing.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold text-wisepix-950">{listing.title}</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <Badge tone={listing.status === "ACTIVE" ? "green" : "slate"}>{listing.status}</Badge>
                      <Badge>{listing.deliveryType === "AUTOMATIC" ? `${listing.stockCount} estoque` : "Manual"}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-wisepix-700">{formatCurrency(listing.priceCents)}</p>
                    <Link href={`/dashboard/vendedor/anuncios/${listing.id}/editar`} className="rounded-lg border border-blue-100 px-3 py-2 text-sm font-bold text-wisepix-800 transition hover:bg-wisepix-50">
                      Editar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <PolishedEmptyState icon={Package} title="Crie seu primeiro anúncio." description="Produtos digitais publicados aparecem aqui com preço, estoque e status." action={<ButtonLink href="/dashboard/vendedor/anuncios/novo">Criar anúncio</ButtonLink>} />
            </div>
          )}
        </Section>

        <Section>
          <h2 className="flex items-center gap-2 text-xl font-black text-wisepix-950"><Wallet size={20} /> Pedidos</h2>
          {orders.length ? (
            <div className="mt-4 divide-y divide-blue-50">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-bold text-wisepix-950">{order.listing.title}</p>
                    <p className="text-xs font-semibold text-slate-500">{order.status}</p>
                  </div>
                  <p className="font-black text-wisepix-700">{formatCurrency(order.amountCents)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <PolishedEmptyState icon={Wallet} title="Você ainda não recebeu pedidos." description="Quando uma venda for criada, o pedido aparecerá aqui com status e valor." />
            </div>
          )}
        </Section>
      </section>

      <Section className="mt-6">
        <h2 className="text-xl font-black text-wisepix-950">Avaliações recentes</h2>
        {reviews.length ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-lg bg-slate-50 p-3">
                <p className="font-black text-wisepix-950">{review.rating}/5</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-600">As primeiras avaliações aparecerão após pedidos concluídos.</p>
        )}
      </Section>
    </MobileShell>
  );
}
