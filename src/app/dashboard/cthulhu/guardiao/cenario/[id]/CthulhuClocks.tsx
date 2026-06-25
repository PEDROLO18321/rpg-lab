"use client";

import { useState } from "react";
import type { CthulhuApi } from "@/lib/cthulhu/useCthulhuCampaign";
import type { CthulhuClock } from "@/lib/cthulhu/cthulhuCampaignClient";

const A = "#a3b86c";
const ABORD = "rgba(125,156,62,0.32)";

const KIND_COLOR: Record<CthulhuClock["kind"], string> = { ameaca: "#e0524c", missao: "#7dd3a8", neutro: "#9aa0a6" };
const KIND_LABEL: Record<CthulhuClock["kind"], string> = { ameaca: "Ameaça", missao: "Investigação", neutro: "Neutro" };
const SEGMENT_OPTIONS = [4, 6, 8, 10, 12];

function ClockDial({ segments, filled, color, size = 84 }: { segments: number; filled: number; color: string; size?: number }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 4;
  const slices = Array.from({ length: segments }, (_, i) => {
    const a0 = (i / segments) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / segments) * 2 * Math.PI - Math.PI / 2;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0), x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return { d: `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`, on: i < filled };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => <path key={i} d={s.d} fill={s.on ? color : "transparent"} fillOpacity={s.on ? 0.85 : 0} stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />)}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="1.6" />
    </svg>
  );
}

export function CthulhuClocks({ api }: { api: CthulhuApi }) {
  const clocks = api.campaign.cthulhuClocks;
  const [name, setName] = useState("");
  const [segments, setSegments] = useState(4);
  const [kind, setKind] = useState<CthulhuClock["kind"]>("ameaca");

  async function add() { if (!name.trim()) return; await api.addChild("clocks", { name: name.trim(), segments, filled: 0, kind }); setName(""); }
  function tick(c: CthulhuClock, delta: number) { api.editChild("clocks", c.id, { filled: Math.max(0, Math.min(c.segments, c.filled + delta)) }); }

  const ip: React.CSSProperties = { padding: "9px 12px", background: "var(--surface-2)", border: `1px solid ${ABORD}`, borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem", boxSizing: "border-box" };
  const lab: React.CSSProperties = { display: "block", fontSize: "0.68rem", fontWeight: 700, color: "#7d9c3e", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 10 }}><span style={{ color: A }}>⏳</span> Relógios de Tensão</h2>
        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 }}>Acompanhe o avanço de ameaças, rituais do culto ou a investigação dos jogadores.</p>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "end", padding: "16px 20px", background: "var(--surface)", border: `1px solid ${ABORD}`, borderRadius: "var(--radius-xl)" }}>
        <div style={{ flex: "2 1 200px" }}><label style={lab}>Nome</label><input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Ex: Ritual de invocação" style={{ ...ip, width: "100%" }} /></div>
        <div><label style={lab}>Segmentos</label><select value={segments} onChange={(e) => setSegments(Number(e.target.value))} style={{ ...ip, cursor: "pointer" }}>{SEGMENT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
        <div><label style={lab}>Tipo</label><select value={kind} onChange={(e) => setKind(e.target.value as CthulhuClock["kind"])} style={{ ...ip, cursor: "pointer" }}>{(["ameaca", "missao", "neutro"] as const).map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}</select></div>
        <button onClick={add} disabled={!name.trim()} style={{ padding: "9px 20px", background: name.trim() ? "linear-gradient(135deg, #a3b86c 0%, #7d9c3e 100%)" : "var(--surface-2)", color: name.trim() ? "#06090f" : "var(--text-muted)", border: "none", borderRadius: "var(--radius)", fontSize: "0.84rem", fontWeight: 700, cursor: name.trim() ? "pointer" : "not-allowed" }}>+ Criar</button>
      </div>

      {clocks.length === 0 ? (
        <p style={{ fontSize: "0.84rem", color: "var(--text-subtle)", textAlign: "center", padding: "32px 0" }}>Nenhum relógio.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
          {clocks.map((c: CthulhuClock) => {
            const color = KIND_COLOR[c.kind]; const done = c.filled >= c.segments;
            return (
              <div key={c.id} style={{ padding: "18px 16px", background: "var(--surface)", border: `1px solid ${done ? color : "var(--border)"}`, borderRadius: "var(--radius-xl)", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                  <span style={{ fontSize: "0.66rem", fontWeight: 700, color, background: `${color}1a`, border: `1px solid ${color}55`, borderRadius: "var(--radius-xs)", padding: "2px 8px" }}>{KIND_LABEL[c.kind]}</span>
                  <button onClick={() => api.removeChild("clocks", c.id)} style={{ padding: "2px 6px", background: "transparent", color: "var(--text-subtle)", border: "none", cursor: "pointer", fontSize: "0.8rem" }}>✕</button>
                </div>
                <ClockDial segments={c.segments} filled={c.filled} color={color} />
                <p style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--text)", textAlign: "center", lineHeight: 1.3 }}>{c.name}</p>
                <p style={{ fontSize: "0.74rem", color: done ? color : "var(--text-muted)", fontWeight: 700 }}>{c.filled}/{c.segments}{done ? " — completo!" : ""}</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => tick(c, -1)} style={{ width: 34, height: 30, borderRadius: "var(--radius)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)", cursor: "pointer", fontSize: "1rem", fontWeight: 700 }}>−</button>
                  <button onClick={() => tick(c, 1)} style={{ width: 34, height: 30, borderRadius: "var(--radius)", background: `${color}1a`, border: `1px solid ${color}55`, color, cursor: "pointer", fontSize: "1rem", fontWeight: 700 }}>+</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
