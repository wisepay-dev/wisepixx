import { MobileShell } from "@/components/mobile-shell";

export default function PrivacyPage() {
  return (
    <MobileShell>
      <article className="prose prose-slate max-w-none rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
        <h1>Política de privacidade</h1>
        <p>Coletamos dados de conta, pedidos, dispositivos, preferências de notificação e conexões sociais para operar marketplace, segurança e suporte.</p>
        <p>Informações sensíveis são protegidas com controles técnicos e acesso restrito conforme a finalidade do serviço.</p>
      </article>
    </MobileShell>
  );
}
