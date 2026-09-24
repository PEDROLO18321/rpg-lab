import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

type PrismaClientSingleton = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClientSingleton };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Guardado sempre, inclusive em produção. A leitura acima é incondicional, então
// sem esta linha cada reavaliação do módulo em produção criava um PrismaClient e um
// pool de conexões novos — desperdício que o Neon sente no plano grátis.
globalForPrisma.prisma = prisma;
