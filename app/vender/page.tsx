import { redirect } from "next/navigation";
import { ListingForm } from "@/components/listing-form";
import { MobileShell } from "@/components/mobile-shell";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export default async function SellPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
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
