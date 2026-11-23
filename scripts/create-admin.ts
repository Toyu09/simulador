import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { hash } from "bcryptjs";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

function askHidden(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!stdin.isTTY || typeof stdin.setRawMode !== "function") {
      reject(new Error("La terminal actual no permite ocultar la contraseña. Ejecuta el script desde una terminal interactiva."));
      return;
    }

    stdout.write(prompt);
    let value = "";

    const cleanup = () => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener("data", onData);
      stdout.write("\n");
    };

    const onData = (chunk: Buffer) => {
      for (const char of chunk.toString("utf8")) {
        if (char === "\u0003") {
          cleanup();
          reject(new Error("Operación cancelada."));
          return;
        }
        if (char === "\r" || char === "\n") {
          cleanup();
          resolve(value);
          return;
        }
        if (char === "\u007f" || char === "\b") {
          value = value.slice(0, -1);
          continue;
        }
        if (char >= " ") value += char;
      }
    };

    stdin.setRawMode(true);
    stdin.resume();
    stdin.on("data", onData);
  });
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL no está definida en el archivo .env.");
  }

  const rl = createInterface({ input: stdin, output: stdout });
  let name = "";
  let email = "";
  let password = "";

  try {
    stdout.write("\n=== Crear administrador inicial ===\n");
    name = (await rl.question("Nombre: ")).trim();
    email = (await rl.question("Correo: ")).trim().toLowerCase();
  } finally {
    rl.close();
  }

  if (!name) throw new Error("El nombre es obligatorio.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("El correo no tiene un formato válido.");
  }

  password = await askHidden("Contraseña (mínimo 12 caracteres, no se mostrará): ");
  if (password.length < 12) {
    throw new Error("La contraseña debe tener al menos 12 caracteres.");
  }

  const adapter = new PrismaNeon({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error(
        "Ya existe un usuario con ese correo. No se modificó su cuenta ni su rol."
      );
    }

    const passwordHash = await hash(password, 12);
    const admin = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "ADMIN",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    stdout.write("\nAdministrador creado correctamente:\n");
    stdout.write(`Nombre: ${admin.name}\n`);
    stdout.write(`Correo: ${admin.email}\n`);
    stdout.write(`Rol: ${admin.role}\n`);
    stdout.write(`Activo: ${admin.isActive ? "Sí" : "No"}\n`);
    stdout.write(`ID: ${admin.id}\n`);
  } finally {
    password = "";
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Error desconocido.";
  console.error(`\nNo se pudo crear el administrador: ${message}`);
  process.exitCode = 1;
});
