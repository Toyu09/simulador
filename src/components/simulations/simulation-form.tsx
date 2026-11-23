"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Props = { businessId: string; production: boolean };
export default function SimulationForm({businessId,production}:Props) {
  const router=useRouter();
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const [form,setForm]=useState({
    name:"Evaluación inicial",initialInvestment:"5000000",monthlyFixedCosts:"800000",
    variableCostPerUnit:"8000",salePricePerUnit:"15000",estimatedMonthlyUnits:"200",
    projectionMonths:"12",annualDiscountRate:"12",productionCapacityUnits:"300",
    machineryDescription:"",monthlyMaintenanceCost:"0",monthlyEnergyKwh:"0",energyCostPerKwh:"0"
  });
  function change(key:string,value:string){setForm(v=>({...v,[key]:value}))}
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError("");const payload={businessId,...Object.fromEntries(Object.entries(form).map(([k,v])=>[k,["name","machineryDescription"].includes(k)?v:Number(v)]))};const r=await fetch("/api/simulations",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const d=await r.json();if(!r.ok){setError(d.error||"No se pudo calcular.");setBusy(false);return;}router.push(`/simulaciones/${d.id}`);}
  const moneyFields:[string,string][]=[["initialInvestment","Inversión inicial (COP)"],["monthlyFixedCosts","Costos fijos mensuales (COP)"],["variableCostPerUnit","Costo variable por unidad (COP)"],["salePricePerUnit","Precio de venta por unidad (COP)"],["estimatedMonthlyUnits","Unidades vendidas al mes"],["projectionMonths","Meses de proyección"],["annualDiscountRate","Tasa de descuento anual (%)"]];
  return <form onSubmit={submit} className="space-y-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div><h2 className="text-lg font-bold text-slate-900">Datos financieros</h2><p className="mt-1 text-sm text-slate-500">Ingresa valores estimados. El sistema calculará tres escenarios automáticamente.</p></div>
    <label className="block text-sm font-medium text-slate-700">Nombre de la simulación<input className="field" required maxLength={100} value={form.name} onChange={e=>change("name",e.target.value)}/></label>
    <div className="grid gap-4 sm:grid-cols-2">
      {moneyFields.map(([key,label])=><label key={key} className="block text-sm font-medium text-slate-700">{label}<input className="field" required type="number" min="0" step="any" value={form[key as keyof typeof form]} onChange={e=>change(key,e.target.value)}/></label>)}
    </div>
    {production&&<div className="border-t border-slate-100 pt-6"><h3 className="font-semibold text-slate-900">Datos de producción (opcionales)</h3><div className="mt-4 grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-medium text-slate-700">Capacidad mensual (unidades)<input className="field" type="number" min="0" value={form.productionCapacityUnits} onChange={e=>change("productionCapacityUnits",e.target.value)}/></label>
      <label className="text-sm font-medium text-slate-700">Descripción de maquinaria<input className="field" maxLength={500} value={form.machineryDescription} onChange={e=>change("machineryDescription",e.target.value)}/></label>
      <label className="text-sm font-medium text-slate-700">Mantenimiento mensual (COP)<input className="field" type="number" min="0" value={form.monthlyMaintenanceCost} onChange={e=>change("monthlyMaintenanceCost",e.target.value)}/></label>
      <label className="text-sm font-medium text-slate-700">Consumo energético (kWh/mes)<input className="field" type="number" min="0" value={form.monthlyEnergyKwh} onChange={e=>change("monthlyEnergyKwh",e.target.value)}/></label>
      <label className="text-sm font-medium text-slate-700">Costo por kWh (COP)<input className="field" type="number" min="0" step="any" value={form.energyCostPerKwh} onChange={e=>change("energyCostPerKwh",e.target.value)}/></label>
    </div></div>}
    {error&&<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <button disabled={busy} className="primary-button">{busy?"Calculando y guardando...":"Calcular viabilidad"}</button>
  </form>;
}
