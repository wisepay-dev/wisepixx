import { NextRequest, NextResponse } from "next/server";
import { DeliveryType, ListingStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { auditLog } from "@/lib/audit";
import { encryptSecret } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";
import { listingSchema } from "@/lib/validation";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    const { id } = await params;

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: "Dados inválidos. Envie as informações novamente." }, { status: 400 });
    }

    const parsed = listingSchema.safeParse(payload);
    if (!parsed.success) return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });

    const existing = await prisma.listing.findUnique({ where: { id }, include: { stockItems: true } });
    if (!existing || existing.sellerId !== session.user.id) return NextResponse.json({ error: "Anúncio não encontrado." }, { status: 404 });

    const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
    if (!category) return NextResponse.json({ error: "Categoria inválida" }, { status: 400 });

    const addedStock = parsed.data.deliveryType === DeliveryType.AUTOMATIC ? parsed.data.stockSecrets.length : 0;
    const availableStock = existing.stockItems.filter((item) => item.status === "AVAILABLE").length + addedStock;

    const listing = await prisma.listing.update({
      where: { id: existing.id },
      data: {
        categoryId: parsed.data.categoryId,
        title: sanitizeText(parsed.data.title),
        description: sanitizeText(parsed.data.description),
        priceCents: parsed.data.priceCents,
        negotiable: parsed.data.negotiable,
        deliveryType: parsed.data.deliveryType,
        images: parsed.data.images,
        status: ListingStatus.ACTIVE,
        stockCount: parsed.data.deliveryType === DeliveryType.AUTOMATIC ? availableStock : 0,
        stockItems: parsed.data.deliveryType === DeliveryType.AUTOMATIC && parsed.data.stockSecrets.length
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

    await auditLog({ actorId: session.user.id, action: "listing.updated", targetType: "Listing", targetId: listing.id });
    return NextResponse.json({ listing });
  } catch (error) {
    console.error("listing_update_error", error);
    return NextResponse.json({ error: "Não foi possível salvar o anúncio agora." }, { status: 500 });
  }
}
