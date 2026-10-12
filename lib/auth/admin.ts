import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export function isAdminPreviewEnabled() {
  return process.env.NODE_ENV === "development" && process.env.ADMIN_PREVIEW === "true";
}

export const getAdminSession = cache(async () => {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  if (isAdminPreviewEnabled()) {
    return {
      supabase,
      user: { id: "admin-preview", email: "preview@lr7.local" },
      profile: { id: "admin-preview", role: "ADMIN" as const, full_name: "Vista previa" },
      preview: true,
    };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "ADMIN") return null;

  return { supabase, user, profile, preview: false };
});

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
