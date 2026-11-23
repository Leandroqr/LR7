# Diagnóstico técnico y comercial de LR7

Fecha: 2026-11-23. Es una auditoría de solo lectura: no se modificó código.

**Fuentes:**
- Código del repo (rama `main` con cambios del admin sin commit).
- Producción `https://lr7.vercel.app`, revisada solo con peticiones GET.
- Lighthouse 12.6.1 en móvil contra producción.
- Registro previo en `LR7_HALLAZGOS.md`, con los hallazgos LR7-001 a LR7-046.

**Variables de entorno:** solo se revisaron sus nombres en `.env.example` y su efecto en producción. No hay acceso al panel de Vercel ni se leyó ningún valor secreto.

**Qué no se pudo comprobar:**
- El pago con Wompi: no se tocó el flujo de pagos.
- La base de datos real: no hay credenciales.
- El panel admin con sesión.

Cada afirmación lleva su nivel de certeza:
- ✅ verificado en producción
- 🔍 verificado en el código
- ❔ no verificable sin acceso

---

## 1. Lo que funciona hoy

| Área | Qué funciona | Certeza |
|---|---|---|
| Arquitectura | Next.js 16 App Router, React 19, TypeScript `strict`, Zod 4, Supabase SSR. Las 23 rutas públicas responden 200 y las 404 responden 404 | ✅ |
| Catálogo | 12 productos y 18 categorías navegables; filtros por talla, precio y disponibilidad; orden; carga incremental; `/buscar` con acentos | ✅ |
| Ficha | Galería, selector de talla, personalización +$15.000, favoritos, relacionados, JSON-LD `Product` y `BreadcrumbList` | ✅ |
| Personalización | `/personaliza` con pasos, vista previa esquemática y resumen. El nombre y el número viajan hasta `order_items.personalization` y se ven en el admin de pedidos | 🔍 |
| Favoritos y carrito | Se guardan en `localStorage`; se puede editar la cantidad y eliminar con deshacer; el total incluye la personalización | 🔍 |
| Contenido CMS | Envíos, cambios, FAQ y guía de tallas tienen contenido en producción, servido desde Supabase | ✅ |
| Checkout Wompi (código) | Bien diseñado: precio, stock, cupón y envío se recalculan en el servidor (RPC `start_wompi_checkout`). Además: reserva de inventario con expiración, firma de integridad, webhook con verificación, idempotencia, reconciliación y pedido como invitado | 🔍 |
| Base de datos | 19 tablas con RLS activado. Reservas de inventario, cupones, pagos y eventos de Wompi. El envío y el envío gratis se leen de `site_settings.commerce` | 🔍 |
| Admin | Protegido: `/admin` redirige al login con 307, y el login tiene `noindex`. CRUD de productos, variantes, imágenes, categorías, inventario, pedidos, usuarios, contenido, navegación y newsletter. Endurecido en LR7-035 a LR7-044 | ✅ y 🔍 |
| SEO base | Títulos, metadata en 21 páginas, URLs canónicas, sitemap con 36 URLs, robots, JSON-LD `Organization` y `WebSite`. Lighthouse SEO 100 | ✅ |
| Accesibilidad base | Foco visible, `prefers-reduced-motion`, enlace para saltar al contenido en el admin y menú móvil accesible. Lighthouse Accesibilidad 96 | ✅ |
| Seguridad base | HSTS con preload (Vercel); escape del JSON-LD; validación del origen en `prepare`; cron protegido con `CRON_SECRET` de al menos 32 caracteres; `server-only` en el cliente con service-role | ✅ y 🔍 |

## 2. Lo que está incompleto (existe, pero no termina de funcionar)

| Funcionalidad | Estado real | Certeza |
|---|---|---|
| **Catálogo real** | Producción muestra el **catálogo de respaldo** de `lib/products.ts`, con 843 referencias a `images.unsplash.com` y 0 imágenes de Supabase Storage. O `CATALOG_SOURCE` no vale `supabase`, o Supabase no tiene productos activos. Lo que se edita en el admin **no llega a la tienda** | ✅ |
| **Compra en línea** | El código está listo, pero no se sabe si `WOMPI_CHECKOUT_ENABLED=true` en producción, ni si existen las claves y `CHECKOUT_ACCESS_SECRET`. Con el catálogo de respaldo, los SKU dependen de que el seed demo esté aplicado. No hay evidencia de un pedido real de principio a fin | ❔ |
| **Expiración de reservas** | Existe `/api/cron/expire-wompi-checkouts`, pero no hay `vercel.json` con `crons`. Si no está configurado en el panel de Vercel, las reservas de stock no se liberan solas | 🔍 / ❔ |
| **WhatsApp** | Botón flotante, enlaces y mensaje con el carrito: todo listo. En producción no aparece ningún `wa.me`, así que falta `NEXT_PUBLIC_WHATSAPP_NUMBER` | ✅ |
| **Contacto** | El formulario solo abre WhatsApp. En producción el botón está deshabilitado y dice "El canal de contacto está en configuración." **La tienda no tiene ningún canal de contacto activo** | ✅ |
| **Newsletter** | Existen la tabla `newsletter_subscribers` con consentimiento, el admin y 2 componentes. Pero los componentes no se usan en ninguna página y el envío solo cambia el estado local, no guarda nada | 🔍 |
| **Contenido de la home** | Las secciones de la home se editan en el admin, pero su render está comentado (LR7-045) | 🔍 |
| **Costo de envío** | El servidor lo calcula desde `site_settings.commerce`, pero el carrito muestra "Calculado al finalizar" | ✅ |
| **Cupones** | Hay campo y validación en el servidor. No hay ningún mensaje que los promocione | 🔍 |
| **Precio anterior** | `compare_at_price` existe en el admin y en la base de datos; la ficha pública no lo muestra | 🔍 |
| **Disponibilidad** | "DISPONIBLE" se calcula a partir de variantes activas, no del stock real (LR7-015) | 🔍 |
| **Analítica** | `lib/whatsapp.ts` llama a `gtag` solo si existe, y no existe | ✅ |
| **Validación del admin con datos** | LR7-035 a LR7-044 están corregidos, pero falta probarlos contra un Supabase de staging | ❔ |

## 3. Lo que no existe

- **Páginas legales:** términos y condiciones, política de privacidad y tratamiento de datos (Ley 1581 de 2012), derecho de retracto y garantía (Ley 1480 de 2011). Tampoco hay razón social, NIT, dirección ni enlace a la SIC ✅.
- **Consentimiento en el checkout:** el formulario recoge nombre, correo, celular y dirección sin aceptación de política de datos 🔍.
- **Analítica:** no hay GA4, GTM, píxeles ni banner de cookies ✅.
- **Cabeceras de seguridad:** no hay CSP, `X-Frame-Options`/`frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy` ni `Permissions-Policy`. Además, la cabecera `x-powered-by: Next.js` queda expuesta ✅.
- **Protección contra abuso:** no hay límite de peticiones ni anti-bots en `/api/payments/wompi/prepare` y `reconcile`, que **reservan inventario** 🔍.
- **`proxy.ts` / middleware:** no existe. La sesión de Supabase no se refresca en un proxy; hoy solo afecta al admin 🔍.
- **CI:** no hay `.github/workflows`, así que lint, tests y build solo se ejecutan a mano 🔍.
- **Tests de extremo a extremo** del embudo de compra.
- **Funciones de tienda que faltan:** mini-carrito o confirmación al agregar, barra de compra fija en la ficha móvil, franja de beneficios, prueba social y reseñas, cuenta de cliente con historial, aviso de reposición, filtros por color y equipo, sugerencias de búsqueda, imagen de Open Graph por defecto, JSON-LD `FAQPage`.

## 4. Errores encontrados

| # | Error | Evidencia | Gravedad |
|---|---|---|---|
| E1 | **Dominio equivocado en SEO:** las URLs canónicas, `og:url`, `robots.txt` y el sitemap con 36 URLs apuntan a `https://sportco.co`. Falta `NEXT_PUBLIC_SITE_URL` en Vercel y `lib/site.ts:1` tiene ese dominio por defecto. Google indexaría otro dominio | ✅ `curl /robots.txt`, `/sitemap.xml` y canonical de la ficha | Crítica |
| E2 | **`next@16.4.0` con vulnerabilidades:** 2 críticas, 1 alta y 7 moderadas (LR7-046). El lockfile fija 16.4.0 y `package.json` usa `latest` | 🔍 `pnpm audit --prod` | Crítica |
| E3 | **Fotos que no corresponden al producto** (LR7-014, 026 y 027): "Seleccion Colombia" muestra Manchester United y Arsenal; "Clasico Europeo" muestra la camiseta de Brasil | ✅ | Crítica (comercial) |
| E4 | ✅ Resuelto en A6 (LR7-051). **Códigos internos visibles:** "FUTBOL_SELECCIONES · COLOMBIA" en la ficha y "MAS EN FUTBOL_SELECCIONES" en los relacionados | ✅ | Alta |
| E5 | **Textos sin tildes** en catálogo, navegación, footer y CMS (Seleccion, Clasico, CATALOGO, Envios, Guia, satisfaccion, dias…), y copy en inglés en tienda y streetwear | ✅ | Alta |
| E6 | ✅ Resuelto en A3 (LR7-049). **Render dinámico en todo el sitio:** `app/layout.tsx:66` llama a `getPublicNavigation()`, que lee `cookies()`. Todas las páginas salen `no-store` y consultan Supabase en cada visita (TTFB en frío de 2,7 s en la home) | ✅ `cache-control: private, no-store` | Alta |
| E7 | **LCP lento en móvil:** home 3,4 s, ficha 3,7 s, tienda 5,5 s. En la tienda, el elemento LCP es el fondo de `header.shop-hero`, que no se prioriza | ✅ Lighthouse | Alta |
| E8 | ✅ Resuelto en A12. **`robots.txt` incompleto:** no excluye `/admin`, `/api`, `/auth` ni `/checkout` | ✅ | Media |
| E9 | **Footer con errores:** "Preguntas frecuentes" sale dos veces y "Cómo comprar" lleva a `/contacto` | ✅ | Media |
| E10 | ✅ Resuelto en A8 (LR7-052). **Talla S marcada por defecto** en la ficha | ✅ | Media |
| E11 | **Pestañas de categoría vacías visibles:** "ACCESORIOS" y "FÚTBOL 5/7/8" aparecen tachadas | ✅ | Baja |
| E12 | **Lighthouse marca contraste y tamaño de fuente:** texto gris pequeño en las tarjetas y en el footer | ✅ | Media |

## 5. Riesgos técnicos

1. **Vulnerabilidades de Next (E2)** en un sitio que procesa pagos.
2. **`latest` en `next`, `react`, `react-dom` y `eslint-config-next`:** cada instalación sin lockfile puede traer un cambio incompatible. Ya ocurrió un desajuste del lockfile (LR7-022).
3. **Inventario retenido:**
   - Sin cron confirmado, las reservas no se liberan.
   - Sin límite de peticiones, un bot puede crear pedidos pendientes y bloquear el stock.
4. **Dos fuentes de catálogo** (estático y Supabase) con datos distintos. Hay que decidir si el respaldo estático se mantiene en producción.
5. **Sin CI ni tests de extremo a extremo:** un cambio puede romper el checkout sin que nadie se entere. Los 55 tests son unitarios.
6. **Rendimiento en producción:** el render dinámico global aumenta los costos de Vercel y Supabase y la latencia cuando crezca el tráfico.
7. **Mantenibilidad:** más de 170 estilos en línea (`style={{…}}`) en `home-personalizer`, `nosotros`, `navbar`, `catalog-page` y otros. `globals.css` tiene 6.419 líneas en un solo archivo.
8. **No hay verificación extremo a extremo de Wompi en sandbox:** la lógica es correcta en tests unitarios, pero nunca se ha ejecutado un pago completo con su webhook.

## 6. Riesgos comerciales

1. **No se puede comprobar que la tienda venda en línea hoy.** Si el checkout no está habilitado, la única salida es WhatsApp, y WhatsApp tampoco está configurado: **ningún visitante puede comprar ni contactar.**
2. **Riesgo marcario:** los productos llevan nombres de clubes y selecciones reales (Real Madrid, AC Milan, Nacional, Colombia, Brasil, Argentina) y las fotos muestran Nike, Adidas, Arsenal y Man Utd. Sin licencia, se expone a reclamaciones de titulares, a la SIC y a rechazos en Meta y Google Ads.
3. **Incumplimiento legal:** no hay términos, política de datos, retracto, NIT ni contacto. Hay riesgo de sanción de la SIC, y además pasarelas y bancos pueden pedir estos datos.
4. **Confianza:** las fotos no coinciden con el producto, faltan tildes y no hay contacto. El visitante no tiene motivos para pagar.
5. **No hay medición:** no se sabe cuántas visitas hay, de dónde vienen ni dónde abandonan.
6. **Sin base de clientes propia:** no se captan correos ni contactos de WhatsApp.

## 7. Oportunidades de conversión

1. **Barra de compra fija** en la ficha móvil, con talla y precio. Hoy el botón queda por debajo de la primera pantalla en 390 px.
2. **Confirmación al agregar al carrito** (panel lateral o toast con "Ir al carrito"). Hoy no se ve nada.
3. **Junto al botón de compra:** envío de 2 a 5 días hábiles, cambios en 5 días hábiles y pago seguro con Wompi. El contenido ya existe en el CMS; falta mostrarlo ahí.
4. **Costo de envío y umbral de envío gratis visibles en el carrito**, usando el mismo `site_settings.commerce` que ya usa el servidor.
5. **Franja de beneficios y propuesta de valor en el hero.** Hoy la propuesta solo aparece en el footer.
6. **Personalización como gancho de venta.** Es el diferenciador real, pero no se comunica en la home.
7. **Precio anterior y descuento** (`compare_at_price`), y cupones de primera compra ligados a la newsletter.
8. **WhatsApp con el carrito precargado**: está listo, solo falta el número.
9. **Venta cruzada:** "completa el look", juntando Training con Fútbol.
10. **Urgencia honesta:** "Últimas 3 en M" a partir del stock real, cuando el catálogo venga de Supabase.

## 8. Mejoras de diseño

- **Fotografía real del producto:** vista frontal, espalda y puesta, sin logos de terceros. Es el cambio de mayor impacto.
- **Un solo acento de acción:** hoy la tienda usa azul y el carrito, el checkout y la personalización usan naranja. Propuesta: azul para acciones y naranja solo para señales (NUEVO, oferta).
- **Copy:** español de Colombia con tildes, sin inglés de relleno ("BUILT FOR THE GAME", "SHOP ALL", "BEST SELLER").
- **Menos patrones de plantilla:** subtítulos numerados "01 / …" en cada sección, siempre el mismo titular bicolor y el ticker.
- **Training con identidad propia:** hoy es un solo bloque en la home. **Streetwear** debe definirse como línea o como forma de llevar las camisetas.
- **Tarjetas en móvil:** los botones S–XXL ocupan 3 filas. Hay que bajar la densidad y subir el contraste de los textos grises.
- **Footer completo:** redes, medios de pago, legales, datos de la empresa y contacto.
- Las propuestas de `PRODUCT.md` y `DESIGN.md` están en `docs/AUDITORIA_MARCA_ECOMMERCE.md` y siguen **pendientes de tu validación**.

## 9. Mejoras SEO

1. **Dominio:** configurar `NEXT_PUBLIC_SITE_URL` y quitar el dominio por defecto `sportco.co` (E1).
2. **Robots:** excluir `/admin`, `/api`, `/auth` y `/checkout` en `robots.txt`.
3. **Metadata:** ~~añadirla en `/contacto`, `/favoritos`, `/carrito` y `/preguntas-frecuentes`~~. Corrección (A12): estas 4 páginas ya la tienen en su `layout.tsx`, y `/carrito`, `/favoritos`, `/buscar`, `/checkout/estado` y `/admin` ya llevan `noindex`.
4. **Imagen para compartir:** crear una imagen de Open Graph por defecto (`app/opengraph-image`).
5. **Datos estructurados:**
   - JSON-LD `FAQPage` en la página de preguntas frecuentes.
   - `Organization` con `sameAs`, `contactPoint` y `logo`.
   - `Offer` con `availability` real, `shippingDetails` y `hasMerchantReturnPolicy`.
6. **Textos de categoría** en español, con palabras clave locales ("camisetas de fútbol en Colombia").
7. **`alt`:** textos con tildes que describan la foto real.
8. **Search Console:** dar de alta el dominio definitivo en Google Search Console y enviar el sitemap.

## 10. Mejoras de seguridad y privacidad

1. **Actualizar Next** a una versión parcheada y **fijar las versiones** de todas las dependencias.
2. **Cabeceras de seguridad** en `next.config.ts`:
   - Una CSP compatible con el widget de Wompi, Supabase y Unsplash.
   - `frame-ancestors 'none'`, `nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` y `Permissions-Policy`.
   - `poweredByHeader: false`.
3. **Límite de peticiones y anti-bots** en `prepare` y `reconcile`, con Vercel Firewall o BotID, o un límite por IP en el servidor.
4. **Tratamiento de datos:**
   - Política de datos y casilla de aceptación en el checkout y en la newsletter.
   - Banner de consentimiento antes de cargar analítica.
5. **Cron confirmado** para expirar reservas, con `CRON_SECRET` en Vercel.
6. **`proxy.ts`** para refrescar la sesión de Supabase. Antes hay que consultar la guía de Next 16 en `node_modules/next/dist/docs/`.
7. **Variables de entorno:** revisar en el panel de Vercel que `SUPABASE_SERVICE_ROLE_KEY`, `WOMPI_PRIVATE_KEY`, `WOMPI_INTEGRITY_SECRET`, `WOMPI_EVENTS_SECRET`, `CHECKOUT_ACCESS_SECRET` y `CRON_SECRET`:
   - estén solo en Production;
   - no lleven el prefijo `NEXT_PUBLIC_`;
   - usen claves de sandbox en Preview.
8. **`ADMIN_PREVIEW`:** asegurar que no esté activo en producción.

## Rendimiento: línea base (Lighthouse móvil, producción, 2026-11-23)

| Página | Performance | Accesibilidad | Buenas prácticas | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| `/` | 87 | 96 | 96 | 100 | 3,4 s | 220 ms | 0 |
| `/productos/seleccion-colombia` | 86 | 96 | 100 | 100 | 3,7 s | 210 ms | 0 |
| `/tienda` | 71 | 96 | 96 | 100 | 5,5 s | 340 ms | 0 |

**Auditorías de Lighthouse que fallan en las tres páginas:**
- LCP.
- TBT.
- `color-contrast`.
- `unused-javascript` y `legacy-javascript`.
- `bf-cache`.
- Tamaño del DOM.
- Entrega de imágenes.

**Peso transferido:** home 951 KiB, tienda 1.064 KiB.

Los informes JSON están en el directorio temporal de la sesión: `/tmp/claude-1839509895/-home-lrincon-roi-webs-LR7/3ec3d2c0-3a30-4932-8fe1-3a24f7e07a7b/scratchpad/lh/`.
