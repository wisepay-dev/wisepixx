import { ListingForm } from "@/components/listing-form";
import { MobileShell } from "@/components/mobile-shell";
import { requireUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewSellerListingPage() {
  await requireUser("/dashboard/vendedor/anuncios/novo");
  const categories = await prisma.category.findMany({ where: { active: true }, orderBy: { name: "asc" } });

  return (
    <MobileShell>
      <div className="mb-5">
        <h1 className="text-3xl font-black text-wisepix-950">Criar anúncio</h1>
        <p className="mt-2 text-sm font-medium text-slate-600">Publique um produto digital com preço fixo ou negociável.</p>
      </div>
      <ListingForm categories={categories} />
    </MobileShell>
  );
}
