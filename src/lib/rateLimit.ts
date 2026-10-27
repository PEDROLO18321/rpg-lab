// ─── Limite de tentativas ────────────────────────────────────────────────────
// Medido antes de escrever: 20 senhas erradas seguidas contra o login, zero
// bloqueios; 10 contas criadas em sequência, nenhum obstáculo. Sem isto, provar
// uma senha fraca é só questão de deixar um laço rodando.
//
// **Limitação declarada, e ela importa:** a contagem vive na memória do
// processo. Na Vercel cada instância tem a sua, e uma instância nova começa
// zerada — então isto atrasa um ataque, não o impede. A forma correta usa
// armazenamento compartilhado (Redis, Upstash); para o volume deste trabalho,
// e sem infraestrutura extra, a versão em memória é o que cabe. Está escrito
// aqui para ninguém confundir com proteção completa.

interface Janela {
  /** Quantas tentativas nesta janela. */
  contagem: number;
  /** Quando a janela expira (epoch em ms). */
  expiraEm: number;
}

const registros = new Map<string, Janela>();

/** Impede o mapa de crescer sem fim num processo de vida longa. */
function limpaExpirados(agora: number) {
  if (registros.size < 5_000) return;
  for (const [chave, j] of registros) if (j.expiraEm <= agora) registros.delete(chave);
}

export interface Limite {
  /** Tentativas permitidas dentro da janela. */
  max: number;
  /** Duração da janela, em segundos. */
  janelaSeg: number;
}

export interface Resultado {
  permitido: boolean;
  /** Quantas ainda cabem nesta janela. */
  restantes: number;
  /** Segundos até a janela zerar — vai no cabeçalho `Retry-After`. */
  esperaSeg: number;
}

/**
 * Conta uma tentativa para `chave` e diz se ela passa.
 *
 * A janela é fixa, não deslizante: na virada o contador zera de uma vez. É
 * menos preciso que janela deslizante e muito mais simples; a diferença só
 * importa num ataque que acerte exatamente a virada.
 */
export function registraTentativa(chave: string, { max, janelaSeg }: Limite, agora = Date.now()): Resultado {
  limpaExpirados(agora);

  const atual = registros.get(chave);
  if (!atual || atual.expiraEm <= agora) {
    registros.set(chave, { contagem: 1, expiraEm: agora + janelaSeg * 1000 });
    return { permitido: true, restantes: max - 1, esperaSeg: 0 };
  }

  atual.contagem += 1;
  const esperaSeg = Math.ceil((atual.expiraEm - agora) / 1000);

  if (atual.contagem > max) return { permitido: false, restantes: 0, esperaSeg };
  return { permitido: true, restantes: max - atual.contagem, esperaSeg };
}

/** Zera a contagem — usado quando a tentativa deu certo. */
export function limpaTentativas(chave: string) {
  registros.delete(chave);
}

/**
 * Identifica quem está pedindo. Atrás da Vercel o IP real vem em
 * `x-forwarded-for`; a primeira entrada é o cliente, as seguintes são os
 * intermediários. Sem cabeçalho nenhum, cai num balde comum — pior para quem
 * roda local, e é o lado seguro: na dúvida, limita.
 */
export function identificaOrigem(req: Request): string {
  const encaminhado = req.headers.get("x-forwarded-for");
  if (encaminhado) return encaminhado.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "desconhecido";
}
