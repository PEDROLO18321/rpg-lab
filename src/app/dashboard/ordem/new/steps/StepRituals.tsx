"use client";

import { useState } from "react";
import type { OrdemWizardData } from "../CharacterWizard";
import { Intro } from "./StepAttrs";
import { RITUALS } from "@/lib/ordem/rituals";
import type { Element } from "@/lib/ordem/data";

const ACCENT       = "#ffffff";
const ACCENT_LIGHT = "#ffffff";
const ACCENT_BORD  = "rgba(255,255,255,0.5)";

const ELEMENTS: { id: Element; label: string; color: string }[] = [
  { id: "conhecimento", label: "Conhecimento", color: "#9b7fd4" },
  { id: "energia",      label: "Energia",      color: "#4db8d4" },
  { id: "morte",        label: "Morte",        color: "#7fba7f" },
  { id: "sangue",       label: "Sangue",       color: "#d45f5f" },
  { id: "medo",         label: "Medo",         color: "#8a8a8a" },
];

const CIRCLE1 = RITUALS.filter((r) => r.circle === 1);
const MAX = 3;

interface Props {
  data: OrdemWizardData;
  onChange: (p: Partial<OrdemWizardData>) => void;
}

export function StepRituals({ data, onChange }: Props) {
  const [filter, setFilter] = useState<Element | "todos">("todos");
  const [expanded, setExpanded] = useState<string | null>(null);

  const chosen = data.startingRituals;
  const full = chosen.length >= MAX;

  function toggle(id: string) {
    if (chosen.includes(id)) {
      onChange({ startingRituals: chosen.filter((r) => r !== id) });
    } else if (!full) {
      onChange({ startingRituals: [...chosen, id] });
    }
  }

  const visible = filter === "todos" ? CIRCLE1 : CIRCLE1.filter((r) => r.element === filter);
  const elemColor = (el: Element) => ELEMENTS.find((e) => e.id === el)?.color ?? "#ffffff";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Intro
        title="Rituais Iniciais"
        text="Escolhido pelo Outro Lado: você começa conhecendo 3 rituais de 1º círculo, de qualquer elemento. Escolha com cuidado — eles definem seu estilo de conjuração."
      />

      {/* Contador */}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 18px",
          background: full ? "rgba(125,200,100,0.08)" : `${ACCENT}14`,
          border: `1px solid ${full ? "rgba(125,200,100,0.3)" : `${ACCENT}44`}`,
          borderRadius: "var(--radius-lg)",
        }}
      >
        <span style={{ fontSize: "0.84rem", color: "var(--text-muted)" }}>Rituais escolhidos</span>
        <span style={{ fontSize: "1.05rem", fontWeight: 800, color: full ? "#7dc864" : ACCENT_LIGHT }}>
          {chosen.length}/{MAX}
        </span>
      </div>

      {/* Filtro por elemento */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <FilterBtn label="Todos" active={filter === "todos"} color={ACCENT} onClick={() => setFilter("todos")} />
        {ELEMENTS.map((el) => (
          <FilterBtn key={el.id} label={el.label} active={filter === el.id} color={el.color} onClick={() => setFilter(el.id)} />
        ))}
      </div>

      {/* Lista de rituais */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {visible.map((r) => {
          const on = chosen.includes(r.id);
          const disabled = full && !on;
          const isOpen = expanded === r.id;
          const color = elemColor(r.element);

          return (
            <div
              key={r.id}
              style={{
                background: on ? "rgba(255,255,255,0.07)" : "var(--surface)",
                border: `1px solid ${on ? ACCENT_BORD : "var(--border)"}`,
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                transition: "border-color 0.15s, background 0.15s",
                opacity: disabled ? 0.45 : 1,
              }}
            >
              {/* Header row */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px" }}>
                {/* Checkbox */}
                <button
                  onClick={() => toggle(r.id)}
                  disabled={disabled}
                  aria-label={on ? "Remover ritual" : "Adicionar ritual"}
                  style={{
                    flexShrink: 0,
                    width: 20, height: 20, borderRadius: 4,
                    background: on ? ACCENT : "transparent",
                    border: `2px solid ${on ? ACCENT : "var(--border)"}`,
                    cursor: disabled ? "default" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.12s, border-color 0.12s",
                  }}
                >
                  {on && <span style={{ color: "#06090f", fontSize: "0.65rem", fontWeight: 900, lineHeight: 1 }}>✓</span>}
                </button>

                {/* Name + element */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: "0.88rem", fontWeight: 700, color: on ? ACCENT_LIGHT : "var(--text)" }}>
                    {r.name}
                  </span>
                  <span
                    style={{
                      marginLeft: 8, fontSize: "0.65rem", fontWeight: 700,
                      color: color, textTransform: "capitalize", letterSpacing: "0.04em",
                    }}
                  >
                    {r.element}
                  </span>
                </div>

                {/* Meta tags */}
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  <Tag text={r.execution} />
                  <Tag text={r.range} />
                </div>

                {/* Expand toggle */}
                <button
                  onClick={() => setExpanded(isOpen ? null : r.id)}
                  style={{
                    flexShrink: 0, background: "none", border: "none",
                    color: "var(--text-subtle)", cursor: "pointer",
                    fontSize: "0.75rem", padding: "0 4px",
                    transform: isOpen ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                  }}
                >
                  ▾
                </button>
              </div>

              {/* Expanded description */}
              {isOpen && (
                <div
                  style={{
                    padding: "0 14px 14px 44px",
                    borderTop: "1px solid var(--border)",
                    paddingTop: 10,
                  }}
                >
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.65 }}>
                    {r.description}
                  </p>
                  {r.target && (
                    <p style={{ fontSize: "0.75rem", color: "var(--text-subtle)", marginTop: 6 }}>
                      <strong style={{ color: "var(--text-muted)" }}>Alvo:</strong> {r.target}
                    </p>
                  )}
                  {r.area && (
                    <p style={{ fontSize: "0.75rem", color: "var(--text-subtle)", marginTop: 4 }}>
                      <strong style={{ color: "var(--text-muted)" }}>Área:</strong> {r.area}
                    </p>
                  )}
                  {r.resistance && (
                    <p style={{ fontSize: "0.75rem", color: "var(--text-subtle)", marginTop: 4 }}>
                      <strong style={{ color: "var(--text-muted)" }}>Resistência:</strong> {r.resistance}
                    </p>
                  )}
                  {r.upgrade && (
                    <p style={{ fontSize: "0.75rem", color: "#9b7fd4", marginTop: 6, lineHeight: 1.5 }}>
                      <strong>↑ {r.upgrade}</strong>
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FilterBtn({
  label, active, color, onClick,
}: { label: string; active: boolean; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 13px", fontSize: "0.76rem", fontWeight: 700,
        background: active ? `${color}22` : "var(--surface)",
        border: `1px solid ${active ? color : "var(--border)"}`,
        borderRadius: "var(--radius-full)",
        color: active ? color : "var(--text-muted)",
        cursor: "pointer",
        transition: "all 0.12s",
      }}
    >
      {label}
    </button>
  );
}

function Tag({ text }: { text: string }) {
  return (
    <span
      style={{
        padding: "2px 7px", fontSize: "0.62rem", fontWeight: 700,
        background: "var(--surface-2)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-full)", color: "var(--text-subtle)",
        textTransform: "capitalize", letterSpacing: "0.03em",
      }}
    >
      {text}
    </span>
  );
}
