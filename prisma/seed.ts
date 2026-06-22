import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma  = new PrismaClient({ adapter });

async function main() {
  await prisma.system.upsert({
    where:  { slug: "dnd5e" },
    update: {},
    create: { slug: "dnd5e", name: "Dungeons & Dragons", version: "5ª Edição", active: true },
  });

  await prisma.system.upsert({
    where:  { slug: "tormenta20" },
    update: {},
    create: { slug: "tormenta20", name: "Tormenta 20", version: "Edição 2020", active: false },
  });

  await prisma.system.upsert({
    where:  { slug: "cthulhu7" },
    update: {},
    create: { slug: "cthulhu7", name: "Call of Cthulhu", version: "7ª Edição", active: true },
  });

  await prisma.system.upsert({
    where:  { slug: "ordem" },
    update: { active: true, version: "1.3" },
    create: { slug: "ordem", name: "Ordem Paranormal", version: "1.3", active: true },
  });

  console.log("Sistemas inseridos com sucesso.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
