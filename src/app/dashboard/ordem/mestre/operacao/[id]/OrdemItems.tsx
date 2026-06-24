"use client";

import { useState } from "react";
import type { OrdemCampaign, OrdemItem } from "@/lib/ordem/ordemCampaignStorage";

const A = "#ffffff";
const AL = "#e8e8ef";
const AD = "rgba(255,255,255,0.1)";
const AB = "rgba(255,255,255,0.28)";

type ItemType = OrdemItem["type"];

const TYPE_OPTIONS: { value: ItemType; label: string }[] = [
  { value: "arma", label: "Arma" },
  { value: "protecao", label: "Proteção" },
  { value: "item-paranormal", label: "Item Paranormal" },
  { value: "equipamento", label: "Equipamento" },
  { value: "ritual", label: "Ritual" },
  { value: "misc", label: "Misc" },
];

const TYPE_COLOR: Record<ItemType, string> = {
  arma: "#fbbf24",
  protecao: "#60a5fa",
  "item-paranormal": "#f87171",
  equipamento: "#a3b86c",
  ritual: "#a78bfa",
  misc: "var(--text-muted)",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem", boxSizing: "border-box", fontFamily: "inherit",
};
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer" };
const labelStyle: React.CSSProperties = {
  fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4, display: "block",
};

function blankItem(): OrdemItem {
  return { id: crypto.randomUUID(), name: "", description: "", type: "misc", paranormal: false, sessionId: null };
}

interface Props { campaign: OrdemCampaign; onChange: (c: OrdemCampaign) => void; }

export function OrdemItems({ campaign, onChange }: Props) {
  const items = campaign.items ?? [];
  const sessions = campaign.sessions ?? [];

  const [filterType, setFilterType] = useState<ItemType | "todos">("todos");
  const [filterSession, setFilterSession] = useState<string>("todos");
  const [filterParanormal, setFilterParanormal] = useState<"todos" | "paranormal" | "normal">("todos");
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState<OrdemItem>(blankItem());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<OrdemItem | null>(null);

  const filtered = items.filter((item) => {
    if (filterType !== "todos" && item.type !== filterType) return false;
    if (filterSession === "cenario") return item.sessionId === null;
    if (filterSession !== "todos") return item.sessionId === filterSession;
    if (filterParanormal === "paranormal" && !item.paranormal) return false;
    if (filterParanormal === "normal" && item.paranormal) return false;
    return true;
  });

  function addItem() {
    if (!newItem.name.trim()) return;
    onChange({ ...campaign, items: [...items, newItem] });
    setNewItem(blankItem());
    setAdding(false);
  }

  function updateItem(updated: OrdemItem) {
    onChange({ ...campaign, items: items.map((x) => (x.id === updated.id ? updated : x)) });
    setEditingItem(updated);
  }

  function deleteItem(id: string) {
    onChange({ ...campaign, items: items.filter((x) => x.id !== id) });
    if (expandedId === id) setExpandedId(null);
  }

  function toggleExpand(item: OrdemItem) {
    if (expandedId === item.id) { setExpandedId(null); setEditingItem(null); }
    else { setExpandedId(item.id); setEditingItem({ ...item }); }
  }

  function sessionName(sid: string | null) {
    if (!sid) return "Geral";
    const s = sessions.find((s) => s.id === sid);
    return s ? `Sessão ${s.number}${s.name ? ` · ${s.name}` : ""}` : "Sessão";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value as ItemType | "todos")} style={{ ...selectStyle, width: "auto", minWidth: 150 }}>
          <option value="todos">Todos os Tipos</option>
          {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={filterParanormal} onChange={(e) => setFilterParanormal(e.target.value as "todos" | "paranormal" | "normal")} style={{ ...selectStyle, width: "auto", minWidth: 150 }}>
          <option value="todos">Paranormal e Normal</option>
          <option value="paranormal">Só Paranormal</option>
          <option value="normal">Não-Paranormal</option>
        </select>
        <select value={filterSession} onChange={(e) => setFilterSession(e.target.value)} style={{ ...selectStyle, width: "auto", minWidth: 160 }}>
          <option value="todos">Todas as Origens</option>
          <option value="cenario">Geral (operação)</option>
          {sessions.map((s) => <option key={s.id} value={s.id}>Sessão {s.number}{s.name ? ` · ${s.name}` : ""}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        <button onClick={() => { setAdding((v) => !v); setNewItem(blankItem()); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", background: `linear-gradient(135deg, ${A} 0%, #b9b9c6 100%)`, color: "#06090f", border: "none", borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>
          {adding ? "Cancelar" : "+ Adicionar Item"}
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div style={{ background: "var(--surface)", border: `1px solid ${AB}`, borderRadius: "var(--radius-xl)", padding: "20px 24px" }}>
          <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.9rem", fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>Novo Item</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Nome</label>
              <input style={inputStyle} value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} placeholder="Ex: Pistola .40, Colete Balístico, Medalhão Profano, Ritual: Lança de Sangue" autoFocus />
            </div>
            <div>
              <label style={labelStyle}>Tipo</label>
              <select style={selectStyle} value={newItem.type} onChange={(e) => setNewItem({ ...newItem, type: e.target.value as ItemType })}>
                {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Vínculo à Sessão</label>
              <select style={selectStyle} value={newItem.sessionId ?? ""} onChange={(e) => setNewItem({ ...newItem, sessionId: e.target.value || null })}>
                <option value="">Geral (operação)</option>
                {sessions.map((s) => <option key={s.id} value={s.id}>Sessão {s.number}{s.name ? ` · ${s.name}` : ""}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.78rem", color: "var(--text-muted)", cursor: "pointer", marginBottom: 12 }}>
                <input type="checkbox" checked={newItem.paranormal} onChange={(e) => setNewItem({ ...newItem, paranormal: e.target.checked })} />
                Item Paranormal (afetado pelo Outro Lado)
              </label>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Descrição / Efeitos</label>
              <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 80 }} value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} placeholder="Categoria, dano, espaços, elemento, custo de PE, efeitos, perda de SAN ao usar..." />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button onClick={() => setAdding(false)} style={{ padding: "8px 18px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text-muted)", fontSize: "0.82rem", cursor: "pointer" }}>Cancelar</button>
            <button onClick={addItem} disabled={!newItem.name.trim()} style={{ padding: "8px 20px", background: newItem.name.trim() ? `linear-gradient(135deg, ${A} 0%, #b9b9c6 100%)` : "var(--surface-2)", color: newItem.name.trim() ? "#06090f" : "var(--text-subtle)", border: "none", borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: newItem.name.trim() ? "pointer" : "default" }}>
              Salvar Item
            </button>
          </div>
        </div>
      )}

      {/* Item list */}
      {filtered.length === 0 ? (
        <div style={{ padding: "48px 24px", textAlign: "center", background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: "var(--radius-xl)" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            {items.length === 0 ? "Nenhum item ainda. Clique em + Adicionar Item." : "Nenhum item com esse filtro."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((item) => {
            const isOpen = expandedId === item.id;
            const editing = editingItem?.id === item.id ? editingItem : item;
            const typeColor = TYPE_COLOR[item.type];
            return (
              <div key={item.id} style={{ background: "var(--surface)", border: `1px solid ${isOpen ? AB : "var(--border)"}`, borderRadius: "var(--radius-xl)", overflow: "hidden", transition: "border-color 0.2s" }}>
                <button onClick={() => toggleExpand(item)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 20px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: typeColor, flexShrink: 0, boxShadow: `0 0 5px ${typeColor}88` }} />
                  <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text)", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</span>
                  {item.paranormal && (
                    <span style={{ fontSize: "0.63rem", fontWeight: 700, color: "#f87171", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: "var(--radius-xs)", padding: "2px 7px", flexShrink: 0 }}>Paranormal</span>
                  )}
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, color: typeColor, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", padding: "2px 7px", flexShrink: 0 }}>
                    {TYPE_OPTIONS.find((t) => t.value === item.type)?.label ?? item.type}
                  </span>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, color: AL, background: AD, border: `1px solid ${AB}`, borderRadius: "var(--radius-xs)", padding: "2px 7px", flexShrink: 0 }}>
                    {sessionName(item.sessionId)}
                  </span>
                  <span style={{ color: "var(--text-subtle)", fontSize: "0.82rem", flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.22s" }}>▾</span>
                </button>

                {isOpen && editingItem?.id === item.id && (
                  <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={labelStyle}>Nome</label>
                        <input style={inputStyle} value={editing.name} onChange={(e) => updateItem({ ...editing, name: e.target.value })} />
                      </div>
                      <div>
                        <label style={labelStyle}>Tipo</label>
                        <select style={selectStyle} value={editing.type} onChange={(e) => updateItem({ ...editing, type: e.target.value as ItemType })}>
                          {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Vínculo</label>
                        <select style={selectStyle} value={editing.sessionId ?? ""} onChange={(e) => updateItem({ ...editing, sessionId: e.target.value || null })}>
                          <option value="">Geral (operação)</option>
                          {sessions.map((s) => <option key={s.id} value={s.id}>Sessão {s.number}{s.name ? ` · ${s.name}` : ""}</option>)}
                        </select>
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.78rem", color: "var(--text-muted)", cursor: "pointer" }}>
                          <input type="checkbox" checked={editing.paranormal} onChange={(e) => updateItem({ ...editing, paranormal: e.target.checked })} />
                          Item Paranormal
                        </label>
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={labelStyle}>Descrição</label>
                        <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 80 }} value={editing.description} onChange={(e) => updateItem({ ...editing, description: e.target.value })} />
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button onClick={() => deleteItem(item.id)} style={{ padding: "7px 16px", background: "rgba(220,60,60,0.1)", border: "1px solid rgba(220,60,60,0.3)", borderRadius: "var(--radius)", color: "#e06c6c", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>
                        Excluir Item
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
