"use client";

import { CLASS_BY_ID } from "@/lib/tormenta/classes";
import { WEAPONS, ARMORS, DEFAULT_STARTING_KIT, STARTING_MONEY_DICE } from "@/lib/tormenta/items";
import type { WizardData } from "../CharacterWizard";
import { ACCENT, ACCENT_LIGHT, ACCENT_DIM, ACCENT_BORD } from "../CharacterWizard";
import { Intro } from "./Intro";

interface Props {
  classId: string | null;
  weaponId: string | null;
  armorId: string | null;
  shieldId: string | null;
  onChange: (p: Partial<WizardData>) => void;
}

export function StepEquipment({ classId, weaponId, armorId, shieldId, onChange }: Props) {
  const cls = classId ? CLASS_BY_ID[classId] : undefined;
  const hasMarcial = cls?.proficiencies.includes("Armas marciais") ?? false;
  const hasPesada = cls?.proficiencies.includes("Armaduras pesadas") ?? false;
  const hasEscudo = cls?.proficiencies.includes("Escudos") ?? false;

  const weaponOptions = WEAPONS.filter((w) => w.category === "simples" || (hasMarcial && w.category === "marcial"));
  const armorOptions = ARMORS.filter((a) => a.category === "leve" || (hasPesada && a.category === "pesada"));
  const shieldOptions = hasEscudo ? ARMORS.filter((a) => a.category === "escudo") : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <Intro title="Equipamento" text="Todo personagem sabe usar armas simples e armaduras leves. Escolha sua arma inicial e, se proficiente, uma armadura e/ou escudo." />

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "14px 18px" }}>
        <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Kit padrão + dinheiro</p>
        <p style={{ fontSize: "0.82rem", color: "var(--text)" }}>{DEFAULT_STARTING_KIT.join(", ")} · {STARTING_MONEY_DICE} T$ (rolado ao criar)</p>
      </div>

      <div>
        <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
          Arma inicial <span style={{ color: ACCENT }}>*</span>
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
          {weaponOptions.map((w) => {
            const sel = weaponId === w.id;
            return (
              <button key={w.id} onClick={() => onChange({ weaponId: w.id })}
                style={{ textAlign: "left", padding: "10px 14px", background: sel ? ACCENT_DIM : "var(--surface)", border: `1px solid ${sel ? ACCENT_BORD : "var(--border)"}`, borderRadius: "var(--radius-lg)", cursor: "pointer" }}>
                <p style={{ fontSize: "0.82rem", fontWeight: 700, color: sel ? ACCENT_LIGHT : "var(--text)" }}>{w.name}</p>
                <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{w.damage} {w.damageType ?? ""} · crítico {w.critical}{w.range ? ` · ${w.range}` : ""}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Armadura (opcional)</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
          <button onClick={() => onChange({ armorId: "" })}
            style={{ textAlign: "left", padding: "10px 14px", background: !armorId ? ACCENT_DIM : "var(--surface)", border: `1px solid ${!armorId ? ACCENT_BORD : "var(--border)"}`, borderRadius: "var(--radius-lg)", cursor: "pointer" }}>
            <p style={{ fontSize: "0.82rem", fontWeight: 700, color: !armorId ? ACCENT_LIGHT : "var(--text)" }}>Nenhuma</p>
          </button>
          {armorOptions.map((a) => {
            const sel = armorId === a.id;
            return (
              <button key={a.id} onClick={() => onChange({ armorId: a.id })}
                style={{ textAlign: "left", padding: "10px 14px", background: sel ? ACCENT_DIM : "var(--surface)", border: `1px solid ${sel ? ACCENT_BORD : "var(--border)"}`, borderRadius: "var(--radius-lg)", cursor: "pointer" }}>
                <p style={{ fontSize: "0.82rem", fontWeight: 700, color: sel ? ACCENT_LIGHT : "var(--text)" }}>{a.name}</p>
                <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>+{a.defenseBonus} Defesa · penalidade {a.armorPenalty}</p>
              </button>
            );
          })}
        </div>
      </div>

      {hasEscudo && (
        <div>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Escudo (opcional)</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
            <button onClick={() => onChange({ shieldId: "" })}
              style={{ textAlign: "left", padding: "10px 14px", background: !shieldId ? ACCENT_DIM : "var(--surface)", border: `1px solid ${!shieldId ? ACCENT_BORD : "var(--border)"}`, borderRadius: "var(--radius-lg)", cursor: "pointer" }}>
              <p style={{ fontSize: "0.82rem", fontWeight: 700, color: !shieldId ? ACCENT_LIGHT : "var(--text)" }}>Nenhum</p>
            </button>
            {shieldOptions.map((s) => {
              const sel = shieldId === s.id;
              return (
                <button key={s.id} onClick={() => onChange({ shieldId: s.id })}
                  style={{ textAlign: "left", padding: "10px 14px", background: sel ? ACCENT_DIM : "var(--surface)", border: `1px solid ${sel ? ACCENT_BORD : "var(--border)"}`, borderRadius: "var(--radius-lg)", cursor: "pointer" }}>
                  <p style={{ fontSize: "0.82rem", fontWeight: 700, color: sel ? ACCENT_LIGHT : "var(--text)" }}>{s.name}</p>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>+{s.defenseBonus} Defesa · penalidade {s.armorPenalty}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
