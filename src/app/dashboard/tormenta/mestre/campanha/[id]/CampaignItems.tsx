"use client";

import { useState } from "react";
import type { TormentaApi } from "@/lib/tormenta/useTormentaCampaign";
import type { TormentaCampaignItem } from "@/lib/tormenta/tormentaCampaignClient";

const ACCENT = "#a01818";
const ACCENT_LIGHT = "#c94040";
const ACCENT_DIM = "rgba(160,24,24,0.12)";
const ACCENT_BORD = "rgba(160,24,24,0.28)";

type ItemType = TormentaCampaignItem["type"];
type ItemRarity = TormentaCampaignItem["rarity"];

const TYPE_OPTIONS: { value: ItemType; label: string }[] = [
  { value: "arma", label: "Arma" }, { value: "armadura", label: "Armadura" },
  { value: "magico", label: "Item Mágico" }, { value: "consumivel", label: "Consumível" }, { value: "misc", label: "Misc" },
];
const RARITY_OPTIONS: { value: ItemRarity; label: string; color: string }[] = [
  { value: "comum", label: "Comum", color: "#8a8a8a" },
  { value: "incomum", label: "Incomum", color: "#4a9e4a" },
  { value: "raro", label: "Raro", color: "#4a6adb" },
  { value: "muito raro", label: "Muito Raro", color: "#9b4ac8" },
  { value: "lendário", label: "Lendário", color: "#c9941f" },
];
function rarityColor(r: ItemRarity) { return RARITY_OPTIONS.find((x) => x.value === r)?.color ?? "#8a8a8a"; }

const labelStyle: React.CSSProperties = { fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4, display: "block" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "9px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem", boxSizing: "border-box", fontFamily: "inherit" };
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer" };

function blankItem() {
  return { name: "", description: "", type: "misc" as ItemType, rarity: "comum" as ItemRarity, sessionId: null as string | null };
}

export function CampaignItems({ api }: { api: TormentaApi }) {
  const items = api.campaign.tormentaItems;
  const sessions = api.campaign.tormentaSessions;
  const [filterType, setFilterType] = useState<ItemType | "todos">("todos");
  const [filterSession, setFilterSession] = useState<string>("todos");
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState(blankItem());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = items.filter((item) => {
    if (filterType !== "todos" && item.type !== filterType) return false;
    if (filterSession === "campanha") return item.sessionId === null;
    if (filterSession !== "todos") return item.sessionId === filterSession;
    return true;
  });

  async function addItem() {
    if (!newItem.name.trim()) return;
    await api.addChild("items", newItem);
    setNewItem(blankItem());
    setAdding(false);
  }
  function sessionName(sid: string | null) {
    if (!sid) return "Geral";
    const s = sessions.find((x) => x.id === sid);
    return s ? `Sessão ${s.number}${s.name ? ` · ${s.name}` : ""}` : "Sessão";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value as ItemType | "todos")} style={{ ...selectStyle, width: "auto", minWidth: 140 }}>
          <option value="todos">Todos os Tipos</option>
          {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={filterSession} onChange={(e) => setFilterSession(e.target.value)} style={{ ...selectStyle, width: "auto", minWidth: 160 }}>
          <option value="todos">Todas as Origens</option>
          <option value="campanha">Geral (campanha)</option>
          {sessions.map((s) => <option key={s.id} value={s.id}>Sessão {s.number}{s.name ? ` · ${s.name}` : ""}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        <button onClick={() => { setAdding((v) => !v); setNewItem(blankItem()); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", background: `linear-gradient(135deg, ${ACCENT_LIGHT} 0%, ${ACCENT} 100%)`, color: "#06090f", border: "none", borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>{adding ? "Cancelar" : "+ Adicionar Item"}</button>
      </div>

      {adding && (
        <div style={{ background: "var(--surface)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-xl)", padding: "20px 24px" }}>
          <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.9rem", fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>Novo Item</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div style={{ gridColumn: "1 / -1" }}><label style={labelStyle}>Nome</label><input style={inputStyle} value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} placeholder="Ex: Espada Justiceira de Khalmyr" autoFocus /></div>
            <div><label style={labelStyle}>Tipo</label><select style={selectStyle} value={newItem.type} onChange={(e) => setNewItem({ ...newItem, type: e.target.value as ItemType })}>{TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
            <div><label style={labelStyle}>Raridade</label><select style={selectStyle} value={newItem.rarity} onChange={(e) => setNewItem({ ...newItem, rarity: e.target.value as ItemRarity })}>{RARITY_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</select></div>
            <div style={{ gridColumn: "1 / -1" }}><label style={labelStyle}>Vínculo</label><select style={selectStyle} value={newItem.sessionId ?? ""} onChange={(e) => setNewItem({ ...newItem, sessionId: e.target.value || null })}><option value="">Geral (campanha)</option>{sessions.map((s) => <option key={s.id} value={s.id}>Sessão {s.number}{s.name ? ` · ${s.name}` : ""}</option>)}</select></div>
            <div style={{ gridColumn: "1 / -1" }}><label style={labelStyle}>Descrição</label><textarea style={{ ...inputStyle, resize: "vertical", minHeight: 70 }} value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} placeholder="Propriedades, lore, efeitos..." /></div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button onClick={() => setAdding(false)} style={{ padding: "8px 18px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text-muted)", fontSize: "0.82rem", cursor: "pointer" }}>Cancelar</button>
            <button onClick={addItem} disabled={!newItem.name.trim()} style={{ padding: "8px 20px", background: newItem.name.trim() ? `linear-gradient(135deg, ${ACCENT_LIGHT} 0%, ${ACCENT} 100%)` : "var(--surface-2)", color: newItem.name.trim() ? "#06090f" : "var(--text-subtle)", border: "none", borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: newItem.name.trim() ? "pointer" : "default" }}>Salvar Item</button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ padding: "48px 24px", textAlign: "center", background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: "var(--radius-xl)" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{items.length === 0 ? "Nenhum item ainda. Clique em + Adicionar Item." : "Nenhum item com esse filtro."}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((item) => {
            const isOpen = expandedId === item.id;
            const rc = rarityColor(item.rarity);
            return (
              <div key={item.id} style={{ background: "var(--surface)", border: `1px solid ${isOpen ? ACCENT_BORD : "var(--border)"}`, borderRadius: "var(--radius-xl)", overflow: "hidden", transition: "border-color 0.2s" }}>
                <button onClick={() => setExpandedId(isOpen ? null : item.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 20px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: rc, flexShrink: 0, boxShadow: `0 0 6px ${rc}88` }} />
                  <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text)", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</span>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", padding: "2px 7px", flexShrink: 0 }}>{TYPE_OPTIONS.find((t) => t.value === item.type)?.label ?? item.type}</span>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, color: ACCENT_LIGHT, background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-xs)", padding: "2px 7px", flexShrink: 0 }}>{sessionName(item.sessionId)}</span>
                  <span style={{ color: "var(--text-subtle)", fontSize: "0.82rem", flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.22s" }}>▾</span>
                </button>
                {isOpen && <ItemEditor api={api} item={item} sessions={sessions} onDeleted={() => setExpandedId(null)} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ItemEditor({ api, item, sessions, onDeleted }: { api: TormentaApi; item: TormentaCampaignItem; sessions: TormentaApi["campaign"]["tormentaSessions"]; onDeleted: () => void }) {
  const [d, setD] = useState(item);
  const set = (p: Partial<TormentaCampaignItem>) => setD((c) => ({ ...c, ...p }));
  const commit = (p: Partial<TormentaCampaignItem>) => api.editChild("items", item.id, p);
  return (
    <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ gridColumn: "1 / -1" }}><label style={labelStyle}>Nome</label><input style={inputStyle} value={d.name} onChange={(e) => set({ name: e.target.value })} onBlur={(e) => commit({ name: e.target.value })} /></div>
        <div><label style={labelStyle}>Tipo</label><select style={selectStyle} value={d.type} onChange={(e) => { set({ type: e.target.value as ItemType }); commit({ type: e.target.value as ItemType }); }}>{TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
        <div><label style={labelStyle}>Raridade</label><select style={selectStyle} value={d.rarity} onChange={(e) => { set({ rarity: e.target.value as ItemRarity }); commit({ rarity: e.target.value as ItemRarity }); }}>{RARITY_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</select></div>
        <div style={{ gridColumn: "1 / -1" }}><label style={labelStyle}>Vínculo à Sessão</label><select style={selectStyle} value={d.sessionId ?? ""} onChange={(e) => { const v = e.target.value || null; set({ sessionId: v }); commit({ sessionId: v }); }}><option value="">Geral (campanha)</option>{sessions.map((s) => <option key={s.id} value={s.id}>Sessão {s.number}{s.name ? ` · ${s.name}` : ""}</option>)}</select></div>
        <div style={{ gridColumn: "1 / -1" }}><label style={labelStyle}>Descrição</label><textarea style={{ ...inputStyle, resize: "vertical", minHeight: 80 }} value={d.description} onChange={(e) => set({ description: e.target.value })} onBlur={(e) => commit({ description: e.target.value })} /></div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={() => { api.removeChild("items", item.id); onDeleted(); }} style={{ padding: "7px 16px", background: "rgba(220,60,60,0.1)", border: "1px solid rgba(220,60,60,0.3)", borderRadius: "var(--radius)", color: "#e06c6c", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>Excluir Item</button>
      </div>
    </div>
  );
}
