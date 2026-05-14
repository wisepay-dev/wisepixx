import { NextRequest, NextResponse } from "next/server";
import { OrderStatus, WithdrawalStatus } from "@prisma/client";
import { auditLog } from "@/lib/audit";
import { verifyHmacSha256 } from "@/lib/crypto";
import { notifyUser } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

export const runtime = "edge";

const PAYMENT_PAID = "payment.paid";
const SUPPORTED_EVENTS = new Set([
  PAYMENT_PAID,
  "payment.failed",
  "payment.cancelled",
  "payment.expired",
  "payment.dispute.opened",
  "payment.dispute.accepted",
  "payment.dispute.rejected",
  "withdrawal.settled",
  "withdrawal.failed",
  "refund.completed"
]);

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const secret = process.env.MIUSE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "MIUSE_WEBHOOK_SECRET ausente" }, { status: 500 });

  const valid = await verifyHmacSha256(rawBody, request.headers.get("x-webhook-signature"), secret);
  if (!valid) return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });

  const event = JSON.parse(rawBody) as {
    type?: string;
    data?: {
      id?: string;
      payment_id?: string;
      withdrawal_id?: string;
      status?: string;
      financial_status?: string;
      recipient_statuses?: unknown;
      recipients?: unknown;
      liquidator?: string;
      created_at?: string;
      metadata?: { orderId?: string; order_id?: string; withdrawalId?: string; withdrawal_id?: string };
    };
  };

  if (!event.type || !SUPPORTED_EVENTS.has(event.type)) {
    return NextResponse.json({ ignored: true });
  }

  const orderId = event.data?.metadata?.orderId ?? event.data?.metadata?.order_id;
  const paymentId = event.data?.payment_id ?? event.data?.id;

  if (event.type.startsWith("payment.") && (orderId || paymentId)) {
    const order = await prisma.order.findFirst({
      where: { OR: [{ id: orderId ?? "" }, { miusePaymentId: paymentId ?? "" }] },
      include: { listing: true }
    });

    if (order) {
      if (event.type === PAYMENT_PAID) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.PAID,
            miusePaymentId: paymentId,
            miuseStatus: event.data?.status,
            miuseFinancialStatus: event.data?.financial_status ?? event.data?.status,
            miuseRecipientStatuses:
              event.data?.recipient_statuses === undefined && event.data?.recipients === undefined
                ? undefined
                : JSON.parse(JSON.stringify(event.data.recipient_statuses ?? event.data.recipients)),
            miuseLiquidator: event.data?.liquidator,
            miuseCreatedAt: event.data?.created_at ? new Date(event.data.created_at) : undefined,
            paidAt: new Date()
          }
        });

        await notifyUser({
          userId: order.sellerId,
          event: "sale.new",
          title: "Nova venda aprovada",
          body: `${order.listing.title} foi pago via Pix.`,
          url: `/pedidos/${order.id}`
        });
      }

      if (["payment.failed", "payment.cancelled", "payment.expired"].includes(event.type)) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.CANCELLED,
            miuseStatus: event.data?.status,
            miuseFinancialStatus: event.data?.financial_status ?? event.data?.status
          }
        });
      }

      if (event.type === "payment.dispute.opened") {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.DISPUTE,
            miuseStatus: event.data?.status,
            miuseFinancialStatus: event.data?.financial_status ?? "locked"
          }
        });
      }

      if (["payment.dispute.accepted", "payment.dispute.rejected"].includes(event.type)) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            miuseStatus: event.data?.status,
            miuseFinancialStatus: event.data?.financial_status ?? event.data?.status,
            miuseRecipientStatuses:
              event.data?.recipient_statuses === undefined && event.data?.recipients === undefined
                ? undefined
                : JSON.parse(JSON.stringify(event.data.recipient_statuses ?? event.data.recipients))
          }
        });
      }

      if (event.type === "refund.completed") {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.REFUNDED,
            miuseStatus: event.data?.status,
            miuseFinancialStatus: event.data?.financial_status ?? "refunded"
          }
        });
      }
    }
  }

  if (event.type.startsWith("withdrawal.")) {
    const withdrawalId = event.data?.metadata?.withdrawalId ?? event.data?.metadata?.withdrawal_id;
    const miuseWithdrawalId = event.data?.withdrawal_id ?? event.data?.id;
    const withdrawal = await prisma.withdrawal.findFirst({
      where: { OR: [{ id: withdrawalId ?? "" }, { miuseWithdrawalId: miuseWithdrawalId ?? "" }] }
    });

    if (withdrawal) {
      await prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: event.type === "withdrawal.settled" ? WithdrawalStatus.SETTLED : WithdrawalStatus.FAILED,
          miuseStatus: event.data?.status,
          settledAt: event.type === "withdrawal.settled" ? new Date() : null
        }
      });
      await notifyUser({
        userId: withdrawal.userId,
        event: event.type,
        title: event.type === "withdrawal.settled" ? "Saque pago" : "Saque falhou",
        body: event.type === "withdrawal.settled" ? "Seu saque foi liquidado." : "Seu saque não foi concluído.",
        url: "/dashboard/vendedor"
      });
    }
  }

  await auditLog({ action: `miuse.${event.type}`, targetType: "Webhook", metadata: event });
  return NextResponse.json({ ok: true });
}
