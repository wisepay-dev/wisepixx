import { MobileShell } from "@/components/mobile-shell";
import { NotificationSettingsForm } from "@/components/settings-forms";
import { PageHeader, Section, Tabs } from "@/components/ui/primitives";
import { requireUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const defaultEvents = [
  "sale.new",
  "order.opened",
  "payment.paid",
  "chat.message",
  "withdrawal.settled",
  "dispute.opened",
  "badge.awarded",
  "level.changed",
  "marketing"
];

export default async function NotificationSettingsPage() {
  const session = await requireUser("/dashboard/configuracoes/notificacoes");
  const existing = await prisma.notificationPreference.findMany({ where: { userId: session.user.id }, orderBy: { event: "asc" } });
  const byEvent = new Map(existing.map((item) => [item.event, item]));
  const preferences = defaultEvents.map((event) => {
    const item = byEvent.get(event);
    return (
      item ?? {
        id: event,
        userId: session.user.id,
        event,
        site: event !== "marketing",
        push: event !== "marketing",
        discordDm: event !== "marketing",
        email: false,
        marketing: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    );
  });

  return (
    <MobileShell>
      <PageHeader eyebrow="Conta" title="Notificações" description="Escolha onde quer receber avisos importantes sobre pedidos, pagamentos, chat e reputação." />
      <Tabs
        active="/dashboard/configuracoes/notificacoes"
        items={[
          { href: "/dashboard/configuracoes", label: "Perfil" },
          { href: "/dashboard/configuracoes/notificacoes", label: "Notificações" }
        ]}
      />
      <Section className="mt-5">
        <NotificationSettingsForm preferences={preferences} />
      </Section>
    </MobileShell>
  );
}
