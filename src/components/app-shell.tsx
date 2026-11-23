"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

type Props = { children: React.ReactNode; title: string; subtitle?: string; admin?: boolean; userName?: string | null };

export default function AppShell({ children, title, subtitle, admin = false, userName }: Props) {
  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200 bg-white p-5 md:flex">
        <Link href={admin ? "/admin" : "/dashboard"} className="text-lg font-bold tracking-tight text-slate-900">
          Viabilidad<span className="text-blue-700">360</span>
        </Link>
        <p className="mt-1 text-xs text-slate-500">{admin ? "Administración" : "Simulador financiero"}</p>
        <nav className="mt-10 flex flex-col gap-2 text-sm">
          {admin ? (
            <Link className="rounded-lg bg-blue-50 px-3 py-2 font-semibold text-blue-800" href="/admin">Usuarios y cuentas</Link>
          ) : (
            <>
              <Link className="rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100" href="/dashboard">Mis emprendimientos</Link>
              <Link className="rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100" href="/historial">Historial de simulaciones</Link>
            </>
          )}
        </nav>
        <div className="mt-auto border-t border-slate-100 pt-4">
          <p className="truncate text-sm font-medium text-slate-800">{userName || "Cuenta"}</p>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="mt-3 text-sm text-slate-500 hover:text-red-600">Cerrar sesión</button>
        </div>
      </aside>
      <main className="md:pl-64">
        <header className="border-b border-slate-200 bg-white px-5 py-6 md:px-10">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-700">Simulador de viabilidad</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
        </header>
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-10">{children}</div>
      </main>
    </div>
  );
}
