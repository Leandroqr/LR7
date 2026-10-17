# Wompi Colombia

## Arquitectura

LR7 usa el Widget Checkout Web oficial de Wompi. El navegador nunca envía precios, totales ni stock como fuente de verdad: envía SKU, cantidad y personalización. `start_wompi_checkout` consulta productos, variantes, inventario, cupón y configuración comercial; en una sola transacción SQL crea el pedido y sus snapshots, reserva stock/cupón, crea el intento de pago y devuelve el total autorizado.

`POST /api/payments/wompi/prepare` es el único punto para iniciar o reintentar. El servidor firma `referencia + centavos + COP + secreto de integridad`, y entrega al navegador solamente la llave pública, referencia, centavos, firma y datos del widget. El acceso guest al pedido es una cookie HttpOnly derivada de `CHECKOUT_ACCESS_SECRET`; la base solo guarda su hash.

El retorno del widget es informativo. `POST /api/payments/wompi/reconcile` consulta `GET /v1/transactions/{id}` en el host fijo del ambiente usando la llave privada, compara comercio, referencia y pedido, y aplica la misma RPC del webhook. `GET /api/orders/{id}/status` consulta pedido/items/pagos sin exponerlos públicamente: requiere sesión propietaria o cookie guest válida.

El webhook es `POST /api/webhooks/wompi`. Verifica SHA-256 según `signature.properties`, `timestamp` y secreto de eventos; acepta el checksum documentado en body/header, exige ambiente correspondiente, valida merchant cuando el payload lo incluye y aplica payment/order/inventario/cupón en una RPC. La tabla `wompi_event_receipts` más restricciones únicas hacen idempotente la recepción; una falla transitoria de DB devuelve 503 para que Wompi reintente.

Documentación oficial consultada el 16-oct-2026: [Widget & Checkout Web](https://docs.wompi.co/docs/colombia/widget-checkout-web/), [Eventos](https://docs.wompi.co/docs/colombia/eventos/), [Transacciones](https://docs.wompi.co/docs/colombia/transacciones/), [Ambientes y llaves](https://docs.wompi.co/docs/colombia/ambientes-y-llaves/) y [Tokens de aceptación](https://docs.wompi.co/docs/colombia/tokens-de-aceptacion/). La integración usa Widget, no `POST /transactions`; por eso no captura tarjetas ni requiere enviar tokens de aceptación de esa API.

## Estados

| Evento/acción | Estado financiero `payments.status` | Estado del pedido | Inventario |
|---|---|---|---|
| Checkout iniciado | `pending` | `payment_pending` | Reserva atómica por 30 minutos |
| `PENDING` | `pending` | `payment_pending` | Mantiene reserva |
| `DECLINED` o `ERROR` | `rejected` | `pending` | Libera stock/cupón; permite un nuevo intento |
| `APPROVED` | `approved` | `paid` | Confirma la reserva una sola vez |
| `VOIDED` antes del despacho | `cancelled` | `cancelled` | Libera la reserva/venta y el cupón una vez |
| `VOIDED` después de envío/entrega | `cancelled` | Conserva el estado comercial | Activa `fulfillment_hold` para revisión; no repone stock enviado |
| Reserva vencida | intento `cancelled` | `cancelled` | Libera reserva/cupón una vez; se evalúa al consultar el pedido y al iniciar otro checkout |

Los estados Wompi son los documentados: `PENDING`, `APPROVED`, `DECLINED`, `ERROR` y `VOIDED`. No se habilita reembolso: Wompi no comunica un evento genérico de reembolso en este flujo y el panel no puede marcar pagos como aprobados manualmente. La preparación/envío se guarda aparte en `orders.fulfillment_status` y solo avanza después de `paid`, mediante RPC admin y transiciones permitidas.

Una aprobación tardía después de expirar intenta reservar stock otra vez. Si ya no hay unidades, se registra el pago confirmado y el pedido queda con `fulfillment_hold`; no se vende stock negativo ni se despacha automáticamente.

## Configuración

Configura estas variables en `.env.local` para desarrollo y en Vercel por ambiente. No publiques secretos ni los incluyas en `NEXT_PUBLIC_*`.

| Variable | Uso |
|---|---|
| `WOMPI_ENV` | `sandbox` o `production`; determina host y prefijos válidos |
| `WOMPI_PUBLIC_KEY` | Llave `pub_test_*` o `pub_prod_*`; se entrega al widget |
| `WOMPI_PRIVATE_KEY` | Llave `prv_test_*` o `prv_prod_*`; solo server-side, para consulta de transacción |
| `WOMPI_INTEGRITY_SECRET` | `test_integrity_*` o `prod_integrity_*`; firma del widget |
| `WOMPI_EVENTS_SECRET` | `test_events_*` o `prod_events_*`; autenticación del webhook |
| `WOMPI_CHECKOUT_ENABLED` | `false` por defecto; activar solo tras completar la aceptación Sandbox |
| `CHECKOUT_ACCESS_SECRET` | Secreto aleatorio independiente, al menos 32 caracteres, para tokens de acceso guest |
| `CRON_SECRET` | Secreto aleatorio independiente, al menos 32 caracteres, para expirar reservas |
| `NEXT_PUBLIC_SITE_URL` | URL HTTPS pública exacta del ambiente; se usa como `redirect-url` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase de ese ambiente |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave pública Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo servidor: checkout/webhook/cron, nunca navegador |

**Dato comercial requerido:** el registro `site_settings.setting_key='commerce'` debe incluir `shipping_cop` como entero no negativo. Opcionalmente puede incluir `free_shipping_threshold_cop`. `personalization_price` se toma de esa misma configuración. El checkout falla cerrado si falta la tarifa; LR7 no inventa un costo de envío.

## Sandbox

1. En Comercios Wompi, habilita Sandbox y obtén las llaves/secreto de integridad/secreto de eventos con prefijo `test_*`.
2. Aplica las migraciones en Supabase de staging, en orden, empezando por `202610160006_wompi_checkout.sql`; confirma que las políticas RLS y RPCs están disponibles.
3. Define `WOMPI_ENV=sandbox`, las cuatro llaves Sandbox, `CHECKOUT_ACCESS_SECRET`, `CRON_SECRET`, URL de staging y `WOMPI_CHECKOUT_ENABLED=false`. Configura `commerce.shipping_cop` desde ajustes admin de staging.
4. Registra en el dashboard Sandbox la URL HTTPS exacta `https://<host-preview>/api/webhooks/wompi`. Configura por separado la URL del ambiente de producción; Wompi mantiene ambos ambientes independientes.
5. Despliega un Preview **solo** con Supabase staging, llaves `test_*` y checkout habilitado en ese Preview. Ejecuta compra aprobada/rechazada, reintento, expiración, duplicado de webhook, evento inválido, importe/moneda/referencia cruzados y carrera de stock.
6. Comprueba pedido/payment/reference en admin y recarga la página de estado. Una redirección `?id=` no es prueba de pago; el navegador consulta el backend.

## Vercel

1. En Project → Settings → Environment Variables, crea variables Preview separadas de Production. Nunca reutilices service-role ni credenciales Wompi de producción en Preview.
2. En Preview, apunta Supabase al proyecto de staging y configura `WOMPI_ENV=sandbox`, llaves `test_*`, `CHECKOUT_ACCESS_SECRET`, `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL` con el host HTTPS de ese Preview y `WOMPI_CHECKOUT_ENABLED=false` inicialmente.
3. Aplica/verifica migraciones en staging, carga la tarifa comercial, registra el webhook Sandbox, y solo entonces habilita checkout en Preview.
4. La expiración normal no depende de cron: ocurre al iniciar otro checkout y al consultar el estado autenticado del pedido. Para limpiar órdenes abandonadas aunque nadie vuelva al sitio, llama `/api/cron/expire-wompi-checkouts` con `Authorization: Bearer <CRON_SECRET>` desde un scheduler externo o Vercel Pro/Enterprise.
5. Vercel Hobby limita cron a una ejecución diaria; una frecuencia de 15 minutos falla en deploy. El repo no incluye `vercel.json` de cron para evitar ese fallo.
6. Production permanece deshabilitado hasta completar aprobación de cuenta, datos comerciales, checkout Sandbox, conciliación, reservas, políticas de cancelación/envío y aceptación del negocio.

## Transiciones administrativas

El admin muestra `orders.status` y el último intento de `payments` por separado, incluyendo referencia/ID Wompi. No hay acción para escribir `paid`, `approved` o `refunded`. La preparación avanza mediante `set_order_fulfillment_status` y requiere que el pago esté aprobado, no exista un hold y la transición sea válida.

## Validaciones y límites

- `pnpm test` cubre checksum body/header, parser de eventos, estados terminales, llaves/ambientes, merchant/consulta privada, serialización del carrito, límites HTTP, token guest y schemas admin.
- `tests/payments/postgres.integration.mjs` (`pnpm test:db`) crea Postgres Docker efímero, aplica migraciones y prueba RPC, precio manipulado, payload/propietario idempotentes, retry paralelo, aprobación tardía/múltiple, mismatch financiero, stock/cupón, fulfillment admin y concurrencia. No usa Supabase remoto ni llaves reales.
- No se ejecutó una compra real ni se llamó a Wompi desde este entorno. La URL pública del comercio, cuenta, webhook Sandbox, llaves y tarifa de envío aún requieren configuración del operador.
- Reembolsos, disputa/contracargo, reglas comerciales de cancelación y reconciliación automática de pagos sin callback aún no están implementados. No habilites cobros reales hasta definir esos procesos y pasar aceptación en Preview.
