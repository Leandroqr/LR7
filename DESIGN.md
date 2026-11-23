---
name: LR7
description: Camisetas de fútbol de diseño propio, personalizables con tu nombre y tu número.
colors:
  dorsal-blue: "#1152E8"
  dorsal-blue-on-dark: "#5B8CFF"
  signal-orange: "#FF6A00"
  signal-orange-hover: "#D95700"
  signal-orange-text: "#A83F00"
  night-navy: "#071426"
  deep-navy: "#0D1F38"
  ink: "#050608"
  ice: "#DCEAF5"
  chalk: "#F5F7F8"
  white: "#FFFFFF"
  border: "rgba(7, 20, 38, 0.14)"
  text-muted: "rgba(5, 6, 8, 0.64)"
  text-muted-on-dark: "rgba(255, 255, 255, 0.72)"
  danger: "#B42318"
typography:
  display:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "clamp(3rem, 8vw, 8rem)"
    fontWeight: 900
    lineHeight: 0.88
    letterSpacing: "0em"
  headline:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3rem)"
    fontWeight: 900
    lineHeight: 0.95
  label:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 800
    letterSpacing: "0.1em"
  body:
    fontFamily: "Barlow, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  none: "0px"
  sm: "2px"
  md: "6px"
  round: "50%"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1.25rem"
  lg: "2rem"
  xl: "5rem"
components:
  button-primary:
    backgroundColor: "{colors.dorsal-blue}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0.85rem 2rem"
    height: "52px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.night-navy}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0.85rem 2rem"
    height: "52px"
  size-button:
    backgroundColor: "{colors.white}"
    textColor: "{colors.night-navy}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    height: "48px"
  size-button-selected:
    backgroundColor: "{colors.dorsal-blue}"
    textColor: "{colors.white}"
  badge-signal:
    backgroundColor: "{colors.signal-orange}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.3rem 0.6rem"
  product-card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.none}"
---

# Design System: LR7

## Overview

**Creative North Star: "El Dorsal"**

Todo el sistema parte de la espalda de una camiseta: un nombre y un número grandes, condensados y en mayúsculas, que se leen desde la tribuna. Esa tipografía es la voz de la marca. Los titulares son condensados, de peso 900 y en cursiva, con una sola palabra en azul que hace de número del dorsal. Los números aparecen como recurso gráfico: pasos numerados, contadores y marcas de agua grandes. La personalización (tu nombre, tu número) es el gesto que siempre debe estar a la vista o a un toque.

La superficie es clara y limpia (blanco, gris tiza y hielo), con bloques en azul noche para campañas y momentos de marca. El contraste es fuerte y la densidad media: el producto y su foto mandan, y la interfaz no compite con ellos. Las formas son firmes y deportivas: esquinas casi rectas, sin sombras decorativas y bordes finos, como una camiseta bien cortada.

**Key Characteristics:**
- Titulares en Barlow Condensed 900, cursiva y mayúsculas; el cuerpo en Barlow.
- Un solo color de acción (azul dorsal); el naranja solo como señal.
- Superficies planas con borde fino; el azul noche como bloque de marca.
- Números como recurso gráfico (dorsales, pasos, contadores).
- Pensado primero para 390 px y una mano.

## Colors

Una paleta deportiva de dos acentos con roles estrictos sobre neutros fríos.

### Primary
- **Azul Dorsal** (dorsal-blue): todas las acciones (botón primario, talla seleccionada, enlaces de acción, precio), en tienda, ficha, carrito, checkout y personalizador. También la palabra destacada de los titulares.
- **Azul Dorsal sobre noche** (dorsal-blue-on-dark): la versión del azul para texto pequeño sobre fondos azul noche o negros, donde el azul base no llega a 4,5:1.

### Secondary
- **Naranja Señal** (signal-orange): solo señales: NUEVO, oferta, urgencia de stock y marcas de estado. Nunca un botón de acción.
- **Naranja Señal para texto** (signal-orange-text): el naranja cuando es texto pequeño sobre blanco (6,2:1).

### Neutral
- **Azul Noche** (night-navy): texto principal, bloques de campaña, hero del carrito vacío y cabeceras oscuras.
- **Navy Profundo** (deep-navy): segunda capa sobre azul noche.
- **Tinta** (ink): el texto más oscuro y los fondos casi negros.
- **Hielo** (ice): fondos de sección con color suave (por ejemplo, categorías de la home).
- **Tiza** (chalk): fondo de catálogo, paneles de compra y superficies secundarias.
- **Blanco** (white): superficie base y tarjetas.
- **Borde** (border): divisiones y contornos de tarjetas, campos y botones de talla.
- **Texto secundario** (text-muted / text-muted-on-dark): etiquetas, notas y metadatos; ≥ 6:1 sobre claro y ≥ 9,8:1 sobre oscuro.
- **Error** (danger): errores de validación (por ejemplo, "Elige una talla para continuar.").

### Named Rules
**The Azul Acción Rule.** Si se puede pulsar para avanzar, es azul. Si avisa de algo, es naranja. Nunca al revés, y nunca un botón naranja.

**The Contraste Mínimo Rule.** El texto pequeño cumple 4,5:1 contra su fondo real. Sobre oscuro se usan los tokens `*-on-dark`, no el azul ni el gris base.

## Typography

**Display Font:** Barlow Condensed (con sans-serif de respaldo)
**Body Font:** Barlow (con sans-serif de respaldo)

**Character:** Condensada, pesada y en cursiva para hablar como un dorsal; Barlow normal, ligera y legible para explicar. Las dos comparten esqueleto, así que el salto entre titular y cuerpo es de peso y anchura, no de familia.

### Hierarchy
- **Display** (900, cursiva, clamp(3rem, 8vw, 8rem), 0.88): heros de página y campañas. Mayúsculas. Una palabra en azul dorsal.
- **Headline** (900, clamp(2rem, 4vw, 3rem), 0.95): títulos de sección y nombre del producto en la ficha.
- **Label** (800, 0.68–0.8rem, 0.08–0.12em, mayúsculas): botones, etiquetas, insignias, migas de pan, subtítulos numerados.
- **Body** (300–400, 0.85–1.1rem, 1.7): descripciones, políticas y FAQ; máximo unos 70 caracteres por línea.

### Named Rules
**The Dorsal Rule.** Barlow Condensed en mayúsculas es para titulares, botones y etiquetas. Los párrafos nunca van en condensada ni en mayúsculas.

**The Una Palabra Azul Rule.** En un titular, como mucho una palabra o un verso en azul. Si todo destaca, nada destaca.

## Layout

- **Contenedor:** máximo 1440 px, con márgenes de 2 rem (1 rem en móvil).
- **Ritmo de secciones:** unos 5 rem de espacio vertical entre secciones (6 rem en las editoriales).
- **Puntos de corte principales:**
  - 900 px: la ficha pasa de dos columnas a una y aparece la barra de compra fija.
  - 600 px: móvil estrecho.
- **Prioridad:** el diseño se piensa primero a 390 px. En la ficha, la talla y la compra van antes que la descripción.
- **Ficha a ≤ 900 px:** barra de compra fija abajo (total, talla y COMPRAR AHORA), que se oculta al llegar al footer.

## Elevation & Depth

El sistema es plano. La profundidad viene del contraste de superficies (blanco, tiza, hielo y bloques azul noche) y de bordes finos, no de sombras. Las sombras solo aparecen en capas que flotan sobre la página.

### Shadow Vocabulary
- **Panel lateral** (`box-shadow: -16px 0 40px rgba(7, 20, 38, 0.18)`): mini-carrito.
- **Barra fija** (`box-shadow: 0 -8px 24px rgba(7, 20, 38, 0.08)`): barra de compra en móvil.

### Named Rules
**The Plano por Defecto Rule.** Las tarjetas y secciones no llevan sombra. Una sombra significa que algo flota sobre el contenido.

## Shapes

- **Esquinas:**
  - Botones: casi rectas (6 px).
  - Tarjetas de producto, botones de talla, campos e insignias: rectas (0–2 px).
  - Círculos solo para botones de icono (favoritos) e indicadores.
- **Bordes:** finos de 1 px en el color de borde. El estado seleccionado se marca con relleno azul, no con un borde más grueso.

## Components

### Buttons
- **Shape:** esquinas casi rectas (6 px), alto de 52 px en paneles de compra y mínimo 44 px en cualquier botón.
- **Primary:** relleno azul dorsal, texto blanco, Barlow Condensed 800 en mayúsculas.
- **Outline:** fondo transparente con borde de 1,5 px en azul noche; al pasar el ratón se rellena de azul noche con texto blanco.
- **Hover / Focus:** foco visible con contorno azul de 3 px separado 3 px.

### Chips (tallas)
- **Style:** botones de talla rectos (0 px) de 48 px de alto, fondo blanco y borde fino.
- **State:** la talla seleccionada va rellena de azul dorsal con texto blanco. Con error, los bordes pasan a rojo de error y aparece el mensaje debajo.

### Cards / Containers
- **Corner Style:** rectas (0 px).
- **Background:** blanco sobre fondo tiza.
- **Shadow Strategy:** ninguna (ver Elevation & Depth).
- **Border:** fino, en el color de borde.
- **Internal Padding:** 1–1,25 rem.

### Inputs / Fields
- **Style:** rectángulo con borde fino o solo una línea inferior, fondo blanco o tiza.
- **Focus:** contorno azul de 3 px (`:focus-visible`). Nunca `outline: none` sin reemplazo.
- **Error / Disabled:** borde y mensaje en rojo de error; deshabilitado al 55 % de opacidad.

### Navigation
- **Desktop:** menú en Barlow Condensed en mayúsculas con espaciado amplio; la sección activa en azul.
- **Mobile:** menú a pantalla completa con enlaces grandes condensados.
- **Buscador:** panel desplegable que, cerrado, queda fuera del orden de tabulación.

### Mini-carrito (signature)
Panel lateral modal de 420 px (pantalla completa en móvil) con la línea agregada, el subtotal, IR AL CARRITO (primario) y SEGUIR COMPRANDO (outline), con los botones abajo, al alcance del pulgar.

## Do's and Don'ts

### Do:
- **Do** usar el azul dorsal para toda acción, también en carrito, checkout y personalizador.
- **Do** escribir titulares en Barlow Condensed 900 en mayúsculas con como mucho una palabra en azul.
- **Do** mostrar la personalización (nombre y número) en la home y en la ficha.
- **Do** usar los tokens `*-on-dark` para texto pequeño sobre azul noche o negro.
- **Do** mantener áreas táctiles de 44 px o más y el foco visible en todo elemento interactivo.

### Don't:
- **Don't** usar naranja en botones de acción. El naranja es solo señal.
- **Don't** usar escudos ni logos de terceros (clubes, selecciones, Nike, Adidas, patrocinadores) en fotos, gráficos o nombres de producto.
- **Don't** poner sombras en tarjetas o secciones planas.
- **Don't** escribir párrafos en condensada o en mayúsculas.
- **Don't** usar texto gris claro sobre fondos claros por debajo de 4,5:1.
