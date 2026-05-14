import { redirect } from "next/navigation";
import { MobileShell } from "@/components/mobile-shell";
import { StatCard } from "@/components/stat-card";
import { auth } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!canAccessAdmin(session?.user?.roles)) redirect("/");

  const [users, kyc, listings, disputes, withdrawals, tickets] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { kycStatus: "PENDING" } }),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.dispute.count({ where: { status: "OPEN" } }),
    prisma.withdrawal.count({ where: { status: "REQUESTED" } }),
    prisma.supportTicket.count({ where: { status: { in: ["OPEN", "WAITING_SUPPORT"] } } })
  ]);

  return (
    <MobileShell>
      <h1 className="text-3xl font-black text-wisepix-950">Painel admin</h1>
      <p className="mt-2 text-sm font-medium text-slate-600">Operação e moderação. Lucro global e taxas ficam restritos ao OWNER.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Usuários" value={String(users)} detail="Base total" />
        <StatCard label="KYC pendente" value={String(kyc)} detail="Aprovação manual" />
        <StatCard label="Anúncios ativos" value={String(listings)} detail="Moderação de catálogo" />
        <StatCard label="Disputas abertas" value={String(disputes)} detail="Risco operacional" />
        <StatCard label="Saques pendentes" value={String(withdrawals)} detail="Revisão de pagamentos" />
        <StatCard label="Suporte" value={String(tickets)} detail="Tickets abertos" />
      </div>
    </MobileShell>
  );
}
