import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AppShell from "@/components/app-shell";
import BusinessManager from "@/components/businesses/business-manager";
import { prisma } from "@/lib/prisma";

const cop = (value: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "USER") redirect("/login");
  const ownerId = session.user.id;
  const [businessCount, simulationCount, businesses, recent] = await Promise.all([
    prisma.business.count({ where: { ownerId } }),
    prisma.simulation.count({ where: { business: { ownerId } } }),
    prisma.business.findMany({ where: { ownerId }, orderBy: { updatedAt: "desc" }, include: { _count: { select: { simulations: true } } } }),
    prisma.simulation.findMany({ where: { business: { ownerId } }, orderBy: { createdAt: "desc" }, take: 5, include: { business: { select: { name: true } }, scenarios: { where: { type: "CONSERVATIVE" }, take: 1 } } }),
  ]);
  const latestProfit = recent[0]?.scenarios[0]?.monthlyProfit ? Number(recent[0].scenarios[0].monthlyProfit) : 0;
  const firstName = (session.user.name || "emprendedor").split(" ")[0];
  return <AppShell title="Resumen de tu negocio" subtitle="Un vistazo claro al estado de tus ideas y evaluaciones." userName={session.user.name}>
    <section className="relative mb-7 overflow-hidden rounded-[26px] bg-gradient-to-br from-[#075c45] via-[#087f5b] to-[#16a36f] p-6 text-white shadow-xl shadow-emerald-950/10 md:p-8">
      <div className="absolute -right-10 -top-24 h-72 w-72 rounded-full border-[35px] border-white/10"/><div className="absolute right-36 top-20 h-32 w-32 rounded-full bg-lime-300/10 blur-2xl"/>
      <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-100">Panel del emprendedor</p><h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">¡Hola, {firstName}!</h2><p className="mt-3 max-w-lg text-sm leading-6 text-emerald-50/90 md:text-base">Tus ideas merecen números claros. Organiza tus emprendimientos y descubre qué tan viable puede ser cada uno.</p></div>
        <a href="#mis-emprendimientos" className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[#087f5b] shadow-lg transition hover:-translate-y-0.5">Explorar emprendimientos <span>→</span></a>
      </div>
      <div className="relative mt-8 grid grid-cols-2 gap-3 md:max-w-xl"><div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"><p className="text-xs text-emerald-100">Emprendimientos</p><p className="mt-1 text-3xl font-extrabold">{businessCount}</p></div><div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"><p className="text-xs text-emerald-100">Simulaciones realizadas</p><p className="mt-1 text-3xl font-extrabold">{simulationCount}</p></div></div>
    </section>
    <div className="mb-8 grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
      <section className="panel p-5 md:p-6"><div className="flex items-center justify-between"><div><p className="eyebrow">Actividad reciente</p><h3 className="mt-1 text-lg font-extrabold text-[#17382b]">Tus últimas evaluaciones</h3></div><Link href="/historial" className="text-xs font-bold text-[#087f5b] hover:underline">Ver historial →</Link></div>
        {recent.length ? <div className="mt-5 divide-y divide-slate-100">{recent.map((item) => <Link key={item.id} href={`/simulaciones/${item.id}`} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 hover:bg-[#fbfdfb]"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e8f6ef] text-lg text-[#087f5b]">↗</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-slate-800">{item.name}</span><span className="block truncate text-xs text-slate-400">{item.business.name} · {new Intl.DateTimeFormat("es-CO",{dateStyle:"medium"}).format(item.createdAt)}</span></span><span className={`text-right text-sm font-extrabold ${latestProfit >= 0 ? "text-[#087f5b]" : "text-rose-600"}`}>{cop(Number(item.scenarios[0]?.monthlyProfit || 0))}<span className="block text-[10px] font-medium text-slate-400">utilidad / mes</span></span></Link>)}</div> : <div className="mt-5 rounded-2xl bg-[#f6faf7] p-6 text-center"><span className="text-2xl">📊</span><p className="mt-2 text-sm font-bold text-slate-700">Aún no tienes evaluaciones</p><p className="mt-1 text-xs text-slate-500">Crea tu primer emprendimiento y realiza una simulación.</p></div>}
      </section>
      <section className="panel soft-grid overflow-hidden p-5 md:p-6"><p className="eyebrow">Consejo para empezar</p><div className="mt-4 grid h-10 w-10 place-items-center rounded-xl bg-[#e1f3e8] text-xl">💡</div><h3 className="mt-3 text-lg font-extrabold text-[#17382b]">Primero entiende tus costos</h3><p className="mt-2 text-sm leading-6 text-slate-500">Registra cuánto cuesta mantener tu negocio y cuánto cuesta producir o entregar cada unidad. Así podrás estimar cuántas ventas necesitas para cubrir tus gastos.</p><div className="mt-5 rounded-xl border border-[#dcece2] bg-white/90 p-3 text-xs leading-5 text-[#39745a]">El punto de equilibrio te ayuda a identificar el nivel de ventas donde los ingresos cubren los costos.</div></section>
    </div>
    <section id="mis-emprendimientos"><div className="mb-4 flex flex-wrap items-end justify-between gap-2"><div><p className="eyebrow">Portafolio</p><h3 className="mt-1 text-xl font-extrabold text-[#17382b]">Mis emprendimientos</h3><p className="mt-1 text-sm text-slate-500">Cada negocio tiene sus propias simulaciones e historial.</p></div><span className="rounded-full bg-[#e8f6ef] px-3 py-1.5 text-xs font-bold text-[#087f5b]">{businesses.length} registrados</span></div><BusinessManager /></section>
  </AppShell>;
}
