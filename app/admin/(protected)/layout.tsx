import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth/admin";

export default async function ProtectedAdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  const { user, preview } = await requireAdmin();
  return <AdminShell email={user.email ?? "ADMIN LR7"} preview={preview}>{children}</AdminShell>;
}
