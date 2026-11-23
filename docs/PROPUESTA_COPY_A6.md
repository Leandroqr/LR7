# Propuesta de copy editorial (A6, pendiente de aprobación)

A6 ya corrigió lo funcional: tildes, códigos internos, insignias, navegación, `alt`, placeholders y metadatos.

Esta tabla recoge el **copy editorial en inglés**: titulares, eyebrows y eslóganes. Según el ROADMAP, los cambios grandes de copy pasan antes por ti, así que **no está aplicado**.

Marca cada fila con ✅ (aplicar), ✏️ (con tu texto) o ❌ (dejar como está).

**Antes, una decisión de marca:**
- **Opción A: todo en español.** Es la recomendación para una tienda que vende en Colombia, porque se entiende a la primera y es coherente.
- **Opción B: español en toda la tienda, inglés solo en `/streetwear`.** Allí el inglés funcionaría como recurso editorial, en tono de revista.

## Home

| Archivo | Actual | Propuesta |
|---|---|---|
| `home-commerce-sections.tsx` | FOOTBALL / 01 | FÚTBOL / 01 |
| `home-commerce-sections.tsx` | 03 / NEW DROP | 03 / LO NUEVO |
| `home-commerce-sections.tsx` | WHY LR7 | POR QUÉ LR7 |
| `home-commerce-sections.tsx` | BUILT FOR THE GAME. | HECHA PARA EL JUEGO. |
| `home-commerce-sections.tsx` | FOOTBALL FIRST (cinta) | FÚTBOL PRIMERO |
| `home-commerce-sections.tsx` | LR7 / COMMUNITY · THE GAME IS YOURS. | LR7 / COMUNIDAD · EL JUEGO ES TUYO. |
| `home-commerce-sections.tsx` | FOLLOW LR7 | SIGUE A LR7 (requiere el enlace real a redes) |
| `featured-campaigns.tsx` | FOOTBALL / 01 · FEEL LIKE THE GAME. | FÚTBOL / 01 · SIENTE EL JUEGO. |
| `featured-campaigns.tsx` | BUILT TO MOVE. | HECHO PARA MOVERTE. |

## Tienda (`/tienda`)

| Archivo | Actual | Propuesta |
|---|---|---|
| `shop-page.tsx` | LR7 / SHOP | LR7 / TIENDA |
| `shop-page.tsx` | FOOTBALL · BUILT FOR THE GAME. | FÚTBOL · HECHA PARA EL JUEGO. |
| `shop-page.tsx` | FOOTBALL FIRST / TRAINING SECOND | FÚTBOL Y TRAINING (o quitar) |

## Novedades (`/colecciones`)

| Archivo | Actual | Propuesta |
|---|---|---|
| `collections-page.tsx` | LR7 / NEW ARRIVALS | LR7 / NOVEDADES |
| `collections-page.tsx` | NEW SEASON | NUEVA TEMPORADA |
| `collections-page.tsx` | DROP · NEW (etiquetas) | LANZAMIENTO · NUEVO |
| `collections-page.tsx` | 02 / THE NEW DROP · BUILT FOR THE GAME. | 02 / EL NUEVO LANZAMIENTO · HECHA PARA EL JUEGO. |
| `collections-page.tsx` | THE DROP. | EL LANZAMIENTO. |
| `collections-page.tsx` | DISCOVER. FEEL THE DROP. SHOP THE GAME. | DESCUBRE. SIENTE. JUEGA. |
| `collections-page.tsx` | 03 / FOOTBALL · FOOTBALL ESSENTIALS | 03 / FÚTBOL · BÁSICOS DE FÚTBOL |

## Streetwear (`/streetwear`): aplica solo con la opción A

| Archivo | Actual | Propuesta |
|---|---|---|
| `streetwear-page.tsx` | THE PIECES · HOW TO WEAR · NEW ARRIVALS (capítulos) | LAS PIEZAS · CÓMO LLEVARLA · NOVEDADES |
| `streetwear-page.tsx` | OVERSIZE FIT · RETRO EDIT · NATIONAL ICONS · CLUB CULTURE · NEW IN · SHOP ALL | FIT OVERSIZE · RETRO · SELECCIONES · CLUBES · NOVEDADES · VER TODO |
| `streetwear-page.tsx` | FOOTBALL, BUT MAKE IT FASHION · MADE FOR THE OUTFIT · WEAR THE GAME (cinta) | EL FÚTBOL SE VISTE · HECHA PARA EL OUTFIT · LLEVA EL JUEGO |
| `streetwear-page.tsx` | STYLE NOTE / 01 · 02 / THE PIECES · 03 / HOW TO WEAR IT · 04 / NEW ARRIVALS | NOTA DE ESTILO / 01 · 02 / LAS PIEZAS · 03 / CÓMO LLEVARLA · 04 / NOVEDADES |
| `streetwear-page.tsx` | LR7 / FOOTBALL-INSPIRED STREETWEAR / BOGOTÁ | LR7 / STREETWEAR INSPIRADO EN EL FÚTBOL / BOGOTÁ |
| `streetwear-page.tsx` | STYLE ISSUE 01/26 · FOOTBALL / FASHION / YOUR STYLE · LR7 EDITORIAL 01 | EDICIÓN DE ESTILO 01/26 · FÚTBOL / MODA / TU ESTILO · EDITORIAL LR7 01 |

## Fuera de A6 (anotado)

- **Contenido del CMS en Supabase** (envíos, cambios, FAQ): en producción sigue sin tildes ("dias habiles", "satisfaccion", "fabrica"…). Es contenido de la base de datos y se corrige desde el admin. Escribir en la base de datos de producción requiere tu confirmación.
- **Seed `supabase/migrations/202608310004_seed_demo_catalog.sql`:** tiene los nombres sin tilde. No se modifican migraciones; cuando el catálogo pase a Supabase (C3), se corrigen desde el admin.
- **`components/pages/highlights-carousel.tsx`:** tiene CTAs en inglés, pero el componente no se usa en ninguna página.
- **Palabras clave SEO de `lib/site.ts`:** van sin tilde a propósito ("camisetas de futbol"), porque así se busca.
