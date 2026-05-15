import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, MessageCircle, PackageSearch, Settings } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ListingCard } from "@/components/listing-card";
import { MobileShell } from "@/components/mobile-shell";
import { auth } from "@/lib/auth";
import { canShowPublicSeedData, isSeedEmail } from "@/lib/environment";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { username: decodeURIComponent(username) },
    include: {
      profile: true,
      badges: { include: { badge: true } },
      listings: {
        where: { status: "ACTIVE" },
        include: {
          category: true,
          seller: { select: { username: true, name: true, sellerLevel: true, kycStatus: true } },
          store: { select: { name: true, slug: true, subdomain: true, verified: true } }
        },
        take: 8,
        orderBy: { createdAt: "desc" }
      },
      feedPosts: { orderBy: { createdAt: "desc" }, take: 6 }
    }
  });

  if (!user) notFound();
  const isSelf = session?.user?.id === user.id;
  if (!isSelf && !canShowPublicSeedData && isSeedEmail(user.email)) notFound();

  return (
    <MobileShell>
      <section className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-soft">
        <div className="h-32 bg-premium-black sm:h-48">
          {user.profile?.bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.profile.bannerUrl} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="-mt-12 grid h-20 w-20 place-items-center rounded-lg border-4 border-white bg-wisepix-600 text-2xl font-black text-white">
                {user.name?.[0]?.toUpperCase() ?? user.username?.[0]?.toUpperCase() ?? "W"}
              </div>
              <div>
                <h1 className="flex items-center gap-2 text-2xl font-black text-wisepix-950">
                  @{user.username}
                  {user.kycStatus === "APPROVED" ? <BadgeCheck size={20} className="text-wisepix-600" /> : null}
                </h1>
                <p className="text-sm font-bold text-slate-500">{user.profile?.displayName ?? user.name}</p>
              </div>
            </div>
            {isSelf ? (
              <Link href="/dashboard/configuracoes" className="flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-100 px-3 text-sm font-bold text-wisepix-800">
                <Settings size={16} /> Editar perfil
              </Link>
            ) : null}
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">{user.profile?.bio ?? "Perfil WisePix."}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {user.badges.map(({ badge }) => (
              <span key={badge.id} className="rounded-lg bg-wisepix-50 px-3 py-1 text-xs font-black text-wisepix-800">{badge.name}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-xl font-black text-wisepix-950">Produtos</h2>
        {user.listings.length ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {user.listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
          </div>
        ) : (
          <EmptyState icon={PackageSearch} title="Nenhum anúncio publicado ainda." description="Os primeiros produtos deste perfil aparecerão aqui." />
        )}
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-xl font-black text-wisepix-950">Feed</h2>
        {user.feedPosts.length ? (
          <div className="space-y-3">
            {user.feedPosts.map((post) => (
              <article key={post.id} className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
                <p className="text-sm leading-6 text-slate-700">{post.text}</p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState icon={MessageCircle} title="A comunidade WisePix ainda está começando." description="O feed público será exibido quando houver atividade real." />
        )}
      </section>
    </MobileShell>
  );
}
