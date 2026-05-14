import { MobileShell } from "@/components/mobile-shell";

export default function HowItWorksPage() {
  return (
    <MobileShell>
      <article className="prose prose-slate max-w-none rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
        <h1>Como funciona</h1>
        <p>A WisePix conecta compradores e vendedores de produtos digitais com checkout Pix, proteção de pedido e entrega manual ou automática.</p>
        <h2>Venda</h2>
        <p>Crie um anúncio, escolha categoria, preço fixo ou negociável, tipo de entrega e publique para a comunidade.</p>
        <h2>Pagamento</h2>
        <p>O checkout usa Miuse para Pix, split, wallets, webhooks e saques. Não há Pix simulado.</p>
        <h2>Entrega</h2>
        <p>Na entrega manual, comprador e vendedor seguem pelo chat. Na automática, o estoque secreto criptografado é liberado após pagamento aprovado.</p>
      </article>
    </MobileShell>
  );
}
