import { MobileShell } from "@/components/mobile-shell";

export default function ForbiddenProductsPage() {
  return (
    <MobileShell>
      <article className="prose prose-slate max-w-none rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
        <h1>Produtos proibidos</h1>
        <p>É proibido vender produtos ilegais, contas roubadas, dados pessoais, métodos de fraude, malware, spam, pirataria, acesso não autorizado ou qualquer item sem direito de revenda.</p>
        <p>Streamings, gift cards e licenças só podem ser vendidos quando autorizados e com origem comprovável.</p>
      </article>
    </MobileShell>
  );
}
