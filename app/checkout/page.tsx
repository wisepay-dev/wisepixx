import { redirect } from "next/navigation";
import { CheckoutButton } from "@/components/checkout-button";
import { MobileShell } from "@/components/mobile-shell";
import { Badge, PageHeader, Section } from "@/components/ui/primitives";
import { formatCurrency } from "@/lib/format";
import { requireUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ listingId?: string }> }) {
  await requireUser("/checkout");
  const params = await searchParams;
  if (!params.listingId) redirect("/marketplace");

  const listing = await prisma.listing.findUnique({
    where: { id: params.listingId },
    include: { seller: { select: { username: true, name: true } } }
  });
  if (!listing) redirect("/marketplace");

  return (
    <MobileShell>
      <PageHeader eyebrow="Checkout" title="Pagamento Pix" description="Revise o produto, gere o Pix e acompanhe o status do pedido pela WisePix." />
      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <Section>
          <h2 className="text-xl font-black text-wisepix-950">Resumo do pedido</h2>
          <div className="mt-4 rounded-lg bg-wisepix-50 p-4">
            <p className="text-sm font-bold text-slate-500">Produto</p>
            <p className="mt-1 text-lg font-black text-wisepix-950">{listing.title}</p>
            <p className="mt-2 text-sm font-semibold text-slate-600">Vendedor: @{listing.seller.username ?? "seller"}</p>
            <p className="mt-3 text-3xl font-black text-wisepix-700">{formatCurrency(listing.priceCents)}</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Badge>Pedido registrado</Badge>
            <Badge tone="green">Pix</Badge>
            <Badge tone="slate">Proteção WisePix</Badge>
          </div>
        </Section>

        <Section>
          <h2 className="text-xl font-black text-wisepix-950">Gerar pagamento</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">O pagamento e o status financeiro são processados por parceiro integrado. A WisePix registra o pedido e a entrega.</p>
          <div className="mt-5">
            <CheckoutButton listingId={listing.id} />
          </div>
        </Section>
      </div>
    </MobileShell>
  );
}
