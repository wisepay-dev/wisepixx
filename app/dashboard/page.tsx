import Link from "next/link";
import { Bell, MessageCircle, PackagePlus, Settings, ShoppingBag, Store } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { requireUser } from "@/lib/guards";

export const dynamic = "force-dynamic";

const actions = [
  { href: "/dashboard/vendedor", label: "Painel vendedor", icon: Store },
  { href: "/dashboard/vendedor/anuncios/novo", label: "Criar anúncio", icon: PackagePlus },
  { href: "/dashboard/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/dashboard/mensagens", label: "Mensagens", icon: MessageCircle },
  { href: "/dashboard/notificacoes", label: "Notificações", icon: Bell },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings }
];

export default async function DashboardPage() {
  const session = await requireUser("/dashboard");

  return (
    <MobileShell>
      <section className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
        <p className="text-sm font-black uppercase text-wisepix-700">Dashboard</p>
        <h1 className="mt-2 text-3xl font-black text-wisepix-950">Bem-vindo à WisePix{session.user.name ? `, ${session.user.name}` : ""}.</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Acompanhe sua conta, pedidos, mensagens e área de vendedor.</p>
      </section>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex items-center gap-3 rounded-lg border border-blue-100 bg-white p-4 font-bold text-wisepix-950 shadow-sm">
            <Icon size={20} className="text-wisepix-700" /> {label}
          </Link>
        ))}
      </div>
    </MobileShell>
  );
}
