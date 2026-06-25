"use client";

import { useEffect, useState, use } from "react";

const KIND_COLOR: Record<string, string> = { ameaca: "#e0524c", missao: "#7dd3a8", neutro: "#9aa0a6" };

interface ShareData {
  name: string;
  dndStory: { currentArc: string } | null;
  dndCombatants: { id: string; name: string; initiative: number; isPlayer: boolean; conditions: string }[];
  dndClocks: { id: string; name: string; segments: number; filled: number; kind: string }[];
  dndClues: { id: string; title: string; content: string; source: string }[];
}

function ClockDial({ segments, filled, color }: { segments: number; filled: number; color: string }) {
  const size = 64, cx = size / 2, cy = size / 2, r = size / 2 - 4;
  const slices = Array.from({ length: segments }, (_, i) => {
    const a0 = (i / segments) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / segments) * 2 * Math.PI - Math.PI / 2;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0), x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return { d: `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`, on: i < filled };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => <path key={i} d={s.d} fill={s.on ? color : "transparent"} fillOpacity={s.on ? 0.85 : 0} stroke="rgba(255,255,255,0.3)" strokeWidth="1.1" />)}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="1.4" />
    </svg>
  );
}

export default function DndPlayerViewPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [data, setData] = useState<ShareData | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let alive = true;
    const load = () => fetch(`/api/dnd/campaigns/share/${code}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => { if (alive) { setData(d.campaign); setStatus("ready"); } })
      .catch(() => { if (alive) setStatus("error"); });
    load();
    const t = setInterval(load, 15000);
    return () => { alive = false; clearInterval(t); };
  }, [code]);

  if (status === "loading") return <Center>Carregando campanha...</Center>;
  if (status === "error" || !data) return <Center>Campanha não encontrada.</Center>;

  return (
    <div style={{ minHeight: "100vh", background: "transparent", maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" }}>
      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--accent-light)", letterSpacing: "0.1em", textTransform: "uppercase" }}>D&D 5e · Tela do Jogador</span>
      <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "clamp(1.4rem, 4vw, 2rem)", fontWeight: 700, color: "var(--text)", margin: "8px 0 24px" }}>{data.name}</h1>

      {data.dndStory?.currentArc && (
        <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "20px 24px", marginBottom: 20 }}>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.7 }}>{data.dndStory.currentArc}</p>
        </section>
      )}

      {data.dndCombatants.length > 0 && (
        <Section title="Ordem de Iniciativa">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {data.dndCombatants.map((c) => {
              let conds: string[] = [];
              try { const a = JSON.parse(c.conditions); if (Array.isArray(a)) conds = a; } catch {}
              return (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                  <span style={{ minWidth: 28, textAlign: "center", fontWeight: 800, color: "var(--accent-light)", fontFamily: "var(--font-cinzel), serif" }}>{c.initiative}</span>
                  <span style={{ flex: 1, fontWeight: 700, color: c.isPlayer ? "#63b3ed" : "var(--text)" }}>{c.name}</span>
                  {conds.length > 0 && <span style={{ fontSize: "0.7rem", color: "#fbbf24" }}>{conds.length} condição(ões)</span>}
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {data.dndClocks.length > 0 && (
        <Section title="Relógios">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
            {data.dndClocks.map((c) => {
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

      {data.dndClues.length > 0 && (
        <Section title="Pistas Reveladas">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.dndClues.map((c) => (
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
      <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.92rem", fontWeight: 700, color: "var(--accent-light)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--border-accent)" }} />{title}
      </h2>
      {children}
    </section>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>{children}</p></div>;
}
