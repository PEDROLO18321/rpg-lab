"use client";

import { useState } from "react";
import { type CthulhuCampaign, type CthulhuCombatant } from "@/lib/cthulhu/cthulhuCampaignStorage";

interface Props { campaign: CthulhuCampaign; onChange: (c: CthulhuCampaign) => void; }

const btnBase: React.CSSProperties = {
  height: 26,
  background: "transparent",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  cursor: "pointer",
  fontSize: "0.72rem",
  fontWeight: 700,
  lineHeight: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 5px",
  color: "var(--text-muted)",
  transition: "all 0.15s",
};

export function CthulhuInitiative({ campaign, onChange }: Props) {
  const [name, setName] = useState("");
  const [dexVal, setDexVal] = useState("");
  const [hp, setHp] = useState("");
  const [san, setSan] = useState("");
  const [isPlayer, setIsPlayer] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const combatants = campaign.combatants;

  function save(list: CthulhuCombatant[]) {
    onChange({ ...campaign, combatants: list });
  }

  function add() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const dex = dexVal !== "" ? Number(dexVal) : Math.floor(Math.random() * 70) + 30;
    const hpNum = hp !== "" ? Number(hp) : null;
    const sanNum = san !== "" ? Number(san) : null;
    const entry: CthulhuCombatant = {
      id: crypto.randomUUID(), name: trimmed, dex, hp: hpNum, maxHp: hpNum, san: sanNum, maxSan: sanNum, isPlayer,
    };
    setName(""); setDexVal(""); setHp(""); setSan(""); setIsPlayer(false);
    save([...combatants, entry]);
  }

  function sort() {
    save([...combatants].sort((a, b) => b.dex - a.dex));
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    const list = [...combatants];
    [list[idx - 1], list[idx]] = [list[idx], list[idx - 1]];
    save(list);
  }

  function moveDown(idx: number) {
    if (idx === combatants.length - 1) return;
    const list = [...combatants];
    [list[idx], list[idx + 1]] = [list[idx + 1], list[idx]];
    save(list);
  }

  function remove(id: string) {
    save(combatants.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(null);
  }

  function nextTurn() {
    if (combatants.length === 0) return;
    if (activeId === null) { setActiveId(combatants[0].id); return; }
    const idx = combatants.findIndex((c) => c.id === activeId);
    setActiveId(combatants[(idx + 1) % combatants.length].id);
  }

  function updateHp(id: string, delta: number) {
    save(combatants.map((c) => c.id !== id || c.hp === null ? c : { ...c, hp: Math.max(0, c.hp + delta) }));
  }

  function updateSan(id: string, delta: number) {
    save(combatants.map((c) => c.id !== id || c.san === null ? c : { ...c, san: Math.max(0, c.san + delta) }));
  }

  function clearAll() { save([]); setActiveId(null); }

  const inputStyle: React.CSSProperties = {
    padding: "9px 12px",
    background: "var(--surface-2)",
    border: "1px solid rgba(125,156,62,0.32)",
    borderRadius: "var(--radius)",
    color: "var(--text)",
    fontSize: "0.86rem",
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <div>
      {/* Add form */}
      <div style={{ padding: "20px 24px", background: "var(--surface)", border: "1px solid rgba(125,156,62,0.32)", borderRadius: "var(--radius-xl)", marginBottom: 24 }}>
        <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#7d9c3e", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
          Adicionar à Ordem de Ação
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.68rem", color: "var(--text-muted)", marginBottom: 4 }}>Nome</label>
            <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Ex: Cultista, Ghoul" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.68rem", color: "var(--text-muted)", marginBottom: 4 }}>DEX <span style={{ color: "var(--text-subtle)", fontWeight: 400 }}>(vazio = aleatório)</span></label>
            <input type="number" value={dexVal} onChange={(e) => setDexVal(e.target.value)} placeholder="—" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.68rem", color: "var(--text-muted)", marginBottom: 4 }}>PV <span style={{ color: "var(--text-subtle)", fontWeight: 400 }}>(opcional)</span></label>
            <input type="number" value={hp} onChange={(e) => setHp(e.target.value)} placeholder="—" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.68rem", color: "var(--text-muted)", marginBottom: 4 }}>SAN <span style={{ color: "var(--text-subtle)", fontWeight: 400 }}>(opcional)</span></label>
            <input type="number" value={san} onChange={(e) => setSan(e.target.value)} placeholder="—" style={inputStyle} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", color: "var(--text-muted)", cursor: "pointer" }}>
            <input type="checkbox" checked={isPlayer} onChange={(e) => setIsPlayer(e.target.checked)} />
            Investigador (PC)
          </label>
          <button onClick={add} disabled={!name.trim()} style={{ padding: "9px 20px", background: name.trim() ? "linear-gradient(135deg, #a3b86c 0%, #7d9c3e 100%)" : "var(--surface-2)", color: name.trim() ? "#06090f" : "var(--text-muted)", border: "none", borderRadius: "var(--radius)", fontSize: "0.86rem", fontWeight: 700, cursor: name.trim() ? "pointer" : "not-allowed" }}>
            + Adicionar
          </button>
        </div>
      </div>

      {/* Controls */}
      {combatants.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <button onClick={sort} style={{ padding: "8px 16px", background: "rgba(125,156,62,0.14)", color: "#a3b86c", border: "1px solid rgba(125,156,62,0.32)", borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>
            ↕ Ordenar por DEX
          </button>
          <button onClick={nextTurn} style={{ padding: "8px 16px", background: "rgba(125,156,62,0.14)", color: "#a3b86c", border: "1px solid rgba(125,156,62,0.32)", borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>
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
          Nenhum combatente na ordem. Adicione investigadores e criaturas acima.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {combatants.map((c, idx) => {
            const isActive = c.id === activeId;
            const hpPct = c.hp !== null && c.maxHp ? Math.max(0, c.hp / c.maxHp) : null;
            const hpColor = hpPct !== null && hpPct < 0.3 ? "#f87171" : hpPct !== null && hpPct < 0.6 ? "#fbbf24" : "#4ade80";
            const sanPct = c.san !== null && c.maxSan ? Math.max(0, c.san / c.maxSan) : null;
            const sanColor = sanPct !== null && sanPct < 0.3 ? "#f87171" : sanPct !== null && sanPct < 0.6 ? "#fbbf24" : "#a3b86c";
            return (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", background: isActive ? "rgba(125,156,62,0.14)" : "var(--surface)", border: `1px solid ${isActive ? "rgba(125,156,62,0.32)" : "var(--border)"}`, borderRadius: "var(--radius-xl)", transition: "all 0.2s" }}>
                {/* Turn indicator */}
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: isActive ? "#7d9c3e" : "transparent", border: `2px solid ${isActive ? "#7d9c3e" : "var(--border)"}`, flexShrink: 0 }} />

                {/* Reorder */}
                <div style={{ display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
                  <button onClick={() => moveUp(idx)} disabled={idx === 0} style={{ padding: "1px 5px", background: "transparent", border: "none", cursor: idx === 0 ? "default" : "pointer", color: idx === 0 ? "var(--border)" : "var(--text-muted)", fontSize: "0.7rem", lineHeight: 1 }}>▲</button>
                  <button onClick={() => moveDown(idx)} disabled={idx === combatants.length - 1} style={{ padding: "1px 5px", background: "transparent", border: "none", cursor: idx === combatants.length - 1 ? "default" : "pointer", color: idx === combatants.length - 1 ? "var(--border)" : "var(--text-muted)", fontSize: "0.7rem", lineHeight: 1 }}>▼</button>
                </div>

                {/* DEX badge */}
                <div style={{ minWidth: 36, height: 36, borderRadius: "var(--radius)", background: isActive ? "rgba(125,156,62,0.14)" : c.isPlayer ? "rgba(99,179,237,0.1)" : "var(--surface-2)", border: `1px solid ${isActive ? "rgba(125,156,62,0.32)" : c.isPlayer ? "rgba(99,179,237,0.25)" : "var(--border)"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: "0.66rem", fontWeight: 700, color: isActive ? "#a3b86c" : c.isPlayer ? "#63b3ed" : "var(--text-muted)", flexShrink: 0 }}>
                  <span style={{ fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.04em", opacity: 0.7 }}>DEX</span>
                  <span>{c.dex}</span>
                </div>

                {/* Name */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "0.88rem", fontWeight: 700, color: isActive ? "#a3b86c" : "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</p>
                  <p style={{ fontSize: "0.68rem", color: "var(--text-subtle)" }}>{c.isPlayer ? "Investigador" : "Criatura/NPC"}</p>
                </div>

                {/* HP controls */}
                {c.hp !== null && c.maxHp !== null && (
                  <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
                    <span style={{ fontSize: "0.6rem", color: "var(--text-subtle)", marginRight: 2 }}>PV</span>
                    <button onClick={() => updateHp(c.id, -5)} title="−5 PV" style={{ ...btnBase, color: "#f87171", borderColor: "rgba(239,68,68,0.2)", width: 26 }}>{"<<"}</button>
                    <button onClick={() => updateHp(c.id, -1)} title="−1 PV" style={{ ...btnBase, color: "#f87171", borderColor: "rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.08)", width: 24 }}>−</button>
                    <div style={{ minWidth: 48, textAlign: "center" }}>
                      <p style={{ fontSize: "0.8rem", fontWeight: 700, color: hpColor }}>{c.hp}/{c.maxHp}</p>
                      <div style={{ height: 3, background: "var(--surface-2)", borderRadius: 2, marginTop: 2 }}>
                        <div style={{ height: "100%", width: `${(hpPct ?? 1) * 100}%`, background: hpColor, borderRadius: 2, transition: "width 0.3s" }} />
                      </div>
                    </div>
                    <button onClick={() => updateHp(c.id, 1)} title="+1 PV" style={{ ...btnBase, color: "#4ade80", borderColor: "rgba(74,222,128,0.25)", background: "rgba(74,222,128,0.08)", width: 24 }}>+</button>
                    <button onClick={() => updateHp(c.id, 5)} title="+5 PV" style={{ ...btnBase, color: "#4ade80", borderColor: "rgba(74,222,128,0.2)", width: 26 }}>{">>"}</button>
                  </div>
                )}

                {/* SAN controls */}
                {c.san !== null && c.maxSan !== null && (
                  <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
                    <span style={{ fontSize: "0.6rem", color: "var(--text-subtle)", marginRight: 2 }}>SAN</span>
                    <button onClick={() => updateSan(c.id, -5)} title="−5 SAN" style={{ ...btnBase, color: "#a78bfa", borderColor: "rgba(167,139,250,0.2)", width: 26 }}>{"<<"}</button>
                    <button onClick={() => updateSan(c.id, -1)} title="−1 SAN" style={{ ...btnBase, color: "#a78bfa", borderColor: "rgba(167,139,250,0.25)", background: "rgba(167,139,250,0.08)", width: 24 }}>−</button>
                    <div style={{ minWidth: 48, textAlign: "center" }}>
                      <p style={{ fontSize: "0.8rem", fontWeight: 700, color: sanColor }}>{c.san}/{c.maxSan}</p>
                      <div style={{ height: 3, background: "var(--surface-2)", borderRadius: 2, marginTop: 2 }}>
                        <div style={{ height: "100%", width: `${(sanPct ?? 1) * 100}%`, background: sanColor, borderRadius: 2, transition: "width 0.3s" }} />
                      </div>
                    </div>
                    <button onClick={() => updateSan(c.id, 1)} title="+1 SAN" style={{ ...btnBase, color: sanColor, borderColor: "rgba(167,139,250,0.25)", background: "rgba(167,139,250,0.08)", width: 24 }}>+</button>
                  </div>
                )}

                <button onClick={() => remove(c.id)} style={{ padding: "4px 8px", background: "transparent", color: "var(--text-subtle)", border: "none", cursor: "pointer", fontSize: "0.8rem", flexShrink: 0 }}>✕</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
