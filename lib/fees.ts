import { SellerLevel } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const DEFAULT_FEES: Record<SellerLevel, { saleFeePercent: number; withdrawalFeePercent: number }> = {
  BRONZE: { saleFeePercent: 9, withdrawalFeePercent: 5.5 },
  SILVER: { saleFeePercent: 8, withdrawalFeePercent: 5.2 },
  GOLD: { saleFeePercent: 7, withdrawalFeePercent: 5 },
  DIAMOND: { saleFeePercent: 6, withdrawalFeePercent: 4.8 },
  LEGEND: { saleFeePercent: 5.5, withdrawalFeePercent: 4.5 }
};

export function calculateFeeCents(amountCents: number, percent: number) {
  return Math.round((amountCents * percent) / 100);
}

export async function getSellerFees(level: SellerLevel) {
  const config = await prisma.feeConfig.findUnique({ where: { level } });
  if (!config?.active) return DEFAULT_FEES[level];
  return {
    saleFeePercent: Number(config.saleFeePercent),
    withdrawalFeePercent: Number(config.withdrawalFeePercent)
  };
}
