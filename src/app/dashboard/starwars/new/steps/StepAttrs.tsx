"use client";

import { ATTR_KEYS, ATTR_LABEL, ATTR_ABBR, ATTR_CREATION_POINTS, attrPointsRemaining, attrPointsSpent, type StarWarsAttrs } from "@/lib/starwars/data";
import { SPECIES_BY_ID } from "@/lib/starwars/species";
import { attributeDicePool } from "@/lib/starwars/creation";
import { SKILLS } from "@/lib/starwars/skills";
import type { WizardData } from "../CharacterWizard";
import { SW, SectionTitle, Badge, gridAutoFill } from "../../ui";

interface Props {
  attrBases: StarWarsAttrs;
  attrsFinal: StarWarsAttrs;
  speciesId: string | null;
  onChange: (p: Partial<WizardData>) => void;
}

export function StepAttrs({ attrBases, attrsFinal, speciesId, onChange }: Props) {
  const remaining = attrPointsRemaining(attrBases);
  const species = speciesId ? SPECIES_BY_ID[speciesId] : undefined;

  function set(k: keyof StarWarsAttrs, delta: number) {
    const value = attrBases[k] + delta;
    if (value < 0) return;
    if (delta > 0 && remaining <= 0) return;
    onChange({ attrBases: { ...attrBases, [k]: value } });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      <SectionTitle eyebrow="Etapa 4 de 8" title="Atributos" desc={`Distribua ${ATTR_CREATION_POINTS} pontos livremente entre os 6 atributos. O valor Final já inclui o modificador de ${species?.name ?? "espécie"} — pode ficar negativo. Regra de rolagem: valor 0 rola 2d20 e usa o menor; valor negativo rola (2 + |valor|) d20 e usa o menor; valor 1 rola 1d20 normal; valor 2 ou mais rola N d20 (N = valor) e usa o maior.`} />

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Badge tone={remaining === 0 ? "success" : "gold"}>{remaining === 0 ? "Todos os pontos distribuídos" : `${remaining} pontos restantes`}</Badge>
        <span style={{ fontSize: "0.72rem", color: SW.textSubtle }}>{attrPointsSpent(attrBases)}/{ATTR_CREATION_POINTS} usados</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {ATTR_KEYS.map((k) => {
          const bonus = attrsFinal[k] - attrBases[k];
          const pool = attributeDicePool(attrsFinal[k]);
          return (
            <div key={k} className="sw-attr-row" style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 18px", background: "rgba(255,255,255,0.015)", border: "1px solid var(--border)" }}>
              <span style={{ width: 150, fontSize: "0.86rem", fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-cinzel), serif" }}>{ATTR_LABEL[k]}</span>
              <button onClick={() => set(k, -1)} disabled={attrBases[k] <= 0}
                style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${SW.accentBord}`, background: "rgba(255,255,255,0.03)", color: SW.accentLight, cursor: "pointer", fontWeight: 700 }}>−</button>
              <span style={{ width: 26, textAlign: "center", fontSize: "1rem", fontWeight: 800, color: "var(--text)" }}>{attrBases[k]}</span>
              <button onClick={() => set(k, 1)} disabled={remaining <= 0}
                style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${SW.accentBord}`, background: "rgba(255,255,255,0.03)", color: SW.accentLight, cursor: "pointer", fontWeight: 700 }}>+</button>
              <span className="sw-attr-row-trailing" style={{ marginLeft: "auto", fontSize: "0.76rem", color: SW.textSubtle, display: "flex", alignItems: "center", gap: 8 }}>
                {bonus !== 0 && <span style={{ color: bonus > 0 ? SW.success : SW.danger, fontWeight: 700 }}>{bonus > 0 ? `+${bonus}` : bonus}</span>}
                <span>Final <strong style={{ color: attrsFinal[k] < 0 ? SW.danger : SW.accentBright, fontSize: "0.92rem" }}>{attrsFinal[k]}</strong></span>
                <span style={{ fontSize: "0.66rem" }}>({pool.dice}d20 {pool.take === "highest" ? "maior" : "menor"})</span>
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <p style={{ fontSize: "0.68rem", fontWeight: 800, color: SW.textMuted, letterSpacing: "0.09em", textTransform: "uppercase" }}>
          Perícias por atributo
        </p>
        <div style={gridAutoFill(150)}>
          {ATTR_KEYS.map((k) => (
            <div key={k} style={{ padding: "10px 12px", background: "rgba(255,255,255,0.015)", border: "1px solid var(--border)" }}>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: SW.accentLight, marginBottom: 4 }}>{ATTR_ABBR[k]} · {ATTR_LABEL[k]}</p>
              <p style={{ fontSize: "0.72rem", color: SW.textSubtle, lineHeight: 1.5 }}>
                {SKILLS.filter((s) => s.attrs.includes(k)).map((s) => s.name).join(", ")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
