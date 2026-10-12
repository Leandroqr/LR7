import { deleteSubscriber, updateSubscriberStatus } from "@/app/admin/actions";
import { AdminConfirmAction, AdminMutationForm } from "@/components/admin/admin-crud";
import { AdminEmpty, AdminPage } from "@/components/admin/admin-page";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminNewsletterPage() {
  const { supabase } = await requireAdmin();
  const { data: subscribers, error } = await supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return <AdminPage title="Newsletter" description="Consentimiento y estado de suscriptores.">
    {!subscribers.length ? <AdminEmpty>No hay suscriptores. El formulario público aún no está conectado.</AdminEmpty> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>EMAIL</th><th>ORIGEN</th><th>CONSENTIMIENTO</th><th>ESTADO</th><th>ACCIONES</th></tr></thead><tbody>{subscribers.map((subscriber) => <tr key={subscriber.id}><td><strong>{subscriber.email}</strong></td><td>{subscriber.consent_source}</td><td>{new Date(subscriber.consent_at).toLocaleDateString("es-CO")}</td><td><AdminMutationForm action={updateSubscriberStatus.bind(null, subscriber.id)} successMessage="Estado actualizado." className="admin-select-form"><select name="status" defaultValue={subscriber.status}><option value="pending">Pendiente</option><option value="active">Activo</option><option value="unsubscribed">Cancelado</option></select><button type="submit">GUARDAR</button></AdminMutationForm></td><td><AdminConfirmAction action={deleteSubscriber.bind(null, subscriber.id)} itemName={`al suscriptor ${subscriber.email}`} /></td></tr>)}</tbody></table></div>}
  </AdminPage>;
}
