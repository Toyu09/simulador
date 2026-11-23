import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import AppShell from "@/components/app-shell";
import SimulationForm from "@/components/simulations/simulation-form";
import Link from "next/link";

export default async function BusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "USER") redirect("/login");
  const { id } = await params;
  const business = await prisma.business.findFirst({
    where: { id, ownerId: session.user.id },
    include: { simulations: { orderBy: { createdAt: "desc" }, include: { scenarios: true } } },
  });
  if (!business) notFound();
  const production = business.type === "PRODUCTION";
  return <AppShell title={business.name} subtitle="Registra una simulación y consulta el historial de evaluaciones." userName={session.user.name}>
    <div className="mb-6"><Link href="/dashboard" className="text-sm font-semibold text-blue-700">← Mis emprendimientos</Link><p className="mt-3 text-sm text-slate-500">{business.description || "Sin descripción"} · {production ? "Producción" : business.type === "COMMERCE" ? "Comercio" : business.type === "SERVICE" ? "Servicios" : "Otro"}</p></div>
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section><h2 className="mb-4 text-lg font-bold text-slate-900">Nueva simulación</h2><SimulationForm businessId={business.id} production={production}/></section>
      <section><h2 className="mb-4 text-lg font-bold text-slate-900">Historial</h2>{business.simulations.length===0?<div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">Todavía no hay simulaciones.</div>:<div className="space-y-3">{business.simulations.map(sim=><article key={sim.id} className="rounded-xl border border-slate-200 bg-white p-4"><p className="font-semibold text-slate-900">{sim.name}</p><p className="mt-1 text-xs text-slate-500">{new Intl.DateTimeFormat("es-CO",{dateStyle:"medium"}).format(sim.createdAt)}</p><Link href={`/simulaciones/${sim.id}`} className="mt-3 inline-block text-sm font-semibold text-blue-700">Ver resultados →</Link></article>)}</div>}</section>
    </div>
  </AppShell>;
}
