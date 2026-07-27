"use client";

import "../../tormenta-responsive.css";
import { useRef } from "react";
import { RACES, RACE_BY_ID } from "@/lib/tormenta/races";
import { ATTR_KEYS, ATTR_LABEL, type AttrKey } from "@/lib/tormenta/data";
import { randomTormentaName } from "@/lib/tormenta/names";
import { smoothScrollTo } from "@/lib/smoothScroll";
import type { WizardData } from "../CharacterWizard";
import { ACCENT, ACCENT_LIGHT, ACCENT_DIM, ACCENT_BORD } from "../CharacterWizard";
import { Intro } from "./Intro";

interface Props {
  raceId: string | null;
  raceVariantId: string | null;
  racialAttrChoices: AttrKey[];
  charName: string;
  onChange: (p: Partial<WizardData>) => void;
}

function formatBonus(b: Partial<Record<AttrKey, number>>): string {
  return ATTR_KEYS.filter((k) => b[k]).map((k) => `${(b[k] ?? 0) > 0 ? "+" : ""}${b[k]} ${ATTR_LABEL[k]}`).join(", ");
}

export function StepRace({ raceId, raceVariantId, racialAttrChoices, charName, onChange }: Props) {
  const race = raceId ? RACE_BY_ID[raceId] : undefined;
  const detailRef = useRef<HTMLDivElement>(null);

  function pick(id: string) {
    if (raceId === id) return;
    onChange({ raceId: id, raceVariantId: "", racialAttrChoices: [] });
    setTimeout(() => {
      if (detailRef.current) smoothScrollTo(detailRef.current);
    }, 50);
  }

  function toggleAttrChoice(k: AttrKey) {
    if (!race?.attrChoiceBonus) return;
    const chosen = racialAttrChoices.includes(k);
    if (chosen) {
      onChange({ racialAttrChoices: racialAttrChoices.filter((x) => x !== k) });
    } else if (racialAttrChoices.length < race.attrChoiceBonus.count) {
      onChange({ racialAttrChoices: [...racialAttrChoices, k] });
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Intro title="Raça" text="A raça define sua herança, bônus de atributo e habilidades inatas. Arton tem 17 raças — 8 comuns e 9 raras." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
        {RACES.map((r) => {
          const isSel = raceId === r.id;
          return (
            <button key={r.id} onClick={() => pick(r.id)}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "16px 10px", background: isSel ? ACCENT_DIM : "var(--surface)", border: `1px solid ${isSel ? ACCENT_BORD : "var(--border)"}`, borderRadius: "var(--radius-xl)", cursor: "pointer", transition: "all 0.15s", boxShadow: isSel ? `0 0 24px ${ACCENT_DIM}` : "none" }}>
              <span style={{ fontSize: "1.6rem" }}>{r.icon}</span>
              <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.8rem", fontWeight: 700, color: isSel ? ACCENT_LIGHT : "var(--text)" }}>{r.name}</span>
              <span style={{ fontSize: "0.62rem", color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{r.rarity}</span>
            </button>
          );
        })}
      </div>

      {race && (
        <div ref={detailRef} style={{ background: "var(--surface)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-xl)", padding: "24px 24px 20px", display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.1rem", fontWeight: 700, color: ACCENT_LIGHT }}>{race.icon} {race.name}</h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 4 }}>{race.description}</p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Chip label="Tamanho" value={race.size} />
            <Chip label="Deslocamento" value={`${race.speed}m`} />
            {Object.keys(race.attrBonus).length > 0 && <Chip label="Atributos" value={formatBonus(race.attrBonus)} accent />}
          </div>

          {race.attrChoiceBonus && (
            <div>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
                +{race.attrChoiceBonus.amount} em {race.attrChoiceBonus.count} atributos à escolha ({racialAttrChoices.length}/{race.attrChoiceBonus.count})
              </p>
              <div className="tm-race-attr-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {ATTR_KEYS.filter((k) => !(race.attrChoiceBonus!.exclude ?? []).includes(k)).map((k) => {
                  const chosen = racialAttrChoices.includes(k);
                  const maxed = !chosen && racialAttrChoices.length >= race.attrChoiceBonus!.count;
                  return (
                    <button key={k} onClick={() => toggleAttrChoice(k)} disabled={maxed}
                      style={{ padding: "9px 6px", background: chosen ? ACCENT_DIM : "var(--surface-2)", border: `1px solid ${chosen ? ACCENT : "var(--border)"}`, borderRadius: "var(--radius)", cursor: maxed ? "not-allowed" : "pointer", opacity: maxed ? 0.4 : 1, color: chosen ? ACCENT_LIGHT : "var(--text)", fontSize: "0.78rem", fontWeight: 700 }}>
                      {ATTR_LABEL[k]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {race.variants && (
            <div>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Linhagem</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {race.variants.map((v) => {
                  const sel = raceVariantId === v.id;
                  return (
                    <button key={v.id} onClick={() => onChange({ raceVariantId: v.id })}
                      style={{ textAlign: "left", padding: "12px 14px", background: sel ? ACCENT_DIM : "var(--surface-2)", border: `1px solid ${sel ? ACCENT : "var(--border)"}`, borderRadius: "var(--radius-lg)", cursor: "pointer" }}>
                      <p style={{ fontSize: "0.85rem", fontWeight: 700, color: sel ? ACCENT_LIGHT : "var(--text)" }}>{v.name} — {formatBonus(v.attrBonus)}</p>
                      <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>{v.traits.map((t) => t.name).join(", ")}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Habilidades Raciais</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[...race.traits, ...(race.variants?.find((v) => v.id === raceVariantId)?.traits ?? [])].map((t) => (
                <div key={t.name}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)" }}>{t.name}. </span>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{t.description}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
              Nome do Personagem <span style={{ color: ACCENT }}>*</span>
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <input type="text" value={charName} onChange={(e) => onChange({ charName: e.target.value })} placeholder="Nome do herói" maxLength={60}
                style={{ flex: 1, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "10px 14px", color: "var(--text)", fontSize: "0.9rem", outline: "none" }} />
              <button type="button" onClick={() => onChange({ charName: randomTormentaName() })}
                style={{ padding: "10px 14px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text-muted)", fontSize: "0.82rem", cursor: "pointer", whiteSpace: "nowrap" }}>
                🎲 Aleatório
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ background: accent ? ACCENT_DIM : "var(--surface-2)", border: `1px solid ${accent ? ACCENT_BORD : "var(--border)"}`, borderRadius: "var(--radius)", padding: "6px 12px" }}>
      <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginRight: 6 }}>{label}</span>
      <span style={{ fontSize: "0.8rem", fontWeight: 700, color: accent ? ACCENT_LIGHT : "var(--text)" }}>{value}</span>
    </div>
  );
}
