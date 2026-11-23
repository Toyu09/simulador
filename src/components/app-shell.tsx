"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

type Props = { children: React.ReactNode; title: string; subtitle?: string; admin?: boolean; userName?: string | null };
const userLinks = [
  { href: "/dashboard", label: "Resumen", icon: "⌂" },
  { href: "/historial", label: "Historial", icon: "◷" },
];
const adminLinks = [{ href: "/admin", label: "Usuarios y cuentas", icon: "♙" }];

export default function AppShell({ children, title, subtitle, admin = false, userName }: Props) {
  const pathname = usePathname();
  const links = admin ? adminLinks : userLinks;
  return (
    <div className="min-h-screen bg-[#f5f8f6]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[258px] flex-col border-r border-[#e2ebe5] bg-white px-5 py-6 lg:flex">
        <Link href={admin ? "/admin" : "/dashboard"} className="flex items-center gap-3 px-2">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#087f5b] text-lg font-black text-white shadow-lg shadow-emerald-900/15">V</span>
          <span><span className="block text-[17px] font-extrabold tracking-tight text-[#17382b]">Viabilidad<span className="text-[#07805b]">360</span></span><span className="block text-[10px] font-semibold uppercase tracking-[.16em] text-slate-400">{admin ? "Centro de administración" : "Tu aliado emprendedor"}</span></span>
        </Link>
        <div className="mt-10 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Espacio de trabajo</div>
        <nav className="mt-3 flex flex-col gap-1.5">
          {links.map((item) => {
            const active = pathname === item.href || (item.href === "/dashboard" && pathname.startsWith("/emprendimientos"));
            return <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${active ? "bg-[#e8f6ef] text-[#087f5b]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}><span className="grid h-7 w-7 place-items-center rounded-lg bg-white text-base shadow-sm">{item.icon}</span>{item.label}{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#087f5b]"/>}</Link>;
          })}
        </nav>
        <div className="mt-auto rounded-2xl bg-[#f0f8f3] p-4">
          <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500"/><span className="text-xs font-bold text-[#176044]">Plataforma activa</span></div>
          <p className="mt-2 text-xs leading-5 text-slate-500">Convierte tus ideas en decisiones con información clara.</p>
        </div>
        <div className="mt-4 flex items-center gap-3 border-t border-slate-100 px-2 pt-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#dff2e8] text-sm font-extrabold text-[#087f5b]">{(userName || "U").slice(0,1).toUpperCase()}</span>
          <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-800">{userName || "Cuenta"}</p><p className="text-[10px] text-slate-400">{admin ? "Administrador" : "Emprendedor"}</p></div>
          <button aria-label="Cerrar sesión" title="Cerrar sesión" onClick={() => signOut({ callbackUrl: admin ? "/admin/login" : "/login" })} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600">↗</button>
        </div>
      </aside>
      <main className="min-h-screen lg:pl-[258px]">
        <header className="sticky top-0 z-20 border-b border-[#e5ede8] bg-white/90 px-5 py-4 backdrop-blur-xl md:px-9">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
            <div className="min-w-0"><p className="eyebrow">{admin ? "Administración" : "Tu espacio de negocio"}</p><h1 className="mt-1 truncate text-xl font-extrabold tracking-tight text-[#17382b] md:text-2xl">{title}</h1>{subtitle && <p className="mt-1 hidden text-sm text-slate-500 sm:block">{subtitle}</p>}</div>
            <div className="flex items-center gap-2"><span className="hidden rounded-full border border-[#dcece2] bg-[#f3faf5] px-3 py-2 text-xs font-semibold text-[#287653] sm:inline-flex">● Entorno seguro</span><button onClick={() => signOut({ callbackUrl: admin ? "/admin/login" : "/login" })} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 lg:hidden">Salir</button></div>
          </div>
        </header>
        <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-9 md:py-9">{children}</div>
        <footer className="px-5 pb-7 text-center text-[11px] text-slate-400 lg:px-9">Viabilidad360 · Herramienta de orientación financiera para pequeños emprendimientos</footer>
      </main>
    </div>
  );
}
