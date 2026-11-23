"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

type Business = { id: string; name: string; description: string | null; type: string; _count: { simulations: number } };
const labels: Record<string, string> = { COMMERCE: "Comercio", SERVICE: "Servicios", PRODUCTION: "Producción", OTHER: "Otro" };
const icons: Record<string,string> = { COMMERCE:"▣", SERVICE:"✳", PRODUCTION:"⚙", OTHER:"◇" };

export default function BusinessManager() {
  const [items, setItems] = useState<Business[]>([]);
  const [form, setForm] = useState({ name: "", description: "", type: "COMMERCE" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm,setShowForm] = useState(false);

  async function load() {
    try {
      const response = await fetch("/api/businesses");
      const data = await response.json();
      if (response.ok) setItems(data);
      else setError(data.error || "No se pudieron cargar los emprendimientos.");
    } catch {
      setError("No se pudieron cargar los emprendimientos. Comprueba tu conexión.");
    } finally { setLoading(false); }
  }
  useEffect(() => {
    let cancelled = false;
    fetch("/api/businesses").then(async response => {
      const data = await response.json();
      if (cancelled) return;
      if (response.ok) setItems(data); else setError(data.error || "No se pudieron cargar los emprendimientos.");
    }).catch(() => { if (!cancelled) setError("No se pudieron cargar los emprendimientos. Comprueba tu conexión."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault(); setError("");
    const response = await fetch("/api/businesses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await response.json();
    if (!response.ok) { setError(data.error); return; }
    setForm({ name: "", description: "", type: "COMMERCE" }); setShowForm(false); await load();
  }
  async function edit(item: Business) {
    const name = window.prompt("Nombre del emprendimiento:", item.name); if (name === null) return;
    const description = window.prompt("Descripción:", item.description || ""); if (description === null) return;
    const response = await fetch(`/api/businesses/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, description }) });
    const data = await response.json(); if (!response.ok) { setError(data.error); return; } await load();
  }
  async function remove(id: string) {
    if (!window.confirm("¿Eliminar este emprendimiento y sus simulaciones?")) return;
    const response = await fetch(`/api/businesses/${id}`, { method: "DELETE" }); const data = await response.json();
    if (!response.ok) { setError(data.error); return; } setItems(current => current.filter(item => item.id !== id));
  }

  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-slate-500">Administra tus negocios y analiza su potencial.</p>
      <button type="button" onClick={() => setShowForm(v=>!v)} className="primary-button"><span className="text-lg leading-none">＋</span> Nuevo emprendimiento</button>
    </div>
    {showForm&&<section className="panel p-5 md:p-6"><div className="mb-4"><p className="eyebrow">Nuevo proyecto</p><h3 className="mt-1 text-lg font-extrabold text-[#17382b]">Cuéntanos sobre tu emprendimiento</h3></div>
      <form onSubmit={submit} className="grid gap-4 md:grid-cols-3">
        <label className="text-sm font-semibold text-slate-700">Nombre del negocio<input className="field" required maxLength={100} placeholder="Ej. Café de origen" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
        <label className="text-sm font-semibold text-slate-700">Actividad económica<select className="field" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option value="COMMERCE">Comercio</option><option value="SERVICE">Servicios</option><option value="PRODUCTION">Producción</option><option value="OTHER">Otro</option></select></label>
        <label className="text-sm font-semibold text-slate-700">Descripción breve<input className="field" maxLength={500} placeholder="¿Qué ofrece tu negocio?" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>
        <div className="flex flex-wrap items-center gap-3 md:col-span-3"><button className="primary-button">Guardar emprendimiento</button><button type="button" onClick={()=>setShowForm(false)} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100">Cancelar</button>{error&&<p role="alert" className="text-sm text-rose-600">{error}</p>}</div>
      </form>
    </section>}
    {error&&!showForm&&<p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    {loading?<div className="panel p-8 text-center text-sm text-slate-400">Cargando tus emprendimientos...</div>:items.length===0?<div className="panel soft-grid p-10 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#e5f5ec] text-2xl text-[#087f5b]">＋</span><h3 className="mt-4 text-lg font-extrabold text-[#17382b]">Tu próximo proyecto empieza aquí</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Registra tu idea de negocio para organizar sus costos, estimar ventas y evaluar su viabilidad financiera.</p><button onClick={()=>setShowForm(true)} className="primary-button mt-5">Crear mi primer emprendimiento</button></div>:
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map(item=><article key={item.id} className="group overflow-hidden rounded-[22px] border border-[#e1ebe4] bg-white shadow-[0_8px_28px_rgba(25,55,40,.035)] transition hover:-translate-y-1 hover:shadow-lg">
        <div className="h-1.5 bg-gradient-to-r from-[#087f5b] via-[#45b77f] to-[#c1df8c]"/>
        <div className="p-5"><div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e8f6ef] text-xl font-bold text-[#087f5b]">{icons[item.type]||"◇"}</span><div className="flex gap-2"><button onClick={()=>void edit(item)} aria-label="Editar emprendimiento" className="rounded-lg border border-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50">Editar</button><button onClick={()=>void remove(item.id)} aria-label="Eliminar emprendimiento" className="rounded-lg border border-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-400 hover:bg-rose-50 hover:text-rose-600">×</button></div></div>
          <span className="mt-4 inline-flex rounded-full bg-[#f1f8f3] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#39815e]">{labels[item.type]||"Otro"}</span>
          <h3 className="mt-2 text-lg font-extrabold tracking-tight text-[#17382b]">{item.name}</h3><p className="mt-1 min-h-10 text-sm leading-5 text-slate-500">{item.description||"Agrega una descripción para identificar mejor tu negocio."}</p>
          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><span className="text-xs text-slate-400"><strong className="text-slate-700">{item._count.simulations}</strong> simulaciones</span><Link href={`/emprendimientos/${item.id}`} className="inline-flex items-center gap-2 rounded-xl bg-[#087f5b] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#066b4c]">Abrir negocio <span>→</span></Link></div>
        </div>
      </article>)}</div>}
  </div>;
}
