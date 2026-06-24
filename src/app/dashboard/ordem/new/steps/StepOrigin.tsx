"use client";

import type { OrdemWizardData } from "../CharacterWizard";
import { Intro } from "./StepAttrs";
import { ORIGINS, ORIGIN_BY_ID } from "@/lib/ordem/origins";
import { SKILLS, SKILL_BY_ID } from "@/lib/ordem/data";
import { PARANORMAL_POWERS, PARANORMAL_POWER_BY_ID } from "@/lib/ordem/abilities";

const BORD_SEL = "rgba(255,255,255,0.55)";
const BG_SEL = "rgba(255,255,255,0.1)";

interface Props {
  data: OrdemWizardData;
  onChange: (p: Partial<OrdemWizardData>) => void;
}

export function StepOrigin({ data, onChange }: Props) {
  const selected = ORIGIN_BY_ID[data.originId];
  const open = !!selected;

  function toggle(id: string) {
    if (data.originId === id) onChange({ originId: "", originSkills: [], paranormalPowerId: "" });
    else onChange({ originId: id, originSkills: [], paranormalPowerId: "" });
  }

  function toggleAnySkill(id: string, max: number) {
    const has = data.originSkills.includes(id);
    if (has) onChange({ originSkills: data.originSkills.filter((s) => s !== id) });
    else if (data.originSkills.length < max) onChange({ originSkills: [...data.originSkills, id] });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Intro
        title="Origem"
        text="A origem é o passado do seu agente antes da Ordem. Ela concede duas perícias treinadas e um poder único. Clique para ver os detalhes; clique de novo para desmarcar."
      />

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        {/* Lista de origens — largura anima suavemente ao abrir o detalhe */}
        <div style={{ flex: open ? "0 0 330px" : "1 1 760px", minWidth: 0, transition: "flex-basis 0.45s cubic-bezier(0.16,1,0.3,1)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
          {ORIGINS.map((o) => {
            const isSel = data.originId === o.id;
            const skillNames = o.chooseAny
              ? `${o.chooseAny} perícias à escolha`
              : o.skills.map((s) => SKILL_BY_ID[s]?.name ?? s).join(", ");
            return (
              <button
                key={o.id}
                onClick={() => toggle(o.id)}
                style={{
                  textAlign: "left",
                  padding: open ? "11px 14px" : "14px 16px",
                  background: isSel ? BG_SEL : "var(--surface)",
                  border: `1px solid ${isSel ? BORD_SEL : "var(--border)"}`,
                  borderRadius: "var(--radius-lg)",
                  cursor: "pointer",
                  transition: "background 0.2s, border-color 0.2s, padding 0.3s",
                  boxShadow: isSel ? "0 0 0 1px rgba(255,255,255,0.35), 0 6px 22px rgba(255,255,255,0.06)" : "none",
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: "0.9rem", fontWeight: 700, color: isSel ? "#ffffff" : "var(--text)", marginBottom: 3 }}>
                    {o.name}
                  </p>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-subtle)", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: open ? "nowrap" : "normal" }}>
                    {skillNames}
                  </p>
                </div>
                {isSel && <span style={{ color: "#ffffff", fontSize: "0.7rem", flexShrink: 0 }}>●</span>}
              </button>
            );
          })}
          </div>
        </div>

        {/* Detalhe à direita */}
        {selected && (
          <aside
            key={selected.id}
            className="ordem-detail-in"
            style={{
              flex: 1, minWidth: 0,
              position: "sticky", top: 84,
              display: "flex", flexDirection: "column", gap: 16,
              padding: "22px 24px",
              background: "linear-gradient(160deg, rgba(255,255,255,0.06) 0%, var(--surface) 60%)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
            }}
          >
            <div>
              <span className="section-label" style={{ color: "#ffffff", display: "block", marginBottom: 6 }}>Origem</span>
              <h3 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.5rem", fontWeight: 700, color: "var(--text)", lineHeight: 1.1 }}>
                {selected.name}
              </h3>
            </div>

            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.75 }}>{selected.description}</p>

            {/* Perícias concedidas */}
            <div>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
                Perícias treinadas
              </p>
              {selected.chooseAny ? (
                <>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 8 }}>
                    Escolha {selected.chooseAny} ({data.originSkills.length}/{selected.chooseAny})
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {SKILLS.map((s) => {
                      const on = data.originSkills.includes(s.id);
                      const full = data.originSkills.length >= (selected.chooseAny ?? 0) && !on;
                      return (
                        <button
                          key={s.id}
                          onClick={() => toggleAnySkill(s.id, selected.chooseAny ?? 0)}
                          disabled={full}
                          style={{
                            padding: "5px 11px", fontSize: "0.74rem", fontWeight: 600,
                            background: on ? "rgba(255,255,255,0.16)" : "var(--surface-2)",
                            border: `1px solid ${on ? BORD_SEL : "var(--border)"}`,
                            borderRadius: "var(--radius-full)",
                            color: on ? "#ffffff" : full ? "var(--text-subtle)" : "var(--text)",
                            cursor: full ? "default" : "pointer", transition: "all 0.12s",
                          }}
                        >
                          {s.name}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {selected.skills.map((id) => (
                    <span key={id} style={{ padding: "5px 11px", fontSize: "0.74rem", fontWeight: 600, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "var(--radius-full)", color: "#ffffff" }}>
                      {SKILL_BY_ID[id]?.name ?? id}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Poder */}
            <div style={{ padding: "14px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: "var(--radius-lg)" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#ffffff", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Poder · {selected.powerName}
              </span>
              <p style={{ fontSize: "0.84rem", color: "var(--text)", lineHeight: 1.7, marginTop: 6 }}>{selected.powerDesc}</p>
            </div>

            {/* Seleção de poder paranormal (Cultista Arrependido) */}
            {selected.id === "cultista-arrependido" && (
              <div>
                <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
                  Poder Paranormal · escolha 1
                </p>
                <p style={{ fontSize: "0.78rem", color: "var(--text-subtle)", marginBottom: 10, lineHeight: 1.55 }}>
                  Sua ligação com o Outro Lado lhe concede um poder paranormal. Em troca, sua Sanidade inicial é reduzida à metade.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 260, overflowY: "auto" }}>
                  {PARANORMAL_POWERS.map((pp) => {
                    const on = data.paranormalPowerId === pp.id;
                    return (
                      <button
                        key={pp.id}
                        onClick={() => onChange({ paranormalPowerId: on ? "" : pp.id })}
                        style={{
                          textAlign: "left",
                          padding: "10px 12px",
                          background: on ? "rgba(255,255,255,0.1)" : "var(--surface)",
                          border: `1px solid ${on ? BORD_SEL : "var(--border)"}`,
                          borderRadius: "var(--radius)",
                          cursor: "pointer",
                          transition: "all 0.12s",
                        }}
                      >
                        <p style={{ fontSize: "0.82rem", fontWeight: 700, color: on ? "#ffffff" : "var(--text)", marginBottom: 3 }}>{pp.name}</p>
                        <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#b89cf0", marginBottom: 4 }}>
                          {pp.element}{pp.prerequisite ? ` · req. ${pp.prerequisite}` : ""}
                        </p>
                        <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)", lineHeight: 1.5 }}>{pp.description}</p>
                        <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", lineHeight: 1.45, marginTop: 4 }}><strong style={{ color: "#9b7fd4" }}>Afinidade:</strong> {pp.affinity}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
