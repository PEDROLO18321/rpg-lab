// ─── Responsividade medida, não afirmada ─────────────────────────────────────
// Abre cada tela do app em cinco larguras e mede três coisas que nenhuma outra
// verificação do projeto enxerga:
//
//   1. rolagem horizontal — o sintoma de que algo não coube;
//   2. elemento vazando da viewport — qual elemento, para o conserto ser dirigido;
//   3. alvo de toque pequeno demais — WCAG 2.5.8 pede 24×24 no nível AA.
//
// O teste não julga estética. Ele responde "cabe?" e "dá para tocar?", que é o
// que dá para medir sem olho humano.

import { test, expect, type Page } from "@playwright/test";
import { LARGURAS } from "../playwright.config";

/** Alvo mínimo do nível AA (WCAG 2.5.8). O nível AAA pede 44. */
const TOQUE_MIN = 24;

/** Rotas públicas: medidas sem login. */
const PUBLICAS = [
  { nome: "landing", url: "/" },
  { nome: "login", url: "/login" },
  { nome: "cadastro", url: "/register" },
];

/** Rotas que exigem sessão. `:id` é trocado pelo personagem do sistema. */
const PRIVADAS = [
  { nome: "laboratorio", url: "/dashboard" },
  { nome: "escolha-de-papel", url: "/dashboard/dnd" },
  { nome: "lista-dnd", url: "/dashboard/dnd/jogador" },
  { nome: "lista-ordem", url: "/dashboard/ordem/jogador" },
  { nome: "ficha-dnd", url: "/dashboard/dnd/:dnd" },
  { nome: "ficha-tormenta", url: "/dashboard/tormenta/:tormenta" },
  { nome: "ficha-ordem", url: "/dashboard/ordem/:ordem" },
  { nome: "ficha-cthulhu", url: "/dashboard/cthulhu/:cthulhu" },
  { nome: "ficha-starwars", url: "/dashboard/starwars/:starwars" },
  { nome: "mestre-dnd", url: "/dashboard/dnd/mestre" },
  { nome: "mestre-ordem", url: "/dashboard/ordem/mestre" },
  { nome: "criar-dnd", url: "/dashboard/dnd/new" },
  { nome: "criar-ordem", url: "/dashboard/ordem/new" },
];

/** Ids criados pelo setup global, lidos do arquivo que ele grava. */
let ids: Record<string, string> = {};

test.beforeAll(async () => {
  const fs = await import("node:fs");
  ids = JSON.parse(fs.readFileSync("tests-responsivo/.ids.json", "utf8"));
});

/**
 * Mede o estouro horizontal e devolve quem vazou. Compara contra o
 * `clientWidth` do documento, que é a largura disponível descontada a barra de
 * rolagem — comparar com `innerWidth` daria falso positivo.
 */
async function vazamentos(page: Page) {
  return page.evaluate(() => {
    const limite = document.documentElement.clientWidth;
    const fora: { tag: string; classe: string; direita: number; texto: string }[] = [];

    for (const el of Array.from(document.body.querySelectorAll<HTMLElement>("*"))) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      // 1px de folga: arredondamento de subpixel não é estouro.
      if (r.right <= limite + 1 && r.left >= -1) continue;
      // Ignora o que está escondido de propósito fora da tela.
      const s = getComputedStyle(el);
      if (s.visibility === "hidden" || s.display === "none" || s.opacity === "0") continue;

      // Recortado por um ancestral? Então não gera rolagem e não é estouro.
      // `getBoundingClientRect` devolve a caixa do elemento sem saber que um
      // pai com `overflow: hidden` a corta — sem esta checagem, todo fundo
      // decorativo vira falso positivo.
      let recortado = false;
      for (let pai = el.parentElement; pai && pai !== document.body; pai = pai.parentElement) {
        const sp = getComputedStyle(pai);
        if (sp.overflow === "visible" && sp.overflowX === "visible") continue;
        if (pai.getBoundingClientRect().right <= limite + 1) { recortado = true; break; }
      }
      if (recortado) continue;
      // Só o elemento mais externo interessa: listar todos os filhos de um
      // container que vazou vira ruído e aponta para o lugar errado.
      if (fora.some((f) => el.closest(`.${CSS.escape(f.classe.split(" ")[0] || "__")}`))) continue;

      fora.push({
        tag: el.tagName.toLowerCase(),
        classe: el.className?.toString().slice(0, 60) ?? "",
        direita: Math.round(r.right),
        texto: (el.textContent ?? "").trim().slice(0, 40),
      });
      if (fora.length >= 5) break;
    }

    return { limite, scrollW: document.documentElement.scrollWidth, fora };
  });
}

/** Botões e links menores que o mínimo tocável. */
async function alvosPequenos(page: Page) {
  return page.evaluate((min) => {
    const achados: { tag: string; w: number; h: number; rotulo: string }[] = [];
    const clicaveis = document.querySelectorAll<HTMLElement>(
      'button, a[href], [role="button"], input[type="checkbox"], input[type="radio"]',
    );
    for (const el of Array.from(clicaveis)) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const s = getComputedStyle(el);
      if (s.visibility === "hidden" || s.display === "none") continue;
      if (r.width >= min && r.height >= min) continue;
      achados.push({
        tag: el.tagName.toLowerCase(),
        w: Math.round(r.width),
        h: Math.round(r.height),
        rotulo: (el.getAttribute("aria-label") ?? el.textContent ?? "").trim().slice(0, 30),
      });
    }
    return achados;
  }, TOQUE_MIN);
}

function relato(fora: Awaited<ReturnType<typeof vazamentos>>) {
  return fora.fora
    .map((f) => `  <${f.tag} class="${f.classe}"> vai até ${f.direita}px (limite ${fora.limite}) — "${f.texto}"`)
    .join("\n");
}

for (const L of LARGURAS) {
  test.describe(`${L.nome}px`, () => {
    test.use({ viewport: { width: L.largura, height: L.altura } });

    for (const rota of PUBLICAS) {
      test(`${rota.nome}: nada vaza da tela`, async ({ page }) => {
        await page.goto(rota.url);
        await page.waitForLoadState("networkidle");
        const v = await vazamentos(page);
        expect(v.fora, `elementos fora da viewport em ${rota.url}:\n${relato(v)}`).toEqual([]);
        expect(v.scrollW, `rolagem horizontal em ${rota.url}`).toBeLessThanOrEqual(v.limite + 1);
      });
    }

    for (const rota of PRIVADAS) {
      test(`${rota.nome}: nada vaza da tela`, async ({ page }) => {
        const url = rota.url.replace(/:(\w+)/, (_, s) => ids[s]);
        await page.goto(url);
        await page.waitForLoadState("networkidle");
        const v = await vazamentos(page);
        expect(v.fora, `elementos fora da viewport em ${url}:\n${relato(v)}`).toEqual([]);
        expect(v.scrollW, `rolagem horizontal em ${url}`).toBeLessThanOrEqual(v.limite + 1);
      });
    }
  });
}

// Alvo de toque só interessa onde se toca: celular e tablet.
for (const L of LARGURAS.filter((l) => l.largura <= 768)) {
  test.describe(`${L.nome}px — toque`, () => {
    test.use({ viewport: { width: L.largura, height: L.altura } });

    test("lista de personagens: todo alvo tem ao menos 24×24", async ({ page }) => {
      await page.goto("/dashboard/dnd/jogador");
      await page.waitForLoadState("networkidle");
      const pequenos = await alvosPequenos(page);
      expect(
        pequenos,
        `alvos abaixo de ${TOQUE_MIN}px:\n${pequenos.map((p) => `  <${p.tag}> ${p.w}×${p.h} — "${p.rotulo}"`).join("\n")}`,
      ).toEqual([]);
    });

    test("ficha de D&D: todo alvo tem ao menos 24×24", async ({ page }) => {
      await page.goto(`/dashboard/dnd/${ids.dnd}`);
      await page.waitForLoadState("networkidle");
      const pequenos = await alvosPequenos(page);
      expect(
        pequenos,
        `alvos abaixo de ${TOQUE_MIN}px:\n${pequenos.map((p) => `  <${p.tag}> ${p.w}×${p.h} — "${p.rotulo}"`).join("\n")}`,
      ).toEqual([]);
    });
  });
}
