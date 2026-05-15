import { Bell } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { UnderConstruction } from "@/components/under-construction";
import { requireUser } from "@/lib/guards";

export const dynamic = "force-dynamic";

export default async function NotificationSettingsPage() {
  await requireUser("/dashboard/configuracoes/notificacoes");
  return (
    <MobileShell>
      <UnderConstruction icon={Bell} title="Preferências de notificação em construção" description="Você poderá escolher canais e eventos de notificação nesta área." />
    </MobileShell>
  );
}
