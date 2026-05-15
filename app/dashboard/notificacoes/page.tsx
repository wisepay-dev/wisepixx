import { Bell } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { UnderConstruction } from "@/components/under-construction";
import { requireUser } from "@/lib/guards";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  await requireUser("/dashboard/notificacoes");
  return (
    <MobileShell>
      <UnderConstruction icon={Bell} title="Notificações em construção" description="Suas notificações da WisePix aparecerão aqui." />
    </MobileShell>
  );
}
