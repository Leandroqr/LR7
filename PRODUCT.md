# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Hinchas y jugadores amateur de fútbol en Colombia, hombres y mujeres de 18 a 35 años. Juegan fútbol 5, 7 u 8, siguen a su equipo y se ponen la camiseta también fuera de la cancha. Compran sobre todo desde el móvil; antes de pagar consultan talla, envío y cambios, y a menudo preguntan por WhatsApp.

Su objetivo es encontrar una camiseta que les represente, elegir bien la talla, personalizarla con su nombre y número y saber cuánto cuesta y cuándo llega.

## Product Purpose

LR7 es una tienda en línea colombiana de camisetas de fútbol y ropa de training. Vende camisetas de diseño propio inspiradas en la historia del fútbol, personalizables con nombre y número.

El éxito es que un visitante en el móvil entienda en segundos qué hace distinta a LR7, encuentre su camiseta, la personalice y compre con confianza: sabe la talla, el plazo de envío y la política de cambios antes de pagar.

## Positioning

Lo que LR7 comunica y otra tienda no puede copiar tal cual es la combinación de tres cosas, todas confirmadas por el dueño:

1. **Personalización:** nombre y número en la espalda, configurados en la web con vista previa (+$15.000).
2. **Diseño propio inspirado:** camisetas inspiradas en colores, épocas y selecciones de la historia del fútbol. No son réplicas oficiales.
3. **Precio accesible:** calidad premium por debajo del precio de una camiseta oficial (catálogo actual entre $79.000 y $95.000 COP).

## Operating Context

- **Líneas de producto:** Fútbol (clubes, selecciones y retro, todo como diseño inspirado) y Training (camisetas, camisillas, pantalonetas, buzos y conjuntos).
- **Streetwear:** no es una línea de producto. Es una sección editorial sobre cómo llevar las camisetas de fútbol fuera de la cancha y combinarlas.
- **Compra:**
  - Carrito en el navegador y checkout con Wompi (precio, stock, cupón y envío se recalculan en el servidor).
  - El checkout aún no está habilitado en producción, así que hoy no se puede pagar en línea.
- **Contenido editable desde el admin (Supabase):** envíos, cambios, FAQ, guía de tallas, navegación y home.
- **Envíos y cambios publicados:**
  - Cobertura nacional y entregas de 2 a 5 días hábiles.
  - Cambios dentro de 5 días hábiles.
  - Las camisetas personalizadas no aplican para cambio, salvo defecto de fábrica.
- **Tallas:** S a XXL, con guía de medidas en centímetros (pecho, largo, hombro).
- **Atención:** WhatsApp previsto como canal principal (pendiente de configurar el número).

## Capabilities and Constraints

- **Personalización:** nombre de hasta 12 letras y número de 0 a 99, en la espalda, con un recargo de $15.000.
- **Stack:** Next.js 16 (App Router), React 19, Supabase y pagos con Wompi, desplegado en Vercel. Precios en COP con IVA incluido.
- **Catálogo:**
  - Hoy producción usa el catálogo de respaldo (`lib/products.ts`) con fotos provisionales de Unsplash.
  - El catálogo real saldrá de Supabase cuando haya fotos reales (C3).
- **Restricción de marca:**
  - Las camisetas son diseños inspirados, **sin escudos ni logos de terceros** (clubes, selecciones, Nike, Adidas, patrocinadores).
  - Los nombres de producto deben ser descriptivos y no usar nombres de clubes o selecciones como si fueran producto oficial.
- **Idioma:** todo el sitio en español de Colombia, streetwear incluido.
- **Decisiones abiertas:**
  - Tarifa de envío y umbral de envío gratis.
  - Número de WhatsApp.
  - Datos legales (razón social, NIT).
  - Dominio definitivo.
  - Medios de pago a mostrar.

## Brand Commitments

- **Nombre:** LR7. Hay un logotipo en `public/lr7-logo.svg` y un icono en `app/icon.svg`.
- **Voz:**
  - Habla de tú, con frases cortas y energía de cancha.
  - Orgullo por el juego sin exagerar.
  - Español de Colombia con tildes y sin anglicismos de relleno.
  - Ejemplo del tono: "Tu nombre. Tu número. Tu camiseta."
- **Color (restricción vinculante del dueño, 2026-11-23):** paleta de noche `#071426`, navy `#0D1F38`, acero `#174A7E`, azul `#1152E8`, negro, blanco y grises. El azul es el único color de interacción. **El naranja se elimina** de todo el sitio.
- **Guía interna de marca (no visible en el sitio):** "FOOTBALL FIRST. PREMIUM STYLE." El cliente solo lee español.
- **Personalidad:** deportiva, premium, juvenil, moderna, elegante, minimalista y comercial. Sin estilos genéricos ni exceso de degradados, sombras o efectos; sin copiar a Nike, Adidas o Puma.
- **Imágenes provisionales (decisión del dueño, 2026-11-23):** mientras no haya fotos reales, el producto se muestra con las fotos de stock del catálogo. Riesgo aceptado: varias muestran logos y escudos de terceros y no corresponden al producto exacto. Cuando el dueño suba fotos propias desde el admin, sustituyen a las de stock sin cambiar código. El render plano solo se usa si un producto no tiene ninguna imagen, y en la vista previa de la personalización.

## Evidence on Hand

- **Contenido real publicado en el CMS:** envíos, cambios, FAQ y guía de tallas.
- **No existen y no deben inventarse:**
  - Fotos reales de producto (las actuales son de Unsplash y no corresponden a los productos).
  - Reseñas, testimonios, cifras de clientes, premios, sellos o prensa.
  - Datos legales de la empresa.
  - Cuentas de redes sociales confirmadas.

## Product Principles

1. **Confianza antes de pagar:** talla, envío, cambios y precio final visibles antes del checkout, con datos reales y nunca inventados.
2. **El móvil manda:** cada pantalla se diseña primero para 390 px y para una mano.
3. **La personalización es el gancho:** debe verse y probarse fácilmente desde la home y la ficha.
4. **Diseño propio, sin logos ajenos:** la identidad viene de la historia y los colores del fútbol, no de marcas de terceros.
5. **Español claro de cancha:** sin códigos internos, sin inglés de relleno y con tildes.

## Accessibility & Inclusion

WCAG 2.1 AA. A 2026-11-23 el sitio pasa axe-core sin violaciones en 21 rutas a 390 y 1280 px, con Lighthouse Accesibilidad 100 (LR7-054). Los cambios nuevos deben mantenerlo: contraste ≥ 4,5:1 en texto pequeño, foco visible, áreas táctiles ≥ 44 px y respeto de `prefers-reduced-motion`.
