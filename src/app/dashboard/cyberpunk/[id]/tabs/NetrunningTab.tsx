"use client";

import { useState } from "react";
import {
  BLACK_ICE, BLACK_ICE_SLOTS, CYBERDECK, CYBERDECK_HARDWARE, INTERFACE_ABILITIES, PROGRAMS, getProgram,
  netActionsForRank,
} from "@/lib/cyberpunk/netrunning";
import { SheetShell } from "@/components/sheet/SheetShell";
import { SheetSection } from "@/components/sheet/SheetSection";
import { CP, PrimaryButton, dangerBtn, inputStyle, pillBtn } from "../../ui";
import { autoModifier, type TabProps } from "../sheetModel";

const CLASS_LABEL = { booster: "Reforço", defender: "Defensor", antiProgram: "Anti-programa", antiPersonnel: "Anti-pessoal" } as const;

export function NetrunningTab({ sh, patch, roll }: TabProps) {
  const [pick, setPick] = useState("");
  // O deck não tem coluna própria no banco: vive no JSON `background`, que
  // aceita chaves extras, para não exigir migração só por causa de uma aba.
  const deck = sh.background.deck ?? [];
  const used = deck.length;
  const mod = autoModifier(sh, "int");
  const actions = netActionsForRank(sh.roleRank);

  function setDeck(next: string[]) {
    patch({ background: { ...sh.background, deck: next } });
  }

  function add() {
    if (!pick || used >= CYBERDECK.slots) return;
    setDeck([...deck, pick]);
    setPick("");
  }

  // Interface é a habilidade de papel: o Grau entra como "perícia" e não há atributo somado.
  const left = (
    <>
      <SheetSection title="Interface" accent>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: "0.84rem" }}>
          <span>Grau (Interface) <b style={{ color: CP.neon }}>{sh.roleRank}</b></span>
          <span>Ações de NET por turno <b style={{ color: CP.neon }}>{actions}</b></span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(210px, 100%), 1fr))", gap: 8 }}>
          {INTERFACE_ABILITIES.map((a) => (
            <button
              key={a.key} type="button"
              onClick={() => roll(`Interface · ${a.name}`, 0, sh.roleRank, { modifier: mod })}
              style={{ textAlign: "left", padding: "9px 11px", minHeight: 44, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer", color: "var(--text)", fontFamily: "inherit" }}
            >
              <span style={{ display: "block", fontWeight: 700, fontSize: "0.84rem", color: CP.accentLight }}>🎲 {a.name}</span>
              <span style={{ display: "block", fontSize: "0.7rem", color: CP.textMuted, lineHeight: 1.4, marginTop: 2 }}>{a.desc}</span>
            </button>
          ))}
        </div>
      </SheetSection>

      <SheetSection title={`Ciberdeck (${used}/${CYBERDECK.slots} espaços)`}>
        {deck.length === 0 && <p style={{ fontSize: "0.82rem", color: CP.textSubtle }}>Nenhum programa instalado.</p>}
        {deck.map((key, i) => {
          const p = getProgram(key);
          if (!p) return null;
          return (
            <div key={`${key}-${i}`} style={{ padding: "9px 11px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", display: "flex", gap: 8, alignItems: "flex-start" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: "0.86rem" }}>{p.name} <span style={{ fontWeight: 400, fontSize: "0.68rem", color: CP.textSubtle }}>{CLASS_LABEL[p.cls]}</span></p>
                <p style={{ fontSize: "0.7rem", color: CP.textMuted }}>ATQ {p.atk} · DEF {p.def} · REZ {p.rez}</p>
                <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", lineHeight: 1.5, marginTop: 2 }}>{p.effect}</p>
              </div>
              {p.atk > 0 && (
                <button type="button" onClick={() => roll(`NET · ${p.name}`, 0, sh.roleRank, { modifier: mod + p.atk })} style={pillBtn}>🎲 ATQ</button>
              )}
              <button type="button" onClick={() => setDeck(deck.filter((_, j) => j !== i))} aria-label={`Remover ${p.name}`} style={dangerBtn}>×</button>
            </div>
          );
        })}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select aria-label="Adicionar programa" value={pick} onChange={(e) => setPick(e.target.value)} style={{ ...inputStyle, flex: "1 1 200px", width: "auto" }}>
            <option value="">Adicionar programa…</option>
            {PROGRAMS.map((p) => <option key={p.key} value={p.key}>{p.name} · {CLASS_LABEL[p.cls]} · {p.cost} eb</option>)}
          </select>
          <PrimaryButton onClick={add} disabled={!pick || used >= CYBERDECK.slots}>+ Instalar</PrimaryButton>
        </div>
        <p style={{ fontSize: "0.72rem", color: CP.textMuted, lineHeight: 1.5 }}>
          Cada programa ocupa 1 espaço. Black ICE ocupa {BLACK_ICE_SLOTS}. {CYBERDECK_HARDWARE.map((h) => `${h.name}: ${h.effect}`).join(" ")}
        </p>
      </SheetSection>
    </>
  );

  const right = (
    <SheetSection title="Black ICE (referência)">
      {BLACK_ICE.map((b) => (
        <div key={b.key} style={{ padding: "9px 11px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
          <p style={{ fontWeight: 700, color: CP.neon }}>{b.name} <span style={{ fontWeight: 400, fontSize: "0.68rem", color: CP.textSubtle }}>{b.cls === "antiPersonnel" ? "anti-pessoal" : "anti-programa"}</span></p>
          <p style={{ fontSize: "0.7rem", color: CP.textMuted }}>PER {b.per} · VEL {b.spd} · ATQ {b.atk} · DEF {b.def} · REZ {b.rez}</p>
          <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", lineHeight: 1.5, marginTop: 2 }}>{b.effect}</p>
        </div>
      ))}
    </SheetSection>
  );

  return <SheetShell system="cyberpunk" left={left} right={right} />;
}
