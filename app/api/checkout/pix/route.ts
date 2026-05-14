import { NextRequest, NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { calculateFeeCents, getSellerFees } from "@/lib/fees";
import { createMiusePayment, normalizeMiusePayment } from "@/lib/miuse";
import { prisma } from "@/lib/prisma";


const checkoutSchema = z.object({
  listingId: z.string().min(1),
  variantId: z.string().optional()
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const ownerWalletId = process.env.MIUSE_OWNER_WALLET_ID;
  if (!ownerWalletId) return NextResponse.json({ error: "MIUSE_OWNER_WALLET_ID não configurado" }, { status: 500 });

  const parsed = checkoutSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const listing = await prisma.listing.findUnique({
    where: { id: parsed.data.listingId },
    include: { seller: true, variants: true }
  });
  if (!listing || listing.status !== "ACTIVE") return NextResponse.json({ error: "Anúncio indisponível" }, { status: 404 });
  if (listing.sellerId === session.user.id) return NextResponse.json({ error: "Você não pode comprar seu próprio anúncio." }, { status: 400 });

  const variant = parsed.data.variantId ? listing.variants.find((item) => item.id === parsed.data.variantId) : null;
  const amountCents = variant?.priceCents ?? listing.priceCents;
  const fees = await getSellerFees(listing.seller.sellerLevel);
  const saleFeeCents = calculateFeeCents(amountCents, fees.saleFeePercent);
  const sellerAmountCents = amountCents - saleFeeCents;
  const idempotencyKey = crypto.randomUUID();
  const sellerWallet = await prisma.sellerWallet.upsert({
    where: { userId: listing.sellerId },
    update: {},
    create: { userId: listing.sellerId, walletId: `seller_${listing.sellerId}` }
  });
  const buyer = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true }
  });

  const order = await prisma.order.create({
    data: {
      buyerId: session.user.id,
      sellerId: listing.sellerId,
      listingId: listing.id,
      variantId: variant?.id,
      amountCents,
      saleFeePercent: fees.saleFeePercent,
      saleFeeCents,
      sellerReceivableCents: sellerAmountCents,
      status: OrderStatus.PENDING_PAYMENT,
      idempotencyKey,
      expiresAt: new Date(Date.now() + 30 * 60_000)
    }
  });

  try {
    const payment = await createMiusePayment({
      idempotencyKey,
      orderId: order.id,
      amountCents,
      sellerWalletId: sellerWallet.walletId,
      ownerWalletId,
      platformFeeCents: saleFeeCents,
      sellerAmountCents,
      description: `WisePix - ${listing.title}`,
      buyer: {
        id: buyer?.id ?? session.user.id,
        name: buyer?.name ?? session.user.name,
        email: buyer?.email ?? session.user.email
      },
      item: {
        id: listing.id,
        title: listing.title
      }
    });
    const normalized = normalizeMiusePayment(payment);

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        miusePaymentId: normalized.paymentId,
        miuseStatus: normalized.status,
        miuseFinancialStatus: normalized.financialStatus,
        miuseRecipientStatuses: normalized.recipientStatuses === undefined ? undefined : JSON.parse(JSON.stringify(normalized.recipientStatuses)),
        miuseLiquidator: normalized.liquidator,
        miuseCreatedAt: normalized.createdAt,
        pixQrCode: normalized.pixQr,
        pixCopyPaste: normalized.pixCopyPaste,
        metadata: JSON.parse(JSON.stringify(payment))
      }
    });
    return NextResponse.json({
      orderId: updatedOrder.id,
      paymentId: updatedOrder.miusePaymentId,
      status: updatedOrder.miuseStatus,
      pixQrCode: updatedOrder.pixQrCode,
      pixCopyPaste: updatedOrder.pixCopyPaste
    });
  } catch (error) {
    return NextResponse.json(
      {
        orderId: order.id,
        error: error instanceof Error ? error.message : "Falha ao criar pagamento Pix"
      },
      { status: 502 }
    );
  }
}
