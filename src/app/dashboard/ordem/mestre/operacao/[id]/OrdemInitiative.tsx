"use client";

import { useState } from "react";
import { type OrdemCampaign, type OrdemCombatant } from "@/lib/ordem/ordemCampaignStorage";

const A = "#ffffff";
const AL = "#e8e8ef";
const AD = "rgba(255,255,255,0.1)";
const AB = "rgba(255,255,255,0.28)";

interface Props { campaign: OrdemCampaign; onChange: (c: OrdemCampaign) => void; }

const btnBase: React.CSSProperties = {
  height: 26, background: "transparent", border: "1px solid var(--border)", borderRadius: "var(--radius)",
  cursor: "pointer", fontSize: "0.72rem", fontWeight: 700, lineHeight: 1, display: "flex",
  alignItems: "center", justifyContent: "center", padding: "0 5px", color: "var(--text-muted)", transition: "all 0.15s",
};

export function OrdemInitiative({ campaign, onChange }: Props) {
  const [name, setName] = useState("");
  const [initVal, setInitVal] = useState("");
  const [pv, setPv] = useState("");
  const [pe, setPe] = useState("");
  const [san, setSan] = useState("");
  const [isPlayer, setIsPlayer] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const combatants = campaign.combatants;

  function save(list: OrdemCombatant[]) {
    onChange({ ...campaign, combatants: list });
  }

  function add() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const init = initVal !== "" ? Number(initVal) : Math.floor(Math.random() * 20) + 1;
    const pvNum = pv !== "" ? Number(pv) : null;
    const peNum = pe !== "" ? Number(pe) : null;
    const sanNum = san !== "" ? Number(san) : null;
    const entry: OrdemCombatant = {
      id: crypto.randomUUID(), name: trimmed, init,
      pv: pvNum, maxPv: pvNum, pe: peNum, maxPe: peNum, san: sanNum, maxSan: sanNum, isPlayer,
    };
    setName(""); setInitVal(""); setPv(""); setPe(""); setSan(""); setIsPlayer(false);
    save([...combatants, entry]);
  }

  function sort() { save([...combatants].sort((a, b) => b.init - a.init)); }
  function moveUp(idx: number) { if (idx === 0) return; const l = [...combatants]; [l[idx - 1], l[idx]] = [l[idx], l[idx - 1]]; save(l); }
  function moveDown(idx: number) { if (idx === combatants.length - 1) return; const l = [...combatants]; [l[idx], l[idx + 1]] = [l[idx + 1], l[idx]]; save(l); }
  function remove(id: string) { save(combatants.filter((c) => c.id !== id)); if (activeId === id) setActiveId(null); }

  function nextTurn() {
    if (combatants.length === 0) return;
    if (activeId === null) { setActiveId(combatants[0].id); return; }
    const idx = combatants.findIndex((c) => c.id === activeId);
    setActiveId(combatants[(idx + 1) % combatants.length].id);
  }

  function adjust(id: string, field: "pv" | "pe" | "san", delta: number) {
    save(combatants.map((c) => {
      if (c.id !== id || c[field] === null) return c;
      const max = field === "pv" ? c.maxPv : field === "pe" ? c.maxPe : c.maxSan;
      const next = Math.max(0, (c[field] as number) + delta);
      return { ...c, [field]: max !== null ? Math.min(max, next) : next };
    }));
  }

  function clearAll() { save([]); setActiveId(null); }

  const inputStyle: React.CSSProperties = {
    padding: "9px 12px", background: "var(--surface-2)", border: `1px solid ${AB}`, borderRadius: "var(--radius)",
    color: "var(--text)", fontSize: "0.86rem", width: "100%", boxSizing: "border-box",
  };

  function vital(c: OrdemCombatant, field: "pv" | "pe" | "san", label: string, color: string) {
    const cur = c[field];
    const max = field === "pv" ? c.maxPv : field === "pe" ? c.maxPe : c.maxSan;
    if (cur === null || max === null) return null;
    const pct = max > 0 ? Math.max(0, cur / max) : 0;
    const barColor = field === "pv" ? (pct < 0.3 ? "#f87171" : pct < 0.6 ? "#fbbf24" : "#4ade80") : color;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
        <span style={{ fontSize: "0.6rem", color: "var(--text-subtle)", marginRight: 2 }}>{label}</span>
        <button onClick={() => adjust(c.id, field, -1)} title={`−1 ${label}`} style={{ ...btnBase, color: barColor, borderColor: `${barColor}44`, background: `${barColor}14`, width: 24 }}>−</button>
        <div style={{ minWidth: 46, textAlign: "center" }}>
          <p style={{ fontSize: "0.8rem", fontWeight: 700, color: barColor }}>{cur}/{max}</p>
          <div style={{ height: 3, background: "var(--surface-2)", borderRadius: 2, marginTop: 2 }}>
            <div style={{ height: "100%", width: `${pct * 100}%`, background: barColor, borderRadius: 2, transition: "width 0.3s" }} />
          </div>
        </div>
        <button onClick={() => adjust(c.id, field, 1)} title={`+1 ${label}`} style={{ ...btnBase, color: barColor, borderColor: `${barColor}44`, background: `${barColor}14`, width: 24 }}>+</button>
      </div>
    );
  }

  return (
    <div>
      {/* Add form */}
      <div style={{ padding: "20px 24px", background: "var(--surface)", border: `1px solid ${AB}`, borderRadius: "var(--radius-xl)", marginBottom: 24 }}>
        <p style={{ fontSize: "0.72rem", fontWeight: 700, color: A, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
          Adicionar à Ordem de Ação
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.68rem", color: "var(--text-muted)", marginBottom: 4 }}>Nome</label>
            <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Ex: Membro, Zumbi" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.68rem", color: "var(--text-muted)", marginBottom: 4 }}>Inic. <span style={{ color: "var(--text-subtle)", fontWeight: 400 }}>(vazio = aleatório)</span></label>
            <input type="number" value={initVal} onChange={(e) => setInitVal(e.target.value)} placeholder="—" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.68rem", color: "var(--text-muted)", marginBottom: 4 }}>PV</label>
            <input type="number" value={pv} onChange={(e) => setPv(e.target.value)} placeholder="—" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.68rem", color: "var(--text-muted)", marginBottom: 4 }}>PE</label>
            <input type="number" value={pe} onChange={(e) => setPe(e.target.value)} placeholder="—" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.68rem", color: "var(--text-muted)", marginBottom: 4 }}>SAN</label>
            <input type="number" value={san} onChange={(e) => setSan(e.target.value)} placeholder="—" style={inputStyle} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", color: "var(--text-muted)", cursor: "pointer" }}>
            <input type="checkbox" checked={isPlayer} onChange={(e) => setIsPlayer(e.target.checked)} />
            Agente (PC)
          </label>
          <button onClick={add} disabled={!name.trim()} style={{ padding: "9px 20px", background: name.trim() ? `linear-gradient(135deg, ${A} 0%, #b9b9c6 100%)` : "var(--surface-2)", color: name.trim() ? "#06090f" : "var(--text-muted)", border: "none", borderRadius: "var(--radius)", fontSize: "0.86rem", fontWeight: 700, cursor: name.trim() ? "pointer" : "not-allowed" }}>
            + Adicionar
          </button>
        </div>
      </div>

      {/* Controls */}
      {combatants.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <button onClick={sort} style={{ padding: "8px 16px", background: AD, color: AL, border: `1px solid ${AB}`, borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>
            ↕ Ordenar por Iniciativa
          </button>
          <button onClick={nextTurn} style={{ padding: "8px 16px", background: AD, color: AL, border: `1px solid ${AB}`, borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>
            ▶ Próxima Ação
          </button>
          <button onClick={clearAll} style={{ padding: "8px 14px", background: "transparent", color: "var(--text-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.82rem", cursor: "pointer", marginLeft: "auto" }}>
            Limpar tudo
          </button>
        </div>
      )}

      {/* List */}
      {combatants.length === 0 ? (
        <p style={{ fontSize: "0.86rem", color: "var(--text-subtle)", textAlign: "center", padding: "40px 0" }}>
          Ninguém na ordem de ação. Adicione agentes e criaturas acima.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {combatants.map((c, idx) => {
            const isActive = c.id === activeId;
            return (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", background: isActive ? AD : "var(--surface)", border: `1px solid ${isActive ? AB : "var(--border)"}`, borderRadius: "var(--radius-xl)", transition: "all 0.2s", flexWrap: "wrap" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: isActive ? A : "transparent", border: `2px solid ${isActive ? A : "var(--border)"}`, flexShrink: 0 }} />

                <div style={{ display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
                  <button onClick={() => moveUp(idx)} disabled={idx === 0} style={{ padding: "1px 5px", background: "transparent", border: "none", cursor: idx === 0 ? "default" : "pointer", color: idx === 0 ? "var(--border)" : "var(--text-muted)", fontSize: "0.7rem", lineHeight: 1 }}>▲</button>
                  <button onClick={() => moveDown(idx)} disabled={idx === combatants.length - 1} style={{ padding: "1px 5px", background: "transparent", border: "none", cursor: idx === combatants.length - 1 ? "default" : "pointer", color: idx === combatants.length - 1 ? "var(--border)" : "var(--text-muted)", fontSize: "0.7rem", lineHeight: 1 }}>▼</button>
                </div>

                <div style={{ minWidth: 40, height: 36, borderRadius: "var(--radius)", background: isActive ? AD : c.isPlayer ? "rgba(99,179,237,0.1)" : "var(--surface-2)", border: `1px solid ${isActive ? AB : c.isPlayer ? "rgba(99,179,237,0.25)" : "var(--border)"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: "0.66rem", fontWeight: 700, color: isActive ? AL : c.isPlayer ? "#63b3ed" : "var(--text-muted)", flexShrink: 0 }}>
                  <span style={{ fontSize: "0.46rem", fontWeight: 700, letterSpacing: "0.04em", opacity: 0.7 }}>INIC</span>
                  <span>{c.init}</span>
                </div>

                <div style={{ flex: 1, minWidth: 100 }}>
                  <p style={{ fontSize: "0.88rem", fontWeight: 700, color: isActive ? AL : "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</p>
                  <p style={{ fontSize: "0.68rem", color: "var(--text-subtle)" }}>{c.isPlayer ? "Agente" : "Criatura/NPC"}</p>
                </div>

                {vital(c, "pv", "PV", "#4ade80")}
                {vital(c, "pe", "PE", "#60a5fa")}
                {vital(c, "san", "SAN", "#a78bfa")}

                <button onClick={() => remove(c.id)} style={{ padding: "4px 8px", background: "transparent", color: "var(--text-subtle)", border: "none", cursor: "pointer", fontSize: "0.8rem", flexShrink: 0 }}>✕</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
