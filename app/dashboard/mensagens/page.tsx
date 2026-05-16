import { MessageCircle } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Avatar, PageHeader, PolishedEmptyState, Section } from "@/components/ui/primitives";
import { requireUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const session = await requireUser("/dashboard/mensagens");
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: session.user.id },
        { order: { OR: [{ buyerId: session.user.id }, { sellerId: session.user.id }] } }
      ]
    },
    include: { sender: { select: { name: true, username: true, image: true } }, order: { include: { listing: true } } },
    orderBy: { createdAt: "desc" },
    take: 40
  });

  return (
    <MobileShell>
      <PageHeader eyebrow="Chat" title="Mensagens" description="Conversas ligadas a pedidos ficam registradas para facilitar entrega, suporte e segurança." />
      {messages.length ? (
        <Section className="p-0">
          <div className="divide-y divide-blue-50">
            {messages.map((message) => (
              <article key={message.id} className="flex gap-3 p-4">
                <Avatar name={message.sender.name ?? message.sender.username} src={message.sender.image} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-black text-wisepix-950">@{message.sender.username ?? "usuario"}</p>
                    <p className="text-xs font-bold text-slate-400">{message.createdAt.toLocaleString("pt-BR")}</p>
                  </div>
                  {message.order ? <p className="mt-1 text-xs font-bold text-wisepix-700">{message.order.listing.title}</p> : null}
                  <p className="mt-2 text-sm leading-6 text-slate-700">{message.body}</p>
                </div>
              </article>
            ))}
          </div>
        </Section>
      ) : (
        <PolishedEmptyState icon={MessageCircle} title="Nenhuma mensagem por enquanto." description="Quando um pedido ou negociação gerar conversa, ela aparecerá aqui com histórico organizado." />
      )}
    </MobileShell>
  );
}
