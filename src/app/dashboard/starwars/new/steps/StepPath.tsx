"use client";

import { PATH_LABEL, type Path } from "@/lib/starwars/data";
import type { WizardData } from "../CharacterWizard";
import { SW, Panel, SectionTitle } from "../../ui";

interface Props { pathId: Path | null; onChange: (p: Partial<WizardData>) => void }

const PATH_DESCRIPTIONS: Record<Path, string> = {
  luz: "Acredita em justiça, compaixão, equilíbrio e autocontrole. Coloca o bem coletivo acima dos próprios interesses.",
  neutro: "Segue suas próprias convicções, sem se prender aos ideais Jedi nem às ambições Sith. Age de forma pragmática.",
  sombrio: "Movido por ambição, paixão, medo ou desejo de poder. Busca seus objetivos a qualquer custo.",
};

const PATH_COLOR: Record<Path, string> = { luz: "#8fc4f5", neutro: "#c9941f", sombrio: "#e0524c" };

export function StepPath({ pathId, onChange }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      <SectionTitle eyebrow="Etapa 6 de 8" title="Caminho" desc="O Caminho representa sua filosofia e relação com a Força — não define se você é sensível a ela. Qualquer classe pode seguir qualquer Caminho." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        {(Object.keys(PATH_LABEL) as Path[]).map((p) => {
          const isSel = pathId === p;
          const color = PATH_COLOR[p];
          return (
            <button key={p} onClick={() => onChange({ pathId: p })} style={{ all: "unset", cursor: "pointer" }}>
              <Panel active={isSel} glow={isSel} style={{ height: "100%", boxSizing: "border-box" }}>
                <span style={{ display: "block", width: 28, height: 2, background: color, marginBottom: 12 }} />
                <span style={{ display: "block", fontFamily: "var(--font-cinzel), serif", fontSize: "1.02rem", fontWeight: 700, color: isSel ? color : "var(--text)", marginBottom: 8 }}>{PATH_LABEL[p]}</span>
                <span style={{ display: "block", fontSize: "0.8rem", color: SW.textMuted, lineHeight: 1.6 }}>{PATH_DESCRIPTIONS[p]}</span>
              </Panel>
            </button>
          );
        })}
      </div>
    </div>
  );
}
