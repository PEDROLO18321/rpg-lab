"use client";

import { useCallback, useRef, useState } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { ExportJsonButton } from "@/components/dashboard/ExportJsonButton";
import { RollToast, type DiceFxRoll } from "@/components/three/DiceRollFx";
import { PLAY_THEME } from "@/components/play/theme";
import { SheetHeader, type SheetTab } from "@/components/sheet/SheetHeader";
import type { DiceResult } from "@/components/play/DicePanel";
import { getRole } from "@/lib/cyberpunk/data";
import { rollCheck, beatsDv } from "@/lib/cyberpunk/rules";
import { rollWeaponDamage } from "@/lib/cyberpunk/weapons";
import { parseJsonField } from "@/lib/characterTransfer";
import "../cyberpunk-responsive.css";
import { CP } from "../ui";
import type { RollEntry, RollOpts, SheetState, TabProps } from "./sheetModel";
import { FichaTab } from "./tabs/FichaTab";
import { SkillsTab } from "./tabs/SkillsTab";
import { CombatTab } from "./tabs/CombatTab";
import { CyberwareTab } from "./tabs/CyberwareTab";
import { NetrunningTab } from "./tabs/NetrunningTab";
import { GearTab } from "./tabs/GearTab";
import { LifepathTab } from "./tabs/LifepathTab";
import { NotesTab } from "./tabs/NotesTab";

interface Props {
  character: {
    id: string; name: string; portraitUrl: string | null;
    cyberpunkSheet: Record<string, unknown>;
    user?: { name: string | null } | null;
  };
}

const BASE_TABS: SheetTab[] = [
  { id: "ficha", label: "Ficha" },
  { id: "pericias", label: "Perícias" },
  { id: "combate", label: "Combate" },
  { id: "cyberware", label: "Cyberware" },
  { id: "netrunning", label: "Netrunning" },
  { id: "equipamento", label: "Equipamento" },
  { id: "lifepath", label: "Lifepath" },
  { id: "notas", label: "Notas" },
];

function initialState(c: Props["character"]): SheetState {
  const r = c.cyberpunkSheet;
  const num = (k: string, d: number): number => (typeof r[k] === "number" ? r[k] : d);
  return {
    name: c.name, portraitUrl: c.portraitUrl,
    role: typeof r.role === "string" ? r.role : "solo", roleRank: num("roleRank", 4), creationMethod: typeof r.creationMethod === "string" ? r.creationMethod : "streetrat",
    int: num("int", 5), ref: num("ref", 5), dex: num("dex", 5), tech: num("tech", 5), cool: num("cool", 5),
    will: num("will", 5), luck: num("luck", 5), move: num("move", 5), body: num("body", 5), emp: num("emp", 5),
    luckCurrent: num("luckCurrent", 5), hpMax: num("hpMax", 35), hpCurrent: num("hpCurrent", 35),
    humanityMax: num("humanityMax", 50), humanity: num("humanity", 50),
    deathSavePenalty: num("deathSavePenalty", 0), improvementPoints: num("improvementPoints", 0),
    eurobucks: num("eurobucks", 0), reputation: num("reputation", 0),
    skills: parseJsonField(r.skills, {}),
    armor: parseJsonField(r.armor, {}),
    weapons: parseJsonField(r.weapons, []),
    cyberware: parseJsonField(r.cyberware, []),
    gear: parseJsonField(r.gear, []),
    criticalInjuries: parseJsonField(r.criticalInjuries, []),
    lifepath: parseJsonField(r.lifepath, {}),
    background: parseJsonField(r.background, {}),
    notes: typeof r.notes === "string" ? r.notes : "",
  };
}

export function SheetClient({ character }: Props) {
  const [sh, setSh] = useState<SheetState>(() => initialState(character));
  const [tab, setTab] = useState("ficha");
  const [log, setLog] = useState<RollEntry[]>([]);
  const [fx, setFx] = useState<DiceFxRoll | null>(null);
  const [save, setSave] = useState<{ state: "idle" | "saving" | "saved" | "error"; msg?: string }>({ state: "idle" });
  const logId = useRef(0);
  // Fila: as gravações saem em ordem. Duas requisições em paralelo podem
  // chegar invertidas, e a última a chegar venceria com o valor antigo.
  const queue = useRef<Promise<void>>(Promise.resolve());

  const isNetrunner = sh.role === "netrunner";
  const tabs = isNetrunner ? BASE_TABS : BASE_TABS.filter((t) => t.id !== "netrunning");
  const activeTab = tabs.some((t) => t.id === tab) ? tab : "ficha";

  const patch = useCallback((p: Partial<SheetState>) => {
    setSh((prev) => ({ ...prev, ...p }));
    setSave({ state: "saving" });
    queue.current = queue.current.then(async () => {
      try {
        const res = await fetch(`/api/cyberpunk/characters/${character.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error ?? "Não foi possível salvar.");
        }
        setSave({ state: "saved" });
      } catch (e) {
        setSave({ state: "error", msg: e instanceof Error ? e.message : "Não foi possível salvar." });
      }
    });
  }, [character.id]);

  const push = useCallback((e: Omit<RollEntry, "id">) => {
    const entry: RollEntry = { ...e, id: ++logId.current };
    setLog((prev) => [entry, ...prev].slice(0, 20));
    setFx({ id: entry.id, label: entry.label, dice: entry.sides, total: entry.total, isCrit: entry.tone === "crit", isFumble: entry.tone === "fumble" });
  }, []);

  const roll = useCallback((label: string, stat: number, skill: number, opts: RollOpts = {}) => {
    const mod = opts.modifier ?? 0;
    const r = rollCheck(stat, skill, mod);
    const dv = opts.dv ?? null;
    const hit = dv !== null && Number.isFinite(dv) ? beatsDv(r.total, dv) : null;
    const dice = r.kind === "explode" ? `d10 ${r.natural} + ${r.extra}` : r.kind === "implode" ? `d10 ${r.natural} − ${r.extra}` : `d10 ${r.natural}`;
    const parts = [dice, `base ${stat + skill}`, ...(mod !== 0 ? [`mod ${mod > 0 ? "+" : ""}${mod}`] : [])];
    push({
      label, total: r.total, sides: 10, detail: parts.join(" · "),
      tone: r.kind === "explode" ? "crit" : r.kind === "implode" ? "fumble" : hit === null ? undefined : hit ? "success" : "fail",
      badge: hit !== null ? `${hit ? "Acerta" : "Erra"} (DV ${dv})` : r.kind === "explode" ? "Explodiu" : r.kind === "implode" ? "Implodiu" : undefined,
    });
  }, [push]);

  const rollDamage = useCallback((label: string, expr: string) => {
    const r = rollWeaponDamage(expr);
    push({
      label, total: r.total, sides: 6,
      detail: `[${r.dice.join(", ")}]${r.critical ? " · dois 6: ferimento crítico, +5 de dano direto" : ""}`,
      tone: r.critical ? "crit" : undefined, badge: r.critical ? "CRÍTICO" : undefined,
    });
    return r;
  }, [push]);

  const onDice = useCallback((r: DiceResult) => {
    push({ label: r.label, total: r.total, sides: r.sides, detail: `[${r.rolls.join(", ")}]${r.mod ? ` ${r.mod > 0 ? "+" : ""}${r.mod}` : ""}` });
  }, [push]);

  const tabProps: TabProps = { sh, patch, roll, push, rollDamage };
  const role = getRole(sh.role);
  const last = log[0];

  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      <DashboardNav
        userName={character.user?.name ?? "Edgerunner"}
        systemName="Cyberpunk RED"
        systemHref="/dashboard/cyberpunk/jogador"
        backLabel="Edgerunners"
        accentColor={CP.accent}
        shareCharacterId={character.id}
      />

      <div className="no-print" style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 24px 0" }}>
        <SheetHeader
          system="cyberpunk"
          portraitUrl={sh.portraitUrl}
          initials={sh.name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "CP"}
          name={sh.name}
          subtitle={`${role?.name ?? sh.role} · Grau ${sh.roleRank} · ${role?.abilityName ?? ""}`}
          mode={activeTab}
          onMode={setTab}
          tabs={tabs}
          status={
            <span role="status" style={{ fontSize: "0.74rem", color: save.state === "error" ? CP.danger : "var(--accent-light)" }}>
              {save.state === "saving" ? "Salvando…" : save.state === "saved" ? "✓ Salvo" : save.state === "error" ? save.msg : ""}
            </span>
          }
          actions={<ExportJsonButton exportUrl={`/api/cyberpunk/characters/${character.id}/export`} characterName={sh.name} systemSlug="cyberpunk" />}
        />

        {last && (
          <div
            aria-label="Última rolagem"
            style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", padding: "8px 14px", marginBottom: 4, background: CP.accentDim, border: `1px solid ${CP.accentBord}`, borderRadius: "var(--radius-lg)", fontSize: "0.8rem" }}
          >
            <span style={{ color: "var(--text-muted)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{last.label}</span>
            <b style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.2rem", color: last.tone === "fumble" ? CP.danger : CP.accentLight }}>{last.total}</b>
            {last.badge && <span style={{ fontSize: "0.7rem", fontWeight: 700, color: last.tone === "fail" || last.tone === "fumble" ? CP.danger : CP.success }}>{last.badge}</span>}
            {last.detail && <span style={{ fontSize: "0.72rem", color: "var(--text-subtle)" }}>{last.detail}</span>}
          </div>
        )}
      </div>

      <main id="conteudo" style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 24px 80px", display: "flex", flexDirection: "column", gap: 24 }}>
        {activeTab === "ficha" && <FichaTab {...tabProps} log={log} onClearLog={() => setLog([])} onDice={onDice} />}
        {activeTab === "pericias" && <SkillsTab {...tabProps} />}
        {activeTab === "combate" && <CombatTab {...tabProps} />}
        {activeTab === "cyberware" && <CyberwareTab {...tabProps} />}
        {activeTab === "netrunning" && isNetrunner && <NetrunningTab {...tabProps} />}
        {activeTab === "equipamento" && <GearTab {...tabProps} />}
        {activeTab === "lifepath" && <LifepathTab {...tabProps} />}
        {activeTab === "notas" && <NotesTab {...tabProps} />}
      </main>

      <RollToast roll={fx} color={PLAY_THEME.cyberpunk.accent} edgeColor={PLAY_THEME.cyberpunk.accentLight} emissive={PLAY_THEME.cyberpunk.dieEmissive} />
    </div>
  );
}
