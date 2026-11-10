"use client";

import { useRef, useState } from "react";
import { STATS, getRole, type StatKey } from "@/lib/cyberpunk/data";
import {
  baseDeathSavePenalty,
} from "@/lib/cyberpunk/criticalInjuries";
import { netActionsForRank } from "@/lib/cyberpunk/netrunning";
import {
  currentEmp, deathSaveSucceeds, isCyberpsycho, rollD, roleRankCost, seriousThreshold,
} from "@/lib/cyberpunk/rules";
import { PlayAlert } from "@/components/play/PlayShell";
import { PlayCard } from "@/components/play/PlayCard";
import { VitalBar } from "@/components/play/VitalBar";
import { StatChip } from "@/components/play/StatChip";
import { RollHistory } from "@/components/play/RollHistory";
import { DicePanel, type DiceResult } from "@/components/play/DicePanel";
import { PLAY_THEME } from "@/components/play/theme";
import { SheetShell, SheetVitals, SheetChips } from "@/components/sheet/SheetShell";
import { SheetSection } from "@/components/sheet/SheetSection";
import { CP, GhostButton, PrimaryButton, inputStyle, pillBtn } from "../../ui";
import { autoModifier, clamp, moveOf, woundOf, armorPenaltyOf, type RollEntry, type TabProps } from "../sheetModel";

interface Props extends TabProps {
  log: RollEntry[];
  onClearLog: () => void;
  onDice: (r: DiceResult) => void;
}

const WOUND_LABEL = { ok: "Ileso", leve: "Levemente ferido", grave: "Gravemente ferido (−2 em Ações)", mortal: "Mortalmente ferido" } as const;

function compressPortrait(file: File, done: (dataUrl: string) => void) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new window.Image();
    img.onload = () => {
      // 400px no maior lado: o servidor recusa retratos grandes (PORTRAIT_MAX).
      const scale = Math.min(1, 400 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      done(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.src = reader.result as string;
  };
  reader.readAsDataURL(file);
}

export function FichaTab({ sh, patch, roll, push, log, onClearLog, onDice }: Props) {
  const [editing, setEditing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const role = getRole(sh.role);
  const wound = woundOf(sh);
  const injuryKeys = sh.criticalInjuries.map((c) => c.key);
  const dsPenalty = sh.deathSavePenalty + baseDeathSavePenalty(injuryKeys);
  const empNow = currentEmp(sh.humanity);
  const move = moveOf(sh);
  const armorPen = armorPenaltyOf(sh);
  const woundColor = wound.state === "ok" ? CP.accentLight : wound.state === "leve" ? CP.accentLight : wound.state === "grave" ? CP.warn : CP.danger;
  const nextRankCost = roleRankCost(sh.roleRank + 1);

  function rollDeathSave() {
    const natural = rollD(10);
    const ok = deathSaveSucceeds(sh.body, dsPenalty, natural);
    push({
      label: "Salvaguarda contra a Morte", total: natural, sides: 10,
      detail: `d10 ${natural} + penalidade ${dsPenalty} deve ficar abaixo de CORPO ${sh.body}${natural === 10 ? " (10 natural sempre falha)" : ""}`,
      tone: ok ? "success" : "fail", badge: ok ? "Sobrevive" : "Morre",
    });
    if (ok) patch({ deathSavePenalty: sh.deathSavePenalty + 1 });
  }

  function setStat(k: StatKey, v: number) {
    patch({ [k]: clamp(v, 1, 10) } as Partial<typeof sh>);
  }

  const band = (
    <>
      <SheetVitals>
        <VitalBar
          label="HP" color={woundColor} cur={sh.hpCurrent} max={sh.hpMax}
          note={WOUND_LABEL[wound.state]} warn={wound.state === "grave" || wound.state === "mortal"}
          onDelta={(d) => patch({ hpCurrent: clamp(sh.hpCurrent + d, 0, sh.hpMax) })}
        />
        <VitalBar
          label="Humanidade" color={sh.humanity < 0 ? CP.danger : CP.neon} cur={sh.humanity} max={sh.humanityMax} min={-100}
          note={`EMP ${empNow}`} warn={empNow < sh.emp}
          onDelta={(d) => patch({ humanity: clamp(sh.humanity + d, -100, sh.humanityMax) })}
        />
        <VitalBar
          label="Sorte" color={CP.accentLight} cur={sh.luckCurrent} max={sh.luck}
          onDelta={(d) => patch({ luckCurrent: clamp(sh.luckCurrent + d, 0, sh.luck) })}
        />
      </SheetVitals>

      <SheetChips>
        <StatChip label="MOV" value={move} warn={move < sh.move} title={armorPen < 0 ? `Armadura: ${armorPen}` : undefined} />
        <StatChip label="Grave abaixo de" value={seriousThreshold(sh.hpMax)} />
        <StatChip label="Salvaguarda" value={`< ${sh.body}`} title="Rolar 1d10 abaixo do CORPO" />
        <StatChip label="EMP atual" value={`${empNow}/${sh.emp}`} warn={empNow < sh.emp} />
        <StatChip label="Eurobucks" value={sh.eurobucks} />
        <StatChip label="Reputação" value={sh.reputation} />
        <StatChip label="IP" value={sh.improvementPoints} title="Pontos de Melhoria" />
      </SheetChips>

      {wound.state === "mortal" && (
        <PlayAlert title="Mortalmente ferido — salvaguarda a cada turno" tone="danger">
          <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 10 }}>
            Ações −4 e MOV −6. Role 1d10 e some a penalidade acumulada ({dsPenalty}); precisa ficar <b>abaixo</b> do CORPO ({sh.body}). Um 10 sempre falha.
            Estabilizar exige Primeiros Socorros ou Paramédico (DV {wound.stabilizeDv}).
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <PrimaryButton onClick={rollDeathSave}>🎲 Rolar salvaguarda</PrimaryButton>
            <GhostButton onClick={() => patch({ hpCurrent: 1, deathSavePenalty: 0 })}>Estabilizado: HP 1</GhostButton>
          </div>
        </PlayAlert>
      )}

      {isCyberpsycho(sh.humanity) && (
        <PlayAlert title="Ciberpsicose — Humanidade abaixo de zero" tone="danger">
          <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
            O personagem perdeu o controle. Em regra ele passa a ser conduzido pelo Mestre até receber terapia.
          </p>
        </PlayAlert>
      )}
    </>
  );

  const stats = (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(150px, 100%), 1fr))", gap: 8 }}>
      {STATS.map((s) => {
        const v = sh[s.key];
        const mod = autoModifier(sh, s.key);
        return editing ? (
          <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
            <span style={{ flex: 1, fontSize: "0.74rem", fontWeight: 800, color: CP.accentLight }}>{s.short}</span>
            <button type="button" onClick={() => setStat(s.key, v - 1)} aria-label={`Diminuir ${s.name}`} style={{ ...pillBtn, width: 28, padding: 0 }}>−</button>
            <b style={{ minWidth: 18, textAlign: "center" }}>{v}</b>
            <button type="button" onClick={() => setStat(s.key, v + 1)} aria-label={`Aumentar ${s.name}`} style={{ ...pillBtn, width: 28, padding: 0 }}>+</button>
          </div>
        ) : (
          <button
            key={s.key} type="button"
            onClick={() => roll(s.name, v, 0, { modifier: mod })}
            title={`${s.desc} Toque para rolar.`}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "10px 6px", minHeight: 64, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer", fontFamily: "inherit", color: "var(--text)" }}
          >
            <span style={{ fontSize: "0.66rem", fontWeight: 800, color: CP.accentLight, letterSpacing: "0.05em" }}>{s.short}</span>
            <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.35rem", fontWeight: 800, lineHeight: 1 }}>{v}</span>
            <span style={{ fontSize: "0.62rem", color: CP.textSubtle }}>{s.name}</span>
          </button>
        );
      })}
    </div>
  );

  const left = (
    <>
      <SheetSection
        title="Atributos" accent
        action={<button type="button" onClick={() => setEditing((e) => !e)} aria-pressed={editing} style={{ ...pillBtn, color: editing ? CP.accentLight : "var(--text-muted)", borderColor: editing ? CP.accentBord : "var(--border)" }}>{editing ? "Concluir" : "Editar"}</button>}
      >
        {stats}
        {editing && (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: "0.76rem", color: "var(--text-muted)" }}>
              HP máx
              <input type="number" min={1} max={200} value={sh.hpMax} onChange={(e) => patch({ hpMax: clamp(parseInt(e.target.value) || 1, 1, 200), hpCurrent: Math.min(sh.hpCurrent, clamp(parseInt(e.target.value) || 1, 1, 200)) })} style={{ ...inputStyle, width: 72 }} />
            </label>
            <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: "0.76rem", color: "var(--text-muted)" }}>
              Humanidade máx
              <input type="number" min={0} max={120} value={sh.humanityMax} onChange={(e) => patch({ humanityMax: clamp(parseInt(e.target.value) || 0, 0, 120) })} style={{ ...inputStyle, width: 72 }} />
            </label>
          </div>
        )}
        {editing && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <input aria-label="Nome" value={sh.name} maxLength={80} onChange={(e) => patch({ name: e.target.value })} style={{ ...inputStyle, flex: "1 1 200px", width: "auto" }} />
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) compressPortrait(f, (url) => patch({ portraitUrl: url })); }} />
            <button type="button" onClick={() => fileRef.current?.click()} style={pillBtn}>Trocar foto</button>
            {sh.portraitUrl && <button type="button" onClick={() => patch({ portraitUrl: null })} style={pillBtn}>Remover foto</button>}
          </div>
        )}
        <p style={{ fontSize: "0.72rem", color: CP.textMuted, lineHeight: 1.5 }}>
          Toque num atributo para rolar 1d10 + valor. Ferimento e armadura já entram no modificador.
        </p>
      </SheetSection>

      <SheetSection title="Habilidade de Papel">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ minWidth: 0, flex: "1 1 220px" }}>
            <p style={{ fontFamily: "var(--font-cinzel), serif", fontWeight: 700, color: CP.accentLight }}>{role?.abilityName ?? "—"}</p>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.6, marginTop: 4 }}>{role?.abilityShort}</p>
            {sh.role === "netrunner" && <p style={{ fontSize: "0.78rem", color: CP.neon, marginTop: 6 }}>Ações de NET por turno: <b>{netActionsForRank(sh.roleRank)}</b></p>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button type="button" onClick={() => patch({ roleRank: clamp(sh.roleRank - 1, 1, 10) })} aria-label="Diminuir Grau" style={{ ...pillBtn, width: 30, padding: 0 }}>−</button>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.58rem", color: CP.textSubtle, fontWeight: 700, letterSpacing: "0.06em" }}>GRAU</div>
              <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.6rem", fontWeight: 800, lineHeight: 1 }}>{sh.roleRank}</div>
            </div>
            <button type="button" onClick={() => patch({ roleRank: clamp(sh.roleRank + 1, 1, 10) })} aria-label="Aumentar Grau" style={{ ...pillBtn, width: 30, padding: 0 }}>+</button>
          </div>
        </div>
        {sh.roleRank < 10 && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", fontSize: "0.76rem", color: "var(--text-muted)" }}>
            Próximo Grau custa <b>{nextRankCost} IP</b> (você tem {sh.improvementPoints}).
            <button
              type="button" disabled={sh.improvementPoints < nextRankCost}
              onClick={() => patch({ roleRank: sh.roleRank + 1, improvementPoints: sh.improvementPoints - nextRankCost })}
              style={{ ...pillBtn, opacity: sh.improvementPoints < nextRankCost ? 0.5 : 1 }}
            >
              Subir com IP
            </button>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", fontSize: "0.76rem", color: "var(--text-muted)" }}>
          Pontos de Melhoria
          <button type="button" onClick={() => patch({ improvementPoints: Math.max(0, sh.improvementPoints - 10) })} aria-label="Menos 10 IP" style={pillBtn}>−10</button>
          <b style={{ minWidth: 28, textAlign: "center" }}>{sh.improvementPoints}</b>
          <button type="button" onClick={() => patch({ improvementPoints: sh.improvementPoints + 10 })} aria-label="Mais 10 IP" style={pillBtn}>+10</button>
        </div>
      </SheetSection>
    </>
  );

  const right = (
    <>
      <PlayCard title="Rolagem de Dados" accent>
        <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)", marginBottom: 10, lineHeight: 1.5 }}>
          Nos testes do jogo, um 10 natural soma outro d10 e um 1 natural subtrai.
        </p>
        <DicePanel theme={PLAY_THEME.cyberpunk} features={{ qty: true }} defaultSides={10} onRoll={onDice} />
      </PlayCard>
      <PlayCard title="Histórico">
        <RollHistory log={log} onClear={onClearLog} />
      </PlayCard>
    </>
  );

  return <SheetShell system="cyberpunk" band={band} left={left} right={right} />;
}
