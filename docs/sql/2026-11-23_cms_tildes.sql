-- Corrección de tildes en el contenido del CMS (LR7-056).
-- Ejecutar en Supabase → SQL Editor del proyecto de PRODUCCIÓN.
-- Solo cambia texto visible: navigation_items.label, content_items.title y content_items.body.
-- No toca slugs, rutas (href), claves ni esquema. Es idempotente: ejecutarlo dos veces no cambia nada más.
-- Generado el 2026-11-23 a partir del texto publicado en https://lr7.vercel.app.

-- 1) VISTA PREVIA (no modifica nada): revisa la columna "propuesto" antes del paso 2.
SELECT 'navigation_items' AS tabla, id, location AS clave, label AS actual, CASE label WHEN 'Catalogo' THEN 'Catálogo' WHEN 'Guia de tallas' THEN 'Guía de tallas' WHEN 'Envios' THEN 'Envíos' WHEN 'Como comprar' THEN 'Cómo comprar' ELSE label END AS propuesto
FROM public.navigation_items
WHERE label IN ('Catalogo', 'Guia de tallas', 'Envios', 'Como comprar')
UNION ALL
SELECT 'content_items.title', id, page_key || '/' || content_key, title, regexp_replace(replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(title, '\mdias\M', 'días', 'g'), '\mhabiles\M', 'hábiles', 'g'), '\mguia\M', 'guía', 'g'), '\mdespues\M', 'después', 'g'), '\mfabrica\M', 'fábrica', 'g'), '\menvios\M', 'envíos', 'g'), '\menvio\M', 'envío', 'g'), '\mvaria\M', 'varía', 'g'), '\mubicacion\M', 'ubicación', 'g'), '\mnumero\M', 'número', 'g'), '\mpersonalizacion\M', 'personalización', 'g'), '\mCuanto\M', 'Cuánto', 'g'), 'la prenda este sin uso', 'la prenda esté sin uso'), '^Si([,.])', 'Sí\1')
FROM public.content_items
WHERE title ~ '\m(dias|habiles|guia|despues|fabrica|envios|envio|varia|ubicacion|numero|personalizacion|Cuanto)\M|^Si[,.]|la prenda este sin uso'
UNION ALL
SELECT 'content_items.body', id, page_key || '/' || content_key, body, regexp_replace(replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(body, '\mdias\M', 'días', 'g'), '\mhabiles\M', 'hábiles', 'g'), '\mguia\M', 'guía', 'g'), '\mdespues\M', 'después', 'g'), '\mfabrica\M', 'fábrica', 'g'), '\menvios\M', 'envíos', 'g'), '\menvio\M', 'envío', 'g'), '\mvaria\M', 'varía', 'g'), '\mubicacion\M', 'ubicación', 'g'), '\mnumero\M', 'número', 'g'), '\mpersonalizacion\M', 'personalización', 'g'), '\mCuanto\M', 'Cuánto', 'g'), 'la prenda este sin uso', 'la prenda esté sin uso'), '^Si([,.])', 'Sí\1')
FROM public.content_items
WHERE body ~ '\m(dias|habiles|guia|despues|fabrica|envios|envio|varia|ubicacion|numero|personalizacion|Cuanto)\M|^Si[,.]|la prenda este sin uso'
ORDER BY 1, 3;

-- 2) CORRECCIÓN (en una transacción). Si algo no cuadra, ejecuta ROLLBACK en lugar de COMMIT.
BEGIN;

UPDATE public.navigation_items
SET label = CASE label WHEN 'Catalogo' THEN 'Catálogo' WHEN 'Guia de tallas' THEN 'Guía de tallas' WHEN 'Envios' THEN 'Envíos' WHEN 'Como comprar' THEN 'Cómo comprar' ELSE label END
WHERE label IN ('Catalogo', 'Guia de tallas', 'Envios', 'Como comprar');

UPDATE public.content_items
SET title = regexp_replace(replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(title, '\mdias\M', 'días', 'g'), '\mhabiles\M', 'hábiles', 'g'), '\mguia\M', 'guía', 'g'), '\mdespues\M', 'después', 'g'), '\mfabrica\M', 'fábrica', 'g'), '\menvios\M', 'envíos', 'g'), '\menvio\M', 'envío', 'g'), '\mvaria\M', 'varía', 'g'), '\mubicacion\M', 'ubicación', 'g'), '\mnumero\M', 'número', 'g'), '\mpersonalizacion\M', 'personalización', 'g'), '\mCuanto\M', 'Cuánto', 'g'), 'la prenda este sin uso', 'la prenda esté sin uso'), '^Si([,.])', 'Sí\1')
WHERE title ~ '\m(dias|habiles|guia|despues|fabrica|envios|envio|varia|ubicacion|numero|personalizacion|Cuanto)\M|^Si[,.]|la prenda este sin uso';

UPDATE public.content_items
SET body = regexp_replace(replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(body, '\mdias\M', 'días', 'g'), '\mhabiles\M', 'hábiles', 'g'), '\mguia\M', 'guía', 'g'), '\mdespues\M', 'después', 'g'), '\mfabrica\M', 'fábrica', 'g'), '\menvios\M', 'envíos', 'g'), '\menvio\M', 'envío', 'g'), '\mvaria\M', 'varía', 'g'), '\mubicacion\M', 'ubicación', 'g'), '\mnumero\M', 'número', 'g'), '\mpersonalizacion\M', 'personalización', 'g'), '\mCuanto\M', 'Cuánto', 'g'), 'la prenda este sin uso', 'la prenda esté sin uso'), '^Si([,.])', 'Sí\1')
WHERE body ~ '\m(dias|habiles|guia|despues|fabrica|envios|envio|varia|ubicacion|numero|personalizacion|Cuanto)\M|^Si[,.]|la prenda este sin uso';

-- 3) COMPROBACIÓN: debe devolver 0 filas antes del COMMIT.
SELECT 'pendiente' AS estado, id, label AS texto FROM public.navigation_items WHERE label IN ('Catalogo', 'Guia de tallas', 'Envios', 'Como comprar')
UNION ALL
SELECT 'pendiente', id, title FROM public.content_items WHERE title ~ '\m(dias|habiles|guia|despues|fabrica|envios|envio|varia|ubicacion|numero|personalizacion|Cuanto)\M|^Si[,.]|la prenda este sin uso'
UNION ALL
SELECT 'pendiente', id, body FROM public.content_items WHERE body ~ '\m(dias|habiles|guia|despues|fabrica|envios|envio|varia|ubicacion|numero|personalizacion|Cuanto)\M|^Si[,.]|la prenda este sin uso';

COMMIT;
