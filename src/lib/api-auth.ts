import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) return { error: NextResponse.json({ error: "No autenticado." }, { status: 401 }) };
  if (session.user.role !== "USER") return { error: NextResponse.json({ error: "Acceso no autorizado." }, { status: 403 }) };
  return { user: session.user };
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return { error: NextResponse.json({ error: "No autenticado." }, { status: 401 }) };
  if (session.user.role !== "ADMIN") return { error: NextResponse.json({ error: "Acceso no autorizado." }, { status: 403 }) };
  return { user: session.user };
}
