import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "USER") {
    redirect("/login");
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">Panel de usuario</h1>
      <p className="mt-2 text-gray-600">
        Bienvenido, {session.user.name}.
      </p>
      <p className="mt-4 text-sm text-gray-500">
        Aquí se gestionarán tus emprendimientos y simulaciones.
      </p>
    </main>
  );
}
