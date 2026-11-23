import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AppShell from "@/components/app-shell";
import UsersManager from "@/components/admin/users-manager";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/admin/login");
  return <AppShell admin title="Gestión de usuarios" subtitle="Administra el acceso de los emprendedores a la plataforma." userName={session.user.name}>
    <UsersManager />
  </AppShell>;
}
