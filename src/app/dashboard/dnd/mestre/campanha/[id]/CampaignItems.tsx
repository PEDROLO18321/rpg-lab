"use client";

import { useState } from "react";
import type { Campaign, CampaignItem } from "@/lib/dnd/campaignStorage";

const ACCENT = "var(--accent)";
const ACCENT_LIGHT = "var(--accent-light)";
const ACCENT_DIM = "var(--accent-dim)";
const ACCENT_BORD = "var(--border-accent)";

interface Props {
  campaign: Campaign;
  onChange: (c: Campaign) => void;
}

type ItemType = CampaignItem["type"];
type ItemRarity = CampaignItem["rarity"];

const TYPE_OPTIONS: { value: ItemType; label: string }[] = [
  { value: "arma", label: "Arma" },
  { value: "armadura", label: "Armadura" },
  { value: "magia", label: "Item Mágico" },
  { value: "consumível", label: "Consumível" },
  { value: "misc", label: "Misc" },
];

const RARITY_OPTIONS: { value: ItemRarity; label: string; color: string }[] = [
  { value: "comum", label: "Comum", color: "#8a8a8a" },
  { value: "incomum", label: "Incomum", color: "#4a9e4a" },
  { value: "raro", label: "Raro", color: "#4a6adb" },
  { value: "muito raro", label: "Muito Raro", color: "#9b4ac8" },
  { value: "lendário", label: "Lendário", color: "#c9941f" },
];

function rarityColor(r: ItemRarity) {
  return RARITY_OPTIONS.find((x) => x.value === r)?.color ?? "#8a8a8a";
}

const labelStyle: React.CSSProperties = {
  fontSize: "0.7rem",
  fontWeight: 700,
  color: "var(--text-muted)",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  marginBottom: 4,
  display: "block",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  color: "var(--text)",
  fontSize: "0.86rem",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
};

function blankItem(): CampaignItem {
  return {
    id: crypto.randomUUID(),
    name: "",
    description: "",
    type: "misc",
    rarity: "comum",
    sessionId: null,
  };
}

export function CampaignItems({ campaign, onChange }: Props) {
  const items = campaign.items ?? [];
  const sessions = campaign.sessions ?? [];

  const [filterType, setFilterType] = useState<ItemType | "todos">("todos");
  const [filterSession, setFilterSession] = useState<string>("todos");
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState<CampaignItem>(blankItem());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<CampaignItem | null>(null);

  const filtered = items.filter((item) => {
    if (filterType !== "todos" && item.type !== filterType) return false;
    if (filterSession === "campanha") return item.sessionId === null;
    if (filterSession !== "todos") return item.sessionId === filterSession;
    return true;
  });

  function addItem() {
    if (!newItem.name.trim()) return;
    const updated = [...items, newItem];
    onChange({ ...campaign, items: updated });
    setNewItem(blankItem());
    setAdding(false);
  }

  function updateItem(updated: CampaignItem) {
    onChange({ ...campaign, items: items.map((x) => (x.id === updated.id ? updated : x)) });
    setEditingItem(updated);
  }

  function deleteItem(id: string) {
    onChange({ ...campaign, items: items.filter((x) => x.id !== id) });
    if (expandedId === id) setExpandedId(null);
  }

  function toggleExpand(item: CampaignItem) {
    if (expandedId === item.id) {
      setExpandedId(null);
      setEditingItem(null);
    } else {
      setExpandedId(item.id);
      setEditingItem({ ...item });
    }
  }

  function sessionName(sid: string | null) {
    if (!sid) return "Geral";
    const s = sessions.find((s) => s.id === sid);
    return s ? `Sessão ${s.number}${s.name ? ` · ${s.name}` : ""}` : "Sessão";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Filters + Add button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as ItemType | "todos")}
          style={{ ...selectStyle, width: "auto", minWidth: 140 }}
        >
          <option value="todos">Todos os Tipos</option>
          {TYPE_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <select
          value={filterSession}
          onChange={(e) => setFilterSession(e.target.value)}
          style={{ ...selectStyle, width: "auto", minWidth: 160 }}
        >
          <option value="todos">Todas as Origens</option>
          <option value="campanha">Geral (campanha)</option>
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>Sessão {s.number}{s.name ? ` · ${s.name}` : ""}</option>
          ))}
        </select>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => { setAdding((v) => !v); setNewItem(blankItem()); }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 18px",
            background: `linear-gradient(135deg, ${ACCENT_LIGHT} 0%, ${ACCENT} 100%)`,
            color: "#06090f",
            border: "none",
            borderRadius: "var(--radius)",
            fontSize: "0.82rem",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {adding ? "Cancelar" : "+ Adicionar Item"}
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div
          style={{
            background: "var(--surface)",
            border: `1px solid ${ACCENT_BORD}`,
            borderRadius: "var(--radius-xl)",
            padding: "20px 24px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "0.9rem",
              fontWeight: 700,
              color: "var(--text)",
              marginBottom: 16,
            }}
          >
            Novo Item
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Nome</label>
              <input
                style={inputStyle}
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="Nome do item"
                autoFocus
              />
            </div>
            <div>
              <label style={labelStyle}>Tipo</label>
              <select
                style={selectStyle}
                value={newItem.type}
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value as ItemType })}
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Raridade</label>
              <select
                style={selectStyle}
                value={newItem.rarity}
                onChange={(e) => setNewItem({ ...newItem, rarity: e.target.value as ItemRarity })}
              >
                {RARITY_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Vínculo</label>
              <select
                style={selectStyle}
                value={newItem.sessionId ?? ""}
                onChange={(e) => setNewItem({ ...newItem, sessionId: e.target.value || null })}
              >
                <option value="">Geral (campanha)</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>Sessão {s.number}{s.name ? ` · ${s.name}` : ""}</option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Descrição</label>
              <textarea
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  minHeight: 70,
                }}
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Propriedades, lore, efeitos..."
              />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              onClick={() => setAdding(false)}
              style={{
                padding: "8px 18px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                color: "var(--text-muted)",
                fontSize: "0.82rem",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={addItem}
              disabled={!newItem.name.trim()}
              style={{
                padding: "8px 20px",
                background: newItem.name.trim() ? `linear-gradient(135deg, ${ACCENT_LIGHT} 0%, ${ACCENT} 100%)` : "var(--surface-2)",
                color: newItem.name.trim() ? "#06090f" : "var(--text-subtle)",
                border: "none",
                borderRadius: "var(--radius)",
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: newItem.name.trim() ? "pointer" : "default",
              }}
            >
              Salvar Item
            </button>
          </div>
        </div>
      )}

      {/* Items list */}
      {filtered.length === 0 ? (
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
            background: "var(--surface)",
            border: "1px dashed var(--border)",
            borderRadius: "var(--radius-xl)",
          }}
        >
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            {items.length === 0
              ? "Nenhum item ainda. Clique em + Adicionar Item."
              : "Nenhum item com esse filtro."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((item) => {
            const isOpen = expandedId === item.id;
            const editing = editingItem?.id === item.id ? editingItem : item;
            const rc = rarityColor(item.rarity);

            return (
              <div
                key={item.id}
                style={{
                  background: "var(--surface)",
                  border: `1px solid ${isOpen ? ACCENT_BORD : "var(--border)"}`,
                  borderRadius: "var(--radius-xl)",
                  overflow: "hidden",
                  transition: "border-color 0.2s",
                }}
              >
                {/* Row */}
                <button
                  onClick={() => toggleExpand(item)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "13px 20px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {/* Rarity dot */}
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: rc,
                      flexShrink: 0,
                      boxShadow: `0 0 6px ${rc}88`,
                    }}
                  />
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: "0.88rem",
                      color: "var(--text)",
                      flex: 1,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.name}
                  </span>
                  {/* Type chip */}
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-xs)",
                      padding: "2px 7px",
                      flexShrink: 0,
                    }}
                  >
                    {TYPE_OPTIONS.find((t) => t.value === item.type)?.label ?? item.type}
                  </span>
                  {/* Session chip */}
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      color: ACCENT_LIGHT,
                      background: ACCENT_DIM,
                      border: `1px solid ${ACCENT_BORD}`,
                      borderRadius: "var(--radius-xs)",
                      padding: "2px 7px",
                      flexShrink: 0,
                    }}
                  >
                    {sessionName(item.sessionId)}
                  </span>
                  <span
                    style={{
                      color: "var(--text-subtle)",
                      fontSize: "0.82rem",
                      flexShrink: 0,
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.22s",
                    }}
                  >
                    ▾
                  </span>
                </button>

                {/* Expanded editor */}
                {isOpen && editingItem?.id === item.id && (
                  <div
                    style={{
                      padding: "0 20px 20px",
                      borderTop: "1px solid var(--border)",
                      paddingTop: 16,
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={labelStyle}>Nome</label>
                        <input
                          style={inputStyle}
                          value={editing.name}
                          onChange={(e) => updateItem({ ...editing, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Tipo</label>
                        <select
                          style={selectStyle}
                          value={editing.type}
                          onChange={(e) => updateItem({ ...editing, type: e.target.value as ItemType })}
                        >
                          {TYPE_OPTIONS.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Raridade</label>
                        <select
                          style={selectStyle}
                          value={editing.rarity}
                          onChange={(e) => updateItem({ ...editing, rarity: e.target.value as ItemRarity })}
                        >
                          {RARITY_OPTIONS.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={labelStyle}>Vínculo à Sessão</label>
                        <select
                          style={selectStyle}
                          value={editing.sessionId ?? ""}
                          onChange={(e) => updateItem({ ...editing, sessionId: e.target.value || null })}
                        >
                          <option value="">Geral (campanha)</option>
                          {sessions.map((s) => (
                            <option key={s.id} value={s.id}>Sessão {s.number}{s.name ? ` · ${s.name}` : ""}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={labelStyle}>Descrição</label>
                        <textarea
                          style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
                          value={editing.description}
                          onChange={(e) => updateItem({ ...editing, description: e.target.value })}
                          placeholder="Propriedades, lore, efeitos..."
                        />
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => deleteItem(item.id)}
                        style={{
                          padding: "7px 16px",
                          background: "rgba(220,60,60,0.1)",
                          border: "1px solid rgba(220,60,60,0.3)",
                          borderRadius: "var(--radius)",
                          color: "#e06c6c",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
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
