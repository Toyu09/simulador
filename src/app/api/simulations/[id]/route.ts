import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const access = await requireUser();
  if (access.error) return access.error;
  const { id } = await context.params;
  const simulation = await prisma.simulation.findFirst({
    where: { id, business: { ownerId: access.user.id } },
    include: {
      business: { select: { id: true, name: true } },
      scenarios: { include: { projections: { orderBy: { month: "asc" } } } },
    },
  });
  if (!simulation) return NextResponse.json({ error: "Simulación no encontrada." }, { status: 404 });
  return NextResponse.json(simulation);
}
