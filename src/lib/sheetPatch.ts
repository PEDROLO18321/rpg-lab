// ─── Guardas de escrita do PATCH de ficha ────────────────────────────────────
// A importação de ficha sempre validou faixa e tamanho (`intIn`, `LIMITS`). O
// PATCH — que é o caminho que o usuário usa de verdade, toda vez que edita —
// só conferia `Number.isFinite`. Na prática aceitava `level: 999999`,
// `pvMax: 1e9`, nome de qualquer tamanho e, pior, um `portraitUrl` de qualquer
// tamanho: o redimensionamento para 400px é feito no navegador, e nada no
// servidor impedia um data-URL de 50 MB ir direto para a coluna.
//
// Aqui ficam as mesmas guardas, na forma que uma rota consome.

import { ImportError, LIMITS } from "@/lib/characterTransfer";

/**
 * Número dentro de uma faixa, ou `undefined` quando o campo não veio no corpo.
 * Fora da faixa **recusa** em vez de grampear: grampear calado grava um valor
 * que o usuário não pediu e ele só descobre depois.
 */
export function numIn(v: unknown, min: number, max: number, campo: string): number | undefined {
  if (v === undefined) return undefined;
  if (typeof v !== "number" || !Number.isFinite(v)) {
    throw new ImportError(`O campo "${campo}" precisa ser um número.`);
  }
  const n = Math.trunc(v);
  if (n < min || n > max) {
    throw new ImportError(`O campo "${campo}" aceita de ${min} a ${max} — recebido ${n}.`);
  }
  return n;
}

/** Texto com teto de tamanho. `undefined` quando ausente; `null` apaga. */
export function textIn(v: unknown, max: number, campo: string): string | null | undefined {
  if (v === undefined) return undefined;
  if (v === null) return null;
  if (typeof v !== "string") {
    throw new ImportError(`O campo "${campo}" precisa ser texto.`);
  }
  if (v.length > max) {
    throw new ImportError(`O campo "${campo}" excede o tamanho máximo de ${max} caracteres.`);
  }
  return v;
}

/**
 * Nome do personagem: obrigatório quando presente, aparado e com teto.
 * Devolve `undefined` quando não veio ou quando só tinha espaços — nesse caso
 * o nome atual fica como está, em vez de virar string vazia.
 */
export function nameIn(v: unknown): string | undefined {
  const t = textIn(v, LIMITS.name, "name");
  if (t == null) return undefined;
  const limpo = t.trim();
  return limpo ? limpo : undefined;
}

/**
 * Retrato. Aceita data-URL de imagem ou caminho; o teto é maior que o de URL
 * porque o projeto guarda a foto como base64 na própria coluna (decisão
 * registrada em docs/ARQUITETURA.md).
 */
export const PORTRAIT_MAX = 400_000;

export function portraitIn(v: unknown): string | null | undefined {
  return textIn(v, PORTRAIT_MAX, "portraitUrl");
}

/**
 * Executa o corpo de um handler traduzindo `ImportError` em resposta 400.
 * Sem isto, a guarda de tamanho de campo Json (`toJsonFieldOrNull`) derrubava
 * a requisição com 500 e stack no log, em vez da mensagem que o usuário
 * precisa ler — pior que não ter guarda, porque a documentação prometia 400.
 */
export async function comGuardas(
  fn: () => Promise<Response>,
): Promise<Response> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof ImportError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
