// ─── Teste ponta a ponta das áreas de Jogar ─────────────────────────────────
// Confere o que a padronização das cinco áreas põe em risco: a página renderiza
// no servidor sem quebrar, e tudo que a área de Jogar altera sobrevive ao
// recarregar — que é ler de novo do banco.
//
// Fora da suíte normal de propósito: exige servidor no ar e banco real.
//
//   npx next build && AUTH_TRUST_HOST=true npx next start -p 3100
//   npx vitest run scripts/e2e-play.test.ts --config vitest.e2e.config.mts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { CAMPAIGNS } from "@/lib/campaign/registry";

const BASE = "http://localhost:3100";
const SENHA = "senha-de-teste-123";
const MARCA = "e2e-play";

type Sistema = "dnd" | "tormenta" | "cthulhu" | "ordem" | "starwars";
const SISTEMAS: Sistema[] = ["dnd", "tormenta", "cthulhu", "ordem", "starwars"];

/** A rota usa a chave do sistema; o banco usa o slug, e os dois divergem
 *  (`tormenta` na URL, `tormenta20` no banco). O registro é a fonte. */
const slugDoBanco = (s: Sistema) => CAMPAIGNS[s].slug;

/** Sessão HTTP: guarda os cookies entre as chamadas, como um navegador. */
class Sessao {
  private cookies = new Map<string, string>();

  private header() {
    return [...this.cookies].map(([k, v]) => `${k}=${v}`).join("; ");
  }

  async fetch(path: string, init: RequestInit = {}) {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      redirect: "manual",
      headers: { ...(init.headers ?? {}), cookie: this.header() },
    });
    for (const raw of res.headers.getSetCookie?.() ?? []) {
      const [par] = raw.split(";");
      const i = par.indexOf("=");
      this.cookies.set(par.slice(0, i).trim(), par.slice(i + 1).trim());
    }
    return res;
  }

  async patch(path: string, data: unknown) {
    const res = await this.fetch(path, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.status;
  }

  async login(email: string, password: string) {
    const { csrfToken } = await (await this.fetch("/api/auth/csrf")).json();
    await this.fetch("/api/auth/callback/credentials", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ csrfToken, email, password, callbackUrl: BASE }).toString(),
    });
    const sess = await (await this.fetch("/api/auth/session")).json();
    if (!sess?.user?.id) throw new Error(`login falhou para ${email}`);
    return sess.user.id as string;
  }
}

const jogador = new Sessao();
const fichas: Partial<Record<Sistema, string>> = {};

async function systemId(slug: string) {
  const s = await prisma.system.findUnique({ where: { slug }, select: { id: true } });
  if (!s) throw new Error(`sistema ${slug} não existe no banco (rodou o seed?)`);
  return s.id;
}

/** Ficha por sistema, criada direto no banco — o alvo do teste é a área de Jogar. */
async function criaFicha(sistema: Sistema, userId: string) {
  const base = { userId, systemId: await systemId(slugDoBanco(sistema)), name: `Herói ${sistema} ${MARCA}` };

  const sheets: Record<Sistema, object> = {
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
    data: { ...base, ...sheets[sistema] },
    select: { id: true },
  });
  return c.id;
}

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: { contains: MARCA } } });

  const email = `jogador.${MARCA}@example.com`;
  const res = await jogador.fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Jogador Play", email, password: SENHA }),
  });
  expect([200, 201]).toContain(res.status);

  const userId = await jogador.login(email, SENHA);
  for (const s of SISTEMAS) fichas[s] = await criaFicha(s, userId);
}, 120_000);

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { contains: MARCA } } });
  await prisma.$disconnect();
});

describe("a página da ficha renderiza no servidor", () => {
  for (const sistema of SISTEMAS) {
    it(`${sistema}: responde 200 e traz o nome do personagem`, async () => {
      const res = await jogador.fetch(`/dashboard/${sistema}/${fichas[sistema]}`);
      expect(res.status).toBe(200);
      const html = await res.text();
      expect(html).toContain(`Herói ${sistema} ${MARCA}`);
      // O Next escreve a mensagem do erro no HTML quando o componente quebra
      // durante o SSR; um 200 sozinho não provaria que renderizou.
      expect(html).not.toMatch(/Application error|digest&quot;:&quot;\d/);
    });
  }
});

describe("o que a área de Jogar altera sobrevive ao recarregar", () => {
  it("dnd: PV, temporários, condições, inspiração e moedas", async () => {
    const id = fichas.dnd!;
    expect(await jogador.patch(`/api/dnd/characters/${id}/sheet`, {
      hpCurrent: 7, hpTemp: 5, conditions: ["Caído", "Enfeitiçado"],
      inspiration: true, gp: 42, deathSavesSuccess: 2,
    })).toBe(200);

    const s = await prisma.dndSheet.findUnique({ where: { id } });
    expect(s).toMatchObject({
      hpCurrent: 7, hpTemp: 5, inspiration: true, gp: 42, deathSavesSuccess: 2,
    });
    expect(s!.conditions).toEqual(["Caído", "Enfeitiçado"]);
  });

  it("tormenta: PV, PM, temporários, condições e tibares", async () => {
    const id = fichas.tormenta!;
    expect(await jogador.patch(`/api/tormenta/characters/${id}`, {
      pvCurrent: 3, pvTemp: 6, pmCurrent: 1, pmTemp: 2,
      conditions: ["sangrando", "alquebrado"], money: 77,
    })).toBe(200);

    const s = await prisma.tormentaSheet.findUnique({ where: { id } });
    expect(s).toMatchObject({ pvCurrent: 3, pvTemp: 6, pmCurrent: 1, pmTemp: 2, money: 77 });
    expect(s!.conditions).toEqual(["sangrando", "alquebrado"]);
  });

  it("ordem: PV, PE, Sanidade, temporários e condições", async () => {
    const id = fichas.ordem!;
    expect(await jogador.patch(`/api/ordem/characters/${id}`, {
      pvCurrent: 2, pvTemp: 4, peCurrent: 1, peTemp: 3, sanCurrent: 6, sanTemp: 1,
      conditions: ["Sangrando"],
    })).toBe(200);

    const s = await prisma.ordemSheet.findUnique({ where: { id } });
    expect(s).toMatchObject({
      pvCurrent: 2, pvTemp: 4, peCurrent: 1, peTemp: 3, sanCurrent: 6, sanTemp: 1,
    });
    expect(s!.conditions).toEqual(["Sangrando"]);
  });

  it("starwars: PV, PE, PP, temporários e as condições digitadas", async () => {
    const id = fichas.starwars!;
    // O Star Wars não tem catálogo de condição escrito: o bloco grava texto
    // livre no mesmo campo `conditions`. É o que este teste trava.
    expect(await jogador.patch(`/api/starwars/characters/${id}`, {
      pvCurrent: 11, pvTemp: 7, peCurrent: 2, peTemp: 1, ppCurrent: 0, ppTemp: 3,
      conditions: ["Atordoado", "Perna quebrada"], notes: "anotação da mesa",
    })).toBe(200);

    const s = await prisma.starWarsSheet.findUnique({ where: { id } });
    expect(s).toMatchObject({
      pvCurrent: 11, pvTemp: 7, peCurrent: 2, peTemp: 1, ppCurrent: 0, ppTemp: 3,
      notes: "anotação da mesa",
    });
    expect(s!.conditions).toEqual(["Atordoado", "Perna quebrada"]);
  });

  it("cthulhu: PV, Sanidade, PM, Sorte, temporários, estados e insanidade", async () => {
    const id = fichas.cthulhu!;
    const insanity = {
      sessionLoss: 7, status: "temp_insane",
      phobias: ["Aracnofobia (aranhas)"], manias: [], notes: "viu o que não devia",
      states: ["ferimento_grave"],
    };
    expect(await jogador.patch(`/api/cthulhu/characters/${id}`, {
      pvCurrent: 3, pvTemp: 2, sanCurrent: 21, sanTemp: 1,
      pmCurrent: 4, pmTemp: 3, luck: 40, insanityData: insanity,
      spellsData: [{ id: "x1", name: "Devastar", mpCost: 3, sanCost: "1", castingTime: "1 rodada", notes: "" }],
    })).toBe(200);

    const s = await prisma.cthulhuSheet.findUnique({ where: { id } });
    expect(s).toMatchObject({
      pvCurrent: 3, pvTemp: 2, sanCurrent: 21, sanTemp: 1, pmCurrent: 4, pmTemp: 3, luck: 40,
    });
    expect(s!.insanityData).toEqual(insanity);
    expect((s!.spellsData as { name: string }[])[0].name).toBe("Devastar");
  });
});

describe("cthulhu: o modo Editar grava campo a campo depois do rename editMode→mode", () => {
  it("salva identidade, atributos, máximos, perícias, armas, equipamento e antecedentes", async () => {
    const id = fichas.cthulhu!;
    const background = { ideology: "Cético", traits: "Fuma cachimbo", backstory: "Veio de Arkham" };

    expect(await jogador.patch(`/api/cthulhu/characters/${id}`, {
      name: `Editado ${MARCA}`, occupation: "detetive", age: 51, era: "modern",
      atribFor: 41, atribCon: 42, atribTam: 43, atribDes: 44,
      atribApa: 45, atribInt: 46, atribPod: 47, atribEdu: 48,
      pvMax: 16, sanMax: 77, mov: 6,
      skills: { avaliacao: 25, psicologia: 10 },
      skillChecks: ["psicologia"],
      weapons: ["punho", "revolver_38"],
      equipment: "Lanterna\nCaderno",
      background,
    })).toBe(200);

    const s = await prisma.cthulhuSheet.findUnique({
      where: { id }, include: { character: { select: { name: true } } },
    });
    expect(s!.character.name).toBe(`Editado ${MARCA}`);
    expect(s).toMatchObject({
      occupation: "detetive", age: 51, era: "modern",
      atribFor: 41, atribCon: 42, atribTam: 43, atribDes: 44,
      atribApa: 45, atribInt: 46, atribPod: 47, atribEdu: 48,
      pvMax: 16, sanMax: 77, mov: 6,
      equipment: "Lanterna\nCaderno",
    });
    expect(s!.skills).toEqual({ avaliacao: 25, psicologia: 10 });
    expect(s!.skillChecks).toEqual(["psicologia"]);
    expect(s!.weapons).toEqual(["punho", "revolver_38"]);
    expect(s!.background).toEqual(background);
  });

  it("a página continua renderizando com o personagem já editado", async () => {
    const res = await jogador.fetch(`/dashboard/cthulhu/${fichas.cthulhu}`);
    expect(res.status).toBe(200);
    expect(await res.text()).toContain(`Editado ${MARCA}`);
  });
});
