import { ShoppingBag } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { UnderConstruction } from "@/components/under-construction";
import { requireUser } from "@/lib/guards";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  await requireUser("/dashboard/pedidos");
  return (
    <MobileShell>
      <UnderConstruction icon={ShoppingBag} title="Pedidos em construção" description="Seus pedidos aparecerão aqui quando o fluxo público de compras estiver ativo." />
    </MobileShell>
  );
}
