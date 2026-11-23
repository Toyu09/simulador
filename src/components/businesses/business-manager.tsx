"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

type Business = { id: string; name: string; description: string | null; type: string; _count: { simulations: number } };
const labels: Record<string, string> = { COMMERCE: "Comercio", SERVICE: "Servicios", PRODUCTION: "Producción", OTHER: "Otro" };

export default function BusinessManager() {
  const [items, setItems] = useState<Business[]>([]);
  const [form, setForm] = useState({ name: "", description: "", type: "COMMERCE" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const response = await fetch("/api/businesses");
      const data = await response.json();
      if (response.ok) setItems(data);
      else setError(data.error || "No se pudieron cargar los emprendimientos.");
    } catch {
      setError("No se pudieron cargar los emprendimientos. Comprueba tu conexión.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    fetch("/api/businesses")
      .then(async (response) => {
        const data = await response.json();
        if (cancelled) return;
        if (response.ok) setItems(data);
        else setError(data.error || "No se pudieron cargar los emprendimientos.");
      })
      .catch(() => {
        if (!cancelled) setError("No se pudieron cargar los emprendimientos. Comprueba tu conexión.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/businesses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await response.json();
    if (!response.ok) { setError(data.error); return; }
    setForm({ name: "", description: "", type: "COMMERCE" });
    await load();
  }

  async function edit(item: Business) {
    const name = window.prompt("Nombre del emprendimiento:", item.name);
    if (name === null) return;
    const description = window.prompt("Descripción:", item.description || "");
    if (description === null) return;
    const response = await fetch(`/api/businesses/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, description }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error); return; }
    await load();
  }

  async function remove(id: string) {
    if (!window.confirm("¿Eliminar este emprendimiento y sus simulaciones?")) return;
    const response = await fetch(`/api/businesses/${id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) { setError(data.error); return; }
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return <div className="space-y-8">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">Registrar emprendimiento</h2>
      <form onSubmit={submit} className="mt-4 grid gap-4 md:grid-cols-3">
        <label className="text-sm font-medium text-slate-700">Nombre<input className="field" required maxLength={100} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label className="text-sm font-medium text-slate-700">Tipo<select className="field" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}><option value="COMMERCE">Comercio</option><option value="SERVICE">Servicios</option><option value="PRODUCTION">Producción</option><option value="OTHER">Otro</option></select></label>
        <label className="text-sm font-medium text-slate-700">Descripción<input className="field" maxLength={500} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        <div className="md:col-span-3 flex flex-wrap items-center gap-3"><button className="primary-button">Guardar emprendimiento</button>{error && <p className="text-sm text-red-600">{error}</p>}</div>
      </form>
    </section>
    <section>
      <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold text-slate-900">Mis emprendimientos</h2><span className="text-sm text-slate-500">{items.length} registrados</span></div>
      {loading ? <p className="text-sm text-slate-500">Cargando...</p> : items.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><p className="font-semibold text-slate-800">Aún no tienes emprendimientos</p><p className="mt-1 text-sm text-slate-500">Registra uno para comenzar a evaluar su viabilidad.</p></div> :
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{labels[item.type] || "Otro"}</span><div className="flex gap-3"><button onClick={() => void edit(item)} className="text-xs text-blue-700 hover:underline">Editar</button><button onClick={() => void remove(item.id)} className="text-xs text-slate-400 hover:text-red-600">Eliminar</button></div></div>
          <h3 className="mt-4 text-lg font-bold text-slate-900">{item.name}</h3><p className="mt-1 min-h-10 text-sm text-slate-500">{item.description || "Sin descripción"}</p>
          <p className="mt-4 text-xs text-slate-500">{item._count.simulations} simulaciones guardadas</p>
          <Link href={`/emprendimientos/${item.id}`} className="mt-4 inline-flex text-sm font-semibold text-blue-700 hover:underline">Abrir emprendimiento →</Link>
        </article>)}</div>}
    </section>
  </div>;
}
