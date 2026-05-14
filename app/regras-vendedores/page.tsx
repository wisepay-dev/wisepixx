import { MobileShell } from "@/components/mobile-shell";

export default function SellerRulesPage() {
  return (
    <MobileShell>
      <article className="prose prose-slate max-w-none rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
        <h1>Regras vendedores</h1>
        <p>Use descrições precisas, entregue dentro do combinado, mantenha estoque válido, responda disputas e respeite compradores.</p>
        <p>KYC é opcional e não bloqueia funcionalidades, mas aprovação concede selo verificado, badge e cargo Discord configurável.</p>
      </article>
    </MobileShell>
  );
}
