"use client";

import dynamic from "next/dynamic";
import type { OrdemWizardData } from "../CharacterWizard";
import { ATTR_KEYS, ATTR_LABEL, ATTR_ABBR, type AttrKey } from "@/lib/ordem/data";
import { randomOrdemName } from "@/lib/ordem/names";

const Dice3D = dynamic(() => import("@/components/three/Dice3D"), { ssr: false });

const ACCENT_LIGHT = "#ffffff";

interface Props {
  data: OrdemWizardData;
  onChange: (p: Partial<OrdemWizardData>) => void;
}

export function StepAttrs({ data, onChange }: Props) {
  const attrs = data.attrs;
  const vals = Object.values(attrs);
  const used = vals.reduce((a, v) => a + Math.max(0, v - 1), 0);
  const zeros = vals.filter((v) => v === 0).length;
  const remaining = 4 + zeros - used;

  function setAttr(key: AttrKey, delta: number) {
    const v = attrs[key];
    if (delta > 0 && (v >= 3 || remaining <= 0)) return;
    if (delta < 0 && v <= 0) return;
    if (delta < 0 && v === 1 && zeros >= 1) return; // apenas um atributo pode ir a 0
    onChange({ attrs: { ...attrs, [key]: v + delta } });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <Intro
        title="Identidade & Atributos"
        text="Dê um nome ao seu agente e distribua os atributos. Cada um começa em 1; você tem 4 pontos. Pode reduzir um atributo a 0 para ganhar +1 ponto. Máximo inicial: 3."
      />

      {/* Nome */}
      <div>
        <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          Nome do agente
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Ex.: Ulisses Beltrão"
            maxLength={60}
            style={{
              flex: 1, minWidth: 0, padding: "11px 14px",
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.92rem",
            }}
          />
          <button
            type="button"
            onClick={() => onChange({ name: randomOrdemName() })}
            title="Gerar nome aleatório"
            style={{
              flexShrink: 0, padding: "0 16px",
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: "var(--radius)", color: ACCENT_LIGHT,
              fontSize: "0.86rem", fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
            }}
          >
            🎲 Aleatório
          </button>
        </div>
      </div>

      {/* Pontos restantes */}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 18px",
          background: remaining === 0 ? "rgba(125,200,100,0.08)" : "rgba(255,255,255,0.08)",
          border: `1px solid ${remaining === 0 ? "rgba(125,200,100,0.3)" : "rgba(255,255,255,0.25)"}`,
          borderRadius: "var(--radius-lg)",
        }}
      >
        <span style={{ fontSize: "0.84rem", color: "var(--text-muted)" }}>Pontos restantes</span>
        <span style={{ fontSize: "1.1rem", fontWeight: 800, color: remaining === 0 ? "#7dc864" : ACCENT_LIGHT }}>
          {remaining}
        </span>
      </div>

      {/* Atributos */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
        {ATTR_KEYS.map((key) => (
          <div
            key={key}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              padding: "16px 12px 14px",
              background: attrs[key] === 0 ? "var(--surface)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${attrs[key] === 0 ? "var(--border)" : "rgba(255,255,255,0.18)"}`,
              borderRadius: "var(--radius-lg)",
              transition: "background 0.2s, border-color 0.2s",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--text)" }}>{ATTR_LABEL[key]}</p>
              <p style={{ fontSize: "0.66rem", color: "var(--text-subtle)", letterSpacing: "0.08em" }}>{ATTR_ABBR[key]}</p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <StepBtn label="−" onClick={() => setAttr(key, -1)} disabled={attrs[key] <= 0 || (attrs[key] === 1 && zeros >= 1)} />
              <span style={{ minWidth: 24, textAlign: "center", fontSize: "1.7rem", fontWeight: 800, color: attrs[key] === 0 ? "var(--text-subtle)" : ACCENT_LIGHT, fontFamily: "var(--font-cinzel), serif" }}>
                {attrs[key]}
              </span>
              <StepBtn label="+" onClick={() => setAttr(key, 1)} disabled={attrs[key] >= 3 || remaining <= 0} />
            </div>

            {/* Dado 3D branco girando */}
            <div style={{ opacity: attrs[key] === 0 ? 0.4 : 1, transition: "opacity 0.2s" }}>
              <Dice3D sides={20} size={40} color="#ffffff" edgeColor="#ffffff" emissive="#2a2a30" />
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: "0.76rem", color: "var(--text-subtle)", lineHeight: 1.6 }}>
        Atributo 0 é arriscado: testes baseados nele rolam 2d20 e usam o pior resultado.
      </p>
    </div>
  );
}

function StepBtn({ label, onClick, disabled }: { label: string; onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 32, height: 32, borderRadius: "50%",
        background: disabled ? "var(--surface-2)" : "rgba(255,255,255,0.14)",
        border: `1px solid ${disabled ? "var(--border)" : "rgba(255,255,255,0.35)"}`,
        color: disabled ? "var(--text-subtle)" : ACCENT_LIGHT,
        fontSize: "1.05rem", fontWeight: 700,
        cursor: disabled ? "default" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}

export function Intro({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.3rem", fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
        {title}
      </h2>
      <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", lineHeight: 1.7, maxWidth: 620 }}>{text}</p>
    </div>
  );
}
