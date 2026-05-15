import { redirect } from "next/navigation";
import { MobileShell } from "@/components/mobile-shell";
import { requireUser } from "@/lib/guards";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await requireUser("/onboarding");
  if (session.user.username) redirect("/dashboard");

  return (
    <MobileShell>
      <section className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-black text-wisepix-950">Complete seu perfil</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Seu perfil ainda precisa de um username para aparecer corretamente na WisePix. Em breve esta tela terá edição completa de username, nome público, avatar e bio.
        </p>
      </section>
    </MobileShell>
  );
}
