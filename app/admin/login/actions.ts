"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8).max(128),
});

export async function loginAdmin(formData: FormData) {
  const result = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) redirect("/admin/login?error=invalid");

  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin/login?error=config");

  const { error } = await supabase.auth.signInWithPassword(result.data);
  if (error) redirect("/admin/login?error=credentials");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login?error=credentials");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "ADMIN") {
    await supabase.auth.signOut();
    redirect("/admin/login?error=forbidden");
  }

  redirect("/admin/dashboard");
}

export async function logoutAdmin() {
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/admin/login");
}
