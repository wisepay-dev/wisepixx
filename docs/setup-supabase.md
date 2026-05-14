# Setup Supabase

1. Crie um projeto Supabase.
2. Copie a connection string PostgreSQL e defina `DATABASE_URL`.
3. Copie também as chaves de API do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` podem ser usados no browser para upload autenticado com policies. `SUPABASE_SERVICE_ROLE_KEY` é server-only e nunca deve aparecer em componente client.
4. Rode:

```bash
npm run prisma:migrate
npm run db:seed
```

5. Para Storage, crie buckets privados ou públicos conforme o tipo:

- `avatars`
- `banners`
- `listing-images`
- `feed-images`
- `store-assets`

6. Adicione políticas de upload por usuário autenticado e leitura pública apenas para assets que devem ser indexáveis.

TODO: conectar o provider de upload escolhido ao frontend. O projeto já tem os campos de URL nos models, as variáveis de ambiente documentadas e o domínio Supabase liberado no `next.config.ts`.
