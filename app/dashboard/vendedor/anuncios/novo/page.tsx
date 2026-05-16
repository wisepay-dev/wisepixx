import { ListingForm } from "@/components/listing-form";
import { MobileShell } from "@/components/mobile-shell";
import { PageHeader } from "@/components/ui/primitives";
import { requireUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewSellerListingPage() {
  await requireUser("/dashboard/vendedor/anuncios/novo");
  const categories = await prisma.category.findMany({ where: { active: true }, orderBy: { name: "asc" } });

  return (
    <MobileShell>
      <PageHeader eyebrow="Vendas" title="Criar anúncio" description="Publique um produto digital com preço, entrega e estoque bem explicados para o comprador." />
      <ListingForm categories={categories} />
    </MobileShell>
  );
}
