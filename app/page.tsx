import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Bot,
  CheckCircle2,
  CreditCard,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Smartphone,
  Store,
  UsersRound
} from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { MobileShell } from "@/components/mobile-shell";

export const dynamic = "force-dynamic";

const steps = [
  "Crie sua conta",
  "Publique seu produto",
  "Receba pedidos",
  "Entregue manualmente ou automaticamente",
  "Construa reputação"
];

const sellerBenefits = [
  "Anúncios para produtos digitais e serviços",
  "Estoque automático para códigos, links e acessos",
  "Loja própria futuramente para parceiros",
  "Notificações para pedidos e mensagens",
  "Painel simples para acompanhar operação"
];

const buyerBenefits = [
  "Checkout simples pensado para Pix",
  "Acompanhamento do pedido em um só lugar",
  "Avaliações para ajudar na decisão",
  "Disputa quando algo precisar de revisão"
];

export default function HomePage() {
  return (
    <MobileShell>
      <section className="overflow-hidden rounded-lg bg-premium-black text-white shadow-soft">
        <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
          <div className="flex flex-col justify-center">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-lg bg-white/10 px-3 py-1 text-xs font-bold text-blue-100">Plataforma digital</span>
              <span className="rounded-lg bg-white/10 px-3 py-1 text-xs font-bold text-blue-100">Mobile-first</span>
              <span className="rounded-lg bg-white/10 px-3 py-1 text-xs font-bold text-blue-100">Discord-first</span>
            </div>
            <h1 className="mt-7 max-w-3xl text-4xl font-black leading-tight tracking-normal sm:text-6xl">
              Venda produtos digitais pelo celular, com Pix e reputação.
            </h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-blue-100 sm:text-lg">
              A WisePix conecta vendedores e compradores de produtos digitais, serviços, automações, bots, design e lojas parceiras com uma experiência simples, social e profissional.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="flex h-12 items-center justify-center gap-2 rounded-lg bg-wisepix-500 px-5 font-bold text-white">
                Criar conta <ArrowRight size={19} />
              </Link>
              <Link href="/explorar" className="flex h-12 items-center justify-center rounded-lg border border-white/20 px-5 font-bold text-white">
                Explorar WisePix
              </Link>
              <a href="#como-funciona" className="flex h-12 items-center justify-center rounded-lg border border-white/20 px-5 font-bold text-white">
                Conhecer a WisePix
              </a>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <div className="rounded-lg bg-white p-4 text-premium-black">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase text-wisepix-700">WisePix</p>
                  <h2 className="mt-1 text-2xl font-black text-wisepix-950">WisePix app</h2>
                </div>
                <Smartphone className="text-wisepix-600" size={28} />
              </div>
              <div className="mt-5 space-y-3">
                {["Marketplace digital", "Checkout Pix", "Pedidos e entregas", "Reputação pública"].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-lg bg-wisepix-50 p-3">
                    <CheckCircle2 size={18} className="text-wisepix-700" />
                    <span className="text-sm font-bold text-wisepix-950">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="mt-10">
        <div className="mb-4">
          <p className="text-sm font-black uppercase text-wisepix-700">Como funciona</p>
          <h2 className="mt-2 text-3xl font-black text-wisepix-950">Da vitrine ao pedido, sem complicar.</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, index) => (
            <div key={step} className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-wisepix-600 text-sm font-black text-white">{index + 1}</span>
              <p className="mt-4 text-sm font-black text-wisepix-950">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-2xl font-black text-wisepix-950">
            <PackageCheck size={23} className="text-wisepix-600" /> Para vendedores
          </h2>
          <div className="mt-5 grid gap-3">
            {sellerBenefits.map((item) => (
              <p key={item} className="flex items-start gap-3 text-sm font-semibold leading-6 text-slate-700">
                <BadgeCheck size={18} className="mt-0.5 shrink-0 text-wisepix-600" /> {item}
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-2xl font-black text-wisepix-950">
            <CreditCard size={23} className="text-wisepix-600" /> Para compradores
          </h2>
          <div className="mt-5 grid gap-3">
            {buyerBenefits.map((item) => (
              <p key={item} className="flex items-start gap-3 text-sm font-semibold leading-6 text-slate-700">
                <BadgeCheck size={18} className="mt-0.5 shrink-0 text-wisepix-600" /> {item}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-[0.58fr_0.42fr]">
        <div className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-2xl font-black text-wisepix-950">
            <ShieldCheck size={23} className="text-wisepix-600" /> Proteção WisePix
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              "A WisePix registra pedidos, pagamentos e entregas para trazer mais segurança.",
              "Compradores podem acompanhar o pedido e abrir disputa se necessário.",
              "Vendedores contam com entrega automática, histórico e reputação.",
              "Pagamentos e saques serão processados por parceiros de pagamento integrados."
            ].map((item) => (
              <p key={item} className="rounded-lg bg-wisepix-50 p-3 text-sm font-semibold leading-6 text-wisepix-950">{item}</p>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-2xl font-black text-wisepix-950">
            <Store size={23} className="text-wisepix-600" /> Stores
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Lojas parceiras podem ter subdomínio, landing própria, catálogo, temas e presença conectada à comunidade.
          </p>
          <div className="mt-5">
            <EmptyState icon={Store} title="Nenhuma loja parceira ativa no momento." description="As lojas parceiras serão exibidas aqui quando estiverem disponíveis." />
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="flex items-center gap-2 text-2xl font-black text-wisepix-950">
            <Bot size={23} className="text-wisepix-600" /> Discord-first
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              { label: "Notificações", icon: Bell },
              { label: "Cargos e reputação", icon: BadgeCheck },
              { label: "Comunidade", icon: UsersRound },
              { label: "Bot WisePix", icon: Bot }
            ].map(({ label, icon: TypedIcon }) => {
              return (
                <div key={label} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                  <TypedIcon size={18} className="text-wisepix-700" />
                  <span className="text-sm font-black text-wisepix-950">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
        <EmptyState icon={MessageCircle} title="A comunidade WisePix ainda está começando." description="O feed público será exibido quando houver atividade real da comunidade." />
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-[0.45fr_0.55fr]">
        <div>
          <p className="text-sm font-black uppercase text-wisepix-700">Marketplace</p>
          <h2 className="mt-2 text-3xl font-black text-wisepix-950">Nenhum anúncio publicado ainda.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Os primeiros vendedores começarão a aparecer aqui em breve.
          </p>
          <Link href="/explorar" className="mt-5 inline-flex h-11 items-center justify-center rounded-lg border border-blue-100 px-4 text-sm font-bold text-wisepix-800">
            Explorar WisePix
          </Link>
        </div>
        <EmptyState icon={PackageCheck} title="Nenhum anúncio publicado ainda." description="Os primeiros vendedores começarão a aparecer aqui em breve." />
      </section>

      <section className="mt-10 rounded-lg bg-wisepix-950 p-5 text-white shadow-soft sm:p-8">
        <div className="grid gap-5 lg:grid-cols-[0.55fr_0.45fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase text-blue-200">Comece agora</p>
            <h2 className="mt-2 text-3xl font-black">Crie sua conta e prepare sua presença na WisePix.</h2>
            <p className="mt-3 text-sm leading-6 text-blue-100">
              Acesse o dashboard, publique anúncios quando estiver pronto e acompanhe sua operação em um só lugar.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Link href="/register" className="flex h-11 items-center justify-center rounded-lg bg-white px-4 text-sm font-black text-wisepix-950">
              Criar conta
            </Link>
            <Link href="/login" className="flex h-11 items-center justify-center rounded-lg border border-white/20 px-4 text-sm font-black text-white">
              Entrar
            </Link>
            <Link href="/dashboard/vendedor/anuncios/novo" className="flex h-11 items-center justify-center rounded-lg border border-white/20 px-4 text-sm font-black text-white">
              Começar a vender
            </Link>
          </div>
        </div>
      </section>

      <footer className="mt-10 border-t border-blue-100 py-6">
        <div className="flex flex-col gap-4 text-sm font-semibold text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>WisePix — plataforma digital para produtos e serviços digitais.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/termos">Termos</Link>
            <Link href="/privacidade">Privacidade</Link>
            <Link href="/produtos-proibidos">Produtos proibidos</Link>
            <a href="mailto:contato@wisepix.online">Contato</a>
            <a href="https://discord.gg/configure">Discord</a>
          </div>
        </div>
      </footer>
    </MobileShell>
  );
}
