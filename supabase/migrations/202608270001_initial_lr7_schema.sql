begin;

create extension if not exists pgcrypto;
create extension if not exists citext;

do $$ begin
  create type public.user_role as enum ('CUSTOMER', 'ADMIN');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.order_status as enum (
    'pending', 'payment_pending', 'paid', 'processing', 'shipped',
    'delivered', 'cancelled', 'refunded'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_provider as enum ('mercadopago', 'addi');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_status as enum (
    'pending', 'approved', 'rejected', 'cancelled', 'refunded'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.discount_type as enum ('percent', 'fixed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.subscriber_status as enum ('pending', 'active', 'unsubscribed');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'CUSTOMER',
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  legacy_id integer unique,
  slug citext not null unique,
  name text not null check (char_length(name) between 2 and 160),
  description text not null default '',
  price integer not null check (price >= 0),
  compare_at_price integer check (compare_at_price is null or compare_at_price >= price),
  currency char(3) not null default 'COP' check (currency = 'COP'),
  brand text not null check (char_length(brand) between 1 and 80),
  team text,
  badge text,
  personalizable boolean not null default false,
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  alt_text text not null check (char_length(alt_text) between 1 and 240),
  sort_order integer not null default 0 check (sort_order >= 0),
  is_hover boolean not null default false,
  created_at timestamptz not null default now(),
  unique (product_id, storage_path)
);

create unique index if not exists product_images_one_hover_idx
  on public.product_images(product_id) where is_hover;

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku citext not null unique,
  size text not null check (char_length(size) between 1 and 30),
  color text,
  price_override integer check (price_override is null or price_override >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists product_variants_identity_idx
  on public.product_variants(product_id, lower(size), lower(coalesce(color, '')));

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete set null,
  slug citext not null unique,
  name text not null check (char_length(name) between 1 and 120),
  description text,
  image_path text,
  sort_order integer not null default 0 check (sort_order >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (parent_id is null or parent_id <> id)
);

create table if not exists public.product_categories (
  product_id uuid not null references public.products(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  is_primary boolean not null default false,
  primary key (product_id, category_id)
);

create unique index if not exists product_categories_one_primary_idx
  on public.product_categories(product_id) where is_primary;

create table if not exists public.inventory (
  variant_id uuid primary key references public.product_variants(id) on delete cascade,
  stock integer not null default 0 check (stock >= 0),
  low_stock_threshold integer not null default 3 check (low_stock_threshold >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code citext not null unique,
  discount_type public.discount_type not null,
  discount_value integer not null check (discount_value > 0),
  minimum_order integer not null default 0 check (minimum_order >= 0),
  maximum_discount integer check (maximum_discount is null or maximum_discount > 0),
  usage_limit integer check (usage_limit is null or usage_limit > 0),
  usage_count integer not null default 0 check (usage_count >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (discount_type <> 'percent' or discount_value <= 100),
  check (usage_limit is null or usage_count <= usage_limit),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create sequence if not exists public.order_number_seq;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default (
    'LR7-' || to_char(current_date, 'YYYYMMDD') || '-' ||
    lpad(nextval('public.order_number_seq')::text, 6, '0')
  ),
  user_id uuid references public.profiles(id) on delete set null,
  status public.order_status not null default 'pending',
  subtotal integer not null check (subtotal >= 0),
  shipping integer not null default 0 check (shipping >= 0),
  discount integer not null default 0 check (discount >= 0),
  total integer not null check (total >= 0),
  currency char(3) not null default 'COP' check (currency = 'COP'),
  customer_email citext not null,
  customer_name text not null,
  customer_phone text,
  shipping_information jsonb not null default '{}'::jsonb,
  coupon_id uuid references public.coupons(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (total = subtotal + shipping - discount),
  check (jsonb_typeof(shipping_information) = 'object')
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  sku text not null,
  size text,
  color text,
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0),
  personalization jsonb not null default '{}'::jsonb,
  line_total integer not null check (line_total >= 0),
  created_at timestamptz not null default now(),
  check (line_total = unit_price * quantity),
  check (jsonb_typeof(personalization) = 'object')
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  provider public.payment_provider not null,
  transaction_id text,
  status public.payment_status not null default 'pending',
  amount integer not null check (amount >= 0),
  currency char(3) not null default 'COP' check (currency = 'COP'),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, transaction_id),
  check (jsonb_typeof(metadata) = 'object')
);

create table if not exists public.home_slides (
  id uuid primary key default gen_random_uuid(),
  image_path text not null,
  eyebrow text not null,
  title text not null,
  accent_text text,
  subtitle text,
  cta_label text not null,
  cta_href text not null check (cta_href ~ '^(/|https://)'),
  sort_order integer not null default 0 check (sort_order >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.home_sections (
  id uuid primary key default gen_random_uuid(),
  section_key citext not null unique,
  section_type text not null,
  title text not null,
  eyebrow text,
  subtitle text,
  cta_label text,
  cta_href text check (cta_href is null or cta_href ~ '^(/|https://)'),
  configuration jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0 check (sort_order >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(configuration) = 'object')
);

create table if not exists public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.navigation_items(id) on delete cascade,
  location text not null check (location in ('header', 'footer')),
  label text not null,
  href text not null check (href ~ '^(/|https://)'),
  sort_order integer not null default 0 check (sort_order >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (parent_id is null or parent_id <> id)
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  status public.subscriber_status not null default 'pending',
  consent_at timestamptz not null default now(),
  consent_source text not null,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_active_idx on public.products(active, created_at desc);
create index if not exists product_variants_product_idx on public.product_variants(product_id);
create index if not exists categories_parent_idx on public.categories(parent_id, sort_order);
create index if not exists orders_user_idx on public.orders(user_id, created_at desc);
create index if not exists orders_status_idx on public.orders(status, created_at desc);
create index if not exists order_items_order_idx on public.order_items(order_id);
create index if not exists payments_order_idx on public.payments(order_id, created_at desc);
create index if not exists home_slides_active_idx on public.home_slides(active, sort_order);
create index if not exists home_sections_active_idx on public.home_sections(active, sort_order);
create index if not exists navigation_items_location_idx on public.navigation_items(location, active, sort_order);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'ADMIN'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create or replace function public.set_user_role(target_user_id uuid, new_role public.user_role)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  if target_user_id = auth.uid() and new_role <> 'ADMIN' then
    raise exception 'an admin cannot remove their own admin role';
  end if;

  update public.profiles set role = new_role where id = target_user_id;
end;
$$;

revoke all on function public.set_user_role(uuid, public.user_role) from public;
grant execute on function public.set_user_role(uuid, public.user_role) to authenticated;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create or replace trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();
create or replace trigger product_variants_updated_at before update on public.product_variants
  for each row execute function public.set_updated_at();
create or replace trigger categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();
create or replace trigger coupons_updated_at before update on public.coupons
  for each row execute function public.set_updated_at();
create or replace trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();
create or replace trigger payments_updated_at before update on public.payments
  for each row execute function public.set_updated_at();
create or replace trigger home_slides_updated_at before update on public.home_slides
  for each row execute function public.set_updated_at();
create or replace trigger home_sections_updated_at before update on public.home_sections
  for each row execute function public.set_updated_at();
create or replace trigger navigation_items_updated_at before update on public.navigation_items
  for each row execute function public.set_updated_at();
create or replace trigger newsletter_subscribers_updated_at before update on public.newsletter_subscribers
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.categories enable row level security;
alter table public.product_categories enable row level security;
alter table public.inventory enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.home_slides enable row level security;
alter table public.home_sections enable row level security;
alter table public.navigation_items enable row level security;
alter table public.newsletter_subscribers enable row level security;

create policy "profiles_select_own_or_admin" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own_or_admin" on public.profiles
  for update to authenticated using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy "products_public_read" on public.products
  for select using (active or public.is_admin());
create policy "products_admin_all" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "product_images_public_read" on public.product_images
  for select using (
    exists (select 1 from public.products p where p.id = product_id and p.active)
    or public.is_admin()
  );
create policy "product_images_admin_all" on public.product_images
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "variants_public_read" on public.product_variants
  for select using (
    (active and exists (select 1 from public.products p where p.id = product_id and p.active))
    or public.is_admin()
  );
create policy "variants_admin_all" on public.product_variants
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "categories_public_read" on public.categories
  for select using (active or public.is_admin());
create policy "categories_admin_all" on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "product_categories_public_read" on public.product_categories
  for select using (
    exists (select 1 from public.products p where p.id = product_id and p.active)
    and exists (select 1 from public.categories c where c.id = category_id and c.active)
    or public.is_admin()
  );
create policy "product_categories_admin_all" on public.product_categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "inventory_admin_all" on public.inventory
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "coupons_admin_all" on public.coupons
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "orders_select_own_or_admin" on public.orders
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "orders_admin_all" on public.orders
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "order_items_select_own_or_admin" on public.order_items
  for select to authenticated using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
    )
  );
create policy "order_items_admin_all" on public.order_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "payments_select_own_or_admin" on public.payments
  for select to authenticated using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
    )
  );
create policy "payments_admin_all" on public.payments
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "home_slides_public_read" on public.home_slides
  for select using (active or public.is_admin());
create policy "home_slides_admin_all" on public.home_slides
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "home_sections_public_read" on public.home_sections
  for select using (active or public.is_admin());
create policy "home_sections_admin_all" on public.home_sections
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "navigation_public_read" on public.navigation_items
  for select using (active or public.is_admin());
create policy "navigation_admin_all" on public.navigation_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "newsletter_admin_all" on public.newsletter_subscribers
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

revoke update on public.profiles from authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('products', 'products', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('hero', 'hero', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('categories', 'categories', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "lr7_storage_public_read" on storage.objects
  for select using (bucket_id in ('products', 'hero', 'categories'));
create policy "lr7_storage_admin_insert" on storage.objects
  for insert to authenticated with check (
    bucket_id in ('products', 'hero', 'categories') and public.is_admin()
  );
create policy "lr7_storage_admin_update" on storage.objects
  for update to authenticated using (
    bucket_id in ('products', 'hero', 'categories') and public.is_admin()
  ) with check (
    bucket_id in ('products', 'hero', 'categories') and public.is_admin()
  );
create policy "lr7_storage_admin_delete" on storage.objects
  for delete to authenticated using (
    bucket_id in ('products', 'hero', 'categories') and public.is_admin()
  );

commit;
