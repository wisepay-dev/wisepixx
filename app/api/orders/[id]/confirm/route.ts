import { NextRequest, NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { auditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { dispute: true }
  });

  if (!order || order.buyerId !== session.user.id) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  if (order.status !== OrderStatus.DELIVERED) return NextResponse.json({ error: "Pedido ainda não está em entrega." }, { status: 400 });
  if (order.dispute) return NextResponse.json({ error: "Pedido em disputa permanece locked na Miuse." }, { status: 409 });

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: OrderStatus.COMPLETED,
      completedAt: new Date()
    }
  });

  await auditLog({
    actorId: session.user.id,
    action: "order.confirmed_by_buyer",
    targetType: "Order",
    targetId: order.id,
    metadata: { miusePaymentId: order.miusePaymentId, financialStatus: order.miuseFinancialStatus }
  });

  return NextResponse.json({ order: updated });
}
