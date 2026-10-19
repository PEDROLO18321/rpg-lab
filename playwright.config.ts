// ─── Playwright: a única verificação do projeto que de fato desenha ──────────
// Os 283 testes de regra leem funções puras; os 70 do e2e falam HTTP e conferem
// HTML. Nenhum dos dois enxerga layout. Este abre a página num navegador de
// verdade, em larguras reais, e mede.
//
// Fora do `npm test` pela mesma razão do e2e: exige servidor no ar e banco.
//
//   npx next build && AUTH_TRUST_HOST=true npx next start -p 3100
//   npm run test:responsivo

import { defineConfig, devices } from "@playwright/test";

/** As larguras que importam, e por quê. */
export const LARGURAS = [
  { nome: "320", largura: 320, altura: 720 },   // menor celular ainda em uso
  { nome: "375", largura: 375, altura: 812 },   // iPhone padrão
  { nome: "768", largura: 768, altura: 1024 },  // iPad retrato — a faixa que não tinha regra nenhuma
  { nome: "1024", largura: 1024, altura: 768 }, // iPad paisagem / notebook pequeno
  { nome: "1440", largura: 1440, altura: 900 }, // desktop
] as const;

export default defineConfig({
  testDir: "./tests-responsivo",
  // Os testes só abrem páginas e medem — não escrevem no banco —, então podem
  // correr em paralelo. As fixtures são criadas antes, por `tsx`.
  workers: 4,
  fullyParallel: true,
  reporter: [["list"], ["json", { outputFile: "tests-responsivo/.resultado.json" }]],
  timeout: 60_000,
  projects: [
    { name: "login", testMatch: /auth\.setup\.ts/ },
    {
      name: "medidas",
      testMatch: /responsivo\.spec\.ts/,
      dependencies: ["login"],
      use: { storageState: "tests-responsivo/.sessao.json" },
    },
  ],
  use: {
    baseURL: "http://localhost:3100",
    ...devices["Desktop Chrome"],
    // Print só do que falhou: o diretório não vira um despejo de centenas de
    // imagens a cada rodada.
    screenshot: "only-on-failure",
  },
});
