# LR7 Supabase

## Apply the database

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and set the project URL and publishable key.
3. Link the Supabase CLI project and run `supabase db push`, or paste migrations into the Supabase SQL editor in timestamp order.
4. Create an Auth user from Supabase Dashboard.
5. Promote the first administrator once from the SQL editor:

```sql
update public.profiles
set role = 'ADMIN'
where id = '<AUTH_USER_UUID>';
```

After the first ADMIN exists, role changes are performed through the protected Admin using `set_user_role`.

## Security

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- Public catalog reads use RLS.
- `/admin` checks the authenticated user server-side.
- Every Server Action repeats the ADMIN check.
- Storage accepts only approved image MIME types and size limits.

## Current migration state

The public storefront uses `lib/products.ts` while `CATALOG_SOURCE=mock`. After approved LR7 products, images, categories and variants have been migrated and visual/SEO parity has been verified, set `CATALOG_SOURCE=supabase` in the server environment. Query failures, an empty database, or no fully publishable rows still fall back to the mock catalog.
