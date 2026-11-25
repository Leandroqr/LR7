# Información legal pendiente para el lanzamiento comercial

Fecha: 2026-11-24. Para el propietario de LR7 y su abogado.

**Esto no es asesoría jurídica.** Es la lista de lo que la tienda ya tiene preparado y de lo que falta. La redacción de cada documento la aprueba un abogado. El sitio no publica ningún texto legal provisional: mientras un documento no tenga texto en el CMS, su página no existe y no se enlaza.

## Cómo se publica un documento

1. En el admin, **Contenido** → nuevo bloque.
2. En **page_key** escribe la clave exacta del documento (tabla de abajo). Cada bloque es una sección: el título es el encabezado y el cuerpo el texto. Los párrafos se separan con una línea en blanco.
3. Al activarlo, la página aparece sola en `/legal/<dirección>`. Se enlaza en el pie y, si es una condición de compra, también en el carrito, en un plazo de hasta 5 minutos (caché).

| Documento | page_key | Dirección | Dónde se enlaza |
|---|---|---|---|
| Términos y condiciones | `legal-terminos` | `/legal/terminos-y-condiciones` | Pie (franja inferior) y carrito |
| Tratamiento de datos personales | `legal-datos` | `/legal/tratamiento-de-datos` | Pie (franja inferior) y carrito |
| Aviso de privacidad | `legal-privacidad` | `/legal/aviso-de-privacidad` | Pie (franja inferior) |
| Derecho de retracto | `legal-retracto` | `/legal/derecho-de-retracto` | Pie (Servicio al cliente) y carrito |
| Reversión del pago | `legal-reversion` | `/legal/reversion-del-pago` | Pie (franja inferior) y carrito |
| Peticiones, quejas y reclamos | `legal-pqr` | `/legal/pqr` | Pie (Servicio al cliente) y carrito |

El enlace a la Superintendencia de Industria y Comercio (https://www.sic.gov.co/) ya está publicado en el pie.

## Datos que faltan (los pide la ley y no están en el sitio)

| Dato | Para qué | Estado |
|---|---|---|
| Razón social o nombre del proveedor | Identificación del proveedor (Ley 1480, art. 50) | **Pendiente** |
| NIT | Identificación del proveedor | **Pendiente** |
| Dirección de notificación judicial | Identificación del proveedor | **Pendiente** |
| Teléfono | Identificación del proveedor y canal de atención | **Pendiente** |
| Correo electrónico | Identificación, PQR y consultas de datos personales | **Pendiente** |
| Responsable del tratamiento de datos | Política de datos (Ley 1581) | **Pendiente** |
| Canal para consultas y reclamos de datos personales | Política de datos | **Pendiente** |
| Tarifa de envío y umbral de envío gratis | Precio total antes de pagar | **Pendiente** (el checkout responde "El costo de envío aún no está configurado") |
| Plazos reales de entrega | Información de compra | Publicado en el CMS: 2 a 5 días hábiles. Confirmar |
| Condiciones de cambios y garantía | Garantía legal (Ley 1480, arts. 7 a 16) | Publicado en el CMS: cambios en 5 días hábiles; personalizadas solo por defecto de fábrica. Confirmar con el abogado |
| Procedimiento de retracto | Ventas a distancia (Ley 1480, art. 47) | **Pendiente** |
| Procedimiento de reversión del pago | Pagos electrónicos (Ley 1480, art. 51) | **Pendiente** |
| Medios de pago habilitados en Wompi producción | Información de compra | **Pendiente**. El checkout está desactivado en producción |
| Material de cada camiseta | Características del producto | 4 de 7 camisetas lo indican en la descripción |

## Qué debería cubrir cada documento (para revisión)

- **Términos y condiciones:** identificación completa del proveedor; productos (diseños inspirados, no réplicas oficiales); precios en COP con IVA; costo de envío; medios de pago; disponibilidad; proceso de compra con resumen antes de pagar; confirmación del pedido; entregas; cambios y garantía; retracto; reversión del pago; PQR; ley aplicable.
- **Tratamiento de datos personales:** responsable y sus datos de contacto; datos que se recogen (nombre, correo, teléfono, dirección); finalidades (gestionar el pedido, el envío y la atención); derechos del titular (conocer, actualizar, rectificar, suprimir, revocar); procedimiento y plazos para consultas y reclamos; vigencia.
- **Aviso de privacidad:** versión corta con el responsable, las finalidades, los derechos y dónde consultar la política completa.
- **Derecho de retracto:** plazo; cómo se ejerce; estado del producto; costos de devolución; plazo de devolución del dinero; excepciones. La ley prevé excepciones para bienes **confeccionados conforme a las especificaciones del consumidor o claramente personalizados**: confirmar con el abogado cómo aplica a las camisetas con nombre y número.
- **Reversión del pago:** casos en los que procede; plazo para solicitarla; a quién se dirige (LR7 y la entidad del medio de pago); qué información aportar.
- **PQR:** canal, datos que se piden, plazo de respuesta y cómo se consulta el estado.

## Decisiones que requieren aprobación (no implementadas)

- **Autorización de tratamiento de datos en el checkout:** el formulario pide nombre, correo, teléfono y dirección, pero no tiene casilla de autorización ni enlace a la política. Añadirla modifica el checkout, así que necesita aprobación expresa.
- **PQR con constancia:** dejar constancia de cada solicitud (número de radicado y seguimiento) necesita guardar las solicitudes. Opciones: una tabla nueva en Supabase (migración) o un servicio de correo. Hoy solo hay contacto por WhatsApp, que no deja radicado.
- **Correo de confirmación del pedido:** no hay proveedor de correo configurado.
- **Registro Nacional de Bases de Datos:** comprobar con el abogado si LR7 está obligada a inscribirse.
