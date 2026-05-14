# Deploy SquareCloud

O bot fica em `/bot`.

1. Configure envs na SquareCloud:

```env
DATABASE_URL=
DISCORD_BOT_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_GUILD_ID=
```

2. Build local ou no pipeline:

```bash
npm run bot:build
```

3. Use `bot/squarecloud.app` como configuração base.

O start command é:

```bash
node dist/index.js
```
