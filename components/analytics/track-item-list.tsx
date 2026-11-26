"use client";

import { useEffect } from "react";
import { type AnalyticsItem, trackEvent } from "@/lib/analytics";

/** Máximo de artículos por evento view_item_list (GA4 recomienda listas cortas). */
const MAX_ITEMS = 30;

/**
 * Envía view_item_list cuando se muestra un listado (tienda, categoría, búsqueda) y cada vez que cambia
 * su contenido, por ejemplo al filtrar. No renderiza nada.
 */
export function TrackItemList({ listId, listName, items }: Readonly<{ listId: string; listName: string; items: readonly AnalyticsItem[] }>) {
  const visible = items.slice(0, MAX_ITEMS);
  const signature = visible.map((item) => item.item_id).join(",");

  useEffect(() => {
    if (!signature) return;
    trackEvent("view_item_list", { item_list_id: listId, item_list_name: listName, items: visible });
    // Solo cuando cambian la lista o sus artículos; `visible` se recalcula en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId, listName, signature]);

  return null;
}
