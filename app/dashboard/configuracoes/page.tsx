import { Disc3, ShieldCheck } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { PasswordSettingsForm, ProfileSettingsForm } from "@/components/settings-forms";
import { Badge, ButtonLink, PageHeader, Section, Tabs } from "@/components/ui/primitives";
import { requireUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await requireUser("/dashboard/configuracoes");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true, accounts: { select: { provider: true } } }
  });

  if (!user) return null;
  const hasDiscord = user.accounts.some((account) => account.provider === "discord");

  return (
    <MobileShell>
      <PageHeader eyebrow="Conta" title="Configurações" description="Mantenha seu perfil público, segurança e preferências com informações reais e claras." />
      <Tabs
        active="/dashboard/configuracoes"
        items={[
          { href: "/dashboard/configuracoes", label: "Perfil" },
          { href: "/dashboard/configuracoes/notificacoes", label: "Notificações" }
        ]}
      />

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
        <Section>
          <h2 className="text-xl font-black text-wisepix-950">Perfil público</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Essas informações aparecem no seu perfil e ajudam compradores a entender quem está vendendo.</p>
          <div className="mt-5">
            <ProfileSettingsForm user={user} />
          </div>
        </Section>

        <div className="space-y-5">
          <Section>
            <h2 className="text-xl font-black text-wisepix-950">Segurança</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">Use uma senha forte e mantenha seus dados atualizados.</p>
            <div className="mt-5">
              <PasswordSettingsForm />
            </div>
          </Section>

          <Section>
            <h2 className="flex items-center gap-2 text-xl font-black text-wisepix-950">
              <Disc3 size={20} className="text-[#5865f2]" /> Discord
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Use Discord para login e notificações da WisePix quando disponível.</p>
            <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3">
              <div>
                <p className="font-bold text-wisepix-950">{hasDiscord ? "Discord conectado" : "Discord não conectado"}</p>
                <p className="text-xs font-medium text-slate-500">{hasDiscord ? "Sua conta já possui vínculo social." : "Você pode conectar pelo login com Discord."}</p>
              </div>
              <Badge tone={hasDiscord ? "green" : "slate"}>{hasDiscord ? "Ativo" : "Opcional"}</Badge>
            </div>
          </Section>

          <Section>
            <h2 className="flex items-center gap-2 text-xl font-black text-wisepix-950">
              <ShieldCheck size={20} className="text-wisepix-700" /> Conta WisePix
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Seu perfil público fica disponível pelo username escolhido.</p>
            <ButtonLink href={user.username ? `/perfil/${user.username}` : "/onboarding"} variant="secondary" className="mt-4 w-full">
              Abrir meu perfil
            </ButtonLink>
          </Section>
        </div>
      </div>
    </MobileShell>
  );
}
