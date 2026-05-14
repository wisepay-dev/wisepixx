import { NextRequest, NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { auditLog } from "@/lib/audit";
import { getAutoReleaseAt } from "@/lib/orders";
import { prisma } from "@/lib/prisma";


export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { listing: true, dispute: true }
  });

  if (!order || order.sellerId !== session.user.id) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  if (order.status !== OrderStatus.PAID) return NextResponse.json({ error: "Pedido precisa estar pago para entrega." }, { status: 400 });
  if (order.dispute) return NextResponse.json({ error: "Pedido em disputa não pode iniciar auto release." }, { status: 409 });

  const deliveredAt = new Date();
  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: OrderStatus.DELIVERED,
      deliveredAt,
      autoReleaseAt: getAutoReleaseAt(order.listing.deliveryType, deliveredAt)
    }
  });

  await auditLog({
    actorId: session.user.id,
    action: "order.delivered",
    targetType: "Order",
    targetId: order.id,
    metadata: { autoReleaseAt: updated.autoReleaseAt }
  });

  return NextResponse.json({ order: updated });
}
