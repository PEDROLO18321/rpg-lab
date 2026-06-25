"use client";

import { useEffect, useState, use } from "react";

const AL = "#e8e8ef";
const AD = "rgba(255,255,255,0.1)";
const AB = "rgba(255,255,255,0.28)";

const MEMBRANA_LABEL: Record<string, { label: string; color: string }> = {
  intacta: { label: "Intacta", color: "#7dd3a8" },
  estavel: { label: "Estável", color: "#5a9fd4" },
  danificada: { label: "Danificada", color: "#c9941f" },
  arruinada: { label: "Arruinada", color: "#c0392b" },
  rompida: { label: "Rompida", color: "#8b0000" },
};
const KIND_COLOR: Record<string, string> = { ameaca: "#e0524c", missao: "#7dd3a8", neutro: "#9aa0a6" };

interface ShareData {
  name: string;
  tier: string;
  ordemStory: { membrana: string; currentArc: string } | null;
  ordemCombatants: { id: string; name: string; init: number; isPlayer: boolean; conditions: string }[];
  ordemClocks: { id: string; name: string; segments: number; filled: number; kind: string }[];
  ordemClues: { id: string; title: string; content: string; source: string }[];
}

function ClockDial({ segments, filled, color }: { segments: number; filled: number; color: string }) {
  const size = 64, cx = size / 2, cy = size / 2, r = size / 2 - 4;
  const slices = Array.from({ length: segments }, (_, i) => {
    const a0 = (i / segments) * 2 * Math.PI - Math.PI / 2;
    const a1 = ((i + 1) / segments) * 2 * Math.PI - Math.PI / 2;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return { d: `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`, on: i < filled };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => <path key={i} d={s.d} fill={s.on ? color : "transparent"} fillOpacity={s.on ? 0.85 : 0} stroke="rgba(255,255,255,0.35)" strokeWidth="1.1" />)}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="1.4" />
    </svg>
  );
}

export default function PlayerViewPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [data, setData] = useState<ShareData | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let alive = true;
    const load = () => fetch(`/api/ordem/campaigns/share/${code}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => { if (alive) { setData(d.campaign); setStatus("ready"); } })
      .catch(() => { if (alive) setStatus("error"); });
    load();
    const t = setInterval(load, 15000); // refresca a cada 15s
    return () => { alive = false; clearInterval(t); };
  }, [code]);

  if (status === "loading") return <Center>Carregando operação...</Center>;
  if (status === "error" || !data) return <Center>Operação não encontrada.</Center>;

  const membrana = data.ordemStory ? MEMBRANA_LABEL[data.ordemStory.membrana] : null;

  return (
    <div style={{ minHeight: "100vh", background: "transparent", maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" }}>
      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: AL, letterSpacing: "0.1em", textTransform: "uppercase" }}>Ordem Paranormal · Tela do Jogador</span>
      <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "clamp(1.4rem, 4vw, 2rem)", fontWeight: 700, color: "var(--text)", margin: "8px 0 24px" }}>{data.name}</h1>

      {(membrana || data.ordemStory?.currentArc) && (
        <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "20px 24px", marginBottom: 20 }}>
          {membrana && (
            <p style={{ marginBottom: data.ordemStory?.currentArc ? 12 : 0 }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Membrana: </span>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: membrana.color }}>{membrana.label}</span>
            </p>
          )}
          {data.ordemStory?.currentArc && <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.7 }}>{data.ordemStory.currentArc}</p>}
        </section>
      )}

      {data.ordemCombatants.length > 0 && (
        <Section title="Ordem de Ação">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {data.ordemCombatants.map((c) => {
              let conds: string[] = [];
              try { const a = JSON.parse(c.conditions); if (Array.isArray(a)) conds = a; } catch {}
              return (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                  <span style={{ minWidth: 28, textAlign: "center", fontWeight: 800, color: AL, fontFamily: "var(--font-cinzel), serif" }}>{c.init}</span>
                  <span style={{ flex: 1, fontWeight: 700, color: c.isPlayer ? "#63b3ed" : "var(--text)" }}>{c.name}</span>
                  {conds.length > 0 && <span style={{ fontSize: "0.7rem", color: "#fbbf24" }}>{conds.length} condição(ões)</span>}
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {data.ordemClocks.length > 0 && (
        <Section title="Relógios">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
            {data.ordemClocks.map((c) => {
              const color = KIND_COLOR[c.kind] ?? "#9aa0a6";
              return (
                <div key={c.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)" }}>
                  <ClockDial segments={c.segments} filled={c.filled} color={color} />
                  <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", textAlign: "center" }}>{c.name}</p>
                  <p style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>{c.filled}/{c.segments}</p>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {data.ordemClues.length > 0 && (
        <Section title="Pistas Reveladas">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.ordemClues.map((c) => (
              <div key={c.id} style={{ padding: "12px 16px", background: "var(--surface)", border: "1px solid rgba(125,211,168,0.3)", borderRadius: "var(--radius-xl)" }}>
                <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text)" }}>{c.title}</p>
                {c.source && <p style={{ fontSize: "0.74rem", color: "var(--text-subtle)", marginTop: 2 }}>{c.source}</p>}
                {c.content && <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.6, marginTop: 6 }}>{c.content}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)", textAlign: "center", marginTop: 32 }}>Atualiza automaticamente a cada 15 segundos.</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 24 }}>
      <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.92rem", fontWeight: 700, color: AL, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: AB }} />{title}
      </h2>
      {children}
    </section>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>{children}</p>
    </div>
  );
}
