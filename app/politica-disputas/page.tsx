import { MobileShell } from "@/components/mobile-shell";

export const runtime = "edge";

export default function DisputesPolicyPage() {
  return (
    <MobileShell>
      <article className="prose prose-slate max-w-none rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
        <h1>Política de disputas</h1>
        <p>Disputas podem ser abertas quando entrega, acesso, qualidade ou descrição forem contestados. Admins avaliam evidências, mensagens, reveal de estoque, IP e horários.</p>
        <p>O resultado pode liberar saldo, estornar pedido ou aplicar medidas de moderação.</p>
      </article>
    </MobileShell>
  );
}
