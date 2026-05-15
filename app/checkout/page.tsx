import { redirect } from "next/navigation";
import { CheckoutButton } from "@/components/checkout-button";
import { MobileShell } from "@/components/mobile-shell";
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
      <div className="mx-auto max-w-2xl rounded-lg border border-blue-100 bg-white p-5 shadow-soft">
        <h1 className="text-2xl font-black text-wisepix-950">Checkout Pix</h1>
        <div className="mt-5 rounded-lg bg-wisepix-50 p-4">
          <p className="text-sm font-bold text-slate-500">Produto</p>
          <p className="mt-1 text-lg font-black text-wisepix-950">{listing.title}</p>
          <p className="mt-2 text-sm font-semibold text-slate-600">Vendedor: @{listing.seller.username ?? "seller"}</p>
          <p className="mt-3 text-3xl font-black text-wisepix-700">{formatCurrency(listing.priceCents)}</p>
        </div>
        <div className="mt-5">
          <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
            O Pix será gerado pela integração de pagamento quando o checkout público estiver habilitado.
          </p>
          <CheckoutButton listingId={listing.id} />
        </div>
      </div>
    </MobileShell>
  );
}
