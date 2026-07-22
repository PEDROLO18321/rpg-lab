"use client";

import { CLASS_BY_ID } from "@/lib/tormenta/classes";
import { getSpellsForTradition, getSpellsForSchools, type Spell } from "@/lib/tormenta/spells";
import type { MagicSchool } from "@/lib/tormenta/data";
import type { WizardData } from "../CharacterWizard";
import { ACCENT, ACCENT_LIGHT, ACCENT_DIM, ACCENT_BORD } from "../CharacterWizard";
import { Intro } from "./Intro";

interface Props {
  classId: string | null;
  pathId: string | null;
  schoolsChosen: string[];
  selectedSpells: string[];
  onChange: (p: Partial<WizardData>) => void;
}

export function StepSpells({ classId, schoolsChosen, selectedSpells, onChange }: Props) {
  const cls = classId ? CLASS_BY_ID[classId] : undefined;

  if (!cls?.spellcasting) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <Intro title="Magias" text="Sua classe não lança magias." />
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "40px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.86rem" }}>
          Nenhuma magia disponível para esta classe. Avance para o próximo passo.
        </div>
      </div>
    );
  }

  const spells: Spell[] = cls.spellcasting.schoolChoiceCount
    ? getSpellsForSchools(cls.spellcasting.tradition, schoolsChosen as MagicSchool[], 1)
    : getSpellsForTradition(cls.spellcasting.tradition, 1);

  const need = cls.spellcasting.startingSpells;

  function toggle(id: string) {
    const sel = selectedSpells.includes(id);
    if (sel) onChange({ selectedSpells: selectedSpells.filter((s) => s !== id) });
    else if (selectedSpells.length < need) onChange({ selectedSpells: [...selectedSpells, id] });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Intro title="Magias" text={`Escolha ${need} magias de 1º círculo ${cls.spellcasting.tradition === "arcana" ? "arcanas" : "divinas"} (${selectedSpells.length}/${need}).`} />

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {spells.map((sp) => {
          const sel = selectedSpells.includes(sp.id);
          const maxed = !sel && selectedSpells.length >= need;
          return (
            <button key={sp.id} onClick={() => toggle(sp.id)} disabled={maxed}
              style={{ textAlign: "left", display: "flex", justifyContent: "space-between", gap: 12, padding: "12px 16px", background: sel ? ACCENT_DIM : "var(--surface)", border: `1px solid ${sel ? ACCENT_BORD : "var(--border)"}`, borderRadius: "var(--radius-lg)", cursor: maxed ? "not-allowed" : "pointer", opacity: maxed ? 0.45 : 1 }}>
              <div>
                <p style={{ fontSize: "0.86rem", fontWeight: 700, color: sel ? ACCENT_LIGHT : "var(--text)" }}>{sp.name}</p>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>{sp.description}</p>
              </div>
              <span style={{ fontSize: "0.68rem", color: "var(--text-subtle)", whiteSpace: "nowrap", alignSelf: "flex-start" }}>{sp.school}</span>
            </button>
          );
        })}
        {spells.length === 0 && (
          <p style={{ fontSize: "0.84rem", color: "var(--text-subtle)" }}>Escolha as escolas de magia no passo anterior para ver as opções.</p>
        )}
      </div>
    </div>
  );
}
