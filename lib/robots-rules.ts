// Rutas que no deben rastrearse: panel, endpoints, callbacks de sesión, estado de pedidos
// (datos personales) y páginas por usuario o sin contenido propio. Las páginas además
// declaran `robots: { index: false }` en su metadata.
export const ROBOTS_DISALLOW = [
  "/admin",
  "/api/",
  "/auth/",
  "/checkout/",
  "/carrito",
  "/favoritos",
  "/buscar",
] as const;
