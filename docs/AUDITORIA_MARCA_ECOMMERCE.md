# Auditoría de marca y e-commerce LR7: fases 1 y 2

Fecha: 2026-11-20. No hay cambios de código.

**Cómo se hizo:**
- Leí el código de las 19 páginas públicas y de `components/{layout,pages,product,commerce}`.
- Hice capturas de página completa y de la primera pantalla a 390 y 1280 px, con Chrome headless contra `next dev` en local.

> **Límite de la evidencia:** en local no hay Supabase, así que la tienda usa el catálogo de respaldo de `lib/products.ts`: 12 productos con fotos de Unsplash. Los textos de envíos, cambios, FAQ y tallas vienen de `content_items` y en local salen vacíos. Si producción usa `CATALOG_SOURCE=supabase` con fotos y contenido reales, algunos hallazgos marcados con ⚠︎ pueden no aplicar allí. Confírmalo.

---

## Fase 1: Diagnóstico de marca

### ¿Qué es LR7 y por qué comprar aquí? ¿Se entiende en 5 segundos?
**A medias.** En la primera pantalla se entiende que es una tienda de camisetas de fútbol. No se entiende para quién es ni por qué comprar en LR7 y no en otra tienda.
- El hero rota cuatro mensajes ("NUEVO EN LA CANCHA.", "HISTORIA QUE SE VISTE.", etc.). El primero describe un producto ("Clasico Europeo · $95.000"), no la marca.
- La única propuesta de valor escrita es la del footer: "Camisetas deportivas premium para quienes viven el juego con pasion". Es genérica y le falta la tilde.
- Los diferenciadores reales sí existen en el código, pero nadie los ve arriba:
  - Personalización de nombre y número (+$15.000).
  - Marca colombiana, IVA incluido, pago con Wompi y atención por WhatsApp.
- La home no tiene ninguna franja de beneficios (envío, cambios, pago seguro).

### ¿Identidad propia o plantilla?
**La base visual es sólida, pero la ejecución es inconsistente y la fotografía la contradice.**

Lo que funciona:
- Barlow Condensed en cursiva, en negrita y en mayúsculas, junto al azul `#1152E8`, se siente deportivo y con energía.
- `/streetwear` es la página con más personalidad: tono editorial, de revista ("STYLE ISSUE 01 / 26", la cita "Nos inspiran sus colores…").
- `/personaliza` está bien resuelto: pasos numerados, resumen y aviso honesto ("esquema, no es fotografía").

Lo que la debilita:
1. **Fotografía que no coincide con el producto** ⚠︎:
   - La ficha "Seleccion Colombia" muestra camisetas del Manchester United y del Arsenal.
   - El hero "Clasico Europeo" muestra la camiseta de Brasil delante de cajas Nike.
   - "Seleccion Brasil" muestra un primer plano del logo de Nike.
   Esto destruye la confianza: el cliente no sabe qué recibe. Además, se ven marcas de terceros (Nike, Adidas, Arsenal, Man Utd, Chevrolet, Emirates) y nombres de jugadores reales.
2. **Idioma mezclado** en una tienda para Colombia:
   - Tienda: "FOOTBALL / BUILT FOR THE GAME", "LR7 / SHOP", "BEST SELLER" y "FOOTBALL FIRST / TRAINING SECOND".
   - Streetwear: "THE PIECES", "HOW TO WEAR", "NEW ARRIVALS" y "SHOP ALL".
   - Home: "NEW DROP".
3. **Faltan tildes** en datos y navegación: Seleccion, Clasico, MAS VENDIDA, CATALOGO, Catalogo, Envios, Como comprar, Guia de tallas, TAMBIEN, pasion, "diseno". En una marca que se llama premium, se nota.
4. **Códigos internos visibles al cliente:** "FUTBOL_SELECCIONES · COLOMBIA" en la ficha y "MAS EN FUTBOL_SELECCIONES" en los relacionados.
5. **Dos colores de acento sin regla:**
   - La tienda usa el azul.
   - El carrito, el checkout y la personalización usan el naranja.
   Al pasar al carrito parece otra marca.
6. **Patrones repetidos de plantilla deportiva:** el subtítulo numerado ("01 / …", "02 / …") aparece en cada sección, igual que el titular en cursiva con la última palabra en azul y el ticker de texto. Repetido en todas las páginas, deja de distinguir.

### ¿Fútbol, Training y Streetwear tienen personalidad propia?
- **Fútbol:** está clara (clubes, selecciones, retro) y es el centro de la marca. Le falta una historia propia: por qué una camiseta LR7 y no la oficial.
- **Training:** es la línea más débil.
  - En la home ocupa un solo bloque genérico ("Ropa para entrenar").
  - Tiene 5 productos en el catálogo local, sin campaña ni personalidad.
- **Streetwear:** tiene la mejor personalidad, pero **no es una línea de producto**.
  - El modelo de datos solo admite `FUTBOL` y `TRAINING`.
  - La página vuelve a mostrar camisetas de fútbol ("Seleccion Colombia" como "pieza oversize").
  - El menú dice "STREET" y la ruta es `/streetwear`.
  - Hay que decidir si es una línea o una forma de llevar el fútbol (styling).

### Riesgo de negocio que debes confirmar
Los productos llevan nombres de clubes y selecciones reales (Real Madrid, AC Milan, Atlético Nacional, Colombia, Brasil, Argentina). Las fotos muestran escudos y patrocinadores. **Si LR7 no tiene licencia**, esto expone la marca ante los titulares de esas marcas y ante la SIC, y también ante Meta y Google si se pauta.

La recomendación de marca es posicionarse en **diseños propios inspirados** (colores, épocas, historia) sin escudos ni logos de terceros. Es más defendible y diferencia más.

---

## Propuesta de `PRODUCT.md` y `DESIGN.md` (pendiente de tu validación)

No existen. Esto es un borrador y **no lo uso como base hasta que lo valides o lo corrijas.** Las partes entre corchetes [ ] las tienes que decidir tú.

### PRODUCT.md (borrador)
- **Qué es:** marca colombiana de camisetas de fútbol y ropa deportiva, con personalización de nombre y número.
- **Para quién:**
  - Hombres y mujeres de 18 a 35 años en Colombia, hinchas y jugadores amateur (fútbol 5, 7 y 8).
  - Personas que usan la camiseta también fuera de la cancha.
  - Compran desde el móvil y preguntan por WhatsApp antes de pagar.
- **Por qué LR7:**
  - [Elige 2 o 3: diseño propio inspirado en la historia del fútbol / personalización incluida en tu talla / precio por debajo de la oficial / calidad de tela concreta / envío rápido a todo el país.]
- **Líneas:**
  - Fútbol: clubes, selecciones y retro.
  - Training: entrenar.
  - Streetwear: [¿línea propia o forma de llevar el fútbol?].
- **Voz:**
  - Español de Colombia, directo y con energía de cancha, sin anglicismos de relleno.
  - Habla de tú.
  - Frases cortas.
  - Orgullo por el juego sin exagerar.
  - No promete lo que no puede cumplir.
- **No es:** tienda de réplicas baratas ni marca de lujo distante.

### DESIGN.md (borrador)
- **Tipografía:**
  - Titulares: Barlow Condensed 900 en cursiva y mayúsculas, solo en titulares (H1 y H2).
  - Texto, precios y etiquetas: Barlow.
- **Color:**
  - El azul `--color-accent` es el único acento de acción en todo el sitio, también en carrito y checkout.
  - El naranja `--color-accent-orange` queda solo para señales: NUEVO, oferta y urgencia de stock.
  - Navy `--color-mid` para fondos de campaña.
- **Fotografía:**
  - Siempre el producto real que se vende.
  - Cada producto lleva una foto frontal y una de espalda sobre fondo neutro, más una foto puesta en contexto (cancha o calle).
  - Sin logos de terceros.
- **Componentes:**
  - Etiqueta de sección numerada solo en páginas editoriales (home, streetwear y colecciones), no en catálogo ni ficha.
  - Las fichas y las tarjetas priorizan la talla, el precio y la disponibilidad.
- **Movimiento:** revelado y carruseles respetan `prefers-reduced-motion`, que ya está presente en 6 reglas.

---

## Fase 2: Auditoría de e-commerce

Estados: **OK** = Existe y está bien · **Mejorable** = Existe pero mejorable · **Falta**.

Impacto en ventas: A = alto · M = medio · B = bajo. Esfuerzo: S = pequeño · M = medio · L = grande.

### Home
| Punto | Estado | Evidencia | Prioridad | Impacto / esfuerzo |
|---|---|---|---|---|
| Propuesta de valor y hero | Mejorable | El hero rota mensajes de producto y la propuesta de valor solo aparece en el footer | P1 | A / S |
| Entrada clara a cada línea | Mejorable | "Compra por categoría" solo muestra fútbol; Training sale en un bloque al final y Streetwear no aparece | P1 | A / S |
| Lanzamientos y lo más vendido | OK | "Elige tu camiseta" y "Nueva temporada" | — | — |
| Prueba social | Falta | Sin reseñas, fotos de clientes ni Instagram (no inventar: se necesita contenido real) | P2 | A / M |
| Beneficios (envío, cambios, pago seguro) | Falta | Ninguna franja en la home ni junto al botón de compra | P1 | A / S |
| Captura de email o WhatsApp | Falta | `Newsletter` y `NewsletterPremium` existen pero no se usan, y el envío solo cambia el estado local, no guarda nada. El admin de newsletter sí existe | P1 | M / M |

### Navegación y catálogo
| Punto | Estado | Evidencia | Prioridad | Impacto / esfuerzo |
|---|---|---|---|---|
| Menú en móvil | OK | Menú a pantalla completa con favoritos y carrito | — | — |
| Filtros por talla, precio y disponibilidad, y orden | OK | `shop-page.tsx`, con un diálogo de filtros en móvil | — | — |
| Filtros por color y equipo | Falta | Solo talla, precio y disponibilidad | P2 | M / S |
| Pestañas sin productos | Mejorable | "ACCESORIOS" y "FÚTBOL 5 / 7 / 8" aparecen tachadas como "Próximamente": callejones sin salida | P2 | B / S |
| Búsqueda con sugerencias | Falta | `/buscar` no ofrece sugerencias mientras escribes | P3 | M / M |
| Estado "sin resultados" | Mejorable | Existe, pero no propone alternativas (líneas, lo más vendido) | P2 | M / S |
| Breadcrumbs | Mejorable | En la ficha móvil se corta y no muestra la línea ni la categoría | P3 | B / S |
| Paginación o "ver más" | OK | `resetVisible` con carga incremental | — | — |
| Copy en inglés en tienda y streetwear | Mejorable | Ver fase 1 | P1 | M / S |

### Ficha de producto
| Punto | Estado | Evidencia | Prioridad | Impacto / esfuerzo |
|---|---|---|---|---|
| Fotos que coinciden con el producto ⚠︎ | Falta | Fotos de stock de otras camisetas (ver fase 1) | **P0** | A / L, depende de fotos tuyas |
| Galería y zoom | Mejorable | Hay miniaturas y zoom con hover (`img-zoom`), que no funciona en táctil; no hay foto de espalda ni del producto puesto | P2 | M / M |
| Selector de talla y guía | Mejorable | La talla S viene marcada por defecto (riesgo de comprar una talla equivocada); la guía es un enlace pequeño y `/guia-de-tallas` está vacía en local ⚠︎ | P1 | A / S |
| Stock y urgencia honesta | Falta | La ficha no muestra stock; solo se ve DISPONIBLE o AGOTADO en la tarjeta | P2 | M / M |
| Precio anterior y descuento | Mejorable | `compare_at_price` existe en el admin, pero la ficha pública no lo muestra | P2 | M / S |
| Personalización con vista previa | Mejorable | La ficha tiene un interruptor de +$15.000 sin vista previa; la vista previa está solo en `/personaliza` | P2 | M / M |
| Envío y cambios junto al botón de compra | Mejorable | Solo enlaces "ENVÍOS" y "CAMBIOS", sin datos (plazo, costo, días para cambiar) | P1 | A / S |
| Códigos internos visibles | Falta corregir | "FUTBOL_SELECCIONES · COLOMBIA" y "MAS EN FUTBOL_SELECCIONES" | **P0** | M / S |
| Reseñas | Falta | Sin modelo de datos; no inventar | P3 | M / L |
| Relacionados y "completa el look" | Mejorable | Los relacionados son de la misma categoría (1 producto en móvil); no hay venta cruzada con training | P2 | M / S |
| Botón de compra fijo en móvil | Falta | En 390 px el botón de compra queda por debajo de la primera pantalla y no hay barra fija | P1 | A / S |
| Datos estructurados `Product` y `Offer` | OK | JSON-LD en `productos/[slug]` | — | — |

### Carrito y checkout
| Punto | Estado | Evidencia | Prioridad | Impacto / esfuerzo |
|---|---|---|---|---|
| Mini-carrito | Falta | "Agregar al carrito" solo anuncia el cambio con `aria-live`, sin un panel lateral ni confirmación visible | P1 | A / M |
| Editar cantidad | OK | `updateQty`, y eliminar con deshacer | — | — |
| Cambiar la talla en el carrito | Falta | Hay que eliminar el producto y volver a agregarlo | P3 | B / M |
| Costo de envío | Mejorable | "Calculado al finalizar": el costo no se conoce antes del checkout | P1 | A / S, depende de tu tarifa |
| Umbral de envío gratis | Falta | Depende de una decisión comercial | P2 | A / S |
| Cupones | OK | Campo `coupon_code` en el checkout, validado en el servidor | — | — |
| Errores claros | OK | Auditado antes (LR7-0xx) | — | — |
| Estados de pago con siguiente paso | OK | `order-status-client.tsx`; no lo toqué (flujo de pagos) | — | — |
| Color de acento distinto | Mejorable | Naranja en el carrito frente al azul de la tienda | P2 | B / S |

### Confianza y soporte
| Punto | Estado | Evidencia | Prioridad | Impacto / esfuerzo |
|---|---|---|---|---|
| Políticas de envío y cambios ⚠︎ | Falta en local | "No hay información de envíos publicada." / "No hay políticas publicadas." Sin texto de respaldo | **P0** si producción también está vacía | A / S |
| FAQ ⚠︎ | Falta en local | "No hay preguntas frecuentes publicadas." | P1 | M / S |
| WhatsApp | Mejorable | Botón flotante y enlaces listos, pero ocultos si falta `NEXT_PUBLIC_WHATSAPP_NUMBER` | P1 | A / S, depende del número |
| Footer | Mejorable | "Preguntas frecuentes" aparece dos veces; "Como comprar" lleva a /contacto. Sin redes sociales, medios de pago, contacto ni legales | P1 | M / S |
| Medios de pago visibles | Falta | No se ven en la ficha, el carrito ni el footer | P2 | M / S |
| Datos legales de Colombia | Falta | No hay términos y condiciones, política de privacidad y tratamiento de datos (Ley 1581 de 2012), razón social, NIT ni enlace a la SIC. El derecho de retracto (Ley 1480 de 2011) no se menciona. **Obligatorio para vender en línea en Colombia** | **P0** | A / M, necesito tus datos |
| `legalName` | Mejorable | `SITE_CONFIG.legalName = "LR7"`, no la razón social | P1 | B / S |

### Retención
| Punto | Estado | Evidencia | Prioridad | Impacto / esfuerzo |
|---|---|---|---|---|
| Favoritos | OK | `/favoritos` usa almacenamiento local | — | — |
| Cuenta y pedidos | Falta | No hay área de cliente pública (solo `/auth` y el estado del pedido por ID) | P3 | M / L |
| Newsletter | Falta | Ver Home | P1 | M / M |
| Aviso de "vuelve a estar disponible" | Falta | Requiere una tabla nueva (cambio de esquema: necesito tu confirmación) | P3 | M / M |

### SEO
| Punto | Estado | Evidencia | Prioridad | Impacto / esfuerzo |
|---|---|---|---|---|
| Metadata por página | Mejorable | 21 páginas con metadata; faltan `/contacto`, `/favoritos`, `/carrito` y `/preguntas-frecuentes` | P2 | M / S |
| Imagen de Open Graph | Mejorable | No hay `opengraph-image` por defecto: las páginas sin producto se comparten sin imagen | P2 | M / S |
| Datos estructurados | Mejorable | Hay `Product`, `BreadcrumbList`, `Organization` y `WebSite`. Falta `FAQPage`, y `Organization` no tiene `sameAs` ni contacto | P2 | M / S |
| Sitemap y robots | OK | `app/sitemap.ts` y `app/robots.ts` | — | — |
| URLs canónicas | OK | Definidas en 20 sitios | — | — |
| Dominio por defecto incorrecto | **Bug** | Si falta `NEXT_PUBLIC_SITE_URL`, `lib/site.ts` usa `https://sportco.co`; las URLs canónicas, el sitemap y Open Graph apuntarían a otro dominio | P1 | A / S |
| Textos de categoría | Mejorable | Los textos de cabecera son cortos y algunos están en inglés | P2 | M / S |
| Atributos `alt` | Mejorable | Existen, pero sin tildes y a veces no describen la foto real ("Seleccion Colombia vista principal" sobre camisetas de otro equipo) | P2 | B / S |

### Rendimiento (aún sin medir con Lighthouse)
| Punto | Estado | Evidencia | Prioridad | Impacto / esfuerzo |
|---|---|---|---|---|
| Imagen principal (LCP) sin prioridad | Mejorable | Next avisa en `/productos/[slug]` y `/training`: la imagen principal no tiene `priority` ni `loading="eager"` | P1 | M / S |
| `next/image` | OK | Se usa en 14 archivos | — | — |
| Fuentes | OK | `next/font` (Barlow y Barlow Condensed) | — | — |
| Estilos en línea en el navbar, `nosotros` y `not-found` | Mejorable | Muchos `style={{…}}` en línea en vez de tokens o clases: más difícil de mantener y de tematizar | P3 | B / M |
| JavaScript del cliente | Por medir | Mido el bundle en la fase 4 | — | — |

### Accesibilidad
| Punto | Estado | Evidencia | Prioridad | Impacto / esfuerzo |
|---|---|---|---|---|
| Foco visible | OK | 23 reglas `:focus-visible` | — | — |
| `prefers-reduced-motion` | OK | 6 reglas | — | — |
| Contraste | Mejorable | Texto gris pequeño sobre gris claro en tarjetas ("SELECCIONA TALLA") y en el footer; lo verifico al medir | P2 | B / S |
| Áreas táctiles | Mejorable | Los botones de talla de las tarjetas en móvil ocupan 3 filas y vuelven la tarjeta muy alta. Revisar el tamaño de las miniaturas | P2 | M / S |

### Analítica
| Punto | Estado | Evidencia | Prioridad | Impacto / esfuerzo |
|---|---|---|---|---|
| Eventos del embudo | Falta | No hay GA4, GTM ni otro proveedor. Solo `lib/whatsapp.ts` llama a `gtag` si existe | **P0** para medir el éxito | A / M, necesito tu ID de GA4 o GTM |
| Píxeles de Meta y TikTok con consentimiento | Falta | Sin píxeles ni banner de consentimiento | P2 | M / M |

---

## Top 10 por impacto/esfuerzo

| # | Mejora | Por qué | Esfuerzo | ¿Necesito algo tuyo? |
|---|---|---|---|---|
| 1 | Limpiar los textos visibles: tildes en datos, nav y footer; traducir el inglés de relleno; quitar los códigos `FUTBOL_SELECCIONES` | Credibilidad inmediata, cero riesgo | S | No (te paso antes los cambios grandes) |
| 2 | Franja de beneficios en la home y bloque de envío y cambios junto al botón de compra (plazo, costo, días para cambiar, pago seguro con Wompi, WhatsApp) | Responde las 3 dudas que frenan la compra | S | Plazos, costo de envío y política de cambios |
| 3 | Páginas legales: términos, privacidad y Habeas Data, retracto; footer con razón social, NIT y enlace a la SIC | Obligatorio en Colombia, da confianza | M | Razón social, NIT, dirección, correo legal |
| 4 | Textos de respaldo para envíos, cambios, FAQ y guía de tallas cuando el CMS está vacío | Ninguna página de confianza puede salir vacía | S | Confirmar si producción ya tiene contenido |
| 5 | Ficha móvil: barra de compra fija con talla y precio; no preseleccionar la talla; guía de tallas en un diálogo | Mayor palanca de conversión en móvil | S–M | No |
| 6 | Confirmación al agregar al carrito: panel lateral o toast con "Ir al carrito" | Hoy no hay respuesta visible al agregar | M | No |
| 7 | Hero y propuesta de valor: un mensaje de marca claro más accesos a Fútbol, Training y Streetwear | Se entiende qué es LR7 en 5 segundos | S | Validar el copy |
| 8 | Analítica: GA4 o GTM con eventos `view_item`, `add_to_cart`, `begin_checkout` y `purchase`, y banner de consentimiento | Sin medir no se sabe qué funciona | M | ID de GA4 o GTM |
| 9 | Corregir el dominio por defecto `sportco.co`, añadir `priority` a la imagen principal, una imagen de Open Graph por defecto y metadata en las 4 páginas que no tienen | SEO y rendimiento, rápido | S | Dominio definitivo |
| 10 | Newsletter real: conectar el componente a la tabla de suscriptores con consentimiento y ponerlo en la home y el footer | Construye una base de clientes propia | M | Confirmar la tabla, quizá cambio de esquema |

**Fuera del top 10 pero crítico:** la fotografía real de producto (P0). No la puedo resolver con código; necesito tus fotos. Mientras tanto, puedo preparar el componente de galería (frontal, espalda, puesta) y un aviso de foto ilustrativa si lo apruebas.

## Lo que necesito de ti para la fase 3
1. Validar o corregir los borradores de `PRODUCT.md` y `DESIGN.md`, sobre todo los 2 o 3 diferenciadores y si Streetwear es una línea.
2. Confirmar si producción usa el catálogo de Supabase con fotos reales y si las páginas de envíos, cambios y FAQ tienen contenido.
3. Confirmar el tema de licencias: si los productos son oficiales o inspirados.
4. Aprobar qué puntos del top 10 implemento.
5. Dar los datos para los puntos 2, 3, 8 y 9 cuando los tengas. Sin ellos dejo un estado vacío seguro y lo anoto.
