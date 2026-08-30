begin;

insert into public.categories (id, parent_id, slug, name, description, sort_order, active)
values
  ('10000000-0000-4000-8000-000000000001', null, 'futbol', 'FUTBOL', 'Camisetas de futbol premium', 10, true),
  ('20000000-0000-4000-8000-000000000001', null, 'training', 'TRAINING', 'Ropa deportiva de alto rendimiento', 20, true)
on conflict (slug) do nothing;

insert into public.categories (parent_id, slug, name, description, sort_order, active)
values
  ('10000000-0000-4000-8000-000000000001', 'futbol-camisetas', 'FUTBOL_CAMISETAS', 'Camisetas de futbol premium', 11, true),
  ('10000000-0000-4000-8000-000000000001', 'futbol-retro', 'FUTBOL_RETRO', 'Historia del futbol en tu piel', 12, true),
  ('10000000-0000-4000-8000-000000000001', 'futbol-clubes', 'FUTBOL_CLUBES', 'Camisetas de clubes', 13, true),
  ('10000000-0000-4000-8000-000000000001', 'futbol-selecciones', 'FUTBOL_SELECCIONES', 'Camisetas de selecciones', 14, true),
  ('10000000-0000-4000-8000-000000000001', 'futbol-personalizado', 'FUTBOL_PERSONALIZADO', 'Camisetas personalizables', 15, true),
  ('20000000-0000-4000-8000-000000000001', 'training-camisetas', 'TRAINING_CAMISETAS', 'Camisetas deportivas de alto rendimiento', 21, true),
  ('20000000-0000-4000-8000-000000000001', 'training-camisillas', 'TRAINING_CAMISILLAS', 'Camisillas para entrenamiento', 22, true),
  ('20000000-0000-4000-8000-000000000001', 'training-pantalonetas', 'TRAINING_PANTALONETAS', 'Pantalonetas de alto rendimiento', 23, true),
  ('20000000-0000-4000-8000-000000000001', 'training-buzos', 'TRAINING_BUZOS', 'Buzos deportivos', 24, true),
  ('20000000-0000-4000-8000-000000000001', 'training-conjuntos', 'TRAINING_CONJUNTOS', 'Conjuntos deportivos coordinados', 25, true)
on conflict (slug) do nothing;

commit;
