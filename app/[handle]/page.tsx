import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HandlePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  if (!handle.startsWith("@")) {
    const store = await prisma.store.findUnique({ where: { slug: handle }, select: { slug: true } });
    if (store) redirect(`/loja/${store.slug}`);
    notFound();
  }

  const username = decodeURIComponent(handle.slice(1));
  const user = await prisma.user.findUnique({ where: { username }, select: { username: true } });
  if (!user) notFound();
  redirect(`/perfil/${user.username}`);
}
