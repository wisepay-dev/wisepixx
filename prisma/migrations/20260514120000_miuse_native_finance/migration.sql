ALTER TABLE "Order"
ADD COLUMN "miuseFinancialStatus" TEXT,
ADD COLUMN "miuseRecipientStatuses" JSONB,
ADD COLUMN "miuseLiquidator" TEXT,
ADD COLUMN "miuseCreatedAt" TIMESTAMP(3),
ADD COLUMN "autoReleaseAt" TIMESTAMP(3);

ALTER TABLE "Withdrawal"
ADD COLUMN "walletId" TEXT NOT NULL DEFAULT '',
ADD COLUMN "miuseStatus" TEXT,
ADD COLUMN "pixKey" TEXT,
ADD COLUMN "pixKeyType" TEXT;

UPDATE "Withdrawal"
SET "walletId" = 'seller_' || "userId"
WHERE "walletId" = '';
