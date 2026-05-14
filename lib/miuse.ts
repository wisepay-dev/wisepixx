import { encryptSecret } from "@/lib/crypto";

const BASE_URL = process.env.MIUSE_BASE_URL ?? "https://api.miuse.app/v1/api";

type MiuseRequestOptions = {
  path: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  token?: string;
  idempotencyKey?: string;
  body?: unknown;
};

export type MiuseBalanceView = {
  available: number;
  locked: number;
  pending: number;
  scheduled: number;
};

export type MiusePaymentResponse = {
  id?: string;
  payment_id?: string;
  pix_qr?: string;
  pix_copy_paste?: string;
  qr?: string | { code?: string; image?: string };
  status?: string;
  financial_status?: string;
  recipient_statuses?: unknown;
  recipients?: unknown;
  liquidator?: string;
  created_at?: string;
  [key: string]: unknown;
};

export type MiuseWithdrawalResponse = {
  id?: string;
  withdrawal_id?: string;
  status?: string;
  created_at?: string;
  [key: string]: unknown;
};

async function miuseRequest<T>(options: MiuseRequestOptions): Promise<T> {
  const token = options.token ?? process.env.MIUSE_PLATFORM_TOKEN;
  if (!token) throw new Error("MIUSE_PLATFORM_TOKEN is required");

  const response = await fetch(`${BASE_URL}${options.path}`, {
    method: options.method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.idempotencyKey ? { "Idempotency-Key": options.idempotencyKey } : {})
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store"
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Miuse request failed ${response.status}: ${details}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function createSellerAccessToken(userId: string) {
  const walletId = `seller_${userId}`;
  const response = await miuseRequest<{ token: string; id?: string }>({
    path: "/access-tokens",
    method: "POST",
    body: {
      wallet_id: walletId,
      scopes: [
        "read:payments",
        "write:payments",
        "read:withdrawals",
        "write:withdrawals",
        "read:balance"
      ],
      label: `WisePix seller ${userId}`,
      expires_in: null,
      magic: false
    }
  });

  return {
    walletId,
    encryptedToken: encryptSecret(response.token),
    accessTokenId: response.id
  };
}

export type CreateMiusePaymentInput = {
  idempotencyKey: string;
  orderId: string;
  amountCents: number;
  sellerWalletId: string;
  ownerWalletId: string;
  platformFeeCents: number;
  sellerAmountCents: number;
  description: string;
  buyer: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
  item: {
    id: string;
    title: string;
    quantity?: number;
  };
};

export function normalizeMiusePayment(payment: MiusePaymentResponse) {
  const qr = payment.qr;
  return {
    paymentId: payment.payment_id ?? payment.id,
    pixQr: payment.pix_qr ?? (typeof qr === "string" ? qr : qr?.image ?? qr?.code),
    pixCopyPaste: payment.pix_copy_paste ?? (typeof qr === "object" ? qr.code : undefined),
    status: payment.status,
    financialStatus: payment.financial_status ?? payment.status,
    recipientStatuses: payment.recipient_statuses ?? payment.recipients,
    liquidator: payment.liquidator,
    createdAt: payment.created_at ? new Date(payment.created_at) : undefined
  };
}

export async function createMiusePayment(input: CreateMiusePaymentInput) {
  return miuseRequest<MiusePaymentResponse>({
    path: "/payments",
    method: "POST",
    idempotencyKey: input.idempotencyKey,
    body: {
      owner: {
        wallet_id: input.ownerWalletId
      },
      customer: {
        id: input.buyer.id,
        name: input.buyer.name,
        email: input.buyer.email
      },
      recipients: [
        {
          wallet_id: input.sellerWalletId,
          amount: input.sellerAmountCents,
          metadata: {
            role: "seller",
            order_id: input.orderId
          }
        },
        {
          wallet_id: input.ownerWalletId,
          amount: input.platformFeeCents,
          metadata: {
            role: "wisepix_fee",
            order_id: input.orderId
          }
        }
      ],
      qr: true,
      items: [
        {
          id: input.item.id,
          title: input.item.title,
          description: input.description,
          quantity: input.item.quantity ?? 1,
          amount: input.amountCents
        }
      ],
      metadata: {
        orderId: input.orderId,
        platform: "WisePix"
      }
    }
  });
}

export async function getMiuseBalance(walletId: string, token?: string): Promise<MiuseBalanceView> {
  const path = (process.env.MIUSE_BALANCE_PATH_TEMPLATE ?? "/wallets/{wallet_id}/balance").replace("{wallet_id}", encodeURIComponent(walletId));
  return miuseRequest<MiuseBalanceView>({ path, method: "GET", token });
}

export async function createMiuseWithdrawal(input: {
  token?: string;
  idempotencyKey: string;
  walletId: string;
  amountCents: number;
  pixKey: string;
  pixKeyType: string;
}) {
  return miuseRequest<MiuseWithdrawalResponse>({
    path: "/withdrawals",
    method: "POST",
    token: input.token,
    idempotencyKey: input.idempotencyKey,
    body: {
      wallet_id: input.walletId,
      amount: input.amountCents,
      pix_key: input.pixKey,
      pix_key_type: input.pixKeyType
    }
  });
}
