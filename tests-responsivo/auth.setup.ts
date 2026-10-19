// Faz login uma vez e guarda os cookies em disco. Sem isto, cada um dos ~80
// testes repetia o fluxo inteiro de autenticação — a suíte levava 43 minutos,
// quase toda em login.

import { test as setup, expect } from "@playwright/test";

const SENHA = "senha-de-teste-123";
const EMAIL = "pw-responsivo@example.com";
export const SESSAO = "tests-responsivo/.sessao.json";

setup("autentica uma vez", async ({ page }) => {
  // `callbackUrl` porque, sem ele, o login devolve para `/` (a landing) e a
  // espera por /dashboard nunca casaria.
  await page.goto("/login?callbackUrl=%2Fdashboard");
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', SENHA);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
  await expect(page).toHaveURL(/\/dashboard/);
  await page.context().storageState({ path: SESSAO });
});
