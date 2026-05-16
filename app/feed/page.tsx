import Link from "next/link";
import { MessageCircle, PackageCheck, Rss } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Avatar, Badge, ButtonLink, PageHeader, PolishedEmptyState, Section } from "@/components/ui/primitives";
import { canShowPublicSeedData } from "@/lib/environment";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const posts = await prisma.feedPost.findMany({
    where: !canShowPublicSeedData ? { author: { email: { not: { endsWith: "@wisepix.dev" } } } } : {},
    include: {
      author: { select: { username: true, name: true, image: true, sellerLevel: true } },
      listing: { select: { slug: true, title: true } },
      media: true,
      likes: { select: { id: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 30
  });

  return (
    <MobileShell>
      <PageHeader eyebrow="Social" title="Feed WisePix" description="Acompanhe atualizações reais de vendedores, produtos e reputação da comunidade." action={<ButtonLink href="/dashboard/vendedor/anuncios/novo">Criar anúncio</ButtonLink>} />
      {posts.length ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {posts.map((post) => (
              <Section key={post.id}>
                <div className="flex items-start gap-3">
                  <Avatar name={post.author.name ?? post.author.username} src={post.author.image} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-black text-wisepix-950">@{post.author.username ?? "usuario"}</p>
                        <p className="text-xs font-semibold text-slate-500">{post.author.sellerLevel} · {post.createdAt.toLocaleString("pt-BR")}</p>
                      </div>
                      {post.automatic ? <Badge>Automático</Badge> : <Badge tone="slate">Post</Badge>}
                    </div>
                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">{post.text}</p>
                    {post.listing ? (
                      <Link href={`/anuncio/${post.listing.slug}`} className="mt-3 flex items-center gap-2 rounded-lg bg-wisepix-50 p-3 text-sm font-bold text-wisepix-900">
                        <PackageCheck size={18} /> {post.listing.title}
                      </Link>
                    ) : null}
                    <p className="mt-3 text-xs font-bold text-slate-400">{post.likes.length} curtida(s)</p>
                  </div>
                </div>
              </Section>
            ))}
          </div>
          <Section className="h-fit">
            <h2 className="flex items-center gap-2 text-xl font-black text-wisepix-950"><MessageCircle size={20} /> Comunidade</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">O feed mostra atividade real. Sem relatos fictícios, sem números inventados.</p>
          </Section>
        </div>
      ) : (
        <PolishedEmptyState icon={Rss} title="A comunidade WisePix ainda está começando." description="Quando houver posts reais de vendedores e lojas, eles aparecerão aqui." />
      )}
    </MobileShell>
  );
}
