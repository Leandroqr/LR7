begin;

insert into public.products (legacy_id, slug, name, description, price, compare_at_price, brand, team, badge, personalizable, featured, active)
values
  (1, 'seleccion-colombia', 'Seleccion Colombia', 'Camiseta premium para vivir el futbol colombiano dentro y fuera de la cancha.', 89000, 109000, 'FUTBOL', 'Colombia', 'MAS VENDIDA', true, true, true),
  (2, 'clasico-europeo', 'Clasico Europeo', 'Diseño refinado de inspiración europea con corte atlético premium.', 95000, null, 'FUTBOL', 'Real Madrid', 'NUEVO', true, true, true),
  (3, 'vintage-brasil-82', 'Vintage Brasil 82', 'Edición retro inspirada en una de las selecciones más recordadas.', 85000, 99000, 'FUTBOL', 'Brasil', 'LIMITADA', true, false, true),
  (4, 'nacional-2024', 'Nacional 2024', 'Camiseta de colección para llevar los colores del verde.', 79000, null, 'FUTBOL', 'Atletico Nacional', 'NUEVO', true, false, true),
  (5, 'entrenamiento-pro', 'Entrenamiento Pro', 'Camiseta técnica transpirable para sesiones intensas.', 75000, null, 'TRAINING', 'Generica', null, false, true, true),
  (6, 'buzo-training', 'Buzo Training', 'Buzo deportivo cómodo para entrenar y moverse.', 125000, 145000, 'TRAINING', 'Generica', 'NUEVO', false, false, true)
on conflict (slug) do update set
  name = excluded.name, description = excluded.description, price = excluded.price, compare_at_price = excluded.compare_at_price,
  brand = excluded.brand, team = excluded.team, badge = excluded.badge, personalizable = excluded.personalizable, featured = excluded.featured, active = excluded.active;

insert into public.product_categories (product_id, category_id, is_primary)
select product.id, category.id, true
from (values
  ('seleccion-colombia', 'futbol-selecciones'), ('clasico-europeo', 'futbol-clubes'), ('vintage-brasil-82', 'futbol-retro'),
  ('nacional-2024', 'futbol-clubes'), ('entrenamiento-pro', 'training-camisetas'), ('buzo-training', 'training-buzos')
) as mapping(product_slug, category_slug)
join public.products product on product.slug = mapping.product_slug
join public.categories category on category.slug = mapping.category_slug
on conflict (product_id, category_id) do update set is_primary = true;

insert into public.product_images (product_id, storage_path, alt_text, sort_order, is_hover)
select product.id, image.url, image.alt_text, image.sort_order, image.is_hover
from (values
  ('seleccion-colombia', 'https://images.unsplash.com/photo-1616124619460-ff4ed8f4683c?w=900&h=1100&fit=crop&auto=format', 'Camiseta Seleccion Colombia vista principal', 10, false),
  ('seleccion-colombia', 'https://images.unsplash.com/photo-1577212017184-80cc0da11082?w=900&h=1100&fit=crop&auto=format', 'Camiseta Seleccion Colombia detalle', 20, true),
  ('clasico-europeo', 'https://images.unsplash.com/photo-1552066379-e7bfd22155c5?w=900&h=1100&fit=crop&auto=format', 'Clasico Europeo frontal', 10, false),
  ('clasico-europeo', 'https://images.unsplash.com/photo-1563382563268-23859556c3f2?w=900&h=1100&fit=crop&auto=format', 'Clasico Europeo detalle', 20, true),
  ('vintage-brasil-82', 'https://images.unsplash.com/photo-1516948900-c5137d2bf399?w=900&h=1100&fit=crop&auto=format', 'Vintage Brasil 82 principal', 10, false),
  ('nacional-2024', 'https://images.unsplash.com/photo-1759808944777-a05e2e9d0685?w=900&h=1100&fit=crop&auto=format', 'Nacional 2024 principal', 10, false),
  ('entrenamiento-pro', 'https://images.unsplash.com/photo-1599204606471-32a75bc663e9?w=900&h=1100&fit=crop&auto=format', 'Entrenamiento Pro principal', 10, false),
  ('buzo-training', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&h=1100&fit=crop&auto=format', 'Buzo Training principal', 10, false)
) as image(product_slug, url, alt_text, sort_order, is_hover)
join public.products product on product.slug = image.product_slug
on conflict (product_id, storage_path) do update set alt_text = excluded.alt_text, sort_order = excluded.sort_order, is_hover = excluded.is_hover;

insert into public.product_variants (product_id, sku, size, active)
select product.id, product.slug || '-' || size.size, size.size, true
from public.products product cross join (values ('S'), ('M'), ('L'), ('XL')) as size(size)
where product.slug in ('seleccion-colombia', 'clasico-europeo', 'vintage-brasil-82', 'nacional-2024', 'entrenamiento-pro', 'buzo-training')
on conflict (sku) do update set active = true;

insert into public.inventory (variant_id, stock, low_stock_threshold)
select variant.id, case when variant.size = 'XL' then 3 else 12 end, 3
from public.product_variants variant
where variant.sku like any (array['seleccion-colombia-%', 'clasico-europeo-%', 'vintage-brasil-82-%', 'nacional-2024-%', 'entrenamiento-pro-%', 'buzo-training-%'])
on conflict (variant_id) do update set stock = excluded.stock, low_stock_threshold = excluded.low_stock_threshold;

insert into public.home_slides (image_path, eyebrow, title, accent_text, subtitle, cta_label, cta_href, sort_order, active)
values
  ('https://images.unsplash.com/photo-1552066379-e7bfd22155c5?w=1800&h=1000&fit=crop&auto=format', 'NUEVA TEMPORADA / 01', 'NUEVO EN', 'LA CANCHA.', 'Camisetas premium para jugar, vestir y coleccionar.', 'VER FÚTBOL', '/futbol', 10, true),
  ('https://images.unsplash.com/photo-1516948900-c5137d2bf399?w=1800&h=1000&fit=crop&auto=format', 'RETRO / 02', 'HISTORIA QUE', 'SE VISTE.', 'Piezas de colección inspiradas en el juego que no se olvida.', 'VER RETRO', '/categorias/futbol-retro', 20, true),
  ('https://images.unsplash.com/photo-1616124619460-ff4ed8f4683c?w=1800&h=1000&fit=crop&auto=format', 'PERSONALIZA / 03', 'TU NOMBRE.', 'TU NÚMERO.', 'Haz que cada camiseta sea completamente tuya.', 'PERSONALIZAR', '/personaliza', 30, true),
  ('https://images.unsplash.com/photo-1599204606471-32a75bc663e9?w=1800&h=1000&fit=crop&auto=format', 'TRAINING / 04', 'ENTRENA PARA', 'EL JUEGO.', 'Rendimiento y comodidad para cada sesión.', 'VER TRAINING', '/training', 40, true)
on conflict do nothing;

insert into public.home_sections (section_key, section_type, title, eyebrow, subtitle, cta_label, cta_href, sort_order, active)
values
  ('editorial-lr7', 'campaign', 'VISTE EL JUEGO.', 'LR7 / CAMPAÑA', 'Camisetas deportivas premium para quienes viven el fútbol todos los días.', 'EXPLORAR CATÁLOGO', '/tienda', 10, true),
  ('community-lr7', 'highlights', 'LA CANCHA ES TUYA.', 'LR7 / COMMUNITY', 'Fútbol, training e identidad para moverte a tu manera.', 'CONOCER LR7', '/nosotros', 20, true),
  ('quality-lr7', 'benefits', 'HECHO PARA MOVERSE.', 'CALIDAD LR7', 'Prendas pensadas para la cancha, el entrenamiento y la calle.', 'VER TRAINING', '/training', 30, true)
on conflict (section_key) do update set title = excluded.title, eyebrow = excluded.eyebrow, subtitle = excluded.subtitle, cta_label = excluded.cta_label, cta_href = excluded.cta_href, sort_order = excluded.sort_order, active = excluded.active;

commit;

-- Create the account in Supabase Authentication first, then run this line with its email:
-- update public.profiles set role = 'ADMIN' where id = (select id from auth.users where email = 'tu-correo@dominio.com');