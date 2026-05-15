import type { MetadataRoute } from "next";
import { canShowPublicSeedData } from "@/lib/environment";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://wisepix.online";
  const [listings, stores, users] = canShowPublicSeedData
    ? await Promise.all([
        prisma.listing.findMany({ where: { status: "ACTIVE" }, select: { slug: true, updatedAt: true } }),
        prisma.store.findMany({ where: { status: "ACTIVE" }, select: { slug: true, updatedAt: true } }),
        prisma.user.findMany({ where: { username: { not: null } }, select: { username: true, updatedAt: true } })
      ])
    : [[], [], []];

  return [
    "",
    "/marketplace",
    "/como-funciona",
    "/termos",
    "/privacidade",
    "/produtos-proibidos",
    "/regras-vendedores",
    "/politica-disputas",
    ...listings.map((item) => `/anuncio/${item.slug}`),
    ...stores.map((item) => `/loja/${item.slug}`),
    ...users.map((item) => `/@${item.username}`)
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7
  }));
}
