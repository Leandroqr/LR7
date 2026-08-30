import { updateUserRole } from "@/app/admin/actions";
import { AdminEmpty, AdminPage } from "@/components/admin/admin-page";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminUsersPage() {
  const { supabase, user } = await requireAdmin();
  const { data: profiles, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return <AdminPage title="Usuarios" description="Perfiles y roles vinculados a Supabase Auth.">
    {!profiles.length ? <AdminEmpty>No hay perfiles.</AdminEmpty> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>USUARIO</th><th>ALTA</th><th>ROL</th></tr></thead><tbody>{profiles.map((profile) => <tr key={profile.id}><td><strong>{profile.full_name ?? "Sin nombre"}</strong><span>{profile.id}{profile.id === user.id ? " · TU CUENTA" : ""}</span></td><td>{new Date(profile.created_at).toLocaleDateString("es-CO")}</td><td><form action={updateUserRole.bind(null, profile.id)} className="admin-select-form"><select name="role" defaultValue={profile.role}><option value="CUSTOMER">CUSTOMER</option><option value="ADMIN">ADMIN</option></select><button type="submit">GUARDAR</button></form></td></tr>)}</tbody></table></div>}
  </AdminPage>;
}
