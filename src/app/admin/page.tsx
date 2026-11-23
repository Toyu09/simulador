import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AppShell from "@/components/app-shell";
import UsersManager from "@/components/admin/users-manager";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/admin/login");
  const [users, activeUsers, businesses, simulations] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.user.count({ where: { role: "USER", isActive: true } }),
    prisma.business.count(),
    prisma.simulation.count(),
  ]);
  return <AppShell admin title="Centro de administración" subtitle="Supervisa las cuentas y la actividad general de Viabilidad360." userName={session.user.name}>
    <section className="mb-7 rounded-[26px] bg-gradient-to-br from-[#153d30] to-[#087f5b] p-6 text-white md:p-8"><p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-100">Panel de control</p><h2 className="mt-2 text-3xl font-extrabold">Gestión de la comunidad</h2><p className="mt-2 max-w-xl text-sm leading-6 text-emerald-50/85">Administra el acceso de los emprendedores y consulta el crecimiento de la plataforma.</p></section>
    <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[{label:"Emprendedores",value:users,icon:"♙"},{label:"Cuentas activas",value:activeUsers,icon:"✓"},{label:"Emprendimientos",value:businesses,icon:"▦"},{label:"Simulaciones",value:simulations,icon:"⌁"}].map((item)=><div key={item.label} className="panel p-5"><div className="flex items-center justify-between"><p className="text-xs font-semibold text-slate-500">{item.label}</p><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e8f6ef] font-bold text-[#087f5b]">{item.icon}</span></div><p className="mt-3 text-3xl font-extrabold tracking-tight text-[#17382b]">{item.value}</p></div>)}</div>
    <div className="mb-4"><p className="eyebrow">Administración de acceso</p><h3 className="mt-1 text-xl font-extrabold text-[#17382b]">Usuarios y cuentas</h3></div><UsersManager />
  </AppShell>;
}
