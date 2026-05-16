import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { ButtonLink, Badge, PageHeader, PolishedEmptyState, Section } from "@/components/ui/primitives";
import { formatCurrency } from "@/lib/format";
import { requireUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await requireUser("/dashboard/pedidos");
  const orders = await prisma.order.findMany({
    where: { OR: [{ buyerId: session.user.id }, { sellerId: session.user.id }] },
    include: { listing: true, buyer: { select: { username: true, name: true } }, seller: { select: { username: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 40
  });

  return (
    <MobileShell>
      <PageHeader eyebrow="Pedidos" title="Meus pedidos" description="Acompanhe compras e vendas registradas na WisePix." action={<ButtonLink href="/explorar" variant="secondary">Explorar anúncios</ButtonLink>} />
      {orders.length ? (
        <Section className="p-0">
          <div className="divide-y divide-blue-50">
            {orders.map((order) => (
              <Link key={order.id} href={`/anuncio/${order.listing.slug}`} className="flex flex-col gap-3 p-4 transition hover:bg-wisepix-50 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-black text-wisepix-950">{order.listing.title}</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    {order.buyerId === session.user.id ? `Compra de @${order.seller.username ?? "vendedor"}` : `Venda para @${order.buyer.username ?? "comprador"}`}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <Badge tone={order.status === "COMPLETED" ? "green" : order.status === "DISPUTE" ? "amber" : "blue"}>{order.status}</Badge>
                  <p className="font-black text-wisepix-700">{formatCurrency(order.amountCents)}</p>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      ) : (
        <PolishedEmptyState
          icon={ShoppingBag}
          title="Você ainda não tem pedidos."
          description="Quando comprar ou vender pela WisePix, seus pedidos aparecerão aqui com status, valores e próximos passos."
          action={<ButtonLink href="/explorar">Explorar WisePix</ButtonLink>}
        />
      )}
    </MobileShell>
  );
}
