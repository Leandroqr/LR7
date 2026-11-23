# ROADMAP de LR7

Este roadmap sale de `docs/DIAGNOSTICO_LR7.md` (2026-11-23). **No hay nada implementado:** está pendiente de tu aprobación.

**Prioridades:**
- **CRÍTICA:** bloquea vender, es ilegal o es un riesgo de seguridad.
- **ALTA:** gran impacto en la conversión o en la operación.
- **MEDIA:** mejora clara.
- **FUTURA:** cuando lo anterior esté estable.

**Reglas que se mantienen:**
- Ningún cambio de esquema, migración ni escritura en una base de datos real sin tu confirmación.
- No se toca `WOMPI_CHECKOUT_ENABLED` ni el flujo de pagos sin que lo digas explícitamente.
- Nunca se prueba contra producción con escrituras.
- No hay commit ni push sin que lo pidas.

**Lo que necesito de ti** (bloquea las tareas marcadas con 🔒):

| Ref. | Qué | Desbloquea |
|---|---|---|
| D1 | Dominio definitivo | C2 |
| D2 | Razón social, NIT, dirección, correo y teléfono legal | C5 |
| D3 | Número de WhatsApp | C6 |
| D4 | Fotos reales de los productos | C3 |
| D5 | Decisión sobre licencias: productos oficiales o diseños inspirados | C4 |
| D6 | Acceso a un Supabase de staging y a las claves sandbox de Wompi | C7, A15 |
| D7 | ID de GA4 o GTM | A5 |
| D8 | Tarifa de envío y umbral de envío gratis | A10 |
| D9 | Validación de `PRODUCT.md` y `DESIGN.md` | A7, M6 |

## Orden y dependencias

```
C1 ─┬─> A1 ─> A2
    └─> M11 (CI)
C2 ─> M7
C4 ─> C3 ─> A6 ─> M4, M5
C5 ─> A5 ─> F4
C6
C7 ─> C8   (C7 y C8 dependen de C1)
A3 ─> A4
D9 ─> A7, A8, A9, A11, M6
```

---

## CRÍTICA

### C1. Actualizar Next.js y fijar versiones ✅ Hecho (commit `678b900`)
- **Problema:** `next@16.4.0` tiene 10 vulnerabilidades (2 críticas, LR7-046). `next`, `react`, `react-dom` y `eslint-config-next` están en `latest`.
- **Archivos:** `package.json`, `pnpm-lock.yaml`.
- **Resultado:**
  - Next en la versión parcheada más reciente de la rama 16.
  - Versiones exactas o con `^`, nunca `latest`.
  - Lockfile regenerado con pnpm 10.34.3.
- **Comprobación:**
  - `pnpm audit --prod` sin avisos críticos ni altos.
  - `pnpm lint`, `pnpm test` y `pnpm build` en verde.
  - Recorrido por las 23 rutas con código 200.
- **Dependencias:** ninguna. Se hace en un git worktree aparte.

### C2. Dominio correcto en URLs canónicas, sitemap y robots ✅ Hecho (commit `a8af229`, pendiente de deploy)
- **Problema:** producción publica `https://sportco.co` en canonical, `og:url`, `robots.txt` y en las 36 URLs del sitemap.
- **Archivos:**
  - `lib/site.ts`: quitar el dominio por defecto; usar `VERCEL_PROJECT_PRODUCTION_URL` o fallar en el build de producción.
  - `app/robots.ts`, `app/sitemap.ts`.
  - La variable `NEXT_PUBLIC_SITE_URL` en Vercel.
- **Resultado:** el dominio real en todos los metadatos.
- **Comprobación:**
  - `curl /robots.txt`, `/sitemap.xml` y el canonical de una ficha muestran el dominio correcto.
  - Un test que falla si aparece `sportco.co`.
- **Dependencias:** D1.

### C3. Catálogo real con fotos reales 🔒 D4
- **Problema:**
  - La tienda muestra el catálogo estático con fotos de Unsplash que no corresponden al producto.
  - Lo que se edita en el admin no llega a la tienda.
- **Archivos:**
  - Variable `CATALOG_SOURCE=supabase` en Vercel.
  - `lib/catalog.ts`: en producción no debe caer al respaldo en silencio; debe registrar el error y mostrar un estado vacío.
  - `next.config.ts`: dominio de Storage.
  - Carga de productos desde el admin.
- **Resultado:** el 100 % de los productos sale de Supabase, con fotos de Storage que corresponden al producto.
- **Comprobación:**
  - 0 referencias a `images.unsplash.com` en el HTML de `/tienda` y de las fichas.
  - Crear un producto en el admin de staging y verlo en la tienda.
- **Dependencias:** C4, D4, D6. Escribe en la base de datos: hace falta tu confirmación.

### C4. Decisión marcaria: nombres, fotos y descripciones 🔒 D5
- **Problema:** nombres de clubes y selecciones, y logos de terceros sin licencia confirmada.
- **Archivos:**
  - Datos del catálogo (Supabase).
  - `lib/products.ts` (respaldo).
  - Textos `alt`.
  - `streetwear-page.tsx` y `hero-carousel.tsx` (fotos del hero).
- **Resultado:** catálogo coherente con la decisión (licenciado o "inspirado en"), sin logos de terceros en las fotos propias.
- **Comprobación:** revisar cada producto y cada imagen con una lista de control firmada por ti.
- **Dependencias:** D5.

### C5. Páginas legales y consentimiento de datos 🔒 D2
- **Problema:** no hay términos, política de tratamiento de datos (Ley 1581), retracto ni garantía (Ley 1480), ni datos de la empresa. El checkout recoge datos personales sin aceptación.
- **Archivos:**
  - Nuevas `app/terminos/page.tsx`, `app/privacidad/page.tsx` y `app/retracto/page.tsx` (o una sola sección legal).
  - `components/layout/footer.tsx`.
  - `lib/site.ts` (`legalName`, NIT).
  - `app/sitemap.ts`.
  - `components/commerce/checkout-panel.tsx`: casilla obligatoria de aceptación. ⚠️ Es la interfaz del flujo de pagos: lo hago solo con tu aprobación explícita.
- **Resultado:**
  - Páginas legales enlazadas desde el footer.
  - Razón social, NIT, dirección, correo y enlace a la SIC visibles.
  - Casilla obligatoria en el checkout.
- **Comprobación:**
  - Las páginas responden 200 y están en el sitemap.
  - El checkout no envía sin la casilla marcada (test de componente o prueba manual en staging).
  - El texto legal lo revisa tu asesor.
- **Dependencias:** D2. El texto legal final es responsabilidad tuya o de tu asesor; yo entrego una plantilla.

### C6. Canal de contacto activo 🔒 D3
- **Problema:** en producción no hay WhatsApp y el formulario de contacto está deshabilitado: no existe ningún canal.
- **Archivos:**
  - Variable `NEXT_PUBLIC_WHATSAPP_NUMBER` en Vercel.
  - `app/contacto/page.tsx`: mostrar también correo y horario, y no depender solo de WhatsApp.
- **Resultado:** botón flotante de WhatsApp, mensaje con el carrito y contacto funcionando.
- **Comprobación:**
  - El HTML de producción contiene `wa.me/57…`.
  - El formulario abre WhatsApp con el mensaje.
  - El enlace del carrito incluye los productos.
- **Dependencias:** D3.

### C7. Compra de principio a fin verificada en sandbox 🔒 D6
- **Problema:** nunca se ha ejecutado un pago completo. No se sabe si producción tiene el checkout habilitado y configurado.
- **Archivos:**
  - Ninguno de código en principio.
  - Variables `WOMPI_*`, `CHECKOUT_ACCESS_SECRET` y `CRON_SECRET` en Vercel Preview.
  - `docs/wompi.md`.
- **Resultado:** en Preview + staging con Wompi sandbox, un pedido pasa por pendiente → aprobado (y otro por rechazado): el webhook se recibe, la reserva se confirma o libera y el admin muestra el pedido.
- **Comprobación:**
  - Tarjetas de prueba de Wompi para aprobado, rechazado y pendiente.
  - Filas correctas en `orders`, `payments`, `inventory_reservations` y `wompi_event_receipts`.
  - `/checkout/estado/[id]` muestra el estado correcto.
- **Dependencias:** C1, D6. Es la única tarea que toca el flujo de pagos, y solo en sandbox con tu autorización.

### C8. Cron de expiración de reservas
- **Problema:** no hay `vercel.json` con crons, así que las reservas de stock pueden quedar retenidas.
- **Archivos:**
  - Nuevo `vercel.json` (`crons`) o configuración en el panel de Vercel.
  - `app/api/cron/expire-wompi-checkouts/route.ts` (solo revisión).
- **Resultado:** el cron se ejecuta con la frecuencia que permita tu plan de Vercel (Hobby: una vez al día) y libera las reservas vencidas.
- **Comprobación:**
  - En staging, una reserva vencida pasa a `released` tras la ejecución.
  - El log del cron en Vercel.
  - Una llamada sin `Bearer` responde 401.
- **Dependencias:** C7.

---

## ALTA

### A1. Cabeceras de seguridad
- **Problema:** no hay CSP, protección contra iframes (clickjacking), `nosniff`, `Referrer-Policy` ni `Permissions-Policy`, y se expone `x-powered-by`.
- **Archivos:** `next.config.ts` (`headers()` y `poweredByHeader: false`).
- **Resultado:** las cabeceras están presentes y la CSP permite Wompi, Supabase, imágenes y GA.
- **Comprobación:**
  - `curl -I` muestra las cabeceras.
  - El widget de Wompi sandbox abre sin errores de CSP en consola.
  - Lighthouse Buenas prácticas igual o mejor.
- **Dependencias:** C1. Validar después de C7.

### A2. Límite de peticiones y anti-bots en los endpoints de pago
- **Problema:** `prepare` y `reconcile` reservan inventario sin ningún límite.
- **Archivos:**
  - `app/api/payments/wompi/prepare/route.ts` y `reconcile/route.ts`.
  - Reglas de Vercel Firewall o BotID.
- **Resultado:** a partir de N peticiones por IP y minuto se responde 429, sin afectar a un cliente real.
- **Comprobación:** un script de carga en Preview recibe 429; una compra normal en sandbox sigue funcionando.
- **Dependencias:** C7. Toca el flujo de pagos: necesita tu aprobación.

### A3. Cachear las páginas públicas ✅ Hecho (pendiente de deploy y de validar el refresco desde el admin en staging, LR7-049)
- **Problema:** `getPublicNavigation()` lee cookies en el layout, así que todo el sitio queda `no-store` y consulta Supabase en cada visita.
- **Archivos:**
  - `lib/content.ts` y `lib/catalog.ts`: un cliente sin cookies para lecturas públicas y caché con revalidación.
  - `lib/supabase/server.ts`.
  - `app/layout.tsx`.
  - `app/admin/actions.ts`: revalidar al guardar.
  - Consultar `node_modules/next/dist/docs/` antes de usar las APIs de caché de Next 16.
- **Resultado:** el home, la tienda y las fichas salen de la caché de Vercel; los cambios del admin aparecen al guardar.
- **Comprobación:**
  - `x-vercel-cache: HIT` en la segunda visita.
  - TTFB en frío menor de 800 ms.
  - Editar un producto en staging y verlo actualizado.
- **Dependencias:** C1.

### A4. LCP en móvil 🟡 Parcial (LR7-050): imágenes LCP corregidas; falta A4b para llegar a ≤ 2,5 s simulado
- **Problema:** LCP de 3,4 s en la home, 3,7 s en la ficha y 5,5 s en la tienda.
- **Archivos:**
  - `components/pages/hero-carousel.tsx`, `product-page.tsx` y `shop-page.tsx`: el hero de la tienda es un fondo CSS y debe pasar a `next/image` con `priority`.
  - `sizes` correctos en las tarjetas.
- **Resultado:** LCP de 2,5 s o menos en las 3 páginas (Lighthouse móvil) y Performance de 90 o más.
- **Comprobación:** Lighthouse antes y después con la misma configuración (la línea base está en `docs/DIAGNOSTICO_LR7.md`).
- **Dependencias:** A3. C3 cambia las imágenes, así que hay que medir de nuevo después.

### A4b. Dividir el CSS global por componente (propuesta, pendiente de aprobación)
- **Problema:** `app/globals.css` (6.436 líneas, 150 KB, 25 KB gz) se carga entero en todas las páginas y el 88 % no se usa en cada una (Lighthouse `unused-css-rules`). Bloquea el render y es la causa principal del LCP simulado alto (LR7-050).
- **Archivos:**
  - `app/globals.css`: dejar solo tokens, base, layout común, navbar y footer.
  - Un `.css` por componente o página, importado desde el propio componente: streetwear, personalizador, colecciones, carrito y checkout, admin, highlights, shop, producto, etc.
- **Resultado:** cada ruta carga solo su CSS, unos 20–40 KB en vez de 150 KB, sin ningún cambio visual.
- **Comprobación:**
  - Comparar los estilos calculados (`getComputedStyle`) de todos los elementos, antes y después, en las 23 rutas a 390 y 1280 px.
  - Lighthouse móvil con LCP ≤ 2,5 s en home, ficha y tienda.
  - Después, valorar `experimental.inlineCss`.
- **Riesgo:** el orden de la cascada cambia entre archivos, por eso la comparación de estilos calculados es obligatoria.
- **Dependencias:** A4.

### A5. Analítica GA4 con eventos de e-commerce y consentimiento 🔒 D7
- **Problema:** no hay ninguna medición.
- **Archivos:**
  - Nuevo `lib/analytics.ts` y un componente de consentimiento.
  - `app/layout.tsx`.
  - Eventos en:
    - `product-page.tsx`: `view_item` y `add_to_cart`.
    - `shop-page.tsx`: `view_item_list`.
    - `app/carrito/page.tsx`: `view_cart` y `begin_checkout`.
    - `order-status-client.tsx`: `purchase`, solo con estado aprobado y sin duplicados. ⚠️ Esta pantalla pertenece al flujo de pagos.
  - `lib/whatsapp.ts` (ya llama a `gtag`).
- **Resultado:** el embudo completo en GA4, que solo se carga tras aceptar el banner.
- **Comprobación:**
  - GA4 DebugView muestra los 6 eventos con `items`, `value` y `currency: COP`.
  - Sin consentimiento no hay peticiones a Google (pestaña Network).
- **Dependencias:** C5 (política de cookies) y D7.

### A6. Textos: tildes, idioma y códigos internos
- **Problema:** "FUTBOL_SELECCIONES" visible, faltan tildes por todas partes y hay copy en inglés.
- **Archivos:**
  - `components/pages/product-page.tsx`: etiqueta legible de la categoría.
  - `shop-page.tsx`, `streetwear-page.tsx`, `catalog-page.tsx`.
  - `components/layout/navbar.tsx` y `footer.tsx`.
  - `lib/products.ts`.
  - El contenido del CMS en Supabase (escritura en la base de datos: necesita tu confirmación).
- **Resultado:** español de Colombia correcto en todo el sitio y ningún enum visible.
- **Comprobación:**
  - Un test o `grep` que falla si aparece `FUTBOL_` o `TRAINING_` en el HTML renderizado.
  - Revisión de capturas a 390 y 1280 px.
- **Dependencias:** C4, solo para los nombres de producto. La interfaz, la navegación y los códigos internos pueden ir antes. Los cambios grandes de copy pasan antes por ti.

### A7. Propuesta de valor, hero y franja de beneficios 🔒 D9
- **Problema:** en 5 segundos no se entiende por qué comprar en LR7; no hay beneficios visibles.
- **Archivos:**
  - `components/pages/home-page.tsx` y `hero-carousel.tsx`.
  - Un componente nuevo de beneficios.
  - `app/globals.css` (tokens existentes).
- **Resultado:**
  - Un hero con mensaje de marca y accesos a las 3 líneas.
  - Una franja con envío a todo Colombia, cambios, pago seguro y personalización.
- **Comprobación:**
  - Capturas a 390, 768 y 1280 px.
  - Lighthouse sin regresión.
  - Tu aprobación del copy.
- **Dependencias:** D9.

### A8. Ficha de producto para móvil
- **Problema:** el botón de compra queda bajo la primera pantalla, la talla S viene marcada y no hay datos de envío ni de cambios.
- **Archivos:**
  - `components/pages/product-page.tsx`.
  - Un diálogo para la guía de tallas, reutilizando `/guia-de-tallas`.
  - `app/globals.css`.
- **Resultado:**
  - Barra fija con precio, talla y botón en 390 px.
  - Sin talla preseleccionada: el botón pide elegirla.
  - Bloque de envío y cambios con el texto del CMS.
- **Comprobación:**
  - En el navegador a 390 px: la barra se ve al bajar, no tapa el footer y agregar sin talla muestra un aviso.
  - Navegación con teclado.
- **Dependencias:** D9.

### A9. Confirmación al agregar al carrito
- **Problema:** al agregar no se ve ninguna respuesta.
- **Archivos:**
  - `components/providers/store-provider.tsx`.
  - Nuevo `components/commerce/mini-cart.tsx` (panel o toast).
  - `navbar.tsx` (contador).
- **Resultado:** un panel lateral con el producto, el subtotal, "Seguir comprando" e "Ir al carrito"; el foco se gestiona y se cierra con Escape.
- **Comprobación:** en el navegador, agregar desde la ficha, la tarjeta y streetwear; probar con lector de pantalla (`aria-live`) y con teclado.
- **Dependencias:** ninguna.

### A10. Costo de envío visible antes del checkout 🔒 D8
- **Problema:** el carrito dice "Calculado al finalizar", aunque el servidor ya conoce el costo (`site_settings.commerce`).
- **Archivos:**
  - `lib/content.ts` (`getSiteSetting("commerce")`).
  - `app/carrito/page.tsx`: barra de progreso hacia el envío gratis.
  - La ficha (mensaje de envío).
- **Resultado:** el carrito muestra el envío y "te faltan $X para el envío gratis" con los mismos valores que cobra el servidor.
- **Comprobación:** en staging, el total del carrito coincide con el monto que prepara Wompi en 3 casos: debajo, en y encima del umbral.
- **Dependencias:** D8, D6.

### A11. Footer y confianza
- **Problema:** FAQ duplicada, "Cómo comprar" mal enlazado y faltan redes, medios de pago y legales.
- **Archivos:** `components/layout/footer.tsx`, `lib/site.ts`.
- **Resultado:** el footer tiene 4 columnas sin duplicados, con medios de pago (Wompi, PSE, Nequi, tarjetas si aplican), redes, legales y datos de la empresa.
- **Comprobación:** capturas y verificación de enlaces (todos responden 200).
- **Dependencias:** C5.

### A12. `robots.txt` completo ✅ Hecho (commit pendiente de deploy, LR7-048)
- **Problema:** no excluye `/admin`, `/api`, `/auth` ni `/checkout`.
- **Archivos:** `app/robots.ts`, nuevo `lib/robots-rules.ts`. El `noindex` de `/carrito`, `/favoritos`, `/buscar`, `/checkout/estado` y `/admin` ya existía.
- **Resultado:** solo las páginas públicas son indexables.
- **Comprobación:** `curl /robots.txt` y la herramienta de robots de Search Console.
- **Dependencias:** C2.

### A13. Contenido de la home desde el CMS
- **Problema:** las secciones de la home se editan en el admin pero no se muestran (LR7-045).
- **Archivos:** `components/pages/home-page.tsx`, `home-commerce-sections.tsx`, admin de la home.
- **Resultado:** según tu decisión, se reactivan o se quitan del admin.
- **Comprobación:** editar una sección en staging y verla en la home, o confirmar que ya no aparece en el admin.
- **Dependencias:** tu decisión y D6.

### A14. Validación del admin con datos (LR7-035 a LR7-044)
- **Problema:** las correcciones del admin están sin probar contra Supabase.
- **Archivos:** ninguno, salvo los que surjan de la prueba.
- **Resultado:** login, CRUD, subida de imágenes, filtros, roles y estados de pedido probados en staging.
- **Comprobación:** filas de `LR7_HALLAZGOS.md` en estado "Validado" con su evidencia; los datos de prueba se limpian al terminar.
- **Dependencias:** D6.

---

## MEDIA

| ID | Tarea | Problema | Archivos | Resultado y comprobación | Dependencias |
|---|---|---|---|---|---|
| M1 | Newsletter real | Los componentes no se usan y no guardan nada | `components/layout/newsletter.tsx`, una nueva Server Action, `app/page.tsx`, footer; revisar la política de inserción en `newsletter_subscribers` | Suscripción con casilla de consentimiento, guardada y visible en el admin. Se prueba en staging con un correo de prueba, que se borra después | C5, D6 |
| M2 | Filtros por color y equipo; ocultar pestañas vacías | Faltan filtros y aparecen pestañas tachadas | `shop-page.tsx`, `catalog-page.tsx` | Los filtros combinables se reflejan en la URL. Tests de la lógica de filtrado | — |
| M3 | Búsqueda sin resultados útil | Callejón sin salida | `app/buscar/page.tsx` | Sugiere líneas y lo más vendido. Prueba en navegador con `?q=xyz` | — |
| M4 | Precio anterior y descuento | `compare_at_price` no se muestra | `product-card.tsx`, `product-page.tsx`, JSON-LD `Offer` | Precio tachado y % solo si es mayor que el precio. Test de cálculo | C3 |
| M5 | Stock real y urgencia honesta | "DISPONIBLE" no refleja el stock (LR7-015) | `lib/catalog.ts`, tarjeta, ficha | "Últimas N" según `low_stock_threshold`. Verificación en staging | C3 |
| M6 | Un solo acento de acción | Naranja en el carrito y la personalización frente al azul de la tienda | `app/globals.css` (tokens), carrito, `personalization-studio.tsx` | Coherente con `DESIGN.md`. Capturas | D9 |
| M7 | SEO complementario | Faltan imagen de Open Graph, `FAQPage` y `Organization` completo | `app/opengraph-image.tsx`, `lib/seo.ts`, preguntas frecuentes | Rich Results Test sin errores; las vistas previas al compartir muestran imagen | C2 |
| M8 | Accesibilidad | Contraste y tamaño de fuente (Lighthouse), zoom solo con hover, tarjetas densas | `app/globals.css`, `product-card.tsx`, galería | Lighthouse Accesibilidad de 100 en las 3 páginas; navegación con teclado completa | — |
| M9 | Estilos en línea a clases y tokens | Más de 170 `style={{}}` | `navbar.tsx`, `home-personalizer.tsx`, `nosotros`, `catalog-page`, `buscar`, `contacto`, `footer` | Mismo aspecto (comparación de capturas antes y después) y menos CSS en línea | — |
| M10 | Venta cruzada "completa el look" | Relacionados limitados a la misma categoría | `product-page.tsx` | Mezcla fútbol y training. Prueba en navegador | — |
| M11 | CI en GitHub Actions | Lint, tests y build solo a mano | Nuevo `.github/workflows/ci.yml` | Una PR ejecuta lint, test y build con `--frozen-lockfile`; un PR de prueba pasa | C1 |
| M12 | Tests de extremo a extremo del embudo | No hay pruebas de navegador | Playwright: nuevo `tests/e2e/` (dependencia de desarrollo, a justificar) | Home → ficha → carrito → checkout hasta antes de pagar, a 390 y 1280 px, en CI | M11 |
| M13 | `proxy.ts` para la sesión de Supabase | La sesión no se refresca en el proxy | Nuevo `proxy.ts` (ver la guía de Next 16) | Sesión del admin estable tras expirar el token. Prueba en staging | C1, D6 |
| M14 | Identidad de Training y Streetwear | Training es débil y Streetwear no es una línea | `app/training`, `streetwear-page.tsx`, datos | Según `PRODUCT.md`. Capturas y tu aprobación | D9 |

## FUTURA

| ID | Tarea | Por qué esperar | Dependencias |
|---|---|---|---|
| F1 | Cuenta de cliente e historial de pedidos | Necesita login de clientes y RLS por usuario | C7 |
| F2 | Reseñas verificadas | Necesita una tabla nueva (esquema) y compras reales; no se inventan | C7 |
| F3 | Aviso de reposición | Tabla nueva y envío de correos | M1 |
| F4 | Píxeles de Meta y TikTok | Después de GA4 y del consentimiento | A5 |
| F5 | Sugerencias de búsqueda | Valor bajo con 12 productos | C3 |
| F6 | Cambiar la talla en el carrito | Valor bajo frente al costo | — |
| F7 | Streetwear como línea en el modelo de datos | Requiere un cambio de esquema (`brand`) | M14 |
| F8 | Vista previa de personalización dentro de la ficha | Ya existe en `/personaliza` | A8 |
| F9 | Dividir `globals.css` (6.419 líneas) por áreas | Mantenimiento; sin impacto para el cliente | M9 |

---

## Primera entrega propuesta

C1, C2 (con D1), A3, A4, A6, A8, A9, A12, M8 y M11.

No necesitan datos de negocio, salvo el dominio, ni tocan pagos ni la base de datos. Así puedo avanzar mientras reúnes D2 a D9.
