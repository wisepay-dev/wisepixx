import { MobileShell } from "@/components/mobile-shell";

export const runtime = "edge";

export default function PrivacyPage() {
  return (
    <MobileShell>
      <article className="prose prose-slate max-w-none rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
        <h1>Política de privacidade</h1>
        <p>Coletamos dados de conta, pedidos, dispositivos, IP anonimizado, preferências de notificação e conexões sociais para operar marketplace, segurança e suporte.</p>
        <p>Tokens sensíveis e estoque automático são salvos criptografados. IPs usados em analytics são armazenados como hash.</p>
      </article>
    </MobileShell>
  );
}
