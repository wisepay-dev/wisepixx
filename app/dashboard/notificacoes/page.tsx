import Link from "next/link";
import { Bell } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Badge, ButtonLink, PageHeader, PolishedEmptyState, Section } from "@/components/ui/primitives";
import { requireUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const session = await requireUser("/dashboard/notificacoes");
  const notifications = await prisma.notification.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, take: 40 });

  return (
    <MobileShell>
      <PageHeader eyebrow="Conta" title="Notificações" description="Avisos importantes da sua operação, pedidos, reputação e conta." action={<ButtonLink href="/dashboard/configuracoes/notificacoes" variant="secondary">Preferências</ButtonLink>} />
      {notifications.length ? (
        <Section className="p-0">
          <div className="divide-y divide-blue-50">
            {notifications.map((notification) => {
              const content = (
                <article className="flex gap-3 p-4 transition hover:bg-wisepix-50">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-wisepix-50 text-wisepix-700">
                    <Bell size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-black text-wisepix-950">{notification.title}</p>
                      <Badge tone={notification.readAt ? "slate" : "blue"}>{notification.readAt ? "Lida" : "Nova"}</Badge>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{notification.body}</p>
                    <p className="mt-2 text-xs font-bold text-slate-400">{notification.createdAt.toLocaleString("pt-BR")}</p>
                  </div>
                </article>
              );
              return notification.url ? <Link key={notification.id} href={notification.url}>{content}</Link> : <div key={notification.id}>{content}</div>;
            })}
          </div>
        </Section>
      ) : (
        <PolishedEmptyState icon={Bell} title="Nenhuma notificação por enquanto." description="Quando houver venda, pagamento, mensagem, badge ou disputa, você verá o aviso aqui." />
      )}
    </MobileShell>
  );
}
