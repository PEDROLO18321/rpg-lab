"use client";

import { useState } from "react";
import {
  getWeaponsForEra, WEAPON_CATEGORY_LABELS,
  type WeaponCategory,
} from "@/lib/cthulhu/data";
import type { WizardData } from "../CthulhuWizard";

const ACCENT       = "#7d9c3e";
const ACCENT_LIGHT  = "#a3b86c";
const ACCENT_DIM   = "rgba(125,156,62,0.12)";
const ACCENT_BORD  = "rgba(125,156,62,0.28)";

interface CreditTierInfo {
  label: string;
  desc: string;
  acomodacao: string;
  viagem: string;
}

function getCreditTier(cr: number): CreditTierInfo {
  if (cr <= 0) return {
    label: "Pobretão",
    desc: "Sem moradia fixa.",
    acomodacao: "Vive na rua.",
    viagem: "A pé ou de carona.",
  };
  if (cr < 10) return {
    label: "Pobre",
    desc: "Subsistência básica, um teto e refeições escassas.",
    acomodacao: "Albergue sujo ou cortiço.",
    viagem: "Transporte público mais barato disponível.",
  };
  if (cr < 50) return {
    label: "Médio",
    desc: "Conforto razoável, três refeições por dia.",
    acomodacao: "Casa ou apartamento comum, alugado ou próprio.",
    viagem: "Transporte padrão; carro confiável (era moderna).",
  };
  if (cr < 90) return {
    label: "Abastado",
    desc: "Boa qualidade de vida, viagens e diversões regulares.",
    acomodacao: "Casa confortável ou apartamento de alto padrão.",
    viagem: "Primeira classe; automóvel de qualidade.",
  };
  if (cr < 100) return {
    label: "Rico",
    desc: "Riqueza considerável, poucos limites financeiros.",
    acomodacao: "Casa própria de luxo ou suíte em hotel de primeira.",
    viagem: "Qualquer meio de transporte; carro de luxo.",
  };
  return {
    label: "Ricaço",
    desc: "Extravagância sem limites, fortunas imensas.",
    acomodacao: "Mansão, palácio ou o melhor hotel disponível.",
    viagem: "Avião ou navio particular, comboio privado.",
  };
}

const CATEGORY_ORDER: WeaponCategory[] = ["corpo", "arremesso", "pistola", "rifle", "espingarda"];

interface Props {
  data: Partial<WizardData>;
  onChange: (p: Partial<WizardData>) => void;
}

export function StepEquipment({ data, onChange }: Props) {
  const era = data.era ?? "1920s";
  const [equip, setEquip]     = useState(data.equipment ?? "");
  const [weapons, setWeapons] = useState<string[]>(data.weapons ?? []);

  const creditPoints = data.occupationSkills?.nivel_credito ?? 0;
  const tier = getCreditTier(creditPoints);
  const eraWeapons = getWeaponsForEra(era);

  // money / assets per Tabela II (NC×2 / NC×50)
  const money  = creditPoints * 2;
  const assets = creditPoints * 50;

  function handleEquip(v: string) {
    setEquip(v);
    onChange({ equipment: v });
  }

  function toggleWeapon(id: string) {
    const next = weapons.includes(id) ? weapons.filter((w) => w !== id) : [...weapons, id];
    setWeapons(next);
    onChange({ weapons: next });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <span className="section-label" style={{ display: "block", marginBottom: 8, color: ACCENT }}>Etapa 4</span>
        <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "clamp(1.3rem, 3vw, 1.7rem)", fontWeight: 700, color: "var(--text)" }}>
          <span style={{ color: ACCENT }}>Equipamento</span> e Posses
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 6, lineHeight: 1.7 }}>
          Selecione armas e anote itens. Itens dentro do padrão de vida não precisam ser detalhados — você simplesmente os possui.
        </p>
      </div>

      {/* Credit Level + Money/Assets */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
      }}>
        <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Padrão de Vida
          </span>
          <div style={{
            padding: "3px 12px",
            background: ACCENT_DIM,
            border: `1px solid ${ACCENT_BORD}`,
            borderRadius: "var(--radius-full)",
            fontSize: "0.78rem", fontWeight: 700, color: ACCENT_LIGHT,
          }}>
            {tier.label} · NC {creditPoints}
          </div>
        </div>
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
            {tier.desc}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
            <InfoBox label="Dinheiro" value={`$${money}`} hint="NC × 2" />
            <InfoBox label="Patrimônio" value={`$${assets.toLocaleString("pt-BR")}`} hint="NC × 50" />
            <InfoBox label="Acomodação" value={tier.acomodacao} />
            <InfoBox label="Transporte" value={tier.viagem} />
          </div>
        </div>
      </div>

      {/* Weapons picker */}
      <div>
        <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
          Armas ({weapons.length} selecionada{weapons.length === 1 ? "" : "s"})
        </div>
        <div style={{ fontSize: "0.72rem", color: "var(--text-subtle)", marginBottom: 12 }}>
          Dano com <em>+DX</em> recebe seu Dano Extra ao rolar na ficha. Lista da Era {era === "modern" ? "Moderna" : "1920"}.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {CATEGORY_ORDER.map((cat) => {
            const list = eraWeapons.filter((w) => w.category === cat);
            if (!list.length) return null;
            return (
              <div key={cat}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                  {WEAPON_CATEGORY_LABELS[cat]}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 6 }}>
                  {list.map((w) => {
                    const on = weapons.includes(w.id);
                    return (
                      <button
                        key={w.id}
                        onClick={() => toggleWeapon(w.id)}
                        style={{
                          textAlign: "left", cursor: "pointer",
                          padding: "8px 12px",
                          background: on ? ACCENT_DIM : "var(--surface)",
                          border: `1px solid ${on ? ACCENT_BORD : "rgba(255,255,255,0.07)"}`,
                          borderRadius: "var(--radius)",
                          transition: "all 0.15s",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                          <span style={{ fontSize: "0.82rem", fontWeight: on ? 700 : 500, color: on ? ACCENT_LIGHT : "var(--text)" }}>
                            {on ? "✓ " : ""}{w.name}
                          </span>
                          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: on ? ACCENT_LIGHT : "var(--text-muted)" }}>
                            {w.damage}{w.addDB ? "+DX" : ""}{w.halfDB ? "+½DX" : ""}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.68rem", color: "var(--text-subtle)", marginTop: 2 }}>
                          {w.range} · {w.attacks} atq{w.ammo ? ` · ${w.ammo} mun.` : ""}
                          {(era === "modern" ? w.costModern : w.cost1920) ? ` · ${era === "modern" ? w.costModern : w.cost1920}` : ""}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Equipment text area */}
      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-cinzel), serif" }}>
          Outros Itens e Equipamentos
        </span>
        <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
          Liste itens especiais ou pertences relevantes (um por linha). Itens comuns dentro do padrão de vida são gratuitos.
        </span>
        <textarea
          value={equip}
          onChange={(e) => handleEquip(e.target.value)}
          rows={6}
          placeholder={"Lanterna elétrica\nKit de primeiros socorros\nCâmera fotográfica\nMunição extra (.38)\n..."}
          style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius)", padding: "10px 12px",
            color: "var(--text)", fontSize: "0.88rem", resize: "vertical",
            outline: "none", lineHeight: 1.6,
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => (e.target.style.borderColor = ACCENT_BORD)}
          onBlur={(e)  => (e.target.style.borderColor = "var(--border)")}
        />
      </label>
    </div>
  );
}

function InfoBox({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div style={{ padding: "10px 14px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
      <div style={{ fontSize: "0.64rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
        {label}{hint ? <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "var(--text-subtle)" }}> ({hint})</span> : null}
      </div>
      <div style={{ fontSize: "0.8rem", color: "var(--text)" }}>{value}</div>
    </div>
  );
}
