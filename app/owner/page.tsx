import Link from "next/link";
import { redirect } from "next/navigation";
import { MobileShell } from "@/components/mobile-shell";
import { StatCard } from "@/components/stat-card";
import { auth } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { canAccessOwner } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export default async function OwnerPage() {
  const session = await auth();
  if (!canAccessOwner(session?.user?.roles)) redirect("/");

  const [orders, users, sellers, stores, visits, pageviews, disputes, withdrawals] = await Promise.all([
    prisma.order.aggregate({ _sum: { amountCents: true, saleFeeCents: true }, where: { status: { in: ["PAID", "DELIVERED", "COMPLETED"] } } }),
    prisma.user.count(),
    prisma.user.count({ where: { roles: { has: "SELLER" } } }),
    prisma.store.count({ where: { status: "ACTIVE" } }),
    prisma.siteVisit.count(),
    prisma.pageView.count(),
    prisma.dispute.count({ where: { status: "OPEN" } }),
    prisma.withdrawal.count({ where: { status: "REQUESTED" } })
  ]);

  return (
    <MobileShell>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-black text-wisepix-950">Painel OWNER</h1>
          <p className="mt-2 text-sm font-medium text-slate-600">Controle financeiro, produto, stores, taxas, badges, admins e Discord roles.</p>
        </div>
        <Link href="/owner/stores" className="flex h-11 items-center justify-center rounded-lg bg-premium-black px-4 font-bold text-white">
          Gerenciar stores
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="GMV total" value={formatCurrency(orders._sum.amountCents ?? 0)} detail="Pedidos pagos" />
        <StatCard label="Lucro WisePix" value={formatCurrency(orders._sum.saleFeeCents ?? 0)} detail="Taxas arrecadadas" />
        <StatCard label="Usuários" value={String(users)} detail={`${sellers} vendedores ativos`} />
        <StatCard label="Stores ativas" value={String(stores)} detail="Parceiros WisePix" />
        <StatCard label="Acessos" value={String(visits)} detail={`${pageviews} pageviews`} />
        <StatCard label="Disputas" value={String(disputes)} detail="Abertas" />
        <StatCard label="Saques suspeitos" value={String(withdrawals)} detail="Pendentes de revisão" />
        <StatCard label="Mobile-first" value="PWA" detail="Instalação iOS/Android" />
      </div>
    </MobileShell>
  );
}
