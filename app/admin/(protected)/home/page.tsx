import { createHomeSection, createHomeSlide, deleteHomeContent, toggleHomeContent } from "@/app/admin/actions";
import { AdminEmpty, AdminPage } from "@/components/admin/admin-page";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminHomePage() {
  const { supabase } = await requireAdmin();
  const [slidesResult, sectionsResult] = await Promise.all([
    supabase.from("home_slides").select("*").order("sort_order"),
    supabase.from("home_sections").select("*").order("sort_order"),
  ]);
  const firstError = [slidesResult.error, sectionsResult.error].find(Boolean);
  if (firstError) throw new Error(firstError.message);
  const slides = slidesResult.data ?? [];
  const sections = sectionsResult.data ?? [];

  return <AdminPage title="Home" description="Contenido preparado para migrar sin cambiar el diseño público.">
    <section className="admin-panel"><h2>NUEVO HERO SLIDE</h2><form action={createHomeSlide} className="admin-form admin-form-grid">
      <label><span>IMAGE PATH</span><input name="image_path" placeholder="carpeta/imagen.webp" required /></label><label><span>EYEBROW</span><input name="eyebrow" required /></label><label><span>TÍTULO</span><input name="title" required /></label><label><span>ACENTO</span><input name="accent_text" /></label><label className="admin-form-full"><span>SUBTÍTULO</span><textarea name="subtitle" rows={3} /></label><label><span>CTA</span><input name="cta_label" required /></label><label><span>DESTINO</span><input name="cta_href" defaultValue="/tienda" required /></label><label><span>ORDEN</span><input name="sort_order" type="number" min="0" defaultValue="0" /></label><label className="admin-check-label"><input name="active" type="checkbox" defaultChecked /> Activo</label><button className="admin-primary admin-form-full" type="submit">CREAR SLIDE</button>
    </form></section>
    <section className="admin-panel"><h2>HERO SLIDES</h2>{!slides.length ? <AdminEmpty>Los slides públicos siguen usando el fallback actual.</AdminEmpty> : <div className="admin-stack">{slides.map((slide) => <article className="admin-record" key={slide.id}><div><strong>{slide.title}</strong><span>{slide.eyebrow} · Orden {slide.sort_order}</span></div><span className={`admin-status ${slide.active ? "is-active" : ""}`}>{slide.active ? "ACTIVO" : "INACTIVO"}</span><form action={toggleHomeContent.bind(null, "home_slides", slide.id, slide.active)}><button type="submit">{slide.active ? "DESACTIVAR" : "ACTIVAR"}</button></form><form action={deleteHomeContent.bind(null, "home_slides", slide.id)}><button type="submit" className="admin-danger-text">ELIMINAR</button></form></article>)}</div>}</section>
    <section className="admin-panel"><h2>NUEVA SECCIÓN / HIGHLIGHT</h2><form action={createHomeSection} className="admin-form admin-form-grid">
      <label><span>KEY</span><input name="section_key" placeholder="highlights-principal" required /></label><label><span>TIPO</span><select name="section_type"><option value="highlights">Highlights</option><option value="featured_products">Productos destacados</option><option value="campaign">Campaña</option><option value="benefits">Beneficios</option></select></label><label><span>TÍTULO</span><input name="title" required /></label><label><span>EYEBROW</span><input name="eyebrow" /></label><label className="admin-form-full"><span>SUBTÍTULO</span><textarea name="subtitle" rows={3} /></label><label><span>CTA</span><input name="cta_label" /></label><label><span>DESTINO</span><input name="cta_href" /></label><label><span>ORDEN</span><input name="sort_order" type="number" min="0" defaultValue="0" /></label><label className="admin-check-label"><input name="active" type="checkbox" defaultChecked /> Activa</label><button className="admin-primary admin-form-full" type="submit">CREAR SECCIÓN</button>
    </form></section>
    <section className="admin-panel"><h2>SECCIONES</h2>{!sections.length ? <AdminEmpty>Las secciones públicas continúan hardcodeadas hasta su migración.</AdminEmpty> : <div className="admin-stack">{sections.map((section) => <article className="admin-record" key={section.id}><div><strong>{section.title}</strong><span>{section.section_type} · {section.section_key}</span></div><span className={`admin-status ${section.active ? "is-active" : ""}`}>{section.active ? "ACTIVA" : "INACTIVA"}</span><form action={toggleHomeContent.bind(null, "home_sections", section.id, section.active)}><button type="submit">{section.active ? "DESACTIVAR" : "ACTIVAR"}</button></form><form action={deleteHomeContent.bind(null, "home_sections", section.id)}><button type="submit" className="admin-danger-text">ELIMINAR</button></form></article>)}</div>}</section>
  </AdminPage>;
}
