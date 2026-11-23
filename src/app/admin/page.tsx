import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">Panel administrativo</h1>
      <p className="mt-2 text-gray-600">
        Bienvenido, {session.user.name}.
      </p>
      <p className="mt-4 text-sm text-gray-500">
        Aquí se gestionarán los usuarios y sus permisos.
      </p>
    </main>
  );
}
