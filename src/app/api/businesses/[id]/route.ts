import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Context) {
  const access = await requireUser();
  if (access.error) return access.error;
  const { id } = await context.params;
  const business = await prisma.business.findFirst({
    where: { id, ownerId: access.user.id },
    include: { simulations: { orderBy: { createdAt: "desc" }, include: { scenarios: true } } },
  });
  if (!business) return NextResponse.json({ error: "Emprendimiento no encontrado." }, { status: 404 });
  return NextResponse.json(business);
}

export async function PATCH(request: NextRequest, context: Context) {
  const access = await requireUser();
  if (access.error) return access.error;
  const { id } = await context.params;
  const body = await request.json();
  const current = await prisma.business.findFirst({ where: { id, ownerId: access.user.id }, select: { id: true } });
  if (!current) return NextResponse.json({ error: "Emprendimiento no encontrado." }, { status: 404 });
  const data: { name?: string; description?: string | null; type?: "COMMERCE" | "SERVICE" | "PRODUCTION" | "OTHER" } = {};
  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim().slice(0, 100);
  if (typeof body.description === "string") data.description = body.description.trim().slice(0, 500) || null;
  if (["COMMERCE", "SERVICE", "PRODUCTION", "OTHER"].includes(body.type)) data.type = body.type;
  const updated = await prisma.business.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, context: Context) {
  const access = await requireUser();
  if (access.error) return access.error;
  const { id } = await context.params;
  const result = await prisma.business.deleteMany({ where: { id, ownerId: access.user.id } });
  if (!result.count) return NextResponse.json({ error: "Emprendimiento no encontrado." }, { status: 404 });
  return NextResponse.json({ success: true });
}
