import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // `core-web-vitals` já registra o plugin jsx-a11y, mas liga só um punhado de
  // regras. Aqui entram as demais do conjunto recomendado — rótulo em controle,
  // alternativa textual, papel ARIA válido, elemento interativo alcançável por
  // teclado —, que é o que a WCAG 2.1 AA exige do markup. Só as regras: redeclarar
  // o plugin quebra a configuração.
  { rules: jsxA11y.flatConfigs.recommended.rules },
  {
    rules: {
      // `no-autofocus` mira o autofoco no carregamento da página, que rouba o
      // contexto de quem usa leitor de tela. Aqui não é esse o caso: todos os
      // 25 usos estão em formulários e diálogos que só são montados depois de um
      // clique explícito ("+ Nova campanha", "Adicionar Item", "⚡ Iniciativa").
      // Levar o foco ao primeiro campo do que acabou de abrir é justamente o que
      // a WCAG 2.4.3 (Ordem de Foco) pede — sem isso o usuário de teclado teria
      // de procurar o campo novo com Tab. Verificado caso a caso.
      "jsx-a11y/no-autofocus": "off",
    },
  },
  {
    rules: {
      // Convenção: prefixo `_` marca parâmetro/variável intencionalmente não usado.
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
