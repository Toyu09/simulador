import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/app-shell";

export default async function HistoryPage() {
  const session=await auth();
  if(!session?.user||session.user.role!=="USER") redirect("/login");
  const items=await prisma.simulation.findMany({where:{business:{ownerId:session.user.id}},orderBy:{createdAt:"desc"},include:{business:true,scenarios:{where:{type:"CONSERVATIVE"}}}});
  const cop=(v:unknown)=>new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(Number(v));
  return <AppShell title="Historial de simulaciones" subtitle="Consulta las evaluaciones guardadas de tus emprendimientos." userName={session.user.name}>
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-5"><table className="w-full min-w-[650px] text-left text-sm"><thead className="border-b text-xs uppercase text-slate-400"><tr><th className="py-3">Simulación</th><th>Emprendimiento</th><th>Fecha</th><th>Utilidad mensual</th><th/></tr></thead><tbody>{items.map(item=><tr key={item.id} className="border-b border-slate-50"><td className="py-4 font-semibold text-slate-800">{item.name}</td><td>{item.business.name}</td><td>{new Intl.DateTimeFormat("es-CO",{dateStyle:"medium"}).format(item.createdAt)}</td><td>{item.scenarios[0]?cop(item.scenarios[0].monthlyProfit):"—"}</td><td><Link className="font-semibold text-blue-700" href={`/simulaciones/${item.id}`}>Ver →</Link></td></tr>)}</tbody></table>{items.length===0&&<p className="py-8 text-center text-sm text-slate-500">Todavía no tienes simulaciones guardadas.</p>}</div>
  </AppShell>;
}
