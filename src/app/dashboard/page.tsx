import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AppShell from "@/components/app-shell";
import BusinessManager from "@/components/businesses/business-manager";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "USER") redirect("/login");
  const [businessCount, simulationCount] = await Promise.all([
    prisma.business.count({ where: { ownerId: session.user.id } }),
    prisma.simulation.count({ where: { business: { ownerId: session.user.id } } }),
  ]);
  return <AppShell title="Mis emprendimientos" subtitle="Organiza tus negocios y evalúa su viabilidad antes de invertir." userName={session.user.name}>
    <div className="mb-8 grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl bg-slate-900 p-5 text-white"><p className="text-sm text-slate-300">Emprendimientos</p><p className="mt-2 text-3xl font-bold">{businessCount}</p></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Simulaciones guardadas</p><p className="mt-2 text-3xl font-bold text-slate-900">{simulationCount}</p></div>
    </div>
    <BusinessManager />
  </AppShell>;
}
