"use client";

// ─── Cartão de recurso ───────────────────────────────────────────────────────
// PV, PM, PE, Sanidade, Pontos de Poder, Sorte. União das três variantes que
// existiam (Ordem, Star Wars, Cthulhu): cada slot opcional aqui tem pelo menos
// um chamador real, nada é especulativo.
//
// Regra comum a todos os sistemas: o botão de dano desconta os pontos
// temporários antes dos atuais.

interface Props {
  label: string;
  /** Cor da barra e do número — semântica do recurso, não do sistema. */
  color: string;
  cur: number;
  max: number;
  temp?: number;
  /** Dano e cura. Recebe o delta já com sinal. */
  onDelta: (delta: number) => void;
  /** Linha de pontos temporários. Sem isto, a linha não aparece. */
  onTemp?: (value: number) => void;
  /** Máximo editável no próprio cartão (Ordem). */
  onMaxChange?: (value: number) => void;
  /** Botões extras de passo largo, ±5 (Star Wars, Sorte do Cthulhu). */
  bigStep?: number;
  /** Ícone de dado no canto: o recurso é testável (Sanidade e Sorte). */
  onRoll?: () => void;
  /** Aviso contextual: "Morrendo!", "Limite 3 PE/turno". */
  note?: string;
  warn?: boolean;
  /** Piso do valor atual. O Tormenta deixa o PV passar de zero. */
  min?: number;
}

export function VitalBar({
  label, color, cur, max, temp = 0,
  onDelta, onTemp, onMaxChange, bigStep, onRoll, note, warn, min = 0,
}: Props) {
  const pct = Math.max(0, Math.min(100, (Math.max(0, cur) / Math.max(1, max)) * 100));
  const canLower = cur > min || temp > 0;

  return (
    <div style={{ padding: "14px 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
          {label}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {note && (
            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: warn ? "#e0843c" : "var(--text-subtle)" }}>{note}</span>
          )}
          {onRoll && (
            <button
              onClick={onRoll}
              aria-label={`Rolar teste de ${label}`}
              title={`Rolar teste de ${label}`}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", padding: 0, lineHeight: 1 }}
            >
              🎲
            </button>
          )}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {bigStep && <button onClick={() => onDelta(-bigStep)} disabled={!canLower} style={stepBtnSmall} aria-label={`${label} menos ${bigStep}`}>−{bigStep}</button>}
        <button onClick={() => onDelta(-1)} disabled={!canLower} style={stepBtn} aria-label={`${label} menos 1`}>−</button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4 }}>
            <span style={{ fontSize: "1.55rem", fontWeight: 800, color, fontFamily: "var(--font-cinzel), serif", lineHeight: 1 }}>{cur}</span>
            {temp > 0 && <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--play-temp)" }}>(+{temp})</span>}
            <span style={{ fontSize: "0.86rem", color: "var(--text-subtle)" }}>/</span>
            {onMaxChange ? (
              <input
                value={max}
                onChange={(e) => { const v = parseInt(e.target.value, 10); onMaxChange(Number.isFinite(v) ? v : 0); }}
                aria-label={`${label} máximo`}
                style={{ width: 38, background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.95rem", fontWeight: 700, textAlign: "center", fontFamily: "inherit" }}
              />
            ) : (
              <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 700 }}>{max}</span>
            )}
          </div>
          <div style={{ height: 5, borderRadius: 3, background: "var(--surface-2)", overflow: "hidden", marginTop: 8, border: "1px solid var(--border)" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.3s ease" }} />
          </div>
        </div>

        <button onClick={() => onDelta(1)} style={stepBtn} aria-label={`${label} mais 1`}>+</button>
        {bigStep && <button onClick={() => onDelta(bigStep)} style={stepBtnSmall} aria-label={`${label} mais ${bigStep}`}>+{bigStep}</button>}
      </div>

      {onTemp && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 10 }}>
          <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--play-temp)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Temp</span>
          <button onClick={() => onTemp(Math.max(0, temp - 1))} style={tempBtn} aria-label={`${label} temporário menos 1`}>−</button>
          <span style={{ minWidth: 20, textAlign: "center", fontSize: "0.86rem", fontWeight: 800, color: temp > 0 ? "var(--play-temp)" : "var(--text-subtle)", fontFamily: "var(--font-cinzel), serif" }}>
            {temp}
          </span>
          <button onClick={() => onTemp(temp + 1)} style={tempBtn} aria-label={`${label} temporário mais 1`}>+</button>
        </div>
      )}
    </div>
  );
}

const stepBtn: React.CSSProperties = {
  width: 30, height: 30, borderRadius: "50%",
  background: "var(--surface-2)", border: "1px solid var(--border)",
  color: "var(--text)", fontSize: "1.05rem", fontWeight: 700, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  fontFamily: "inherit",
};

const stepBtnSmall: React.CSSProperties = {
  ...stepBtn, width: 30, height: 24, borderRadius: "var(--radius)", fontSize: "0.68rem",
};

const tempBtn: React.CSSProperties = {
  ...stepBtn, width: 22, height: 22, fontSize: "0.78rem",
};
