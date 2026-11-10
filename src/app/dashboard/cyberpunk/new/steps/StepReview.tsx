"use client";

import { COMPLETE_PACKAGE_GEAR_EB, STATS, getRole, getSkillDef } from "@/lib/cyberpunk/data";
import { validateCompletePackage } from "@/lib/cyberpunk/creation";
import { CP, SectionTitle } from "../../ui";
import { derived, equipmentCost, finalSkills, resolveEquipment, languageKey, type WizardData } from "../wizardModel";

function skillLabel(key: string): string {
  const def = getSkillDef(key);
  const base = def ? def.name.replace(/ \(especificar\)/, "") : key;
  const i = key.indexOf(":");
  return i < 0 ? base : `${base}: ${key.slice(i + 1)}`;
}

/** Problemas que impedem criar. O servidor repete a conta do Pacote Completo. */
export function reviewProblems(data: WizardData): string[] {
  const out: string[] = [];
  if (!data.name.trim()) out.push("Dê um nome ao edgerunner.");
  if (!data.stats) { out.push("Defina os atributos."); return out; }
  if (data.method === "complete") {
    const free = data.lifepath.language ? languageKey(data.lifepath.language) : undefined;
    const check = validateCompletePackage({ stats: data.stats, skills: finalSkills(data), freeLanguageKey: free });
    if (!check.complete) out.push(...check.errors, ...(check.valid ? [`Gaste todos os pontos (atributos: ${check.statPointsLeft}, perícias: ${check.skillPointsLeft}).`] : []));
    if (equipmentCost(data) > COMPLETE_PACKAGE_GEAR_EB) out.push("O equipamento passa do orçamento de 2550 eb.");
  }
  return out;
}

export function StepReview({ data }: { data: WizardData }) {
  const role = getRole(data.role);
  const problems = reviewProblems(data);
  const stats = data.stats;
  const d = stats ? derived(stats, data) : null;
  const eq = resolveEquipment(data);
  const skills = Object.entries(finalSkills(data)).sort((a, b) => skillLabel(a[0]).localeCompare(skillLabel(b[0]), "pt"));
  const lp = data.lifepath;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <SectionTitle eyebrow="Passo 6" title="Revisão" desc="Confira tudo antes de criar. Depois, qualquer coisa pode ser ajustada na ficha." />

      {problems.length > 0 && (
        <div style={{ padding: "12px 16px", background: "rgba(239,107,107,0.1)", border: "1px solid rgba(239,107,107,0.4)", borderRadius: "var(--radius)" }}>
          <p style={{ fontSize: "0.74rem", fontWeight: 800, color: CP.danger, marginBottom: 6 }}>Ainda falta resolver</p>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.8rem", color: "var(--text-muted)" }}>{problems.map((p) => <li key={p}>{p}</li>)}</ul>
        </div>
      )}

      <Card title={data.name.trim() || "Sem nome"}>
        <p style={{ fontSize: "0.84rem", color: "var(--text-muted)" }}>
          {role?.name} · Grau 4 · {role?.abilityName} · método {data.method === "complete" ? "Pacote Completo" : data.method === "edgerunner" ? "Edgerunner" : "Streetrat"}
        </p>
      </Card>

      {stats && d && (
        <Card title="Atributos e derivados">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(86px, 100%), 1fr))", gap: 8 }}>
            {STATS.map((s) => (
              <div key={s.key} style={{ textAlign: "center", padding: "6px 4px", background: CP.accentDim, border: `1px solid ${CP.accentBord}`, borderRadius: "var(--radius)" }}>
                <div style={{ fontSize: "0.62rem", fontWeight: 800, color: CP.accentLight }}>{s.short}</div>
                <div style={{ fontFamily: "var(--font-cinzel), serif", fontWeight: 800 }}>{stats[s.key]}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: "0.82rem", marginTop: 10 }}>
            HP <b>{d.hp}</b> · Humanidade <b>{d.humanity}</b>/{d.humanityMax} · Salvaguarda <b>{stats.body}</b>
          </p>
        </Card>
      )}

      <Card title={`Perícias (${skills.length})`}>
        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
          {skills.map(([k, v]) => `${skillLabel(k)} ${v}`).join(" · ")}
        </p>
      </Card>

      <Card title="Equipamento">
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
          {eq.weapons.length} arma(s) · {eq.gear.length} item(ns) · {eq.cyberware.length} peça(s) de ciberware
          {eq.armorHead || eq.armorBody || eq.shield ? " · armadura" : ""}
        </p>
      </Card>

      {(lp.origin || lp.personality) && (
        <Card title="Caminho de vida">
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
            {[lp.origin, lp.language && `idioma ${lp.language}`, lp.personality, lp.goal].filter(Boolean).join(" · ")}
          </p>
        </Card>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "14px 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
      <p style={{ fontFamily: "var(--font-cinzel), serif", fontWeight: 700, marginBottom: 8, color: "var(--text)" }}>{title}</p>
      {children}
    </div>
  );
}
