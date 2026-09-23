"use client";

// ─── Condições ───────────────────────────────────────────────────────────────
// Quatro sistemas têm catálogo de condições com a mesma forma ({id, name, desc}
// e às vezes categoria). O Star Wars é autoral e não tem lista escrita, por
// isso existe a variante de texto livre — o bloco fica no mesmo lugar sem que
// o software invente regra.

import { useState } from "react";
import { activateOnKey } from "@/lib/a11y";

export interface PlayCondition {
  id: string;
  name: string;
  desc: string;
  category?: string;
}

/** Lista para escolher e remover, com o texto da regra no título. */
export function ConditionPicker({
  all, active, onToggle, categoryColor,
}: {
  all: PlayCondition[];
  active: string[];
  onToggle: (id: string) => void;
  categoryColor?: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const byId = Object.fromEntries(all.map((c) => [c.id, c]));
  const colorOf = (c?: PlayCondition) =>
    (c?.category && categoryColor?.[c.category]) || "var(--border-accent)";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          style={{
            padding: "4px 10px", borderRadius: "var(--radius)", fontSize: "0.72rem", fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
            background: open ? "var(--accent-dim)" : "var(--surface-2)",
            border: `1px solid ${open ? "var(--border-accent)" : "var(--border)"}`,
            color: open ? "var(--accent-light)" : "var(--text-muted)",
          }}
        >
          {open ? "Fechar" : "+ Aplicar"}
        </button>
      </div>

      {open ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 3, maxHeight: 320, overflowY: "auto" }}>
          {all.map((c) => {
            const on = active.includes(c.id);
            const color = colorOf(c);
            return (
              <button
                key={c.id}
                onClick={() => onToggle(c.id)}
                aria-pressed={on}
                title={c.desc}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", textAlign: "left",
                  background: on ? "var(--accent-dim)" : "transparent",
                  border: `1px solid ${on ? color : "transparent"}`,
                  borderRadius: "var(--radius-xs)", cursor: "pointer", fontFamily: "inherit",
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                <span style={{ fontSize: "0.72rem", color: on ? "var(--text)" : "var(--text-muted)", fontWeight: on ? 700 : 400 }}>
                  {c.name}
                </span>
              </button>
            );
          })}
        </div>
      ) : active.length === 0 ? (
        <p style={{ fontSize: "0.74rem", color: "var(--text-subtle)" }}>Nenhuma condição ativa.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {active.map((id) => {
            const c = byId[id];
            if (!c) return null;
            const color = colorOf(c);
            return (
              <div key={id} style={{ padding: "6px 8px", background: "var(--surface-2)", border: `1px solid ${color}`, borderRadius: "var(--radius)" }}>
                <p style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--text)" }}>{c.name}</p>
                <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: 2, lineHeight: 1.45 }}>{c.desc}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Etiquetas das condições ativas, para a faixa do topo. Clique remove. */
export function ActiveConditionChips({
  all, active, onRemove, categoryColor,
}: {
  all: PlayCondition[];
  active: string[];
  onRemove: (id: string) => void;
  categoryColor?: Record<string, string>;
}) {
  if (active.length === 0) return null;
  const byId = Object.fromEntries(all.map((c) => [c.id, c]));

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {active.map((id) => {
        const c = byId[id];
        const name = c?.name ?? id;
        const color = (c?.category && categoryColor?.[c.category]) || "var(--border-accent)";
        return (
          <span
            key={id}
            role="button"
            tabIndex={0}
            aria-label={`Remover condição ${name}`}
            title={c?.desc ?? "Clique para remover"}
            onClick={() => onRemove(id)}
            onKeyDown={activateOnKey(() => onRemove(id))}
            style={{
              fontSize: "0.72rem", fontWeight: 700, padding: "3px 10px",
              borderRadius: "var(--radius-xs)", cursor: "pointer", userSelect: "none",
              background: "var(--accent-dim)", border: `1px solid ${color}`, color: "var(--text)",
            }}
          >
            {name} ✕
          </span>
        );
      })}
    </div>
  );
}

/**
 * Condições digitadas pelo jogador — para sistema sem catálogo de regra
 * (Star Wars). Guarda só o texto, na mesma posição do bloco dos outros.
 */
export function FreeConditionInput({
  active, onChange,
}: {
  active: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const name = draft.trim();
    if (!name || active.includes(name)) { setDraft(""); return; }
    onChange([...active, name]);
    setDraft("");
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: active.length > 0 ? 10 : 0 }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="Atordoado, Imobilizado…"
          aria-label="Nome da condição"
          style={{
            flex: 1, minWidth: 0, padding: "6px 10px", borderRadius: "var(--radius)",
            background: "var(--surface-2)", border: "1px solid var(--border)",
            color: "var(--text)", fontSize: "0.78rem", fontFamily: "inherit",
          }}
        />
        <button
          onClick={add}
          aria-label="Adicionar condição"
          style={{
            padding: "6px 12px", borderRadius: "var(--radius)", cursor: "pointer", fontFamily: "inherit",
            background: "var(--accent-dim)", border: "1px solid var(--border-accent)",
            color: "var(--accent-light)", fontSize: "0.78rem", fontWeight: 700,
          }}
        >
          +
        </button>
      </div>

      {active.length === 0 ? (
        <p style={{ fontSize: "0.74rem", color: "var(--text-subtle)" }}>Nenhuma condição ativa.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {active.map((name) => (
            <span
              key={name}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.72rem", fontWeight: 700,
                padding: "3px 8px", borderRadius: "var(--radius-xs)",
                background: "var(--accent-dim)", border: "1px solid var(--border-accent)", color: "var(--text)",
              }}
            >
              {name}
              <button
                onClick={() => onChange(active.filter((c) => c !== name))}
                aria-label={`Remover ${name}`}
                style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "0.7rem", padding: 0, lineHeight: 1 }}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
