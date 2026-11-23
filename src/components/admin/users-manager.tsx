"use client";

import { useEffect, useState, type FormEvent } from "react";

type User = { id: string; name: string; email: string; role: string; isActive: boolean; createdAt: string; _count?: { businesses: number } };

export default function UsersManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      if (!response.ok) setError(data.error || "No se pudieron cargar los usuarios.");
      else setUsers(data);
    } catch {
      setError("No se pudieron cargar los usuarios. Comprueba tu conexión.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin/users")
      .then(async (response) => {
        const data = await response.json();
        if (cancelled) return;
        if (!response.ok) setError(data.error || "No se pudieron cargar los usuarios.");
        else setUsers(data);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudieron cargar los usuarios. Comprueba tu conexión.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function create(event: FormEvent) {
    event.preventDefault(); setError(""); setMessage("");
    const response = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "No se pudo crear la cuenta."); return; }
    setMessage(`Cuenta creada para ${data.email}.`);
    setForm({ name: "", email: "", password: "" });
    await load();
  }

  async function toggle(user: User) {
    setError(""); setMessage("");
    const response = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: user.id, isActive: !user.isActive }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "No se pudo actualizar el usuario."); return; }
    setUsers((current) => current.map((item) => item.id === user.id ? { ...item, isActive: data.isActive } : item));
  }

  return <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-slate-900">Cuentas registradas</h2><span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{users.length} cuentas</span></div>
      {loading ? <p className="py-8 text-sm text-slate-500">Cargando usuarios...</p> : <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-slate-100 text-xs uppercase text-slate-400"><tr><th className="py-3">Usuario</th><th>Rol</th><th>Emprendimientos</th><th>Estado</th><th /></tr></thead>
          <tbody>{users.map((user) => <tr key={user.id} className="border-b border-slate-50">
            <td className="py-4"><p className="font-semibold text-slate-800">{user.name}</p><p className="text-xs text-slate-500">{user.email}</p></td>
            <td><span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{user.role === "ADMIN" ? "Administrador" : "Emprendedor"}</span></td>
            <td>{user._count?.businesses ?? "—"}</td>
            <td><span className={user.isActive ? "text-emerald-700" : "text-red-600"}>{user.isActive ? "Activo" : "Inactivo"}</span></td>
            <td>{user.role === "USER" && <button onClick={() => void toggle(user)} className="text-xs font-semibold text-blue-700 hover:underline">{user.isActive ? "Desactivar" : "Activar"}</button>}</td>
          </tr>)}</tbody>
        </table>
      </div>}
    </section>
    <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">Crear emprendedor</h2>
      <p className="mt-1 text-sm text-slate-500">Las cuentas son creadas por administración.</p>
      <form onSubmit={create} className="mt-5 space-y-4">
        <label className="block text-sm font-medium text-slate-700">Nombre<input required maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field" /></label>
        <label className="block text-sm font-medium text-slate-700">Correo<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="field" /></label>
        <label className="block text-sm font-medium text-slate-700">Contraseña temporal<input required minLength={12} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="field" /><span className="mt-1 block text-xs font-normal text-slate-400">Mínimo 12 caracteres. Comunícala de forma segura.</span></label>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}{message && <p role="status" className="text-sm text-emerald-700">{message}</p>}
        <button className="primary-button w-full">Crear cuenta</button>
      </form>
    </section>
  </div>;
}
