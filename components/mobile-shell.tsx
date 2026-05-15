import Link from "next/link";
import { Bell, Home, LayoutDashboard, PlusCircle, Search, ShieldCheck, UserRound } from "lucide-react";
import { auth } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

const navItems = [
  { href: "/", label: "Início", icon: Home },
  { href: "/explorar", label: "Explorar", icon: Search },
  { href: "/dashboard/vendedor/anuncios/novo", label: "Vender", icon: PlusCircle },
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { href: "/perfil", label: "Perfil", icon: UserRound }
];

export async function MobileShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const profileHref = session?.user?.username ? `/perfil/${session.user.username}` : "/onboarding";

  return (
    <div className="min-h-screen bg-[#f8fbff] text-premium-black">
      <header className="sticky top-0 z-30 border-b border-blue-100 bg-white/92 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-wisepix-500 font-black text-white">W</span>
            <span className="text-lg font-black tracking-normal text-wisepix-950">WisePix</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/explorar" className="hidden rounded-lg border border-blue-100 px-3 py-2 text-sm font-semibold text-wisepix-800 sm:inline-flex">
              Explorar
            </Link>
            {session?.user?.roles?.includes("OWNER") ? (
              <Link href="/owner" className="hidden rounded-lg border border-blue-100 px-3 py-2 text-sm font-semibold text-wisepix-800 sm:inline-flex">
                Owner
              </Link>
            ) : null}
            {session?.user?.roles?.some((role) => role === "ADMIN" || role === "OWNER") ? (
              <Link href="/admin" className="hidden rounded-lg border border-blue-100 px-3 py-2 text-sm font-semibold text-wisepix-800 sm:inline-flex">
                Admin
              </Link>
            ) : null}
            <button className="grid h-10 w-10 place-items-center rounded-lg border border-blue-100 text-wisepix-900" aria-label="Notificações">
              <Bell size={18} />
            </button>
            {session?.user ? (
              <>
                <Link href={profileHref} className="hidden rounded-lg border border-blue-100 px-3 py-2 text-sm font-semibold text-wisepix-800 sm:inline-flex">
                  Meu perfil
                </Link>
                <Link href="/dashboard" className="hidden rounded-lg border border-blue-100 px-3 py-2 text-sm font-semibold text-wisepix-800 sm:inline-flex">
                  Dashboard
                </Link>
                <LogoutButton />
                <Link href={profileHref} className="grid h-10 w-10 place-items-center rounded-lg bg-premium-black text-sm font-bold text-white" title={session.user.name ?? "Meu perfil"}>
                  {session.user.name?.[0]?.toUpperCase() ?? session.user.username?.[0]?.toUpperCase() ?? "U"}
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="rounded-lg border border-blue-100 px-4 py-2 text-sm font-bold text-wisepix-800">
                  Entrar
                </Link>
                <Link href="/register" className="rounded-lg bg-wisepix-600 px-4 py-2 text-sm font-bold text-white">
                  Criar conta
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-5 sm:pb-8">{children}</main>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-blue-100 bg-white/95 px-2 py-2 backdrop-blur sm:hidden">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-semibold text-wisepix-950">
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="fixed bottom-24 right-4 hidden rounded-full border border-blue-100 bg-white px-3 py-2 text-xs font-semibold text-wisepix-900 shadow-soft sm:flex">
        <ShieldCheck size={16} className="mr-2" /> Proteção WisePix ativa
      </div>
    </div>
  );
}
