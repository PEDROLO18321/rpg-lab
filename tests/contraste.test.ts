// ─── Contraste de cor (WCAG 2.1, critério 1.4.3 nível AA) ────────────────────
// Lint de acessibilidade não enxerga cor: ele lê markup. Contraste só se verifica
// calculando. Este teste lê os tokens do próprio globals.css — não uma cópia —
// e recusa qualquer combinação abaixo do exigido. Se alguém escurecer um token,
// o teste quebra antes de chegar ao usuário.
//
// Limiares da WCAG 2.1 AA:
//   texto normal (< 18,66px em negrito ou < 24px)  → 4,5:1
//   texto grande e componentes de interface        → 3,0:1
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const CSS = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf-8");

/** Lê o valor hexadecimal de um token do bloco `:root` de globals.css. */
function token(name: string): string {
  const m = CSS.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`token ${name} não encontrado em globals.css`);
  return m[1];
}

/** Canal sRGB → luminância linear (WCAG, fórmula de luminância relativa). */
function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Fundos em que o texto do app efetivamente aparece. */
const FUNDOS = {
  "--bg": token("--bg"),
  "--surface": token("--surface"),
  "--surface-2": token("--surface-2"),
  "--surface-3": token("--surface-3"),
};

const TEXTOS = {
  "--text": token("--text"),
  "--text-muted": token("--text-muted"),
  "--text-subtle": token("--text-subtle"),
};

describe("contraste — texto sobre cada fundo (AA, 4.5:1)", () => {
  for (const [nomeFg, fg] of Object.entries(TEXTOS)) {
    for (const [nomeBg, bg] of Object.entries(FUNDOS)) {
      it(`${nomeFg} sobre ${nomeBg}`, () => {
        const r = contrast(fg, bg);
        expect(r, `${fg} sobre ${bg} = ${r.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});

describe("contraste — acentos usados como texto (AA, 4.5:1)", () => {
  const ACENTOS = {
    "--accent (dourado D&D)": token("--accent"),
    "--accent-light": token("--accent-light"),
    "--green (status)": token("--green"),
  };
  for (const [nome, fg] of Object.entries(ACENTOS)) {
    for (const [nomeBg, bg] of Object.entries(FUNDOS)) {
      it(`${nome} sobre ${nomeBg}`, () => {
        const r = contrast(fg, bg);
        expect(r, `${fg} sobre ${bg} = ${r.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});

describe("contraste — acentos de cada sistema", () => {
  // Cada sistema tinge sua área com uma cor própria. As que aparecem como texto
  // precisam do mesmo 4.5:1; as que são só borda ou preenchimento de componente
  // respondem ao limiar de interface, 3:1 (WCAG 1.4.11).
  const COMO_TEXTO = {
    "Tormenta 20 — vermelho claro": "#d56c6c",
    "Cthulhu — verde musgo claro": "#a3b86c",
    "Star Wars — azul claro": "#8fc4f5",
    "Ordem Paranormal — branco": "#ffffff",
  };
  const COMO_INTERFACE = {
    "Star Wars — azul médio (borda)": "#3b82c4",
  };

  // O vermelho escuro do Tormenta é preenchimento de marca (gradiente de botão,
  // tinta do avatar), sempre sob texto branco — nunca é ele o texto. O que
  // precisa passar, então, é o branco sobre ele.
  const SOB_TEXTO_BRANCO = { "Tormenta 20 — vermelho escuro": "#a01818" };
  for (const [nome, bg] of Object.entries(SOB_TEXTO_BRANCO)) {
    it(`${nome} comporta texto branco`, () => {
      const r = contrast("#ffffff", bg);
      expect(r, `branco sobre ${bg} = ${r.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
    });
  }

  for (const [nome, fg] of Object.entries(COMO_TEXTO)) {
    it(`${nome} legível no fundo mais claro`, () => {
      const r = contrast(fg, FUNDOS["--surface-3"]);
      expect(r, `${fg} = ${r.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
    });
  }

  for (const [nome, fg] of Object.entries(COMO_INTERFACE)) {
    it(`${nome} distinguível como componente`, () => {
      const r = contrast(fg, FUNDOS["--surface-3"]);
      expect(r, `${fg} = ${r.toFixed(2)}:1`).toBeGreaterThanOrEqual(3);
    });
  }
});

describe("contraste — link de pular para o conteúdo", () => {
  it("o texto do skip link contrasta com o dourado de fundo", () => {
    const r = contrast("#06090f", token("--accent"));
    expect(r).toBeGreaterThanOrEqual(4.5);
  });
});

describe("regressão — os tokens continuam distinguíveis entre si", () => {
  it("os três níveis de texto formam uma hierarquia visível", () => {
    // Sem isso, clarear --text-subtle por acessibilidade acabaria fundindo-o
    // com --text-muted e a hierarquia da interface sumiria.
    const passo1 = contrast(TEXTOS["--text"], TEXTOS["--text-muted"]);
    const passo2 = contrast(TEXTOS["--text-muted"], TEXTOS["--text-subtle"]);
    expect(passo1).toBeGreaterThan(1.2);
    expect(passo2).toBeGreaterThan(1.1);
  });
});
