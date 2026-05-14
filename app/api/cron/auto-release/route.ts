import { NextRequest, NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { auditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const dueOrders = await prisma.order.findMany({
    where: {
      status: OrderStatus.DELIVERED,
      autoReleaseAt: { lte: new Date() },
      dispute: null
    },
    take: 100
  });

  const completed = await prisma.$transaction(
    dueOrders.map((order) =>
      prisma.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.COMPLETED,
          completedAt: new Date()
        }
      })
    )
  );

  await Promise.all(
    completed.map((order) =>
      auditLog({
        action: "order.auto_released",
        targetType: "Order",
        targetId: order.id,
        metadata: {
          autoReleaseAt: order.autoReleaseAt,
          miusePaymentId: order.miusePaymentId,
          financialStatus: order.miuseFinancialStatus
        }
      })
    )
  );

  return NextResponse.json({ completed: completed.length });
}
