import { updateUserRole } from "@/app/admin/actions";
import { AdminMutationForm } from "@/components/admin/admin-crud";
import { AdminEmpty, AdminPage, AdminResultCount } from "@/components/admin/admin-page";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminUsersPage() {
  const { supabase, user } = await requireAdmin();
  const { data: profiles, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const admins = profiles.filter((profile) => profile.role === "ADMIN").length;

  return <AdminPage title="Usuarios" description="Perfiles y roles vinculados a Supabase Auth. Un ADMIN tiene acceso completo a este panel.">
    {!profiles.length ? <AdminEmpty>No hay perfiles.</AdminEmpty> : <>
      <AdminResultCount shown={profiles.length} noun={`perfiles · ${admins} ADMIN`} />
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th scope="col">USUARIO</th><th scope="col">ALTA</th><th scope="col">ROL</th></tr></thead><tbody>{profiles.map((profile) => {
        const isSelf = profile.id === user.id;
        return <tr key={profile.id}>
          <td><strong>{profile.full_name ?? "Sin nombre"}{isSelf ? " · TU CUENTA" : ""}</strong><span>{profile.phone ?? "Sin teléfono"} · ID {profile.id.slice(0, 8)}</span></td>
          <td>{new Date(profile.created_at).toLocaleDateString("es-CO")}</td>
          <td>{isSelf
            ? <span className="admin-status is-active" title="No puedes quitarte tu propio rol ADMIN">ADMIN</span>
            : <AdminMutationForm action={updateUserRole.bind(null, profile.id)} successMessage="Rol actualizado." className="admin-select-form">
              <label><span className="admin-visually-hidden">Rol de {profile.full_name ?? profile.id}</span><select name="role" defaultValue={profile.role}><option value="CUSTOMER">CUSTOMER</option><option value="ADMIN">ADMIN</option></select></label>
              <button type="submit">GUARDAR</button>
            </AdminMutationForm>}</td>
        </tr>;
      })}</tbody></table></div>
    </>}
  </AdminPage>;
}
