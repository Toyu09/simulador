import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";

export async function GET() {
  const access = await requireUser();
  if (access.error) return access.error;
  const businesses = await prisma.business.findMany({
    where: { ownerId: access.user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { simulations: true } } },
  });
  return NextResponse.json(businesses);
}

export async function POST(request: NextRequest) {
  const access = await requireUser();
  if (access.error) return access.error;
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const allowed = ["COMMERCE", "SERVICE", "PRODUCTION", "OTHER"];
  const type = allowed.includes(body.type) ? body.type : "OTHER";
  if (!name || name.length > 100 || description.length > 500) {
    return NextResponse.json({ error: "El nombre es obligatorio (máximo 100 caracteres) y la descripción admite 500." }, { status: 400 });
  }
  const business = await prisma.business.create({
    data: { ownerId: access.user.id, name, description: description || null, type },
  });
  return NextResponse.json(business, { status: 201 });
}
