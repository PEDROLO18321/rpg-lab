"use client";

import { useRef } from "react";
import { SPECIES, TIER_LABEL, TIER_DESCRIPTION } from "@/lib/starwars/species";
import { NAMES_BY_SPECIES, pickRandom } from "@/lib/starwars/names";
import { ATTR_KEYS, ATTR_LABEL, type AttrKey } from "@/lib/starwars/data";
import { smoothScrollTo } from "@/lib/smoothScroll";
import type { WizardData } from "../CharacterWizard";
import { SW, Panel, SectionTitle, Badge, SelectCard, gridAutoFill } from "../../ui";

interface Props {
  charName: string;
  speciesId: string | null;
  humanChoice: { plus2: AttrKey[]; plus1: AttrKey[]; minus1: AttrKey[] };
  onChange: (p: Partial<WizardData>) => void;
}

function formatBonus(b: Partial<Record<AttrKey, number>>): string {
  return ATTR_KEYS.filter((k) => b[k]).map((k) => `${(b[k] ?? 0) > 0 ? "+" : ""}${b[k]} ${ATTR_LABEL[k]}`).join(" · ");
}

const SPECIES_SORTED = [...SPECIES].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

export function StepSpecies({ charName, speciesId, humanChoice, onChange }: Props) {
  const species = speciesId ? SPECIES.find((s) => s.id === speciesId) : undefined;
  const names = speciesId ? NAMES_BY_SPECIES[speciesId] : undefined;
  const detailRef = useRef<HTMLDivElement>(null);

  function pick(id: string) {
    if (speciesId === id) return;
    onChange({ speciesId: id, humanChoice: { plus2: [], plus1: [], minus1: [] } });
    setTimeout(() => { if (detailRef.current) smoothScrollTo(detailRef.current); }, 50);
  }

  function pickRandomName() {
    if (!names) return;
    onChange({ charName: pickRandom([...names.male, ...names.female]) });
  }

  function toggleHuman(kind: "plus2" | "plus1" | "minus1", k: AttrKey) {
    if (!species?.attrFreeChoice) return;
    const cur = humanChoice[kind];
    const already = cur.includes(k);
    const otherKeys = [...humanChoice.plus2, ...humanChoice.plus1, ...humanChoice.minus1].filter((x) => !(already && x === k));
    if (!already && otherKeys.includes(k)) return;
    const max = species.attrFreeChoice[kind];
    const next = already ? cur.filter((x) => x !== k) : cur.length < max ? [...cur, k] : cur;
    onChange({ humanChoice: { ...humanChoice, [kind]: next } });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      <SectionTitle eyebrow="Etapa 1 de 8" title="Espécie" desc="Sua espécie define perícias iniciais, modificador de atributo e o perfil de vida/energia. São 35 espécies jogáveis na galáxia." />

      <div style={gridAutoFill(150)}>
        {SPECIES_SORTED.map((s) => (
          <SelectCard key={s.id} label={s.name} sublabel={TIER_LABEL[s.tier]} selected={speciesId === s.id} onClick={() => pick(s.id)} />
        ))}
      </div>

      {species && (
        <Panel active glow style={{ scrollMarginTop: 120 }}>
          <div ref={detailRef} />
          <h3 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.1rem", fontWeight: 700, color: SW.accentBright, marginBottom: 8 }}>{species.name}</h3>
          <p style={{ fontSize: "0.84rem", color: SW.textMuted, lineHeight: 1.65, marginBottom: 10 }}>{species.description}</p>
          <p style={{ fontSize: "0.8rem", color: SW.textMuted, lineHeight: 1.6, marginBottom: 14, padding: "10px 14px", background: "rgba(255,255,255,0.025)", border: `1px solid ${SW.panelBorder}`, borderRadius: 6 }}>
            <strong style={{ color: "var(--text)" }}>Aparência: </strong>{species.appearance}
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            <Badge tone="gold">Perícias iniciais: {species.initialSkills.join(", ")}</Badge>
            {!species.attrFreeChoice && <Badge tone="accent">{formatBonus(species.attrBonus)}</Badge>}
          </div>

          <p style={{ fontSize: "0.8rem", color: SW.textMuted, lineHeight: 1.6, marginBottom: 16, padding: "10px 14px", background: "rgba(59,130,196,0.06)", borderLeft: `2px solid ${SW.accentBord}` }}>
            <strong style={{ color: SW.accentBright }}>{TIER_LABEL[species.tier]}:</strong> {TIER_DESCRIPTION[species.tier]}
          </p>

          {species.attrFreeChoice && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 16, marginBottom: 16, borderBottom: `1px solid ${SW.panelBorder}` }}>
              <p style={{ fontSize: "0.78rem", color: SW.textMuted }}>
                Escolha livre: +2 em {species.attrFreeChoice.plus2}, +1 em {species.attrFreeChoice.plus1}, −1 em {species.attrFreeChoice.minus1} atributo(s).
              </p>
              {(["plus2", "plus1", "minus1"] as const).map((kind) => (
                <div key={kind} style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: "0.68rem", color: SW.textSubtle, width: 50, fontWeight: 700 }}>{kind === "plus2" ? "+2" : kind === "plus1" ? "+1" : "−1"}</span>
                  {ATTR_KEYS.map((k) => {
                    const on = humanChoice[kind].includes(k);
                    return (
                      <button key={k} onClick={() => toggleHuman(kind, k)}
                        style={{ padding: "5px 12px", fontSize: "0.72rem", fontWeight: 600, borderRadius: 3, border: `1px solid ${on ? SW.accentBord : "var(--border)"}`, background: on ? SW.accentDim : "rgba(255,255,255,0.02)", color: on ? SW.accentBright : SW.textMuted, cursor: "pointer" }}>
                        {ATTR_LABEL[k]}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          <div>
            <label style={{ fontSize: "0.68rem", fontWeight: 800, color: SW.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Nome do personagem <span style={{ color: SW.gold }}>*</span>
            </label>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <input value={charName} onChange={(e) => onChange({ charName: e.target.value })}
                placeholder={names ? `Ex.: ${names.male[0]}` : "Digite um nome..."} maxLength={60}
                style={{ flex: 1, minWidth: 0, padding: "11px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.92rem", fontFamily: "var(--font-cinzel), serif" }} />
              {names && (
                <button type="button" onClick={pickRandomName}
                  style={{ padding: "0 20px", background: "rgba(255,255,255,0.02)", border: `1px solid ${SW.accentBord}`, color: SW.accentLight, fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                  🎲 Aleatório
                </button>
              )}
            </div>

            {names && (
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <p style={{ fontSize: "0.7rem", color: SW.textSubtle, marginBottom: 6 }}>Nomes masculinos:</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {names.male.slice(0, 10).map((n) => (
                      <button key={n} onClick={() => onChange({ charName: n })}
                        style={{ padding: "4px 12px", fontSize: "0.78rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", color: SW.textMuted, cursor: "pointer" }}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: "0.7rem", color: SW.textSubtle, marginBottom: 6 }}>Nomes femininos:</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {names.female.slice(0, 10).map((n) => (
                      <button key={n} onClick={() => onChange({ charName: n })}
                        style={{ padding: "4px 12px", fontSize: "0.78rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", color: SW.textMuted, cursor: "pointer" }}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                {names.family && (
                  <div>
                    <p style={{ fontSize: "0.7rem", color: SW.textSubtle, marginBottom: 6 }}>Sobrenomes / Clã:</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {names.family.map((n) => (
                        <button key={n} onClick={() => onChange({ charName: charName ? `${charName} ${n}` : n })}
                          style={{ padding: "4px 12px", fontSize: "0.78rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", color: SW.textMuted, cursor: "pointer" }}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Panel>
      )}
    </div>
  );
}
