# Setup Discord Bot

Variáveis compartilhadas:

```env
DISCORD_BOT_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_GUILD_ID=
DATABASE_URL=
MIUSE_BASE_URL=https://api.miuse.app/v1/api
MIUSE_PLATFORM_TOKEN=
```

Role IDs não ficam no `.env`. Configure no painel OWNER em `DiscordRoleConfig`.

Seed cria chaves com `TODO_CONFIGURE_IN_OWNER_PANEL`:

- `verified`
- `partner`
- `level_bronze`
- `level_silver`
- `level_gold`
- `level_diamond`
- `level_legend`

## Rodar local

```bash
npm run bot:dev
```

## Comandos

- `/perfil`
- `/saldo`
- `/sacar`
- `/ranking`
- `/minhas-vendas`
- `/meus-pedidos`
- `/suporte`

O bot sincroniza cargos com base em KYC, partner, nível e badges com `discordRoleKey`.
