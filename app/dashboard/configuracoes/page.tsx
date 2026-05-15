import { Settings } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { UnderConstruction } from "@/components/under-construction";
import { requireUser } from "@/lib/guards";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireUser("/dashboard/configuracoes");
  return (
    <MobileShell>
      <UnderConstruction icon={Settings} title="Configurações em construção" description="Edição de perfil, conta e preferências ficará disponível aqui." />
    </MobileShell>
  );
}
