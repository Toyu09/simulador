import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AppShell from "@/components/app-shell";
import SimulationResults from "@/components/simulations/simulation-results";

export default async function SimulationPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "USER") redirect("/login");
  const { id } = await params;
  return <AppShell title="Informe de viabilidad" subtitle="Indicadores y comparación de escenarios." userName={session.user.name}>
    <SimulationResults id={id}/>
  </AppShell>;
}
