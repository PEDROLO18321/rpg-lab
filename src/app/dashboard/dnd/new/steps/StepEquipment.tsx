"use client";

import { CLASSES }     from "@/lib/dnd/classes";
import { BACKGROUNDS } from "@/lib/dnd/backgrounds";
import { parseEquipmentLine, isCurrencyItem, parseCurrencyItem } from "@/lib/dnd/equipmentParser";
import type { EquipmentChoice } from "@/lib/dnd/equipmentParser";
import { getWeaponList, getCategoryLabel } from "@/lib/dnd/equipmentData";
import type { WizardData } from "../CharacterWizard";

const CURRENCY_LABEL: Record<string, string> = { gp: "PO", sp: "PP", cp: "PC", ep: "PE", pp: "PL" };
const CURRENCY_COLOR: Record<string, string> = { gp: "#c9941f", sp: "#d1d5db", cp: "#b45309", ep: "#7dd3fc", pp: "#b0c4de" };

interface Props {
  classId:          string | null;
  backgroundId:     string | null;
  equipmentChoices: Record<string, string>;
  onChange:         (p: Partial<WizardData>) => void;
}

export function StepEquipment({ classId, backgroundId, equipmentChoices, onChange }: Props) {
  const cls = CLASSES.find((c) => c.id === classId);
  const bg  = BACKGROUNDS.find((b) => b.id === backgroundId);

  function patch(key: string, value: string) {
    onChange({ equipmentChoices: { ...equipmentChoices, [key]: value } });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Heading */}
      <div>
        <span className="section-label" style={{ display: "block", marginBottom: 6 }}>
          Passo 6 · Equipamento
        </span>
        <h2
          style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)",
            fontWeight: 700, color: "var(--text)", lineHeight: 1.2,
          }}
        >
          Equipamento <span className="text-gold">Inicial</span>
        </h2>
        <p style={{ marginTop: 8, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
          Selecione o equipamento de partida. Moedas incluídas aparecem automaticamente na ficha.
        </p>
      </div>

      {cls ? (
        <EquipmentBlock
          icon={cls.icon}
          title={`Equipamento da Classe — ${cls.name}`}
          items={cls.startingEquipment}
          prefix="cls"
          choices={equipmentChoices}
          onPatch={patch}
          accent
        />
      ) : (
        <EmptyBlock label="Nenhuma classe selecionada" />
      )}

      {bg ? (
        <EquipmentBlock
          icon={bg.icon}
          title={`Equipamento do Antecedente — ${bg.name}`}
          items={bg.startingEquipment}
          prefix="bg"
          choices={equipmentChoices}
          onPatch={patch}
        />
      ) : (
        <EmptyBlock label="Nenhum antecedente selecionado" />
      )}
    </div>
  );
}

/* ── Equipment block (class or background) ── */
function EquipmentBlock({
  icon, title, items, prefix, choices, onPatch, accent,
}: {
  icon:    string;
  title:   string;
  items:   string[];
  prefix:  "cls" | "bg";
  choices: Record<string, string>;
  onPatch: (key: string, value: string) => void;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: `1px solid ${accent ? "var(--border-accent)" : "var(--border)"}`,
        borderRadius: "var(--radius-xl)",
        padding: "24px 24px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <p
          style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "0.88rem", fontWeight: 700,
            color: accent ? "var(--accent-light)" : "var(--text)",
          }}
        >
          {title}
        </p>
      </div>

      {/* Currency badges */}
      {(() => {
        const coins = items
          .filter((r) => !r.trimStart().startsWith("(a)") && isCurrencyItem(r))
          .map((r) => parseCurrencyItem(r))
          .filter(Boolean) as Partial<Record<string, number>>[];
        if (coins.length === 0) return null;
        const merged: Record<string, number> = {};
        coins.forEach((c) => Object.entries(c).forEach(([k, v]) => { merged[k] = (merged[k] ?? 0) + (v ?? 0); }));
        return (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "0.68rem", color: "var(--text-subtle)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Moedas iniciais:</span>
            {Object.entries(merged).map(([key, val]) => (
              <span key={key} style={{ padding: "3px 10px", borderRadius: "var(--radius)", background: "var(--surface-2)", border: `1px solid ${CURRENCY_COLOR[key]}55`, fontSize: "0.78rem", fontWeight: 700, color: CURRENCY_COLOR[key] }}>
                {val} {CURRENCY_LABEL[key]}
              </span>
            ))}
          </div>
        );
      })()}

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {items.map((raw, idx) => {
          const line = parseEquipmentLine(raw);
          if (line.type === "fixed") {
            if (isCurrencyItem(raw)) return null;
            return (
              <FixedRow key={idx} text={raw} accent={accent} />
            );
          }
          return (
            <ChoiceRow
              key={idx}
              choices={line.choices}
              prefix={prefix}
              idx={idx}
              selected={choices[`${prefix}_${idx}`] ?? null}
              subChoices={choices}
              onSelect={(letter) => {
                // Clear sub-choices for this row when re-selecting
                const newChoices: Record<string, string> = { ...choices };
                Object.keys(newChoices).forEach((k) => {
                  if (k.startsWith(`${prefix}_${idx}_`)) delete newChoices[k];
                });
                newChoices[`${prefix}_${idx}`] = letter;
                // propagate via parent patch helper indirectly:
                onPatch(`${prefix}_${idx}`, letter);
                // Also clear old sub-choices
                Object.keys(choices).forEach((k) => {
                  if (k.startsWith(`${prefix}_${idx}_`)) onPatch(k, "");
                });
              }}
              onSubSelect={(letter, subIdx, value) =>
                onPatch(`${prefix}_${idx}_${letter}_${subIdx}`, value)
              }
              accent={accent}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ── Fixed item row ── */
function FixedRow({ text, accent }: { text: string; accent?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
      }}
    >
      <span style={{ color: accent ? "var(--accent)" : "var(--text-subtle)", fontSize: "0.75rem", flexShrink: 0 }}>✔</span>
      <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}

/* ── Choice row ── */
function ChoiceRow({
  choices, prefix, idx, selected, subChoices, onSelect, onSubSelect, accent,
}: {
  choices:     EquipmentChoice[];
  prefix:      string;
  idx:         number;
  selected:    string | null;
  subChoices:  Record<string, string>;
  onSelect:    (letter: string) => void;
  onSubSelect: (letter: string, subIdx: number, value: string) => void;
  accent?:     boolean;
}) {
  const chosenOption = choices.find((c) => c.letter === selected);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Option cards */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {choices.map((opt) => {
          const isSelected = selected === opt.letter;
          return (
            <button
              key={opt.letter}
              onClick={() => onSelect(opt.letter)}
              style={{
                flex: 1,
                minWidth: 120,
                padding: "10px 14px",
                background: isSelected ? "var(--accent-dim)" : "var(--surface-2)",
                border: `1px solid ${isSelected ? "var(--border-accent)" : "var(--border)"}`,
                borderRadius: "var(--radius)",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 20, height: 20,
                  borderRadius: "50%",
                  background: isSelected ? "var(--accent)" : "var(--surface-3)",
                  border: `1px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: isSelected ? "#06090f" : "var(--text-subtle)",
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                {opt.letter.toUpperCase()}
              </span>
              <span style={{ fontSize: "0.82rem", color: isSelected ? "var(--accent-light)" : "var(--text-muted)", fontWeight: isSelected ? 600 : 400, lineHeight: 1.5 }}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sub-selector for "qualquer X" or "duas armas" options */}
      {chosenOption?.sub && (
        <div style={{ paddingLeft: 8, display: "flex", flexDirection: "column", gap: 8 }}>
          {Array.from({ length: chosenOption.sub.count }).map((_, k) => {
            const subKey = `${prefix}_${idx}_${chosenOption.letter}_${k}`;
            const currentVal = subChoices[subKey] ?? "";
            const list = getWeaponList(chosenOption.sub!.category);
            const label = chosenOption.sub!.count > 1
              ? `${getCategoryLabel(chosenOption.sub!.category)} ${k + 1}`
              : getCategoryLabel(chosenOption.sub!.category);

            return (
              <div key={k} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {label}
                </label>
                <select
                  value={currentVal}
                  onChange={(e) => onSubSelect(chosenOption.letter, k, e.target.value)}
                  style={{
                    padding: "8px 12px",
                    background: "var(--surface-2)",
                    border: `1px solid ${currentVal ? "var(--border-accent)" : "var(--border)"}`,
                    borderRadius: "var(--radius)",
                    color: currentVal ? "var(--text)" : "var(--text-subtle)",
                    fontSize: "0.84rem",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  <option value="" disabled>Selecione...</option>
                  {list.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Empty placeholder ── */
function EmptyBlock({ label }: { label: string }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-xl)",
        padding: "24px",
        textAlign: "center",
        color: "var(--text-subtle)",
        fontSize: "0.82rem",
      }}
    >
      {label}
    </div>
  );
}
