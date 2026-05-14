# WisePix

WisePix é uma plataforma social de vendas digitais, marketplace e ecossistema de stores Discord-first, mobile-first e focada em Pix.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL/Supabase
- Auth.js/NextAuth com Discord OAuth e email/senha
- Miuse para Pix, split, wallets, access tokens, webhooks e saques
- PWA com manifest, service worker e push
- Bot Discord separado em `/bot` com discord.js

## Setup local

1. Instale dependências:

```bash
npm install
```

2. Configure `.env` a partir de `.env.example`.

3. Gere uma chave de criptografia:

```bash
openssl rand -base64 32
```

Use o valor em `ENCRYPTION_KEY`.

4. Rode migrations e seed:

```bash
npm run prisma:migrate
npm run db:seed
```

5. Inicie o app:

```bash
npm run dev
```

Conta seed OWNER:

- email: `owner@wisepix.dev`
- senha: `WisePix@123`

## Pontos reais já preparados

- Webhook Miuse em `POST /api/webhooks/miuse` com validação `X-Webhook-Signature` por HMAC-SHA256.
- Todas as operações financeiras criadas no backend usam `crypto.randomUUID()` como `Idempotency-Key`.
- Estoque automático usa AES-256-GCM e registra reveal, IP anonimizado, user agent e horário.
- Subdomínios wildcard são detectados por host e reescritos para `/loja/:subdomain`.
- OWNER cria stores, taxas por nível, Discord role configs e admins.
- ADMIN opera moderação sem acesso a lucro global ou settings OWNER.

## TODOs intencionais

A Miuse informou o corpo de `POST /access-tokens`, mas não informou o contrato oficial de criação de Pix, split e saques. Por isso:

- `createSellerAccessToken` está implementado com o body fornecido.
- `createPixPayment` está encapsulado e bloqueia checkout com erro explícito até confirmar endpoint, payload e resposta oficiais.
- `createWithdrawal` tem TODO para confirmar o body de saque antes de produção.

Isso evita QR Code fake e impede que a plataforma pareça integrada sem estar.

## Documentação operacional

- [Supabase](docs/setup-supabase.md)
- [Miuse](docs/setup-miuse.md)
- [Discord Bot](docs/setup-discord-bot.md)
- [Deploy SquareCloud](docs/deploy-squarecloud.md)
