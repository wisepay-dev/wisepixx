import Link from "next/link";
import type { ElementType } from "react";
import { Bell, Compass, Home, LayoutDashboard, LogIn, Menu, PackagePlus, Rss, Search, Settings, ShieldCheck, UserRound } from "lucide-react";
import { auth } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { Avatar, Dropdown } from "@/components/ui/primitives";

const publicNav = [
  { href: "/explorar", label: "Explorar" },
  { href: "/como-funciona", label: "Como funciona" }
];

const mobileItems = [
  { href: "/", label: "Início", icon: Home },
  { href: "/explorar", label: "Explorar", icon: Search },
  { href: "/feed", label: "Feed", icon: Rss },
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { href: "/perfil", label: "Perfil", icon: UserRound }
];

export async function MobileShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const profileHref = session?.user?.username ? `/perfil/${session.user.username}` : "/onboarding";

  return (
    <div className="min-h-screen text-premium-black">
      <header className="sticky top-0 z-30 border-b border-blue-100/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 rounded-lg focus:outline-none focus:ring-4 focus:ring-wisepix-200">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-wisepix-600 font-black text-white shadow-sm">W</span>
            <span className="text-lg font-black tracking-normal text-wisepix-950">WisePix</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {publicNav.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-wisepix-50 hover:text-wisepix-900">
                {item.label}
              </Link>
            ))}
            {session?.user ? (
              <>
                <Link href="/feed" className="rounded-lg px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-wisepix-50 hover:text-wisepix-900">
                  Feed
                </Link>
                <Link href="/dashboard" className="rounded-lg px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-wisepix-50 hover:text-wisepix-900">
                  Dashboard
                </Link>
              </>
            ) : null}
          </nav>

          <div className="flex items-center gap-2">
            {session?.user ? (
              <>
                <Link href="/dashboard/notificacoes" className="grid h-10 w-10 place-items-center rounded-lg border border-blue-100 bg-white text-wisepix-900 transition hover:bg-wisepix-50" aria-label="Notificações">
                  <Bell size={18} />
                </Link>
                <Dropdown label={<Avatar name={session.user.name ?? session.user.username} src={session.user.image} />}>
                  <div className="px-2 py-2">
                    <p className="text-sm font-black text-wisepix-950">{session.user.name ?? "WisePix"}</p>
                    <p className="text-xs font-semibold text-slate-500">@{session.user.username ?? "sem_username"}</p>
                  </div>
                  <div className="mt-1 grid gap-1 border-t border-blue-50 pt-2">
                    <MenuLink href={profileHref} icon={UserRound} label="Meu perfil" />
                    <MenuLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                    <MenuLink href="/dashboard/vendedor/anuncios/novo" icon={PackagePlus} label="Criar anúncio" />
                    <MenuLink href="/dashboard/configuracoes" icon={Settings} label="Configurações" />
                    {session.user.roles?.some((role) => role === "ADMIN" || role === "OWNER") ? <MenuLink href="/admin" icon={ShieldCheck} label="Admin" /> : null}
                    {session.user.roles?.includes("OWNER") ? <MenuLink href="/owner" icon={Compass} label="Owner" /> : null}
                    <div className="px-2 pt-1"><LogoutButton /></div>
                  </div>
                </Dropdown>
              </>
            ) : (
              <>
                <Link href="/login" className="hidden h-10 items-center rounded-lg border border-blue-100 px-4 text-sm font-bold text-wisepix-800 transition hover:bg-wisepix-50 sm:inline-flex">
                  Entrar
                </Link>
                <Link href="/register" className="inline-flex h-10 items-center rounded-lg bg-wisepix-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-wisepix-700">
                  Criar conta
                </Link>
                <Link href="/login" className="grid h-10 w-10 place-items-center rounded-lg border border-blue-100 text-wisepix-900 sm:hidden" aria-label="Entrar">
                  <LogIn size={18} />
                </Link>
              </>
            )}
            <details className="relative md:hidden">
              <summary className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded-lg border border-blue-100 bg-white text-wisepix-900">
                <Menu size={18} />
              </summary>
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-blue-100 bg-white p-2 shadow-soft">
                {publicNav.map((item) => <MenuLink key={item.href} href={item.href} icon={Search} label={item.label} />)}
                {session?.user ? <MenuLink href="/feed" icon={Rss} label="Feed" /> : null}
              </div>
            </details>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-5 sm:pb-10">{children}</main>

      <MobileBottomNav items={mobileItems} />
    </div>
  );
}

function MenuLink({ href, icon: Icon, label }: { href: string; icon: ElementType; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-wisepix-50 hover:text-wisepix-900">
      <Icon size={16} /> {label}
    </Link>
  );
}

export function MobileBottomNav({ items }: { items: { href: string; label: string; icon: ElementType }[] }) {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-blue-100 bg-white/95 px-2 py-2 backdrop-blur-xl sm:hidden">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-bold text-wisepix-950 transition active:bg-wisepix-50">
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return <MobileShell>{children}</MobileShell>;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return <MobileShell>{children}</MobileShell>;
}
