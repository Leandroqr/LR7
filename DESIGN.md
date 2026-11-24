---
name: LR7
description: Camisetas de fútbol de diseño propio, personalizables con tu nombre y tu número.
colors:
  night: "#071426"
  navy: "#0D1F38"
  steel: "#174A7E"
  action: "#1152E8"
  action-hover: "#0D3DAE"
  action-on-dark: "#5B8CFF"
  black: "#050608"
  white: "#FFFFFF"
  gray-50: "#F5F7F8"
  gray-100: "#ECEFF2"
  gray-200: "#DCE1E6"
  gray-400: "#8A949E"
  gray-600: "#5C6670"
  danger: "#B42318"
  success: "#17652D"
typography:
  display:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "clamp(3.25rem, 9vw, 7.5rem)"
    fontWeight: 900
    lineHeight: 0.88
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 900
    lineHeight: 0.92
  title:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.1
  body:
    fontFamily: "Barlow, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "Barlow, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    letterSpacing: "0.06em"
  caption:
    fontFamily: "Barlow, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  none: "0px"
  button: "6px"
  round: "50%"
spacing:
  "1": "0.25rem"
  "2": "0.5rem"
  "3": "0.75rem"
  "4": "1rem"
  "5": "1.5rem"
  "6": "2rem"
  "7": "3rem"
  "8": "4rem"
  "9": "6rem"
components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "0 1.5rem"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.action-hover}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.night}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "0 1.5rem"
    height: "52px"
  button-on-dark:
    backgroundColor: "{colors.white}"
    textColor: "{colors.night}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    height: "52px"
  field:
    backgroundColor: "{colors.white}"
    textColor: "{colors.night}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    height: "48px"
  size-option:
    backgroundColor: "{colors.white}"
    textColor: "{colors.night}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    height: "48px"
  size-option-selected:
    backgroundColor: "{colors.night}"
    textColor: "{colors.white}"
  badge:
    backgroundColor: "{colors.night}"
    textColor: "{colors.white}"
    typography: "{typography.caption}"
    rounded: "{rounded.none}"
    padding: "0.25rem 0.5rem"
  product-card:
    backgroundColor: "{colors.gray-50}"
    rounded: "{rounded.none}"
---

# Design System: LR7

<!-- Revisado el 2026-11-23 tras la auditoría UI/UX (etapa 2). Sustituye la versión del mismo día:
     elimina el naranja, la regla de "una palabra azul" y las etiquetas numeradas decorativas. -->

## Overview

**Creative North Star: "El Dorsal, en silencio"**

La identidad de LR7 es la espalda de una camiseta: un nombre y un número grandes, condensados, que se leen desde lejos. Esa tipografía es la voz de la marca y no necesita adornos alrededor. Premium, aquí, significa quitar: una sola foto grande por pantalla, titulares que hablan solos, un único color para lo que se pulsa y mucho aire. El sistema es deportivo por la letra y el ritmo, no por los efectos.

La superficie es clara: blanco y grises fríos, con bloques en noche y navy para los momentos de marca. El producto o su render ocupan el centro; la interfaz se aparta. El movimiento aparece solo una vez por página para presentar algo, en la entrada del hero, y el resto responde a lo que hace el visitante: agregar, marcar favorito, abrir el carrito.

Guía interna (no visible en el sitio): **FOOTBALL FIRST. PREMIUM STYLE.**

**Key Characteristics:**
- Barlow Condensed 900 para display y titulares; Barlow para todo lo que se lee.
- Un solo color de acción (azul `action`). No hay naranja.
- Superficies planas, sin sombras ni degradados decorativos.
- Una imagen protagonista por pantalla; sin carruseles automáticos.
- Números solo cuando hay una secuencia real: tallas, dorsal y pasos del checkout.
- Diseñado primero para 390 px y para una mano.

## Colors

Paleta de azules profundos y grises fríos; el color se gana su sitio.

### Primary
- **Acción** (action): todo lo pulsable que avanza, como botones primarios, enlaces de acción, talla enfocada y foco. Es lo único azul brillante de la pantalla.
- **Acción hover** (action-hover): hover y pulsación del botón primario.
- **Acción sobre oscuro** (action-on-dark): enlaces y foco sobre noche o navy (5,2–5,8:1).

### Secondary
- **Acero** (steel): superficies secundarias y estados sobre fondos oscuros (hover de una tarjeta oscura, banda de información). Nunca un botón.

### Neutral
- **Noche** (night): texto principal, bloques de marca, talla seleccionada e insignias.
- **Navy** (navy): segunda capa sobre noche.
- **Negro** (black): solo texto sobre fotos claras o detalles de máximo contraste.
- **Blanco** (white): superficie base y texto sobre oscuro.
- **Gris 50** (gray-50): fondo de la foto de producto y de las secciones alternas.
- **Gris 100** (gray-100): superficies de agrupación (resumen del carrito, paneles).
- **Gris 200** (gray-200): separadores decorativos. No sirve como borde de un control.
- **Gris 400** (gray-400): bordes de campos y botones de talla (3,1:1) e iconos inactivos. No es texto.
- **Gris 600** (gray-600): texto secundario y metadatos (5,85:1 sobre blanco).
- **Error** (danger) y **Éxito** (success): validación y confirmaciones. Nunca decorativos.

### Named Rules
**The Un Azul Rule.** El azul `action` es solo para lo que se pulsa. Si no es interactivo, no es azul.

**The Sin Naranja Rule.** No hay naranja en el sistema. Las señales (Nuevo, Últimas unidades) van en blanco sobre noche.

**The Contraste Mínimo Rule.** El texto cumple 4,5:1 contra su fondo real; los bordes de controles, 3:1. Sobre fondos oscuros se usan `white` y `action-on-dark`.

## Typography

**Display Font:** Barlow Condensed (con sans-serif de respaldo)
**Body Font:** Barlow (con sans-serif de respaldo)

**Character:** La condensada pesada habla como un dorsal; Barlow normal explica con calma. Comparten esqueleto, así que la jerarquía sale de peso, tamaño y anchura, no de mezclar familias.

### Hierarchy
- **Display** (900, clamp(3.25rem, 9vw, 7.5rem), 0.88): solo el hero de cada página. Mayúsculas, en cursiva o recta.
- **Headline** (900, clamp(2.25rem, 5vw, 3.75rem), 0.92): título de sección y nombre del producto en la ficha. Mayúsculas.
- **Title** (700, 1.375rem, 1.1): títulos de bloque, nombre en la tarjeta del carrito y del mini-carrito.
- **Body** (400, 1rem, 1.6): descripciones, políticas y FAQ, con un máximo de 70 caracteres por línea.
- **Body small** (400, 0.875rem, 1.5): metadatos, ayudas de campo, notas de envío.
- **Label** (700, 0.875rem, 0.06em): botones, pestañas, navegación y tallas. Mayúsculas solo aquí.
- **Caption** (500, 0.75rem): insignias y contadores. Es el tamaño mínimo: **ningún texto por debajo de 12 px**.

### Named Rules
**The Titular Solo Rule.** Un titular no lleva etiqueta encima por defecto ni una palabra en otro color. Solo se añade etiqueta si aporta información real (por ejemplo, la categoría en la ficha).

**The Mayúsculas Con Motivo Rule.** Mayúsculas en display, headline y label. Metadatos, ayudas y párrafos van en minúsculas con mayúscula inicial.

**The Escala Cerrada Rule.** Solo los 7 tamaños de esta jerarquía. Un tamaño nuevo es un error, no una excepción.

## Layout

- **Base:** escala de espaciado de 4 px (`spacing` 1–9). El ritmo entre secciones es 8 (4 rem) en móvil y 9 (6 rem) en escritorio.
- **Contenedor:** máximo 1440 px, con márgenes de 1 rem en móvil y 2 rem desde 900 px.
- **Puntos de corte:** 600, 900 y 1200 px (el CSS existente usa max-width; se mantiene el criterio).
- **Rejillas:**
  - Catálogo: 2 columnas en móvil, 3 a partir de 900 px y 4 a partir de 1200 px.
  - Ficha: 1 columna hasta 900 px y 2 columnas (galería 7/12 y compra 5/12) a partir de ahí.
- **Una idea por pantalla:** cada sección tiene un propósito y una acción. Si la rejilla no se llena, se usa otra composición; nunca queda media rejilla vacía.
- **Alineación:** a la izquierda en contenido y formularios; centrado solo en estados vacíos.

## Elevation & Depth

Plano. La profundidad sale del contraste de superficies (blanco, gris 50, gris 100, noche) y de la escala de las imágenes. Solo las capas que flotan llevan sombra.

### Shadow Vocabulary
- **Cajón lateral** (`box-shadow: -16px 0 40px rgba(7, 20, 38, 0.18)`): mini-carrito y filtros.
- **Barra fija** (`box-shadow: 0 -8px 24px rgba(7, 20, 38, 0.08)`): barra de compra en móvil.

### Named Rules
**The Plano por Defecto Rule.** Tarjetas, secciones y botones no llevan sombra ni degradado. Una sombra significa que algo flota encima del contenido.

## Shapes

- **Esquinas:** 0 en tarjetas, imágenes, campos, tallas e insignias; 6 px en botones; círculo solo en botones de icono.
- **Bordes:** 1 px. Gris 400 en controles y gris 200 en separadores. La selección se marca con relleno (noche), no con un borde más grueso.
- **Proporción de imagen de producto:** 4:5 en tarjeta y ficha; 16:9 o a sangre en los heros.

## Components

### Buttons
- **Primario:** relleno `action`, texto blanco, label en mayúsculas, 52 px de alto (44 px mínimo en espacios compactos), esquinas de 6 px. Uno por vista.
- **Secundario:** contorno de 1,5 px en noche y texto noche; al pasar el ratón, relleno noche y texto blanco.
- **Sobre oscuro:** relleno blanco y texto noche.
- **Texto:** subrayado con desplazamiento de 4 px, sin flecha añadida.
- **Estados:**
  - Hover solo con `(hover: hover) and (pointer: fine)`. Lo comprueba un test que recorre `globals.css`: ninguna regla `:hover` de la tienda queda fuera de ese media; el panel de administración queda fuera de la regla.
  - Pulsación con `scale(0.97)` en 120 ms.
  - Foco con contorno de 3 px en `action` separado 3 px (`action-on-dark` sobre oscuro).
  - Deshabilitado al 50 % con cursor no permitido.
  - Un botón principal nunca arranca deshabilitado: se valida al pulsar (por ejemplo, "Elige una talla").

### Chips (tallas y filtros)
- **Talla:** 48 px de alto, sin esquinas, borde gris 400. Seleccionada: relleno noche y texto blanco. Agotada: tachada y deshabilitada, con el motivo en `aria-label`.
- **Filtro activo:** chip noche con "×" para quitarlo, más "Limpiar todo".

### Cards / Containers
- **Tarjeta de producto (una sola para todo el sitio):**
  - Foto del producto 4:5 sobre gris 100. Al pasar el ratón la foto se acerca despacio (1,03 en 600 ms) y cambia a su segunda foto, si existe y es distinta; en táctil no.
  - Debajo, el nombre (title), una línea de metadatos (body small en gris 600: "Personalizable", "Training") y el precio (label 700).
  - Como mucho una insignia y el favorito como botón de icono de 44 px. Con puntero, el favorito sin marcar aparece al pasar por la tarjeta o al enfocarla con el teclado; marcado o en táctil se ve siempre.
  - Sin borde, sombra ni tallas.
  - Toda la tarjeta enlaza a la ficha.
- **Paneles:** gris 100, sin borde y con relleno de 1,5 rem.

### Inputs / Fields
- **Estilo:** 48 px de alto, borde de 1 px en gris 400, sin esquinas y fondo blanco. La etiqueta va siempre visible encima (body small 500); el placeholder no sustituye a la etiqueta.
- **Focus:** contorno de 3 px en `action`.
- **Error:** borde y mensaje en `danger` debajo del campo, con `aria-describedby`.
- **Teclado móvil:** `inputmode` y `autocomplete` correctos (teléfono, correo, número de dorsal).

### Navigation
- **Escritorio:** logo, 4 o 5 enlaces (Fútbol, Training, Personaliza, Novedades), buscador, favoritos y carrito. El enlace activo va en noche con subrayado de 2 px.
- **Móvil:** logo, buscador, carrito y menú. El menú es un cajón que se abre desde abajo, con los enlaces grandes al alcance del pulgar, incluida la Tienda.
- **Contador del carrito:** blanco sobre `action`.

### Drawer (mini-carrito, filtros, guía de tallas)
Panel modal lateral (420 px; a pantalla completa en móvil) o que se abre desde abajo en móvil. Las acciones van abajo, al alcance del pulgar. Al abrir, el foco pasa a la acción principal; se cierra con Escape o con un clic fuera, y el foco vuelve al disparador.

### Personalización (signature)
La vista previa muestra el render del modelo elegido, con sus colores y el dorsal escrito en vivo. Por defecto tiene "TU NOMBRE" y "10" para que nunca arranque vacía. Siempre va acompañada de la línea "Las camisetas personalizadas no tienen cambio, salvo defecto de fábrica".

### Fila de confianza (TrustRow)
Envío, cambios y pago con datos reales del CMS (nunca inventados), en body small con icono. Va junto al precio en la ficha, en el carrito y en el checkout.

## Motion

- **Curvas:**
  - `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` para entradas y respuestas.
  - `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)` para cajones.
  - `ease` para cambios de color.
- **Duraciones:** 120 ms (pulsación, color), 200 ms (hover, cambios de estado, salidas), 320 ms (cajones, entradas) y 900 ms (solo la entrada del hero).
- **Qué se anima:** solo `transform` y `opacity` (y `clip-path` en la entrada del hero). Nunca dimensiones ni márgenes. Nada de `transition: all`.
- **Un momento por página:** la entrada del hero (la imagen pasa de 1,04 a 1 de escala y aparece; las líneas del titular se revelan con 60 ms entre una y otra; el CTA aparece 200 ms después). No hay animación al hacer scroll en las secciones de texto.
- **Respuestas al usuario:**
  - Pulsación con `scale(0.97)`.
  - Favorito: el corazón se rellena y pasa de 0,9 a 1 de escala en 200 ms.
  - Contador del carrito: escala de 0,8 a 1 en 200 ms al agregar.
  - Mini-carrito: entra de 100 % a 0 en 320 ms con la curva de cajón y sale en 200 ms. La salida usa `overlay` y `display` con `allow-discrete`; en navegadores sin soporte se cierra al instante.
  - Filtros en móvil: el cajón sale hacia abajo en 200 ms antes de desmontarse; con movimiento reducido se cierra al instante.
  - Agregar al carrito en la ficha: el botón pasa a noche con un check que entra en 200 ms; "Ver carrito" aparece con fundido.
  - Aviso "Deshacer" del carrito: entra con fundido, también cuando se elimina la única línea. Su botón mide 44 px.
  - Galería (ficha):
    - En escritorio, la foto nueva entra con un fundido de 160 ms por encima de la anterior, que sigue debajo hasta que termina, sin flash gris.
    - Con ratón, zoom de 1,5 que sigue al cursor, en 300 ms; no se activa con movimiento reducido.
    - En móvil, carril nativo con `scroll-snap`, puntos de posición y sin miniaturas. El carril se puede enfocar y mover con las flechas.
  - Personalización: al activarla, los campos entran con un fundido de 200 ms; al desactivarla se van al instante.
  - Tarjeta en escritorio: acercamiento de 600 ms, fundido de 200 ms a la segunda imagen (150 ms de vuelta) y aparición del favorito en 200 ms.
- **Prohibido:** franjas de texto en movimiento, carruseles automáticos (salvo el hero, con botón de pausa y quieto con movimiento reducido), rebotes, parpadeos para llamar la atención y aparición progresiva de cada sección.
- **Fuera de pantalla:** una animación continua (la cinta de Streetwear) se pausa con `IntersectionObserver` cuando no se ve.
- **Objetivos táctiles:** 44 × 44 px como mínimo. Cuando el dibujo debe ser menor (interruptor de 52 × 32, migas de pan), se agranda solo la zona de pulsación con un pseudoelemento, o con relleno y margen negativo, sin mover el diseño.
- **`prefers-reduced-motion`:** no hay movimientos de posición ni de escala; solo fundidos de 150 ms.
- **Validación (M7, 2026-11-24):** a 390 px táctil con la CPU 4 veces más lenta:
  - Hero, menú, filtros, galería, mini-carrito, personalización y deshacer van a 60 fps en el percentil 95.
  - CLS 0 y ningún cuadro de más de 50 ms.
  - Solo se animan `transform`, `opacity`, `scale` y colores.
  - Con movimiento reducido no queda ningún `transform` ni `scale` y el hero no avanza solo.
- **Sin dependencias:** CSS, `@starting-style` y la Web Animations API. No se instalan Framer Motion ni GSAP.

## Do's and Don'ts

### Do:
- **Do** usar el azul `action` solo en lo pulsable y un único botón primario por vista.
- **Do** dejar que la foto del producto sea la protagonista de cada pantalla.
- **Do** mostrar la personalización con vista previa en vivo en la home y en la ficha.
- **Do** usar la tarjeta de producto única (foto, nombre, metadatos, precio) en todo el sitio.
- **Do** mantener todo texto en 12 px o más, el foco visible y áreas táctiles de 44 px o más.
- **Do** escribir en español de Colombia, con verbos claros en los botones ("Agregar al carrito", "Pagar").

### Don't:
- **Don't** usar naranja ni ningún otro color de acento fuera de la paleta.
- **Don't** usar escudos, logos ni nombres de clubes, selecciones o marcas de terceros en fotos, renders o nombres de producto. Excepción provisional: las fotos de stock del catálogo, hasta que haya fotos propias (PRODUCT.md, decisión del dueño). El diseño propio (renders, iconos, secciones como "Busca por equipo") sigue sin escudos.
- **Don't** poner etiquetas numeradas ("01 / …") que no correspondan a una secuencia real, ni una etiqueta sobre cada titular.
- **Don't** resaltar una palabra del titular en otro color por costumbre, ni añadir "→" al texto de los botones.
- **Don't** usar franjas de texto en movimiento, carruseles automáticos, rejillas decorativas ni números gigantes de fondo.
- **Don't** poner sombras o degradados en tarjetas y secciones.
- **Don't** mostrar la insignia "Más vendida" si no se basa en ventas reales, ni reseñas o cifras inventadas.

## Implementación con Tailwind CSS 4 (adopción gradual)

- **Entrada:** `app/styles.css`. Capas, en este orden: `theme` (tokens), `legacy` (todo `globals.css`) y `utilities`. Las utilidades ganan a las reglas antiguas, así que un componente migrado no necesita `!important`.
- **Tokens:** el bloque `@theme` replica el `:root` de `globals.css` con los mismos valores; `tests/design-system.test.mjs` falla si se desincronizan. Clases disponibles:
  - Color: `bg-night`, `text-action`, `bg-gray-100`, `text-gray-600`, `border-gray-400`, `text-danger`… La paleta por defecto de Tailwind no existe.
  - Tipografía: `font-heading` (Barlow Condensed) y `font-sans` (Barlow); tamaños `text-caption`, `text-body-sm`, `text-body`, `text-title`, `text-headline`, `text-display`.
  - Espaciado: la escala de Tailwind coincide con la base de 4 px (`p-4` = 1 rem, `p-6` = `--space-5`, `p-8` = `--space-6`).
  - Puntos de corte: `sm` 600 px, `md` 768 px, `lg` 901 px, `xl` 1180 px.
  - Movimiento: `ease-out`, `ease-drawer`; duraciones con los tokens, por ejemplo `duration-(--duration-state)`. No hay `animate-*` genéricos.
- **Sin preflight:** el reset de Tailwind no se carga. `border` va siempre con `border-solid`; para un solo lado, `border-0 border-t border-solid` (si no, los otros lados toman el grosor por defecto). Los controles de formulario declaran su fondo y su tipografía.
- **Reglas de uso:**
  - `hover:` en Tailwind 4 ya solo actúa en dispositivos con puntero; no hace falta envolverlo.
  - Movimiento con `motion-safe:`, o con la regla global de movimiento reducido, que sigue activa.
  - Al migrar un componente, su bloque de `globals.css` se borra en el mismo cambio, para no tener dos fuentes.
  - No se migran el checkout ni el panel admin.

## Home (2026-11-23)

- **Hero en carrusel:** usa todas las diapositivas activas del CMS. Si no hay ninguna, se generan con productos reales: personalización, nueva temporada, retro y training.
  - Movimiento: fundido entre fotos de 700 ms; la foto activa se acerca muy despacio (de 1,06 a 1 en 8 s); el titular se revela línea a línea en cada cambio.
  - Tiempo: una barra de progreso de 7 s por diapositiva. El avance lo dispara el final de esa barra, sin temporizadores.
  - Controles: botón de pausa (WCAG 2.2.2), pausa con el ratón encima o con el foco, flechas, indicadores numerados, teclado y deslizar en móvil (`touch-action: pan-y`).
  - Con movimiento reducido no avanza solo.
- **Busca por equipo,** justo debajo del hero: los equipos reales del catálogo (campo `team`), cada uno con la foto de una de sus camisetas y enlace a `/buscar?q=`. Sin escudos, porque son marcas de terceros.
- La foto del hero (estadio de noche, aficionado de espaldas) no se repite en "Elige tu línea".

## Páginas secundarias y pie (UX8, 2026-11-24)

- **Páginas de información** (envíos, cambios, preguntas frecuentes, guía de tallas, contacto y Nosotros):
  - Usan la cabecera de página de la tienda, sin etiqueta sobre el título.
  - El contenido va en `InfoSection` (mismo ancho que la cabecera) y los textos del CMS en paneles gris 100 (`InfoCards`).
- **Preguntas frecuentes:** `<details>` nativo; se abre con clic, Enter o Espacio sin JavaScript. El signo + gira 45° en 200 ms y no gira con movimiento reducido.
- **Contacto:** campos del sistema de 48 px con etiqueta visible. Envía por WhatsApp; si el número no está configurado, el botón queda deshabilitado con el motivo y un enlace a las preguntas frecuentes.
- **Nosotros:** solo lo que confirma `PRODUCT.md`: los tres diferenciadores, los envíos, los cambios y las tallas. Sin cifras, premios, testimonios ni promesas de calidad.
- **Streetwear y Novedades:**
  - Todo en español, según la tabla aprobada de `docs/PROPUESTA_COPY_A6.md`.
  - Sin aparición por secciones ni flechas añadidas al texto.
  - La cinta de Streetwear es fija. Las entradas del hero usan `--duration-hero` y `--ease-out`.
- **Pie:**
  - Columnas Tienda, Ayuda y LR7. Los enlaces del CMS van a su columna según su dirección, sin repetirse.
  - Muestra envíos, cambios y personalización, y WhatsApp solo si hay número configurado.
  - No muestra medios de pago ni datos legales mientras sigan sin definirse (`PRODUCT.md` → Decisiones abiertas).

## Pulido final (UX9, 2026-11-24)

- **Un solo `<main>`:** lo pone `SiteShell`. Las páginas usan `<div>` como raíz; antes 7 componentes anidaban un segundo `<main>`.
- **Fuentes:** solo los pesos que se pintan, medidos en las 20 rutas públicas a 390 y 1280 px.
  - Barlow Condensed: 400, 700, 800 y 900, en normal y cursiva. Se precarga, porque es la de los titulares y el LCP.
  - Barlow: 400, 500 y 600, sin precarga.
  - Antes eran 14 archivos precargados; ahora son 11 y solo se precargan 8.
- **Lighthouse en local** (Supabase falso, 4G simulado):
  - Accesibilidad y buenas prácticas en 100 en las rutas medidas. SEO en 100, salvo `/carrito`, que es `noindex` a propósito.
  - Rendimiento en escritorio entre 99 y 100. En móvil, entre 87 y 92 en las rutas medidas; el LCP lo marca la foto del hero, que es de stock y externa.
- **Tableta (768 px):** sin desbordamiento, sin elementos fuera de la pantalla y sin texto cortado en 19 rutas.

