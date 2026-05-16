import { notFound } from "next/navigation";
import { ListingForm } from "@/components/listing-form";
import { MobileShell } from "@/components/mobile-shell";
import { PageHeader } from "@/components/ui/primitives";
import { requireUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireUser("/dashboard/vendedor");
  const { id } = await params;
  const [categories, listing] = await Promise.all([
    prisma.category.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.listing.findUnique({ where: { id } })
  ]);

  if (!listing || listing.sellerId !== session.user.id) notFound();

  return (
    <MobileShell>
      <PageHeader eyebrow="Vendas" title="Editar anúncio" description="Atualize preço, descrição, entrega e estoque mantendo a página clara para o comprador." />
      <ListingForm
        categories={categories}
        initial={{
          id: listing.id,
          title: listing.title,
          description: listing.description,
          categoryId: listing.categoryId,
          priceCents: listing.priceCents,
          negotiable: listing.negotiable,
          deliveryType: listing.deliveryType,
          images: listing.images,
          stockCount: listing.stockCount
        }}
      />
    </MobileShell>
  );
}
