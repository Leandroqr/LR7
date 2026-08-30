import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { loginAdmin } from "@/app/admin/login/actions";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Revisa el correo y la contraseña.",
  credentials: "Credenciales inválidas.",
  forbidden: "Esta cuenta no tiene acceso ADMIN.",
  callback: "No fue posible completar la sesión.",
  config: "Supabase todavía no está configurado en este entorno.",
};

type LoginPageProps = Readonly<{ searchParams: Promise<{ error?: string }> }>;

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  if (await getAdminSession()) redirect("/admin/dashboard");

  const { error } = await searchParams;
  const configured = isSupabaseConfigured();

  return (
    <main className="admin-login-page">
      <section className="admin-login-panel" aria-labelledby="admin-login-title">
        <p className="admin-kicker">LR7 / OPERACIONES</p>
        <h1 id="admin-login-title">ADMIN</h1>
        <p>Acceso exclusivo para el equipo autorizado de LR7.</p>

        {!configured ? (
          <output className="admin-notice">
            Configura `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` para iniciar sesión.
          </output>
        ) : null}
        {error ? <div className="admin-error" role="alert">{ERROR_MESSAGES[error] ?? ERROR_MESSAGES.callback}</div> : null}

        <form action={loginAdmin} className="admin-form">
          <label>
            <span>CORREO</span>
            <input name="email" type="email" autoComplete="email" required disabled={!configured} />
          </label>
          <label>
            <span>CONTRASEÑA</span>
            <input name="password" type="password" autoComplete="current-password" minLength={8} required disabled={!configured} />
          </label>
          <button type="submit" disabled={!configured}>INICIAR SESIÓN</button>
        </form>
      </section>
    </main>
  );
}
