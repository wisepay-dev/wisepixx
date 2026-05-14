# Setup Miuse

Base URL:

```txt
https://api.miuse.app/v1/api
```

Auth:

```txt
Authorization: Bearer <token>
```

Variáveis:

```env
MIUSE_BASE_URL=https://api.miuse.app/v1/api
MIUSE_PLATFORM_TOKEN=
MIUSE_WEBHOOK_SECRET=
MIUSE_OWNER_WALLET_ID=
MIUSE_BALANCE_PATH_TEMPLATE=/wallets/{wallet_id}/balance
```

## Access token por vendedor

Cada vendedor usa wallet `seller_<userId>`.

Endpoint implementado:

```http
POST /access-tokens
```

Body:

```json
{
  "wallet_id": "seller_<userId>",
  "scopes": [
    "read:payments",
    "write:payments",
    "read:withdrawals",
    "write:withdrawals",
    "read:balance"
  ],
  "label": "WisePix seller <userId>",
  "expires_in": null,
  "magic": false
}
```

O token retornado é salvo criptografado.

## Pagamentos

A WisePix cria Pix real com:

```http
POST /payments
```

Sempre com `Idempotency-Key` UUID.

O payload usa:

- `owner.wallet_id`
- `customer`
- `recipients`
- `qr=true`
- `items`
- `metadata.orderId`

A WisePix salva:

- `miusePaymentId`
- `pixQrCode`
- `pixCopyPaste`
- `miuseStatus`
- `miuseFinancialStatus`
- `miuseRecipientStatuses`
- `miuseLiquidator`
- `miuseCreatedAt`

## Saldos

Saldo não é calculado localmente. O painel consulta o `BalanceView` da Miuse:

- `available` → saldo disponível
- `locked` → saldo travado
- `pending` → aguardando confirmação
- `scheduled` → saldo agendado/liberação futura

## Saques

A WisePix usa:

```http
POST /withdrawals
```

Com:

- `wallet_id`
- `amount`
- `pix_key`
- `pix_key_type`

São salvos `withdrawal_id` e `status`, e os eventos `withdrawal.settled` / `withdrawal.failed` atualizam o pedido local.

## Webhooks

Rota:

```txt
POST /api/webhooks/miuse
```

Eventos aceitos:

- `payment.paid`
- `payment.failed`
- `payment.cancelled`
- `payment.expired`
- `payment.dispute.opened`
- `payment.dispute.accepted`
- `payment.dispute.rejected`
- `withdrawal.settled`
- `withdrawal.failed`
- `refund.completed`

A assinatura `X-Webhook-Signature` é validada com HMAC-SHA256 usando `MIUSE_WEBHOOK_SECRET`.

## Fluxo financeiro

A WisePix não faz escrow fake e não mantém carteira paralela. A Miuse controla dinheiro real, lock, pending, settlement, saldo, saque e split.

A WisePix controla pedido, entrega, UX, disputa, timers e notificações.

Auto release local:

- entrega automática: 24h
- entrega manual/X1: 72h

O cron `POST /api/cron/auto-release` finaliza pedidos `DELIVERED` vencidos e sem disputa. Se a Miuse exigir uma chamada explícita de release financeiro em alguma conta/contrato, essa chamada deve ser adicionada contra o endpoint oficial da Miuse, sem movimentação interna na WisePix.
