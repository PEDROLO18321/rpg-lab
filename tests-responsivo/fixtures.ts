// ─── Fixtures do teste de responsividade ─────────────────────────────────────
// Cria um usuário e um personagem por sistema, grava os ids num arquivo que o
// spec lê, e limpa tudo no fim. Mesmo padrão do `scripts/e2e-play.test.ts` — a
// ficha nasce direto no banco porque o alvo aqui é o layout, não a criação.
//
// Roda com `tsx` antes do Playwright, não como globalSetup dele: o carregador
// de TS do Playwright compila para CommonJS, e o cliente Prisma gerado usa
// `import.meta`. O `tsx` lida com ESM — é o mesmo motivo de o e2e já usá-lo.

import { writeFileSync, rmSync } from "node:fs";
import { prisma } from "@/lib/prisma";
import { CAMPAIGNS } from "@/lib/campaign/registry";

const BASE = "http://localhost:3100";
const SENHA = "senha-de-teste-123";
const MARCA = "pw-responsivo";
const EMAIL = `${MARCA}@example.com`;
const ARQUIVO = "tests-responsivo/.ids.json";

type Sistema = "dnd" | "tormenta" | "cthulhu" | "ordem" | "starwars";
const SISTEMAS: Sistema[] = ["dnd", "tormenta", "cthulhu", "ordem", "starwars"];

async function systemId(slug: string) {
  const s = await prisma.system.findUnique({ where: { slug }, select: { id: true } });
  if (!s) throw new Error(`sistema ${slug} não existe no banco (rodou o seed?)`);
  return s.id;
}

async function criaFicha(sistema: Sistema, userId: string) {
  const base = {
    userId,
    systemId: await systemId(CAMPAIGNS[sistema].slug),
    name: `Herói ${sistema} ${MARCA}`,
  };

  const fichas: Record<Sistema, object> = {
    dnd: {
      dndSheet: {
        create: {
          race: "anao", background: "Soldado", alignment: "Leal e Bom", level: 3, xp: 900,
          str: 16, dex: 12, con: 14, int: 8, wis: 10, cha: 13,
          hpMax: 28, hpCurrent: 22, hpTemp: 0, hitDice: "3d10", armorClass: 18,
          conditions: [],
          classes: { create: [{ className: "guerreiro", level: 3 }] },
          skills: { create: [{ skillName: "Atletismo", proficient: true }] },
        },
      },
    },
    tormenta: {
      tormentaSheet: {
        create: {
          race: "humano", className: "guerreiro", origin: "batedor", level: 2,
          forca: 16, des: 14, con: 13, int: 10, sab: 12, car: 8,
          pvMax: 24, pvCurrent: 20, pmMax: 6, pmCurrent: 4, defense: 17,
          skills: { atletismo: true }, conditions: [],
        },
      },
    },
    cthulhu: {
      cthulhuSheet: {
        create: {
          occupation: "antiquario", era: "1920s", age: 42,
          atribFor: 55, atribCon: 60, atribTam: 65, atribDes: 50,
          atribApa: 45, atribInt: 70, atribPod: 55, atribEdu: 80,
          pvMax: 12, pvCurrent: 9, sanMax: 99, sanCurrent: 48, luck: 55, mov: 8,
          skills: { avaliacao: 60 },
        },
      },
    },
    ordem: {
      ordemSheet: {
        create: {
          origin: "academico", className: "ocultista", nex: 25, patente: "operador",
          agi: 2, forca: 1, int: 3, pre: 2, vig: 1,
          pvMax: 18, pvCurrent: 12, peMax: 8, peCurrent: 5, sanMax: 20, sanCurrent: 14,
          skills: { ocultismo: "veterano" }, conditions: [],
        },
      },
    },
    starwars: {
      starWarsSheet: {
        create: {
          species: "cathar", planet: "tatooine", path: "luz", level: 3,
          classes: { soldado: 3 },
          agi: 3, int: 1, forca: 2, vig: 2, pre: 1, sen: 1,
          pvMax: 30, pvCurrent: 30, peMax: 4, peCurrent: 4, ppMax: 2, ppCurrent: 1,
          skills: { atletismo: "treinado" },
        },
      },
    },
  };

  const c = await prisma.character.create({
    data: { ...base, ...fichas[sistema] },
    select: { id: true },
  });
  return c.id;
}

async function main() {
  await prisma.user.deleteMany({ where: { email: { contains: MARCA } } });

  const res = await fetch(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Teste Responsivo", email: EMAIL, password: SENHA }),
  });
  if (![200, 201].includes(res.status)) {
    throw new Error(`cadastro falhou (${res.status}) — o servidor está no ar em ${BASE}?`);
  }

  const user = await prisma.user.findUnique({ where: { email: EMAIL }, select: { id: true } });
  if (!user) throw new Error("usuário não apareceu no banco depois do cadastro");

  const ids: Record<string, string> = {};
  for (const s of SISTEMAS) ids[s] = await criaFicha(s, user.id);

  writeFileSync(ARQUIVO, JSON.stringify(ids, null, 2));
  await prisma.$disconnect();
}

async function limpa() {
  await prisma.user.deleteMany({ where: { email: { contains: MARCA } } });
  await prisma.$disconnect();
  try {
    rmSync(ARQUIVO);
  } catch {
    // Já não existe — nada a limpar.
  }
}

// `--limpar` desfaz o que a execução anterior criou.
if (process.argv.includes("--limpar")) {
  limpa();
} else {
  main();
}
