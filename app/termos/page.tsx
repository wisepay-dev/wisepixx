import { MobileShell } from "@/components/mobile-shell";

export default function TermsPage() {
  return (
    <MobileShell>
      <article className="prose prose-slate max-w-none rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
        <h1>Termos de uso</h1>
        <p>Ao usar a WisePix, você concorda em vender apenas itens digitais legais, autorizados e entregáveis, mantendo comunicação clara e provas de entrega.</p>
        <p>Vendedores são responsáveis por descrição, estoque, suporte e cumprimento das regras. A WisePix pode moderar anúncios, disputas e contas com risco.</p>
      </article>
    </MobileShell>
  );
}
