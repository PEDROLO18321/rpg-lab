// ─── Tipo comum de rolagem ───────────────────────────────────────────────────
// Cada sistema tem seu próprio tipo de rolagem, com o que a regra dele exige:
// níveis de sucesso no Cthulhu, "maior/pior" na Ordem, crítico por margem no
// Tormenta. Nenhum deles sobe para cá. Em vez disso, cada ficha escreve um
// adaptador curto para esta forma, que é só o que o histórico precisa exibir.

export type RollTone = "crit" | "fumble" | "success" | "fail";

export interface PlayRollEntry {
  id: number;
  /** O que foi rolado: "Percepção", "Espada longa — Dano". */
  label: string;
  total: number;
  /** Os dados por extenso: "[12, 7] maior +3". */
  detail?: string;
  tone?: RollTone;
  /** Rótulo curto do resultado: "Sucesso Extremo", "CRIT". */
  badge?: string;
}
