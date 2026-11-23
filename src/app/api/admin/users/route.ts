import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET() {
  const access = await requireAdmin();
  if (access.error) return access.error;
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, _count: { select: { businesses: true } } },
  });
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const access = await requireAdmin();
  if (access.error) return access.error;
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!name || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 12) {
    return NextResponse.json({ error: "Verifica nombre, correo y contraseña (mínimo 12 caracteres)." }, { status: 400 });
  }
  const exists = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (exists) return NextResponse.json({ error: "Ya existe una cuenta con ese correo." }, { status: 409 });
  const user = await prisma.user.create({
    data: { name, email, passwordHash: await hash(password, 12), role: "USER" },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  });
  return NextResponse.json(user, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const access = await requireAdmin();
  if (access.error) return access.error;
  const body = await request.json();
  if (typeof body.id !== "string" || typeof body.isActive !== "boolean") {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  const target = await prisma.user.findUnique({ where: { id: body.id } });
  if (!target) return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  if (target.role === "ADMIN") return NextResponse.json({ error: "No se puede modificar el estado de una cuenta administrativa desde este panel." }, { status: 400 });
  const updated = await prisma.user.update({
    where: { id: body.id },
    data: { isActive: body.isActive },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
  return NextResponse.json(updated);
}
