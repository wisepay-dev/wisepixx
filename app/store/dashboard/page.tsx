import { Store } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { UnderConstruction } from "@/components/under-construction";
import { requirePartnerOrOwner } from "@/lib/guards";

export const dynamic = "force-dynamic";

export default async function StoreDashboardPage() {
  await requirePartnerOrOwner("/store/dashboard");
  return (
    <MobileShell>
      <UnderConstruction icon={Store} title="Dashboard da store em construção" description="A gestão de lojas parceiras ficará disponível nesta área." />
    </MobileShell>
  );
}
