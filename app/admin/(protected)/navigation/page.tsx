import { createNavigationItem, deleteNavigationItem, updateNavigationItem } from "@/app/admin/actions";
import { AdminEmpty, AdminPage } from "@/components/admin/admin-page";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminNavigationPage() {
  const { supabase } = await requireAdmin();
  const { data: items, error } = await supabase.from("navigation_items").select("*").order("location").order("sort_order");
  if (error) throw new Error(error.message);
  return <AdminPage title="Navegación" description="Menús administrables para header y footer.">
    <section className="admin-panel"><h2>NUEVO ENLACE</h2><NavigationForm action={createNavigationItem} /></section>
    <section className="admin-panel"><h2>ENLACES</h2>{!items.length ? <AdminEmpty>La navegación pública sigue usando el fallback actual.</AdminEmpty> : <div className="admin-stack">{items.map((item) => <NavigationForm key={item.id} action={updateNavigationItem.bind(null, item.id)} item={item} deleteAction={deleteNavigationItem.bind(null, item.id)} />)}</div>}</section>
  </AdminPage>;
}

type NavigationItem = { location: "header" | "footer"; label: string; href: string; sort_order: number; active: boolean };
function NavigationForm({ action, item, deleteAction }: Readonly<{ action: (data: FormData) => void | Promise<void>; item?: NavigationItem; deleteAction?: () => void | Promise<void> }>) {
  return <form action={action} className="admin-form admin-navigation-form"><select name="location" defaultValue={item?.location ?? "header"}><option value="header">Header</option><option value="footer">Footer</option></select><input name="label" defaultValue={item?.label} placeholder="LABEL" required /><input name="href" defaultValue={item?.href ?? "/"} placeholder="/ruta" required /><input name="sort_order" type="number" min="0" defaultValue={item?.sort_order ?? 0} aria-label="Orden" /><label className="admin-check-label"><input name="active" type="checkbox" defaultChecked={item?.active ?? true} /> Activo</label><button type="submit">{item ? "GUARDAR" : "CREAR"}</button>{deleteAction ? <button type="submit" formAction={deleteAction} className="admin-danger-text">ELIMINAR</button> : null}</form>;
}
