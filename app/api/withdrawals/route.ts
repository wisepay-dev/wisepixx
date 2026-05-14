import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { calculateFeeCents, getSellerFees } from "@/lib/fees";
import { createMiuseWithdrawal } from "@/lib/miuse";
import { prisma } from "@/lib/prisma";

export const runtime = "edge";

const withdrawalSchema = z.object({
  amountCents: z.number().int().min(100),
  pixKey: z.string().min(3).max(180),
  pixKeyType: z.string().min(2).max(40)
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const parsed = withdrawalSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });

  const wallet = await prisma.sellerWallet.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id, walletId: `seller_${session.user.id}` }
  });
  const fees = await getSellerFees(session.user.sellerLevel as never);
  const withdrawalFeeCents = calculateFeeCents(parsed.data.amountCents, fees.withdrawalFeePercent);
  const idempotencyKey = crypto.randomUUID();

  const withdrawal = await prisma.withdrawal.create({
    data: {
      userId: session.user.id,
      walletId: wallet.walletId,
      amountCents: parsed.data.amountCents,
      withdrawalFeePercent: fees.withdrawalFeePercent,
      withdrawalFeeCents,
      netAmountCents: parsed.data.amountCents - withdrawalFeeCents,
      pixKey: parsed.data.pixKey,
      pixKeyType: parsed.data.pixKeyType,
      idempotencyKey,
      status: "PROCESSING"
    }
  });

  try {
    const miuseWithdrawal = await createMiuseWithdrawal({
      idempotencyKey,
      walletId: wallet.walletId,
      amountCents: parsed.data.amountCents,
      pixKey: parsed.data.pixKey,
      pixKeyType: parsed.data.pixKeyType
    });

    const miuseWithdrawalId = miuseWithdrawal.withdrawal_id ?? miuseWithdrawal.id;
    const updated = await prisma.withdrawal.update({
      where: { id: withdrawal.id },
      data: {
        miuseWithdrawalId,
        miuseStatus: miuseWithdrawal.status,
        status: miuseWithdrawal.status === "failed" ? "FAILED" : "PROCESSING"
      }
    });

    return NextResponse.json({ withdrawal: updated });
  } catch (error) {
    const failed = await prisma.withdrawal.update({
      where: { id: withdrawal.id },
      data: {
        status: "FAILED",
        failureReason: error instanceof Error ? error.message : "Falha ao criar saque na Miuse"
      }
    });
    return NextResponse.json({ withdrawal: failed, error: failed.failureReason }, { status: 502 });
  }
}
