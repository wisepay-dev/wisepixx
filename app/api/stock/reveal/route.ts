import { NextRequest, NextResponse } from "next/server";
import { OrderStatus, StockStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { getClientIp } from "@/lib/analytics";
import { decryptSecret, hashIp } from "@/lib/crypto";
import { getAutoReleaseAt } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { orderId } = (await request.json()) as { orderId?: string };
  if (!orderId) return NextResponse.json({ error: "Pedido obrigatório" }, { status: 400 });

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { soldStock: true, listing: true }
  });
  if (!order || order.buyerId !== session.user.id) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  const releasableStatuses: OrderStatus[] = [OrderStatus.PAID, OrderStatus.DELIVERED, OrderStatus.COMPLETED];
  if (!releasableStatuses.includes(order.status)) {
    return NextResponse.json({ error: "Pagamento ainda não liberado." }, { status: 403 });
  }

  let stock = order.soldStock;
  if (!stock && order.listing.deliveryType === "AUTOMATIC") {
    stock = await prisma.stockItem.findFirst({
      where: { listingId: order.listingId, status: StockStatus.AVAILABLE },
      orderBy: { createdAt: "asc" }
    });
    if (!stock) return NextResponse.json({ error: "Estoque automático indisponível." }, { status: 409 });
    const stockId = stock.id;

    const deliveredAt = new Date();
    const updated = await prisma.$transaction(async (tx) => {
      const soldStock = await tx.stockItem.update({
        where: { id: stockId },
        data: {
          status: StockStatus.SOLD,
          soldOrderId: order.id,
          revealedAt: deliveredAt,
          revealIpHash: hashIp(getClientIp(request)),
          revealUserAgent: request.headers.get("user-agent")
        }
      });
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.DELIVERED,
          deliveredAt,
          autoReleaseAt: getAutoReleaseAt(order.listing.deliveryType, deliveredAt)
        }
      });
      return soldStock;
    });
    stock = updated;
  }

  if (!stock) return NextResponse.json({ error: "Este pedido usa entrega manual." }, { status: 400 });

  if (!stock.revealedAt) {
    stock = await prisma.stockItem.update({
      where: { id: stock.id },
      data: {
        revealedAt: new Date(),
        revealIpHash: hashIp(getClientIp(request)),
        revealUserAgent: request.headers.get("user-agent")
      }
    });
  }

  return NextResponse.json({
    secretType: stock.secretType,
    secret: decryptSecret(stock.encryptedSecret),
    revealedAt: stock.revealedAt
  });
}
