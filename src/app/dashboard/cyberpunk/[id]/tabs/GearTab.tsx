"use client";

import { useState } from "react";
import { ALL_GEAR, GEAR_MAP, LIFESTYLES, sheetGearItem } from "@/lib/cyberpunk/gear";
import { SheetShell } from "@/components/sheet/SheetShell";
import { SheetSection } from "@/components/sheet/SheetSection";
import { Field } from "@/components/ui/Field";
import { CP, PrimaryButton, dangerBtn, inputStyle, labelStyle, pillBtn } from "../../ui";
import { clamp, type TabProps } from "../sheetModel";

export function GearTab({ sh, patch }: TabProps) {
  const [amount, setAmount] = useState(100);
  const [pick, setPick] = useState("");
  const [custom, setCustom] = useState("");

  function money(sign: 1 | -1) {
    patch({ eurobucks: Math.max(0, sh.eurobucks + sign * Math.max(0, amount)) });
  }

  function addGear() {
    const def = GEAR_MAP[pick];
    if (def) {
      const i = sh.gear.findIndex((g) => g.name === def.name);
      patch({
        gear: i < 0
          ? [...sh.gear, sheetGearItem(def, crypto.randomUUID())]
          : sh.gear.map((g, j) => (j === i ? { ...g, qty: g.qty + 1 } : g)),
      });
      setPick("");
    } else if (custom.trim()) {
      patch({ gear: [...sh.gear, { id: crypto.randomUUID(), name: custom.trim(), qty: 1, cost: 0, notes: "" }] });
    }
    setCustom("");
  }

  function setQty(id: string, qty: number) {
    patch({ gear: qty <= 0 ? sh.gear.filter((g) => g.id !== id) : sh.gear.map((g) => (g.id === id ? { ...g, qty } : g)) });
  }

  const left = (
    <SheetSection title={`Equipamento (${sh.gear.length})`} accent>
      {sh.gear.length === 0 && <p style={{ fontSize: "0.82rem", color: CP.textSubtle }}>Mochila vazia.</p>}
      {sh.gear.map((g) => (
        <div key={g.id} style={{ padding: "9px 11px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 600, fontSize: "0.86rem" }}>{g.name}{g.cost > 0 && <span style={{ color: CP.textSubtle, fontSize: "0.68rem" }}> · {g.cost} eb</span>}</p>
            {g.notes && <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{g.notes}</p>}
          </div>
          <button type="button" onClick={() => setQty(g.id, g.qty - 1)} aria-label={`Menos 1 ${g.name}`} style={{ ...pillBtn, width: 30, padding: 0 }}>−</button>
          <b style={{ minWidth: 20, textAlign: "center" }}>{g.qty}</b>
          <button type="button" onClick={() => setQty(g.id, g.qty + 1)} aria-label={`Mais 1 ${g.name}`} style={{ ...pillBtn, width: 30, padding: 0 }}>+</button>
          <button type="button" onClick={() => patch({ gear: sh.gear.filter((x) => x.id !== g.id) })} aria-label={`Remover ${g.name}`} style={dangerBtn}>×</button>
        </div>
      ))}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <select aria-label="Adicionar item do catálogo" value={pick} onChange={(e) => setPick(e.target.value)} style={{ ...inputStyle, flex: "1 1 200px", width: "auto" }}>
          <option value="">Adicionar do catálogo…</option>
          {ALL_GEAR.map((g) => <option key={g.key} value={g.key}>{g.name} · {g.cost} eb</option>)}
        </select>
        <input aria-label="Item personalizado" value={custom} placeholder="ou item próprio" maxLength={60} onChange={(e) => setCustom(e.target.value)} style={{ ...inputStyle, flex: "1 1 160px", width: "auto" }} />
        <PrimaryButton onClick={addGear} disabled={!pick && !custom.trim()}>+ Adicionar</PrimaryButton>
      </div>
    </SheetSection>
  );

  const right = (
    <>
      <SheetSection title="Eurobucks" accent>
        <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.8rem", fontWeight: 800, color: CP.accentLight }}>{sh.eurobucks.toLocaleString("pt-BR")} <span style={{ fontSize: "0.9rem", color: CP.textMuted }}>eb</span></p>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 90px" }}>
            <Field label="Valor" style={labelStyle}>
              <input type="number" min={0} value={amount} onChange={(e) => setAmount(parseInt(e.target.value) || 0)} style={inputStyle} />
            </Field>
          </div>
          <button type="button" onClick={() => money(-1)} style={{ ...pillBtn, minHeight: 36, color: CP.danger }}>Gastar</button>
          <button type="button" onClick={() => money(1)} style={{ ...pillBtn, minHeight: 36, color: CP.success }}>Ganhar</button>
        </div>
      </SheetSection>

      <SheetSection title="Reputação">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button type="button" onClick={() => patch({ reputation: clamp(sh.reputation - 1, 0, 10) })} aria-label="Menos reputação" style={{ ...pillBtn, width: 30, padding: 0 }}>−</button>
          <b style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.4rem", minWidth: 24, textAlign: "center" }}>{sh.reputation}</b>
          <button type="button" onClick={() => patch({ reputation: clamp(sh.reputation + 1, 0, 10) })} aria-label="Mais reputação" style={{ ...pillBtn, width: 30, padding: 0 }}>+</button>
          <span style={{ fontSize: "0.72rem", color: CP.textMuted }}>de 0 a 10</span>
        </div>
      </SheetSection>

      <SheetSection title="Custo de vida (por mês)">
        {LIFESTYLES.map((l) => (
          <div key={l.key} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", gap: 8 }}>
            <span>{l.name}</span><b>{l.cost} eb</b>
          </div>
        ))}
      </SheetSection>
    </>
  );

  return <SheetShell system="cyberpunk" left={left} right={right} />;
}
