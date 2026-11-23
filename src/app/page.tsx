import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session=await auth();
  if(session?.user) redirect(session.user.role==="ADMIN"?"/admin":"/dashboard");
  return <main className="relative flex min-h-screen items-center overflow-hidden bg-slate-950 px-6 py-16 text-white">
    <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-blue-600/20 blur-3xl"/>
    <div className="relative mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
      <section><p className="text-sm font-semibold uppercase tracking-[.25em] text-blue-300">Herramienta para emprendedores</p><h1 className="mt-6 max-w-2xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl">Evalúa tu idea de negocio antes de invertir.</h1><p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">Organiza tus costos, estima tus ventas y compara escenarios para comprender la viabilidad financiera de tu emprendimiento.</p><div className="mt-9 flex flex-wrap gap-3"><Link href="/login" className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500">Ingresar al simulador</Link><Link href="/admin/login" className="rounded-xl border border-slate-600 px-6 py-3 font-semibold text-slate-200 hover:bg-white/5">Acceso administrativo</Link></div></section>
      <section className="rounded-3xl border border-white/10 bg-white/[.06] p-7 shadow-2xl backdrop-blur"><div className="flex items-center justify-between"><span className="font-semibold">Resumen de viabilidad</span><span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">Ejemplo ilustrativo</span></div><div className="mt-8 grid grid-cols-2 gap-4"><div className="rounded-2xl bg-white/[.06] p-4"><p className="text-sm text-slate-400">Ingresos estimados</p><p className="mt-2 text-2xl font-bold">$3.000.000</p></div><div className="rounded-2xl bg-white/[.06] p-4"><p className="text-sm text-slate-400">Utilidad estimada</p><p className="mt-2 text-2xl font-bold text-emerald-300">$620.000</p></div></div><div className="mt-5 rounded-2xl bg-white/[.06] p-5"><p className="text-sm text-slate-400">Análisis de escenarios</p><div className="mt-5 flex h-28 items-end gap-3">{[52,78,38].map((h,i)=><div key={i} className="flex flex-1 flex-col items-center gap-2"><div className="w-full rounded-t-lg bg-blue-400/80" style={{height:`${h}%`}}/><span className="text-xs text-slate-400">{["Optimista","Base","Pesimista"][i]}</span></div>)}</div></div></section>
    </div>
  </main>;
}
