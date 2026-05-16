import { NextRequest, NextResponse } from "next/server";
import { DeliveryType, ListingStatus, UserRole } from "@prisma/client";
import { auth } from "@/lib/auth";
import { auditLog } from "@/lib/audit";
import { encryptSecret } from "@/lib/crypto";
import { canShowPublicSeedData } from "@/lib/environment";
import { prisma } from "@/lib/prisma";
import { sanitizeText, slugify } from "@/lib/sanitize";
import { listingSchema } from "@/lib/validation";


export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category");
  const deliveryType = searchParams.get("deliveryType") as DeliveryType | null;
  const negotiable = searchParams.get("negotiable");

  const listings = await prisma.listing.findMany({
    where: {
      status: ListingStatus.ACTIVE,
      ...(!canShowPublicSeedData ? { seller: { email: { not: { endsWith: "@wisepix.dev" } } } } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } }
            ]
          }
        : {}),
      ...(category ? { category: { slug: category } } : {}),
      ...(deliveryType ? { deliveryType } : {}),
      ...(negotiable ? { negotiable: negotiable === "true" } : {})
    },
    include: {
      category: true,
      seller: { select: { id: true, username: true, name: true, image: true, sellerLevel: true, kycStatus: true } },
      store: { select: { name: true, slug: true, subdomain: true, verified: true } }
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 60
  });

  return NextResponse.json({ listings });
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: "Dados inválidos. Envie as informações novamente." }, { status: 400 });
    }

    const parsed = listingSchema.safeParse(payload);
    if (!parsed.success) return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
    if (parsed.data.deliveryType === DeliveryType.AUTOMATIC && parsed.data.stockSecrets.length === 0) {
      return NextResponse.json({ error: "Adicione pelo menos um item de estoque para entrega automática." }, { status: 400 });
    }

    const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
    if (!category) return NextResponse.json({ error: "Categoria inválida" }, { status: 400 });

    const baseSlug = slugify(parsed.data.title);
    const slug = `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`;
    const listing = await prisma.listing.create({
      data: {
        sellerId: session.user.id,
        categoryId: parsed.data.categoryId,
        title: sanitizeText(parsed.data.title),
        slug,
        description: sanitizeText(parsed.data.description),
        priceCents: parsed.data.priceCents,
        negotiable: parsed.data.negotiable,
        deliveryType: parsed.data.deliveryType,
        images: parsed.data.images,
        status: ListingStatus.ACTIVE,
        stockCount: parsed.data.deliveryType === DeliveryType.AUTOMATIC ? parsed.data.stockSecrets.length : 0,
        publishedAt: new Date(),
        stockItems: parsed.data.deliveryType === DeliveryType.AUTOMATIC
          ? {
              create: await Promise.all(
                parsed.data.stockSecrets.map(async (secret) => ({
                  encryptedSecret: await encryptSecret(secret),
                  secretType: parsed.data.secretType ?? "texto"
                }))
              )
            }
          : undefined
      }
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { roles: { push: UserRole.SELLER } }
    }).catch(() => null);

    await prisma.sellerWallet.upsert({
      where: { userId: session.user.id },
      update: {},
      create: { userId: session.user.id, walletId: `seller_${session.user.id}` }
    });

    await auditLog({ actorId: session.user.id, action: "listing.created", targetType: "Listing", targetId: listing.id });
    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    console.error("listing_create_error", error);
    return NextResponse.json({ error: "Não foi possível publicar o anúncio agora. Verifique os dados e tente novamente." }, { status: 500 });
  }
}
