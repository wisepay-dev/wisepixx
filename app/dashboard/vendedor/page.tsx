import { redirect } from "next/navigation";
import { Package, Wallet } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { StatCard } from "@/components/stat-card";
import { auth } from "@/lib/auth";
import { formatCurrency, formatPercent } from "@/lib/format";
import { getSellerFees } from "@/lib/fees";
import { getMiuseBalance, type MiuseBalanceView } from "@/lib/miuse";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export default async function SellerDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [wallet, listings, orders, reviews, fees] = await Promise.all([
    prisma.sellerWallet.upsert({
      where: { userId: session.user.id },
      update: {},
      create: { userId: session.user.id, walletId: `seller_${session.user.id}` }
    }),
    prisma.listing.findMany({ where: { sellerId: session.user.id }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.order.findMany({ where: { sellerId: session.user.id }, include: { listing: true }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.review.findMany({ where: { sellerId: session.user.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    getSellerFees(session.user.sellerLevel as never)
  ]);
  let miuseBalance: MiuseBalanceView = { available: 0, locked: 0, pending: 0, scheduled: 0 };
  let balanceError: string | null = null;
  try {
    miuseBalance = await getMiuseBalance(wallet.walletId);
  } catch (error) {
    balanceError = error instanceof Error ? error.message : "Não foi possível consultar o saldo Miuse.";
  }

  const soldToday = orders
    .filter((order) => order.paidAt && order.paidAt.toDateString() === new Date().toDateString())
    .reduce((sum, order) => sum + order.amountCents, 0);

  return (
    <MobileShell>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-wisepix-950">Painel vendedor</h1>
          <p className="mt-2 text-sm font-medium text-slate-600">Saldo, pedidos, anúncios, estoque e analytics.</p>
        </div>
        <div className="hidden rounded-lg bg-premium-black px-4 py-3 text-right text-white sm:block">
          <p className="text-xs font-bold text-blue-100">Nível</p>
          <p className="font-black">{session.user.sellerLevel}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Saldo disponível" value={formatCurrency(miuseBalance.available)} detail="Miuse available" />
        <StatCard label="Saldo travado" value={formatCurrency(miuseBalance.locked)} detail="Miuse locked" />
        <StatCard label="Aguardando confirmação" value={formatCurrency(miuseBalance.pending)} detail="Miuse pending" />
        <StatCard label="Liberação futura" value={formatCurrency(miuseBalance.scheduled)} detail="Miuse scheduled" />
        {balanceError ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900 sm:col-span-2 lg:col-span-4">
            Não foi possível consultar o BalanceView da Miuse agora: {balanceError}
          </div>
        ) : null}
        <StatCard label="Vendido hoje" value={formatCurrency(soldToday)} detail={`Taxa venda ${formatPercent(fees.saleFeePercent)}`} />
        <StatCard label="Taxa saque" value={formatPercent(fees.withdrawalFeePercent)} detail="Configurável por nível" />
      </div>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
          <h2 className="flex items-center gap-2 text-xl font-black text-wisepix-950"><Package size={20} /> Anúncios</h2>
          <div className="mt-4 space-y-3">
            {listings.map((listing) => (
              <div key={listing.id} className="flex items-center justify-between gap-3 border-b border-blue-50 pb-3 last:border-0">
                <div>
                  <p className="font-bold text-wisepix-950">{listing.title}</p>
                  <p className="text-xs font-semibold text-slate-500">{listing.status} · {listing.deliveryType}</p>
                </div>
                <p className="font-black text-wisepix-700">{formatCurrency(listing.priceCents)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
          <h2 className="flex items-center gap-2 text-xl font-black text-wisepix-950"><Wallet size={20} /> Pedidos</h2>
          <div className="mt-4 space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between gap-3 border-b border-blue-50 pb-3 last:border-0">
                <div>
                  <p className="font-bold text-wisepix-950">{order.listing.title}</p>
                  <p className="text-xs font-semibold text-slate-500">{order.status}</p>
                </div>
                <p className="font-black text-wisepix-700">{formatCurrency(order.amountCents)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
        <h2 className="text-xl font-black text-wisepix-950">Avaliações recentes</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-lg bg-slate-50 p-3">
              <p className="font-black text-wisepix-950">{review.rating}/5</p>
              <p className="mt-1 text-sm text-slate-600">{review.comment}</p>
            </div>
          ))}
        </div>
      </section>
    </MobileShell>
  );
}
