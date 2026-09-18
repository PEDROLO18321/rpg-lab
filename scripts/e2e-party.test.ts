// ─── Teste ponta a ponta do vínculo de ficha à campanha ──────────────────────
// Roda contra o servidor de produção real (next start) e o banco real. Fora da
// suíte normal de propósito: exige servidor no ar.
//
//   npx next start -p 3100
//   npx vitest run scripts/e2e-party.test.ts
//
// Cria dois usuários (jogador e mestre), uma ficha por sistema, e percorre o
// fluxo inteiro por HTTP: gerar link, abrir link como mestre, vincular, ler a
// ficha na aba do mestre, recusar sistema trocado, regerar e desvincular.
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { CAMPAIGNS, type SystemKey } from "@/lib/campaign/registry";

const BASE = "http://localhost:3100";
const SENHA = "senha-de-teste-123";
const MARCA = "e2e-party";

const JOGADOR = { name: "Jogador E2E", email: `jogador.${MARCA}@example.com`, password: SENHA };
const MESTRE = { name: "Mestre E2E", email: `mestre.${MARCA}@example.com`, password: SENHA };

const SISTEMAS = ["dnd", "tormenta", "cthulhu", "ordem", "starwars"] as const;

/** Sessão HTTP: guarda os cookies entre as chamadas, como um navegador. */
class Sessao {
  private cookies = new Map<string, string>();

  private header(): string {
    return [...this.cookies].map(([k, v]) => `${k}=${v}`).join("; ");
  }

  private absorve(res: Response) {
    for (const raw of res.headers.getSetCookie?.() ?? []) {
      const [pair] = raw.split(";");
      const i = pair.indexOf("=");
      this.cookies.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim());
    }
  }

  async fetch(path: string, init: RequestInit = {}): Promise<Response> {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      redirect: "manual",
      headers: { ...(init.headers ?? {}), cookie: this.header() },
    });
    this.absorve(res);
    return res;
  }

  async json<T = any>(path: string, init: RequestInit = {}): Promise<{ status: number; body: T }> {
    const res = await this.fetch(path, init);
    const body = await res.json().catch(() => ({} as T));
    return { status: res.status, body: body as T };
  }

  async post<T = any>(path: string, data: unknown) {
    return this.json<T>(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  /** Login pelo provider de credenciais do NextAuth, com CSRF como no navegador. */
  async login(email: string, password: string) {
    const csrfRes = await this.fetch("/api/auth/csrf");
    const { csrfToken } = await csrfRes.json();

    const form = new URLSearchParams({ csrfToken, email, password, callbackUrl: BASE });
    await this.fetch("/api/auth/callback/credentials", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });

    const { body } = await this.json<{ user?: { id: string } }>("/api/auth/session");
    if (!body?.user?.id) throw new Error(`login falhou para ${email}`);
    return body.user.id;
  }
}

const jogador = new Sessao();
const mestre = new Sessao();
const anonimo = new Sessao();

let jogadorId = "";
/** systemKey → id do Character criado para o jogador. */
const fichas: Partial<Record<SystemKey, string>> = {};
/** systemKey → id da campanha do mestre. */
const campanhas: Partial<Record<SystemKey, string>> = {};
/** systemKey → token de compartilhamento da ficha. */
const tokens: Partial<Record<SystemKey, string>> = {};

async function systemId(slug: string) {
  const s = await prisma.system.findUnique({ where: { slug }, select: { id: true } });
  if (!s) throw new Error(`sistema ${slug} não existe no banco (rodou o seed?)`);
  return s.id;
}

/** Ficha realista por sistema, criada direto no banco — o alvo do teste é o vínculo. */
async function criaFicha(system: SystemKey, userId: string): Promise<string> {
  const sid = await systemId(CAMPAIGNS[system].slug);
  const base = { userId, systemId: sid, name: `Herói ${system} ${MARCA}` };

  const sheets: Record<SystemKey, any> = {
    dnd: {
      dndSheet: {
        create: {
          race: "anao", background: "Soldado", alignment: "Leal e Bom", level: 3, xp: 900,
          str: 16, dex: 12, con: 14, int: 8, wis: 10, cha: 13,
          hpMax: 28, hpCurrent: 22, hpTemp: 4, hitDice: "3d10", armorClass: 18,
          conditions: ["Envenenado"],
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
          pvMax: 12, pvCurrent: 9, sanMax: 99, sanCurrent: 48, luck: 55,
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
          skills: { ocultismo: "veterano" }, conditions: ["Sangrando"],
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
    data: { ...base, ...sheets[system] },
    select: { id: true },
  });
  return c.id;
}

async function limpa() {
  await prisma.user.deleteMany({ where: { email: { contains: MARCA } } });
}

beforeAll(async () => {
  await limpa();

  for (const u of [JOGADOR, MESTRE]) {
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(u),
    });
    if (![200, 201].includes(res.status)) {
      throw new Error(`cadastro de ${u.email} falhou: ${res.status} ${await res.text()}`);
    }
  }

  jogadorId = await jogador.login(JOGADOR.email, JOGADOR.password);
  await mestre.login(MESTRE.email, MESTRE.password);

  for (const s of SISTEMAS) {
    fichas[s] = await criaFicha(s, jogadorId);
  }
}, 120_000);

afterAll(async () => {
  await limpa();
  await prisma.$disconnect();
});

describe("1 · o jogador gera o link da própria ficha", () => {
  for (const s of SISTEMAS) {
    it(`${s}: POST /api/characters/:id/share devolve um token`, async () => {
      const { status, body } = await jogador.post(`/api/characters/${fichas[s]}/share`, {});
      expect(status).toBe(200);
      expect(body.enabled).toBe(true);
      expect(typeof body.token).toBe("string");
      tokens[s] = body.token;
    });
  }

  it("um estranho não consegue gerar link da ficha alheia", async () => {
    const { status } = await mestre.post(`/api/characters/${fichas.dnd}/share`, {});
    expect(status).toBe(403);
  });

  it("sem sessão, gerar link é recusado", async () => {
    const { status } = await anonimo.post(`/api/characters/${fichas.dnd}/share`, {});
    expect(status).toBe(401);
  });
});

describe("2 · o mestre abre o link", () => {
  it("sem sessão, o link não revela nada", async () => {
    const { status } = await anonimo.json(`/api/share/${tokens.dnd}`);
    expect(status).toBe(401);
  });

  it("token inexistente devolve 404", async () => {
    const { status } = await mestre.json("/api/share/token-que-nao-existe");
    expect(status).toBe(404);
  });

  for (const s of SISTEMAS) {
    it(`${s}: o link identifica ficha, dono e sistema`, async () => {
      const { status, body } = await mestre.json(`/api/share/${tokens[s]}`);
      expect(status).toBe(200);
      expect(body.system).toBe(s);
      expect(body.systemLabel).toBe(CAMPAIGNS[s].label);
      expect(body.character.name).toContain(s);
      expect(body.character.ownerName).toBe(JOGADOR.name);
      // O mestre ainda não tem campanha nenhuma deste sistema.
      expect(body.campaigns).toEqual([]);
    });
  }
});

describe("3 · o mestre cria campanha e vincula", () => {
  for (const s of SISTEMAS) {
    it(`${s}: cria a campanha`, async () => {
      const { status, body } = await mestre.post(`/api/campaigns/${s}`, {
        name: `Mesa ${s} ${MARCA}`,
      });
      expect(status === 200 || status === 201).toBe(true);
      expect(typeof body.id).toBe("string");
      campanhas[s] = body.id;
    });
  }

  for (const s of SISTEMAS) {
    it(`${s}: o link agora oferece a campanha do mesmo sistema`, async () => {
      const { body } = await mestre.json(`/api/share/${tokens[s]}`);
      expect(body.campaigns.map((c: any) => c.id)).toContain(campanhas[s]);
      expect(body.campaigns.every((c: any) => c.linked === false)).toBe(true);
    });
  }

  it("vincular a uma campanha de OUTRO sistema é recusado com a mensagem da regra", async () => {
    const { status, body } = await mestre.post(`/api/share/${tokens.dnd}`, {
      campaignId: campanhas.tormenta,
    });
    expect(status).toBe(409);
    expect(body.error).toBe("Esta ficha pertence a outro sistema e não pode ser visualizada aqui.");
  });

  it("vincular a campanha que não é sua é recusado", async () => {
    const { status } = await jogador.post(`/api/share/${tokens.dnd}`, {
      campaignId: campanhas.dnd,
    });
    expect(status).toBe(404);
  });

  for (const s of SISTEMAS) {
    it(`${s}: vincula a ficha à campanha`, async () => {
      const { status, body } = await mestre.post(`/api/share/${tokens[s]}`, {
        campaignId: campanhas[s],
      });
      expect(status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.system).toBe(s);
    });
  }

  it("abrir o mesmo link de novo não duplica a ficha na campanha", async () => {
    await mestre.post(`/api/share/${tokens.dnd}`, { campaignId: campanhas.dnd });
    const { body } = await mestre.json(`/api/campaigns/dnd/${campanhas.dnd}/party`);
    expect(body.party).toHaveLength(1);
  });
});

describe("4 · a ficha aparece na aba do mestre, legível e completa", () => {
  const esperado: Record<SystemKey, { vitais: string[]; trechoNoSubtitulo: string; pericia: string }> = {
    dnd: { vitais: ["PV"], trechoNoSubtitulo: "Anão", pericia: "Atletismo" },
    tormenta: { vitais: ["PV", "PM"], trechoNoSubtitulo: "Humano", pericia: "Atletismo" },
    cthulhu: { vitais: ["PV", "Sanidade"], trechoNoSubtitulo: "Antiquário", pericia: "Avaliação" },
    ordem: { vitais: ["PV", "PE", "Sanidade"], trechoNoSubtitulo: "Ocultista", pericia: "Ocultismo" },
    starwars: { vitais: ["PV", "PE", "PP"], trechoNoSubtitulo: "Cathar", pericia: "Atletismo" },
  };

  for (const s of SISTEMAS) {
    it(`${s}: vitais, atributos e perícias chegam prontos`, async () => {
      const { status, body } = await mestre.json(`/api/campaigns/${s}/${campanhas[s]}/party`);
      expect(status).toBe(200);
      expect(body.party).toHaveLength(1);

      const ficha = body.party[0];
      expect(ficha.name).toContain(s);
      expect(ficha.ownerName).toBe(JOGADOR.name);
      expect(ficha.subtitle).toContain(esperado[s].trechoNoSubtitulo);
      expect(ficha.vitals.map((v: any) => v.label)).toEqual(esperado[s].vitais);
      expect(ficha.attrs.length).toBeGreaterThan(0);
      expect(ficha.skills.map((k: any) => k.name)).toContain(esperado[s].pericia);
      expect(typeof ficha.linkedAt).toBe("string");
    });
  }

  it("D&D: PV atual, máximo e temporário vêm certos", async () => {
    const { body } = await mestre.json(`/api/campaigns/dnd/${campanhas.dnd}/party`);
    expect(body.party[0].vitals[0]).toEqual({ label: "PV", current: 22, max: 28, temp: 4 });
  });

  it("Ordem: a condição ativa chega ao mestre", async () => {
    const { body } = await mestre.json(`/api/campaigns/ordem/${campanhas.ordem}/party`);
    expect(body.party[0].conditions).toContain("Sangrando");
  });

  it("o jogador não enxerga a aba de fichas da campanha do mestre", async () => {
    const { status } = await jogador.json(`/api/campaigns/dnd/${campanhas.dnd}/party`);
    expect(status).toBe(404);
  });

  it("sem sessão, a aba não responde", async () => {
    const { status } = await anonimo.json(`/api/campaigns/dnd/${campanhas.dnd}/party`);
    expect(status).toBe(401);
  });
});

describe("5 · o jogador regera o link", () => {
  it("o token muda e o anterior deixa de resolver", async () => {
    const antigo = tokens.cthulhu!;
    const { body } = await jogador.post(`/api/characters/${fichas.cthulhu}/share`, { regenerate: true });
    expect(body.token).not.toBe(antigo);

    const { status } = await mestre.json(`/api/share/${antigo}`);
    expect(status).toBe(404);

    tokens.cthulhu = body.token;
  });

  it("o vínculo já criado continua valendo — o link concede, não sustenta", async () => {
    const { body } = await mestre.json(`/api/campaigns/cthulhu/${campanhas.cthulhu}/party`);
    expect(body.party).toHaveLength(1);
  });

  it("desativar o compartilhamento derruba o link novo também", async () => {
    const { status } = await jogador.fetch(`/api/characters/${fichas.cthulhu}/share`, { method: "DELETE" });
    expect(status).toBe(200);

    const r = await mestre.json(`/api/share/${tokens.cthulhu}`);
    expect(r.status).toBe(404);
  });

  it("o jogador vê quantas campanhas acompanham sua ficha", async () => {
    const { body } = await jogador.json(`/api/characters/${fichas.dnd}/share`);
    expect(body.linkedCampaigns).toBe(1);
  });
});

describe("6 · o mestre remove a ficha da campanha", () => {
  it("o vínculo some da aba", async () => {
    const { status } = await mestre.fetch(
      `/api/campaigns/starwars/${campanhas.starwars}/party/${fichas.starwars}`,
      { method: "DELETE" },
    );
    expect(status).toBe(200);

    const { body } = await mestre.json(`/api/campaigns/starwars/${campanhas.starwars}/party`);
    expect(body.party).toEqual([]);
  });

  it("a ficha do jogador continua intacta no banco", async () => {
    const ficha = await prisma.character.findUnique({
      where: { id: fichas.starwars },
      include: { starWarsSheet: true },
    });
    expect(ficha).not.toBeNull();
    expect(ficha!.starWarsSheet).not.toBeNull();
    expect(ficha!.starWarsSheet!.pvMax).toBe(30);
  });

  it("remover de novo devolve 404", async () => {
    const { status } = await mestre.fetch(
      `/api/campaigns/starwars/${campanhas.starwars}/party/${fichas.starwars}`,
      { method: "DELETE" },
    );
    expect(status).toBe(404);
  });

  it("o jogador não consegue remover vínculo de campanha alheia", async () => {
    const { status } = await jogador.fetch(
      `/api/campaigns/dnd/${campanhas.dnd}/party/${fichas.dnd}`,
      { method: "DELETE" },
    );
    expect(status).toBe(404);
  });
});

describe("7 · a página do link responde", () => {
  it("sem sessão, /s/:token manda para o login guardando o destino", async () => {
    const res = await anonimo.fetch(`/s/${tokens.dnd}`);
    expect([302, 307]).toContain(res.status);
    expect(decodeURIComponent(res.headers.get("location") ?? "")).toContain(`/s/${tokens.dnd}`);
  });

  it("com sessão, a página renderiza", async () => {
    const res = await mestre.fetch(`/s/${tokens.dnd}`);
    expect(res.status).toBe(200);
  });
});
