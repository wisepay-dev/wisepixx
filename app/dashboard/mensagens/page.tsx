import { MessageCircle } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { UnderConstruction } from "@/components/under-construction";
import { requireUser } from "@/lib/guards";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  await requireUser("/dashboard/mensagens");
  return (
    <MobileShell>
      <UnderConstruction icon={MessageCircle} title="Mensagens em construção" description="Conversas de pedidos e negociações aparecerão aqui." />
    </MobileShell>
  );
}
