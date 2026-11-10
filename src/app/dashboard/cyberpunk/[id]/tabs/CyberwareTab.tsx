"use client";

import { useState } from "react";
import {
  CYBERWARE, CYBERWARE_MAP, CYBER_CATEGORY_LABEL, cyberwareToSheetItem, rollHumanityLoss, slotsFree,
} from "@/lib/cyberpunk/cyberware";
import { THERAPY } from "@/lib/cyberpunk/gear";
import { currentEmp, rollDice } from "@/lib/cyberpunk/rules";
import { SheetShell } from "@/components/sheet/SheetShell";
import { SheetSection } from "@/components/sheet/SheetSection";
import { CP, PrimaryButton, dangerBtn, inputStyle, pillBtn } from "../../ui";
import { clamp, type TabProps } from "../sheetModel";

const CATEGORIES = Array.from(new Set(CYBERWARE.map((c) => c.category)));

export function CyberwareTab({ sh, patch, push }: TabProps) {
  const [pick, setPick] = useState("");
  const [charge, setCharge] = useState(true);
  const installedKeys = sh.cyberware.map((c) => c.key);
  const totalHl = sh.cyberware.reduce((n, c) => n + c.humanityLoss, 0);
  const def = CYBERWARE_MAP[pick];

  function install(rolled: boolean) {
    if (!def) return;
    const hl = rolled ? rollHumanityLoss(def) : def.hl;
    const item = cyberwareToSheetItem(def, crypto.randomUUID(), hl);
    patch({
      cyberware: [...sh.cyberware, item],
      humanity: clamp(sh.humanity - hl, -100, sh.humanityMax),
      ...(charge ? { eurobucks: Math.max(0, sh.eurobucks - def.cost) } : {}),
    });
    push({
      label: `Perda de Humanidade · ${def.name}`, total: hl, sides: 6,
      detail: rolled ? `HL ${def.hlDice || "fixa"} → ${hl}` : `HL fixa ${hl}`, tone: hl > 0 ? "fail" : undefined,
    });
    setPick("");
  }

  function therapy(t: (typeof THERAPY)[number]) {
    const m = /(\d+d\d+)/.exec(t.regains);
    const gain = m ? rollDice(m[1]) : null;
    patch({
      eurobucks: Math.max(0, sh.eurobucks - t.cost),
      ...(gain ? { humanity: clamp(sh.humanity + gain.total, -100, sh.humanityMax) } : {}),
    });
    push({
      label: `Terapia · ${t.name}`, total: gain?.total ?? 0, sides: 6,
      detail: gain ? `${m![1]} → [${gain.dice.join(", ")}] (DV ${t.dv})` : `${t.regains} (DV ${t.dv})`, tone: "success",
    });
  }

  const left = (
    <SheetSection title="Ciberware instalado" accent>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: "0.82rem" }}>
        <span>Humanidade <b>{sh.humanity}</b>/{sh.humanityMax}</span>
        <span>EMP atual <b style={{ color: currentEmp(sh.humanity) < sh.emp ? CP.warn : "var(--text)" }}>{currentEmp(sh.humanity)}</b>/{sh.emp}</span>
        <span>Perda total em implantes <b>{totalHl}</b></span>
      </div>

      {sh.cyberware.length === 0 && <p style={{ fontSize: "0.82rem", color: CP.textSubtle }}>Nenhum implante. Quem não tem chrome ainda é só carne.</p>}
      {sh.cyberware.map((c) => {
        const free = CYBERWARE_MAP[c.key]?.provides ? slotsFree(c.key, installedKeys) : null;
        return (
          <div key={c.id} style={{ padding: "10px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: "0.86rem" }}>{c.name}</p>
              <p style={{ fontSize: "0.68rem", color: CP.textMuted }}>
                {CYBER_CATEGORY_LABEL[c.category as keyof typeof CYBER_CATEGORY_LABEL] ?? c.category} · HL <b style={{ color: CP.neon }}>{c.humanityLoss}</b> · {c.cost} eb
                {free !== null && <> · espaços livres <b>{free}</b></>}
              </p>
              {c.notes && <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.5, marginTop: 3 }}>{c.notes}</p>}
            </div>
            <button type="button" onClick={() => patch({ cyberware: sh.cyberware.filter((x) => x.id !== c.id) })} aria-label={`Remover ${c.name}`} style={dangerBtn} title="Remover (a Humanidade perdida não volta)">×</button>
          </div>
        );
      })}
    </SheetSection>
  );

  const right = (
    <>
      <SheetSection title="Instalar ciberware">
        <select aria-label="Escolher ciberware" value={pick} onChange={(e) => setPick(e.target.value)} style={inputStyle}>
          <option value="">Escolher peça…</option>
          {CATEGORIES.map((cat) => (
            <optgroup key={cat} label={CYBER_CATEGORY_LABEL[cat]}>
              {CYBERWARE.filter((c) => c.category === cat).map((c) => <option key={c.key} value={c.key}>{c.name} · {c.cost} eb</option>)}
            </optgroup>
          ))}
        </select>
        {def && (
          <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
            {def.desc} <b style={{ color: CP.neon }}>HL {def.hlDice || def.hl}</b> (fixa {def.hl})
          </p>
        )}
        <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: "0.76rem", minHeight: 28 }}>
          <input type="checkbox" checked={charge} onChange={(e) => setCharge(e.target.checked)} /> Descontar o custo dos eurobucks
        </label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <PrimaryButton onClick={() => install(true)} disabled={!def}>Instalar e rolar a perda</PrimaryButton>
          <button type="button" onClick={() => install(false)} disabled={!def} style={{ ...pillBtn, minHeight: 40, opacity: def ? 1 : 0.5 }}>Instalar com HL fixa</button>
        </div>
      </SheetSection>

      <SheetSection title="Terapia de Humanidade">
        <p style={{ fontSize: "0.74rem", color: CP.textMuted, lineHeight: 1.5 }}>Cada sessão custa eurobucks e exige um teste do terapeuta. Recupera Humanidade até o máximo.</p>
        {THERAPY.map((t) => (
          <div key={t.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.8rem" }}>{t.name} <span style={{ color: CP.textSubtle }}>· {t.cost} eb · DV {t.dv} · {t.regains}</span></span>
            <button type="button" onClick={() => therapy(t)} disabled={sh.eurobucks < t.cost} style={{ ...pillBtn, opacity: sh.eurobucks < t.cost ? 0.5 : 1 }}>Fazer</button>
          </div>
        ))}
      </SheetSection>
    </>
  );

  return <SheetShell system="cyberpunk" left={left} right={right} />;
}
