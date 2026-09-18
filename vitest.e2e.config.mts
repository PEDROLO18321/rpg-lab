// Configuração separada para o teste ponta a ponta: ele exige o servidor no ar
// e o banco real, então fica fora do `npm test`.
//
//   npx next start -p 3100
//   npx vitest run --config vitest.e2e.config.mts
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    environment: "node",
    include: ["scripts/**/*.test.ts"],
    setupFiles: ["scripts/e2e.setup.ts"],
    testTimeout: 30_000,
    hookTimeout: 120_000,
    // As etapas são encadeadas (gerar link → vincular → ler → desvincular);
    // rodar em paralelo embaralharia a ordem.
    fileParallelism: false,
    sequence: { concurrent: false },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
