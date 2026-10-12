begin;

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  page_key text not null check (char_length(page_key) between 1 and 80),
  content_key citext not null,
  title text not null default '',
  eyebrow text,
  body text,
  image_path text,
  cta_label text,
  cta_href text check (cta_href is null or cta_href ~ '^(/|https://)'),
  configuration jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0 check (sort_order >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_key, content_key),
  check (jsonb_typeof(configuration) = 'object')
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key citext not null unique,
  value jsonb not null,
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(value) in ('object', 'array', 'string', 'number', 'boolean'))
);

create index if not exists content_items_public_idx on public.content_items(page_key, active, sort_order);
create trigger content_items_updated_at before update on public.content_items for each row execute function public.set_updated_at();
create trigger site_settings_updated_at before update on public.site_settings for each row execute function public.set_updated_at();

alter table public.content_items enable row level security;
alter table public.site_settings enable row level security;
create policy "content_items_public_read" on public.content_items for select using (active or public.is_admin());
create policy "content_items_admin_all" on public.content_items for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "site_settings_public_read" on public.site_settings for select using (active or public.is_admin());
create policy "site_settings_admin_all" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "newsletter_public_insert" on public.newsletter_subscribers for insert with check (consent_source in ('newsletter', 'newsletter_premium'));

insert into public.content_items (page_key, content_key, title, body, sort_order, configuration) values
  ('faq', 'shipping', '¿Hacen envios a todo Colombia?', 'Si, realizamos envios a cualquier ciudad de Colombia. El tiempo de entrega varia entre 2 y 5 dias habiles dependiendo de tu ubicacion.', 10, '{}'),
  ('faq', 'delivery-time', '¿Cuanto tarda mi pedido?', 'Una vez confirmado el pago, procesamos tu pedido en 1-2 dias habiles. El envio tarda entre 2-5 dias adicionales.', 20, '{}'),
  ('faq', 'personalization', '¿Puedo personalizar mi camiseta?', 'Si. Puedes agregar nombre y numero en camisetas seleccionadas. La personalizacion tiene costo adicional.', 30, '{}'),
  ('faq', 'size-change', '¿Puedo cambiar la talla?', 'Si, aceptamos cambios dentro de los plazos establecidos siempre que la prenda este sin uso y en perfecto estado.', 40, '{}'),
  ('shipping', 'coverage', 'Cobertura nacional', 'Cobertura nacional en Colombia.', 10, '{}'),
  ('shipping', 'delivery', 'Tiempos de entrega', 'Entregas promedio entre 2 y 5 dias habiles.', 20, '{}'),
  ('shipping', 'tracking', 'Seguimiento', 'Seguimiento por guia una vez despachado.', 30, '{}'),
  ('shipping', 'support', 'Soporte', 'Soporte por WhatsApp para coordinar tiempos y costos.', 40, '{}'),
  ('returns', 'window', 'Plazo de cambios', 'Solicita cambios dentro de los 5 dias habiles despues de recibir tu pedido.', 10, '{}'),
  ('returns', 'condition', 'Condición del producto', 'Los productos deben estar sin uso y con etiquetas originales.', 20, '{}'),
  ('returns', 'personalized', 'Personalizados', 'Camisetas personalizadas no aplican para cambio, salvo defecto de fabrica.', 30, '{}'),
  ('returns', 'defects', 'Defectos de fabrica', 'Defectos de fabrica cuentan con respaldo y reemplazo.', 40, '{}'),
  ('size-guide', 's', 'S', null, 10, '{"chest":"88-92","length":"68","shoulder":"42"}'),
  ('size-guide', 'm', 'M', null, 20, '{"chest":"94-98","length":"70","shoulder":"44"}'),
  ('size-guide', 'l', 'L', null, 30, '{"chest":"100-104","length":"72","shoulder":"46"}'),
  ('size-guide', 'xl', 'XL', null, 40, '{"chest":"106-110","length":"74","shoulder":"48"}'),
  ('size-guide', 'xxl', 'XXL', null, 50, '{"chest":"112-118","length":"76","shoulder":"50"}')
on conflict (page_key, content_key) do nothing;

insert into public.site_settings (setting_key, value) values
  ('footer', '{"description":"Camisetas deportivas premium para quienes viven el juego con pasion.","country_label":"HECHO EN COLOMBIA"}'),
  ('commerce', '{"personalization_price":15000,"shop_page_size":8,"size_options":["S","M","L","XL","XXL"]}')
on conflict (setting_key) do nothing;

insert into public.navigation_items (location, label, href, sort_order, active) values
  ('header', 'INICIO', '/', 10, true), ('header', 'FÚTBOL', '/futbol', 20, true), ('header', 'STREET', '/streetwear', 30, true), ('header', 'TRAINING', '/training', 40, true), ('header', 'NOVEDADES', '/colecciones', 50, true), ('header', 'PERSONALIZA', '/personaliza', 60, true),
  ('footer', 'Catalogo', '/tienda', 10, true), ('footer', 'Colecciones', '/colecciones', 20, true), ('footer', 'Personaliza', '/personaliza', 30, true), ('footer', 'Favoritos', '/favoritos', 40, true), ('footer', 'Envios', '/envios', 50, true), ('footer', 'Cambios y devoluciones', '/cambios-y-devoluciones', 60, true), ('footer', 'Contacto', '/contacto', 70, true), ('footer', 'Preguntas frecuentes', '/preguntas-frecuentes', 80, true), ('footer', 'Nosotros', '/nosotros', 90, true), ('footer', 'Guia de tallas', '/guia-de-tallas', 100, true)
on conflict do nothing;

commit;