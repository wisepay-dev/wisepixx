import { MobileShell } from "@/components/mobile-shell";
import { requireOwner } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OwnerStoresPage() {
  await requireOwner("/owner/stores");
  const [stores, users, themes] = await Promise.all([
    prisma.store.findMany({ include: { owner: { select: { username: true, name: true } }, theme: true }, orderBy: { createdAt: "desc" } }),
    prisma.user.findMany({ select: { id: true, username: true, name: true, email: true }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.storeTheme.findMany({ orderBy: { name: "asc" } })
  ]);

  return (
    <MobileShell>
      <h1 className="text-3xl font-black text-wisepix-950">Stores parceiras</h1>
      <form action="/api/owner/stores" method="post" className="mt-5 grid gap-3 rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-600">Criação via API OWNER. Para produção, conectar este formulário a uma action que envie JSON e trate erros em tela.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <select name="ownerId" className="h-12 rounded-lg border-blue-100">
            {users.map((user) => <option key={user.id} value={user.id}>{user.username ?? user.email ?? user.name}</option>)}
          </select>
          <select name="themeId" className="h-12 rounded-lg border-blue-100">
            {themes.map((theme) => <option key={theme.id} value={theme.id}>{theme.name}</option>)}
          </select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="name" placeholder="Nome da Store" className="h-12 rounded-lg border-blue-100" />
          <input name="subdomain" placeholder="elitekeys" className="h-12 rounded-lg border-blue-100" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="saleFeePercent" defaultValue="7" inputMode="decimal" className="h-12 rounded-lg border-blue-100" />
          <input name="withdrawalFeePercent" defaultValue="5" inputMode="decimal" className="h-12 rounded-lg border-blue-100" />
        </div>
        <button className="h-12 rounded-lg bg-wisepix-600 font-bold text-white">Criar Store</button>
      </form>
      <div className="mt-5 grid gap-3">
        {stores.map((store) => (
          <article key={store.id} className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-wisepix-950">{store.name}</h2>
                <p className="text-sm font-semibold text-slate-500">{store.subdomain}.wisepix.online · /loja/{store.slug}</p>
              </div>
              <span className="rounded-lg bg-wisepix-50 px-3 py-1 text-xs font-black text-wisepix-800">{store.status}</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">Responsável: @{store.owner.username ?? store.owner.name ?? "user"} · Tema: {store.theme?.name ?? "Sem tema"}</p>
          </article>
        ))}
      </div>
    </MobileShell>
  );
}
