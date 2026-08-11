"use client";

import { useMemo, useState } from "react";
import { SPECIES, TIER_LABEL, TIER_DESCRIPTION, type PvPeTier } from "@/lib/starwars/species";
import { CLASSES, ARCHETYPE_LABEL, ARCHETYPE_DESCRIPTION, ARCHETYPE_FORMULA, type Archetype, type StarWarsClass } from "@/lib/starwars/classes";
import { SKILLS } from "@/lib/starwars/skills";
import {
  ATTR_KEYS, ATTR_LABEL, ATTR_ABBR, SKILL_GRADE_BONUS, SKILL_GRADE_LABEL, SKILL_GRADE_ORDER,
  ATTR_CREATION_POINTS, ATTR_CREATION_MAX_PER_ATTR,
} from "@/lib/starwars/data";
import { attributeDicePool } from "@/lib/starwars/creation";
import { PLANETS } from "@/lib/starwars/planets";
import { GENERAL_POWERS_BASIC, GENERAL_POWERS_ADVANCED } from "@/lib/starwars/powers/generalPowers";
import { getAbilitiesGroupedByLevel, getClassMilestones } from "@/lib/starwars/powers/registry";
import { SABRE_FORMS, SABRE_FORM_BY_ID } from "@/lib/starwars/sabreForms";
import { ITEMS, CATEGORY_LABEL, CATEGORY_ORDER, type ItemCategory } from "@/lib/starwars/items";
import {
  MAX_LEVEL, CLASS_LEVEL_CAP, FREE_MULTICLASS_LEVEL, EXPERT_SKILLS_PER_MULTICLASS,
  PATH_CLASS_UNLOCK_LEVEL, POOL_CLASS_IDS, ppMaxPerTurn, ppLevelUpGain,
} from "@/lib/starwars/leveling";
import { damageLevelMultiplier } from "@/lib/starwars/damage";

const ACCENT = "#5d9ed6";
const ACCENT_LIGHT = "#8fc4f5";
const ACCENT_DIM = "rgba(93,158,214,0.14)";
const ACCENT_BORD = "rgba(93,158,214,0.35)";
const GOLD = "#c9941f";

const TOC = [
  { id: "visao-geral", label: "Visão Geral" },
  { id: "atributos", label: "Atributos e Dados" },
  { id: "pericias", label: "Perícias" },
  { id: "criacao", label: "Criação de Personagem" },
  { id: "planetas", label: "Planetas de Origem" },
  { id: "especies", label: "Espécies (35)" },
  { id: "classes", label: "Classes e Arquétipos" },
  { id: "habilidades", label: "Habilidades de Classe" },
  { id: "sabres", label: "Formas de Sabre de Luz" },
  { id: "poderes", label: "Poderes Gerais (50)" },
  { id: "progressao", label: "Progressão e Nível" },
  { id: "combate", label: "Combate e Escala de Dano" },
  { id: "itens", label: "Equipamentos" },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const panel: React.CSSProperties = { background: "var(--surface)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-xl)", padding: "20px 22px" };
const label: React.CSSProperties = { fontSize: "0.62rem", fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.08em" };
const sectionTitle: React.CSSProperties = { fontFamily: "var(--font-cinzel), serif", fontSize: "1.05rem", fontWeight: 700, color: "var(--text)", marginBottom: 4 };
const searchInput: React.CSSProperties = { padding: "9px 14px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem", outline: "none", width: "100%", boxSizing: "border-box" };

function Section({ id, title, note, children }: { id: string; title: string; note?: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ ...panel, scrollMarginTop: 90 }}>
      <h2 style={sectionTitle}>{title}</h2>
      {note && <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 16 }}>{note}</p>}
      <div style={{ marginTop: note ? 0 : 14 }}>{children}</div>
    </section>
  );
}

function mod(n: number) { return n >= 0 ? `+${n}` : `${n}`; }

export function RulesManual() {
  return (
    <div className="sw-rules-grid" style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 32, alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
        <VisaoGeral />
        <Atributos />
        <Pericias />
        <Criacao />
        <Planetas />
        <Especies />
        <ClassesSection />
        <HabilidadesClasse />
        <Sabres />
        <PoderesGerais />
        <Progressao />
        <Combate />
        <Equipamentos />
      </div>

      <aside className="sw-rules-toc" style={{ position: "sticky", top: 90 }}>
        <p style={{ ...label, marginBottom: 10 }}>Neste manual</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {TOC.map((t) => (
            <button
              key={t.id}
              onClick={() => scrollTo(t.id)}
              style={{ textAlign: "left", padding: "6px 10px", background: "transparent", border: "none", borderLeft: `2px solid ${ACCENT_BORD}`, color: "var(--text-muted)", fontSize: "0.78rem", cursor: "pointer", borderRadius: 0 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = ACCENT_LIGHT)}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              {t.label}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}

// ─── Visão Geral ────────────────────────────────────────────────────────────

function VisaoGeral() {
  return (
    <Section id="visao-geral" title="Visão Geral do Sistema">
      <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "0.84rem", color: "var(--text)", lineHeight: 1.7 }}>
        <p><strong style={{ color: ACCENT_LIGHT }}>Star Wars: Além da Fronteira</strong> é um sistema autoral d20 numa linha do tempo alternativa, focado na exploração das Regiões Desconhecidas. Personagens têm 6 atributos, 25 perícias, e três recursos de jogo: <strong>PV</strong> (Pontos de Vida), <strong>PE</strong> (Pontos de Energia — custeiam habilidades de classe) e <strong>PP</strong> (Pontos de Poder — custeiam Poderes Gerais).</p>
        <p>Testes não rolam 1d20 fixo: o número de dados rolados depende do valor do atributo (veja <button onClick={() => scrollTo("atributos")} style={{ background: "none", border: "none", color: ACCENT_LIGHT, cursor: "pointer", padding: 0, font: "inherit" }}>Atributos e Dados</button>), somado ao bônus de grau de treinamento da perícia.</p>
        <p>Todo personagem tem uma <strong>espécie</strong> (35 opções, bônus de atributo + tier de PV/PE), um <strong>planeta de origem</strong> (28 opções, cada um com uma Habilidade Natal de +5 em perícia) e uma <strong>classe</strong> (25 opções, em 3 arquétipos: Marcial, Especialista e Sensível à Força). O nível vai de 1 a {MAX_LEVEL.toLocaleString("pt-BR")}, com <strong>multiclasse</strong> livre a partir do nível {FREE_MULTICLASS_LEVEL} e teto de {CLASS_LEVEL_CAP} níveis por classe individual.</p>
        <p>As 3 classes-base ligadas à Força (Padawan Jedi, Acólito Sith, Andarilho da Força) aprendem <strong>Formas de Sabre de Luz</strong> e, a partir do nível {PATH_CLASS_UNLOCK_LEVEL}, desbloqueiam classes de Caminho ainda mais poderosas.</p>
      </div>
    </Section>
  );
}

// ─── Atributos ──────────────────────────────────────────────────────────────

function Atributos() {
  const examples = [-2, -1, 0, 1, 2, 3, 4];
  return (
    <Section id="atributos" title="Atributos e Dados" note="Os 6 atributos vão de valores negativos (raro, penalidade de espécie) até tipicamente +4. Cada teste rola um número de d20 que depende do valor do atributo usado — não existe teste de 1d20 puro acima do valor 1.">
      <div className="sw-rules-attr-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 18 }}>
        {ATTR_KEYS.map((k) => (
          <div key={k} style={{ textAlign: "center", padding: "10px 6px", background: "var(--surface-2)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius)" }}>
            <p style={{ fontSize: "0.62rem", fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{ATTR_ABBR[k]}</p>
            <p style={{ fontSize: "0.78rem", color: "var(--text)" }}>{ATTR_LABEL[k]}</p>
          </div>
        ))}
      </div>

      <p style={{ ...label, marginBottom: 8 }}>Pool de dados por valor de atributo</p>
      <div style={{ overflowX: "auto", marginBottom: 8 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${ACCENT_BORD}` }}>
              <th style={{ textAlign: "left", padding: "6px 8px", color: "var(--text-muted)" }}>Valor</th>
              <th style={{ textAlign: "left", padding: "6px 8px", color: "var(--text-muted)" }}>Rola</th>
              <th style={{ textAlign: "left", padding: "6px 8px", color: "var(--text-muted)" }}>Usa</th>
            </tr>
          </thead>
          <tbody>
            {examples.map((v) => {
              const p = attributeDicePool(v);
              return (
                <tr key={v} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "6px 8px", color: "var(--text)", fontWeight: 700 }}>{mod(v)}</td>
                  <td style={{ padding: "6px 8px", color: "var(--text-muted)" }}>{p.dice}d20</td>
                  <td style={{ padding: "6px 8px", color: p.take === "highest" ? "#4ade80" : "#f87171" }}>{p.take === "highest" ? "o maior resultado" : "o menor resultado"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: "0.76rem", color: "var(--text-subtle)", lineHeight: 1.6 }}>
        Atributo 2+: rola N d20 (N = valor) e usa o maior. Atributo 1: 1d20 normal. Atributo 0: 2d20, usa o menor (desvantagem leve). Atributo negativo: (2 + |valor|)d20, usa o menor — quanto mais negativo, pior a desvantagem.
      </p>
    </Section>
  );
}

// ─── Perícias ───────────────────────────────────────────────────────────────

function Pericias() {
  return (
    <Section id="pericias" title="Perícias" note="25 perícias, cada uma ligada a 1-3 atributos possíveis (o jogador usa o melhor na hora do teste). O bônus de perícia soma o grau de treinamento ao resultado do dado.">
      <p style={{ ...label, marginBottom: 8 }}>Graus de treinamento</p>
      <div className="sw-rules-grade-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6, marginBottom: 18 }}>
        {SKILL_GRADE_ORDER.map((g) => (
          <div key={g} style={{ textAlign: "center", padding: "8px 4px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
            <p style={{ fontSize: "0.9rem", fontWeight: 700, color: ACCENT_LIGHT }}>+{SKILL_GRADE_BONUS[g]}</p>
            <p style={{ fontSize: "0.62rem", color: "var(--text-muted)" }}>{SKILL_GRADE_LABEL[g]}</p>
          </div>
        ))}
      </div>

      <p style={{ ...label, marginBottom: 8 }}>As 25 perícias</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
        {SKILLS.map((s) => (
          <div key={s.id} style={{ padding: "8px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text)" }}>{s.name}</span>
            <span style={{ fontSize: "0.66rem", color: ACCENT_LIGHT, whiteSpace: "nowrap" }}>{s.attrs.map((a) => ATTR_ABBR[a]).join("/")}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── Criação de Personagem ──────────────────────────────────────────────────

function Criacao() {
  const steps = [
    { n: 1, title: "Distribua atributos", text: `${ATTR_CREATION_POINTS} pontos livres entre os 6 atributos, base 0. Máximo de +${ATTR_CREATION_MAX_PER_ATTR} em um único atributo na criação (evita build extremo de "um alto, resto zero").` },
    { n: 2, title: "Escolha uma espécie", text: "Aplica o bônus/penalidade de atributo da espécie (ou, só no Humano, uma escolha livre de +2/+2/+1/+1/+1/-1 entre os 6 atributos), define o tier de PV/PE bônus e concede 2 perícias iniciais treinadas de graça." },
    { n: 3, title: "Escolha um planeta de origem", text: "Concede a Habilidade Natal do planeta: +5 fixo numa perícia específica (ou a escolher, se o planeta listar 2 opções) — somado por cima do grau normal." },
    { n: 4, title: "Escolha uma classe", text: "Define o arquétipo (Marcial, Especialista ou Sensível à Força), que fixa as fórmulas de PV/PE e o multiplicador de perícias treinadas." },
    { n: 5, title: "Perícias treinadas", text: "Nº de perícias treinadas na criação = arredondar para cima (INT final × multiplicador do arquétipo da classe). Especialista e Sensível multiplicam por 2; Marcial por 1,5." },
    { n: 6, title: "PV/PE/PP iniciais", text: "PV e PE seguem a fórmula do arquétipo da classe (base + Vigor×mult / Sensitividade×mult) mais o bônus de tier da espécie. PP = 2 + Presença + modificador de PP da classe." },
  ];
  return (
    <Section id="criacao" title="Criação de Personagem">
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {steps.map((s) => (
          <div key={s.n} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, color: ACCENT_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", fontWeight: 700, flexShrink: 0 }}>{s.n}</div>
            <div>
              <p style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{s.title}</p>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{s.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: 1, background: "var(--border)", margin: "16px 0" }} />
      <p style={{ ...label, marginBottom: 8 }}>Fórmulas por arquétipo (nível 1)</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 10 }}>
        {(Object.keys(ARCHETYPE_FORMULA) as Archetype[]).map((a) => {
          const f = ARCHETYPE_FORMULA[a];
          return (
            <div key={a} style={{ padding: "12px 14px", background: "var(--surface-2)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-lg)" }}>
              <p style={{ fontSize: "0.84rem", fontWeight: 700, color: ACCENT_LIGHT, marginBottom: 4 }}>{ARCHETYPE_LABEL[a]}</p>
              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 6 }}>{ARCHETYPE_DESCRIPTION[a]}</p>
              <p style={{ fontSize: "0.76rem", color: "var(--text)" }}>PV 1: {f.pv1Base} + VIG×{f.pv1VigMult}</p>
              <p style={{ fontSize: "0.76rem", color: "var(--text)" }}>PE 1: {f.pe1Base} + SEN×{f.pe1SenMult}</p>
              <p style={{ fontSize: "0.76rem", color: "var(--text)" }}>Por nível: +{f.pvPerLevelBase}+VIG×{f.pvPerLevelVigMult} PV, +{f.pePerLevelBase}+SEN×{f.pePerLevelSenMult} PE</p>
              <p style={{ fontSize: "0.76rem", color: ACCENT_LIGHT }}>Perícias treinadas: INT × {f.skillMultiplier}</p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

// ─── Planetas ───────────────────────────────────────────────────────────────

function Planetas() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return PLANETS;
    return PLANETS.filter((p) => p.name.toLowerCase().includes(term) || p.naturalAbility.name.toLowerCase().includes(term));
  }, [q]);
  return (
    <Section id="planetas" title="Planetas de Origem" note="28 planetas jogáveis. Cada um concede a Habilidade Natal: +5 fixo numa perícia (ou escolha entre 2, quando listadas).">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar planeta..." style={{ ...searchInput, marginBottom: 14 }} />
      <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 10 }}>{filtered.length} de {PLANETS.length}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
        {filtered.map((p) => (
          <div key={p.id} style={{ padding: "12px 14px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
            <p style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{p.name}</p>
            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 6 }}>{p.description}</p>
            <p style={{ fontSize: "0.72rem", color: ACCENT_LIGHT, fontWeight: 700 }}>{p.naturalAbility.name}</p>
            <p style={{ fontSize: "0.7rem", color: "var(--text-subtle)", lineHeight: 1.5 }}>{p.naturalAbility.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── Espécies ───────────────────────────────────────────────────────────────

function Especies() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return SPECIES;
    return SPECIES.filter((s) => s.name.toLowerCase().includes(term));
  }, [q]);
  return (
    <Section id="especies" title="Espécies" note="35 espécies jogáveis. Cada uma tem bônus/penalidade fixos de atributo (exceto o Humano, que escolhe livremente), 2 perícias iniciais treinadas e um tier de PV/PE.">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 8, marginBottom: 16 }}>
        {(Object.keys(TIER_LABEL) as PvPeTier[]).map((t) => (
          <div key={t} title={TIER_DESCRIPTION[t]} style={{ padding: "8px 10px", background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius)" }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, color: ACCENT_LIGHT }}>{TIER_LABEL[t]}</p>
            <p style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>+{TIER_BONUS_STATIC(t).pv} PV / +{TIER_BONUS_STATIC(t).pe} PE</p>
          </div>
        ))}
      </div>

      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar espécie..." style={{ ...searchInput, marginBottom: 14 }} />
      <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 10 }}>{filtered.length} de {SPECIES.length}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
        {filtered.map((s) => (
          <div key={s.id} style={{ padding: "12px 14px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6, marginBottom: 4 }}>
              <p style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--text)" }}>{s.name}</p>
              <span style={{ fontSize: "0.6rem", fontWeight: 700, color: ACCENT_LIGHT, background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-full)", padding: "2px 7px", whiteSpace: "nowrap" }}>{TIER_LABEL[s.tier]}</span>
            </div>
            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 6 }}>{s.description}</p>
            <p style={{ fontSize: "0.7rem", color: "var(--text-subtle)", lineHeight: 1.5, marginBottom: 6, fontStyle: "italic" }}>{s.appearance}</p>
            {s.attrFreeChoice ? (
              <p style={{ fontSize: "0.72rem", color: GOLD }}>Escolha livre: +{s.attrFreeChoice.plus2}/+{s.attrFreeChoice.plus1}/+{s.attrFreeChoice.plus1}/+{s.attrFreeChoice.plus1}/-{s.attrFreeChoice.minus1} entre os atributos</p>
            ) : (
              <p style={{ fontSize: "0.72rem", color: GOLD }}>
                {ATTR_KEYS.filter((k) => s.attrBonus[k]).map((k) => `${ATTR_ABBR[k]} ${mod(s.attrBonus[k]!)}`).join(", ")}
              </p>
            )}
            <p style={{ fontSize: "0.7rem", color: ACCENT_LIGHT }}>Perícias iniciais: {s.initialSkills.map((id) => SKILLS.find((sk) => sk.id === id)?.name ?? id).join(", ")}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function TIER_BONUS_STATIC(t: PvPeTier) {
  const map: Record<PvPeTier, { pv: number; pe: number }> = {
    robusto: { pv: 4, pe: 2 }, robusto_extremo: { pv: 5, pe: 1 }, equilibrado: { pv: 3, pe: 3 },
    sensivel: { pv: 2, pe: 4 }, sensivel_extremo: { pv: 1, pe: 5 },
  };
  return map[t];
}

// ─── Classes e Arquétipos ───────────────────────────────────────────────────

function classTag(c: StarWarsClass): string | null {
  if (c.isForceBase) return "Base — Força";
  if (c.isPathClass) return "Caminho";
  if (c.isPropheticClass) return "Profecia";
  return null;
}

function ClassesSection() {
  return (
    <Section id="classes" title="Classes e Arquétipos" note={`25 classes: 20 comuns (3 delas ligadas à Força na base), 3 de Caminho (desbloqueadas no nível ${PATH_CLASS_UNLOCK_LEVEL} numa classe-base de Força) e 2 de Profecia (desbloqueadas ao descobrir a profecia correspondente). As 5 só ficam disponíveis na subida de nível — não aparecem na criação de personagem.`}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
        {CLASSES.map((c) => {
          const tag = classTag(c);
          return (
            <div key={c.id} style={{ padding: "12px 14px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6, marginBottom: 4 }}>
                <p style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--text)" }}>{c.name}</p>
                <span style={{ fontSize: "0.6rem", fontWeight: 700, color: ACCENT_LIGHT, background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-full)", padding: "2px 7px", whiteSpace: "nowrap" }}>{ARCHETYPE_LABEL[c.archetype]}</span>
              </div>
              <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 6 }}>{c.description}</p>
              <p style={{ fontSize: "0.7rem", color: "var(--text-subtle)" }}>Modificador de PP: {mod(c.ppModifier)}{tag && <span style={{ color: GOLD }}> · {tag}</span>}</p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

// ─── Habilidades de Classe ──────────────────────────────────────────────────

function HabilidadesClasse() {
  const [classId, setClassId] = useState(CLASSES[0].id);
  const isPool = POOL_CLASS_IDS.has(classId);
  const groups = getAbilitiesGroupedByLevel(classId, 40);
  const milestones = getClassMilestones(classId);

  return (
    <Section id="habilidades" title="Habilidades de Classe">
      <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 16 }}>
        <p><strong style={{ color: ACCENT_LIGHT }}>Sistema de Pools</strong> (13 classes: Cientista, Diplomata, Engenheiro, Espião, Explorador, Mandaloriano, Médico, Piloto, Pirata Espacial, Soldado da República, e as 3 classes-base de Força) — as habilidades abrem em blocos nos níveis 1, 6, 11 e 16. Um bloco nunca fecha: a cada subida de nível na classe, escolhe-se 1 habilidade entre todas as já abertas e ainda não escolhidas.</p>
        <p><strong style={{ color: ACCENT_LIGHT }}>Sistema Linear</strong> (5 classes especiais: O Equilíbrio, O Lado da Luz, O Lado Negro, O Cântico do Alvorecer, A Litania da Queda) — 1 habilidade cadastrada por nível exato, sem pool.</p>
        <p>Todas as classes revelam <strong style={{ color: GOLD }}>Marcos</strong> nos níveis 25/30/35/40, só depois de completar o nível 20 na classe.</p>
      </div>

      <select value={classId} onChange={(e) => setClassId(e.target.value)} style={{ ...searchInput, marginBottom: 16, maxWidth: 340 }}>
        {CLASSES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {groups.length === 0 && <p style={{ fontSize: "0.82rem", color: "var(--text-subtle)" }}>Sem habilidades cadastradas até o nível 40 pra esta classe.</p>}

      {groups.map(({ level, abilities }) => (
        <div key={level} style={{ marginBottom: 16 }}>
          <p style={{ ...label, marginBottom: 8 }}>{isPool ? `Pool — abre no nível ${level}` : `Nível ${level}`}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 8 }}>
            {abilities.map((a) => (
              <div key={a.name} style={{ padding: "10px 12px", background: a.combat ? "rgba(251,146,60,0.06)" : "var(--surface-2)", border: `1px solid ${a.combat ? "rgba(251,146,60,0.2)" : "var(--border)"}`, borderRadius: "var(--radius)" }}>
                <p style={{ fontSize: "0.8rem", fontWeight: 700, color: a.combat ? "#fb923c" : "var(--text)", marginBottom: 2 }}>{a.name}</p>
                <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 4 }}>{a.description}</p>
                <p style={{ fontSize: "0.66rem", color: ACCENT_LIGHT }}>
                  {a.peCost} PE
                  {a.damageDice && ` · ${a.damageDice}`}
                  {a.weaponDamage === "sabre" && " · 6d6×atributo + Sabres de Luz"}
                  {a.dt !== undefined && ` · DT ${a.dt}`}
                  {a.heal && " · Cura"}
                  {a.healOrDamage && " · Cura ou Dano"}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {milestones.length > 0 && (
        <div>
          <p style={{ ...label, color: GOLD, marginBottom: 8 }}>Marcos (25/30/35/40)</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 8 }}>
            {milestones.map((m) => (
              <div key={m.name} style={{ padding: "10px 12px", background: "rgba(201,148,31,0.08)", border: "1px solid rgba(201,148,31,0.25)", borderRadius: "var(--radius)" }}>
                <p style={{ fontSize: "0.8rem", fontWeight: 700, color: GOLD, marginBottom: 2 }}>Nível {m.level} — {m.name}</p>
                <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 4 }}>{m.description}</p>
                <p style={{ fontSize: "0.66rem", color: ACCENT_LIGHT }}>
                  {m.peCost} PE{m.damageDice && ` · ${m.damageDice}`}{m.weaponDamage === "sabre" && " · 6d6×atributo + Sabres de Luz"}{m.dt !== undefined && ` · DT ${m.dt}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}

// ─── Formas de Sabre ────────────────────────────────────────────────────────

function Sabres() {
  return (
    <Section id="sabres" title="Formas de Sabre de Luz" note="Só Padawan Jedi, Acólito Sith e Andarilho da Força aprendem Formas. 7 formas numa matriz circular de vantagem: cada forma vence 3 e perde para 3 (a regra clássica pedra-papel-tesoura ampliada).">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10, marginBottom: 18 }}>
        {SABRE_FORMS.map((f) => (
          <div key={f.id} style={{ padding: "12px 14px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
            <p style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>Forma {f.numeral} — {f.name}</p>
            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 6 }}>{f.style}</p>
            <p style={{ fontSize: "0.68rem", color: "#4ade80" }}>Vence: {f.beats.map((id) => SABRE_FORM_BY_ID[id]?.name).join(", ")}</p>
            <p style={{ fontSize: "0.68rem", color: "#f87171" }}>Perde para: {f.losesTo.map((id) => SABRE_FORM_BY_ID[id]?.name).join(", ")}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── Poderes Gerais ─────────────────────────────────────────────────────────

function PoderesGerais() {
  const [q, setQ] = useState("");
  const filterFn = (p: { name: string; description: string }) => {
    const term = q.trim().toLowerCase();
    return !term || p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term);
  };
  const basic = GENERAL_POWERS_BASIC.filter(filterFn);
  const advanced = GENERAL_POWERS_ADVANCED.filter(filterFn);

  const powerCard = (p: (typeof GENERAL_POWERS_BASIC)[number]) => (
    <div key={p.id} style={{ padding: "10px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 6, marginBottom: 3 }}>
        <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)" }}>{p.name}</p>
        <span style={{ fontSize: "0.68rem", color: ACCENT_LIGHT, fontWeight: 700, whiteSpace: "nowrap" }}>{p.cost} PP</span>
      </div>
      <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 4 }}>{p.description}</p>
      <p style={{ fontSize: "0.64rem", color: "var(--text-subtle)" }}>{p.sustain === "sustentado" ? "Sustentado" : "Instantâneo"}{p.prerequisite && ` · Requer: ${p.prerequisite}`}</p>
    </div>
  );

  return (
    <Section id="poderes" title="Poderes Gerais" note="50 poderes utilizáveis por qualquer classe/espécie, custeados em Pontos de Poder (PP). Poderes sustentados continuam ativos enquanto o jogador mantiver o custo pago.">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar poder..." style={{ ...searchInput, marginBottom: 16 }} />

      <p style={{ ...label, marginBottom: 8 }}>Básicos ({basic.length})</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 8, marginBottom: 18 }}>
        {basic.map(powerCard)}
      </div>

      <p style={{ ...label, marginBottom: 8 }}>Avançados ({advanced.length})</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 8 }}>
        {advanced.map(powerCard)}
      </div>
    </Section>
  );
}

// ─── Progressão e Nível ─────────────────────────────────────────────────────

function Progressao() {
  return (
    <Section id="progressao" title="Progressão e Subida de Nível">
      <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "0.84rem", color: "var(--text)", lineHeight: 1.7, marginBottom: 16 }}>
        <p>Nível total vai de 1 a <strong style={{ color: ACCENT_LIGHT }}>{MAX_LEVEL.toLocaleString("pt-BR")}</strong>. Cada classe individual tem teto de <strong style={{ color: ACCENT_LIGHT }}>{CLASS_LEVEL_CAP}</strong> níveis — depois disso, o excedente vira nível Bônus (sem classe) ou multiclasse.</p>
        <p>Todo nível sobe PV + PE (fórmula da classe que recebe o nível) + PP (+{ppLevelUpGain(0)} + Presença). Além disso, toda subida tem <strong>1 escolha obrigatória</strong>, nesta ordem de prioridade:</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
        {[
          "1. Habilidade de Classe — se a classe tiver uma cadastrada/disponível exatamente nesse nível.",
          "2. Perícia — senão, treina uma perícia nova ou sobe o grau de uma já treinada.",
          "3. +1 Atributo — só se não sobrar nenhuma perícia pra evoluir (todas em grau Mestre).",
        ].map((t) => (
          <div key={t} style={{ padding: "8px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.8rem", color: "var(--text-muted)" }}>{t}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10, marginBottom: 18 }}>
        <div style={{ padding: "12px 14px", background: "rgba(201,148,31,0.08)", border: "1px solid rgba(201,148,31,0.25)", borderRadius: "var(--radius-lg)" }}>
          <p style={{ fontSize: "0.8rem", fontWeight: 700, color: GOLD, marginBottom: 4 }}>Múltiplo de 5</p>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.5 }}>Bônus obrigatório extra: +1 Perícia (nova ou sobe grau) e +1 Poder Geral.</p>
        </div>
        <div style={{ padding: "12px 14px", background: "rgba(201,148,31,0.08)", border: "1px solid rgba(201,148,31,0.25)", borderRadius: "var(--radius-lg)" }}>
          <p style={{ fontSize: "0.8rem", fontWeight: 700, color: GOLD, marginBottom: 4 }}>Múltiplo de 10</p>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.5 }}>Acumula o bônus do múltiplo de 5, mais +1 Atributo obrigatório.</p>
        </div>
      </div>

      <div style={{ height: 1, background: "var(--border)", margin: "16px 0" }} />
      <p style={{ ...label, marginBottom: 8 }}>Multiclasse</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
        <p>Janela grátis: ao alcançar o nível {FREE_MULTICLASS_LEVEL} pela primeira vez (com só 1 classe), pode adicionar uma 2ª classe sem custo.</p>
        <p>Depois disso, cada nova classe exige perícias em grau Expert ou acima: {EXPERT_SKILLS_PER_MULTICLASS} para a 2ª classe paga, {EXPERT_SKILLS_PER_MULTICLASS * 2} para a 3ª, {EXPERT_SKILLS_PER_MULTICLASS * 3} para a 4ª — a exigência cresce {EXPERT_SKILLS_PER_MULTICLASS} a cada nova classe.</p>
        <p>As 3 classes-base ligadas à Força não podem coexistir entre si (nem duas classes de Caminho). Classes de Caminho só ficam disponíveis com nível {PATH_CLASS_UNLOCK_LEVEL}+ em Padawan Jedi, Acólito Sith ou Andarilho da Força.</p>
      </div>
    </Section>
  );
}

// ─── Combate e Escala de Dano ───────────────────────────────────────────────

function Combate() {
  const levels = [1, 5, 10, 20, 40, 100];
  return (
    <Section id="combate" title="Combate e Escala de Dano" note="Dano Final = Dano Base × (1 + Nível / 5). 'Base' é o valor cadastrado na habilidade/item no nível 1 — a fórmula escala sem teto, pra qualquer nível.">
      <div style={{ overflowX: "auto", marginBottom: 16 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${ACCENT_BORD}` }}>
              <th style={{ textAlign: "left", padding: "6px 8px", color: "var(--text-muted)" }}>Nível</th>
              <th style={{ textAlign: "left", padding: "6px 8px", color: "var(--text-muted)" }}>Multiplicador</th>
              <th style={{ textAlign: "left", padding: "6px 8px", color: "var(--text-muted)" }}>Base 10 vira</th>
            </tr>
          </thead>
          <tbody>
            {levels.map((lvl) => (
              <tr key={lvl} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "6px 8px", color: "var(--text)", fontWeight: 700 }}>{lvl}</td>
                <td style={{ padding: "6px 8px", color: "var(--text-muted)" }}>×{damageLevelMultiplier(lvl).toFixed(2)}</td>
                <td style={{ padding: "6px 8px", color: ACCENT_LIGHT }}>{Math.round(10 * damageLevelMultiplier(lvl))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
        <p><strong style={{ color: ACCENT_LIGHT }}>Exceção — Sabre de Luz:</strong> o golpe de sabre (cru ou usando uma Forma) NÃO segue essa escala. É sempre <strong>6d6 × o maior entre AGI, FOR ou SEN</strong>, mais o bônus total da perícia Sabres de Luz somado por fora (esse bônus de perícia é a única parte que não escala com nível).</p>
        <p><strong style={{ color: ACCENT_LIGHT }}>Limite de PP por turno:</strong> 3 + arredondar para cima (Nível / 2). Um personagem de nível {40}, por exemplo, pode gastar até {ppMaxPerTurn(40)} PP num único turno, mesmo tendo PP de sobra na reserva.</p>
      </div>
    </Section>
  );
}

// ─── Equipamentos ───────────────────────────────────────────────────────────

function Equipamentos() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<ItemCategory | "">("");
  const filtered = useMemo(() => {
    let list = ITEMS;
    if (cat) list = list.filter((i) => i.category === cat);
    const term = q.trim().toLowerCase();
    if (term) list = list.filter((i) => i.name.toLowerCase().includes(term) || i.description.toLowerCase().includes(term));
    return list;
  }, [q, cat]);

  return (
    <Section id="itens" title="Equipamentos" note="Catálogo de itens jogáveis: armas, armaduras, escudos, explosivos, equipamento médico, gadgets, drones e itens raros. O dano listado é o valor base (nível 1) — escala junto com o personagem que o equipa.">
      <div className="sw-rules-item-filters" style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar item..." style={{ ...searchInput, flex: "1 1 200px" }} />
        <select value={cat} onChange={(e) => setCat(e.target.value as ItemCategory | "")} style={{ ...searchInput, flex: "0 1 220px" }}>
          <option value="">Todas as categorias</option>
          {CATEGORY_ORDER.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
        </select>
      </div>
      <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 10 }}>{filtered.length} de {ITEMS.length} itens</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 8 }}>
        {filtered.map((i) => (
          <div key={i.id} style={{ padding: "10px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 6, marginBottom: 3 }}>
              <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)" }}>{i.name}</p>
              <span style={{ fontSize: "0.62rem", fontWeight: 700, color: ACCENT_LIGHT, background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-full)", padding: "1px 6px", whiteSpace: "nowrap" }}>{i.rarity}</span>
            </div>
            <p style={{ fontSize: "0.66rem", color: "var(--text-subtle)", marginBottom: 4 }}>{CATEGORY_LABEL[i.category]} · {i.price.toLocaleString("pt-BR")} créd. · {i.weight}kg</p>
            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 4 }}>{i.description}</p>
            {(i.damage || i.defenseBonus || i.range) && (
              <p style={{ fontSize: "0.68rem", color: ACCENT_LIGHT }}>
                {i.damage && `Dano ${i.damage}${i.damageType ? ` (${i.damageType})` : ""}`}
                {i.defenseBonus && `Defesa +${i.defenseBonus}`}
                {i.range && ` · ${i.range}`}
              </p>
            )}
            {i.special && <p style={{ fontSize: "0.66rem", color: GOLD, marginTop: 3 }}>{i.special}</p>}
          </div>
        ))}
      </div>
    </Section>
  );
}
