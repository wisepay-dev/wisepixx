# Deploy Cloudflare

1. Configure as variáveis de ambiente no Cloudflare Pages.
2. Use PostgreSQL externo/Supabase em `DATABASE_URL`.
3. Configure um cron protegido com `CRON_SECRET` para chamar `POST /api/cron/auto-release`.
4. Configure wildcard DNS:

```txt
*.wisepix.online -> Cloudflare Pages
wisepix.online -> Cloudflare Pages
```

4. Build command:

```bash
npm run build
```

5. Output: `.next`.

Para Next.js em Cloudflare, use o adapter oficial recomendado pela Cloudflare para a versão do Next em uso.

TODO: confirmar adapter no momento do deploy, pois suporte Cloudflare/Next muda com frequência.
