"use client";

import { useState } from "react";
import type { CyberpunkApi } from "@/lib/cyberpunk/useCyberpunkCampaign";
import { randomCyberpunkName, randomHandle } from "@/lib/cyberpunk/names";
import { ROLES } from "@/lib/cyberpunk/data";
import { PERSONALITIES, AFFECTATIONS, VALUES } from "@/lib/cyberpunk/lifepath";
import { CP, SectionTitle, pillBtn } from "../../../ui";

function rand<T>(arr: readonly T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

const HOOKS = ["Um fixer oferece muito dinheiro por um serviço que ninguém quer.", "Um netrunner amigo some no meio de uma invasão e deixa só um endereço.", "Uma gangue cobra pedágio no bairro onde o grupo precisa passar.", "Uma corporação quer recuperar um protótipo roubado, sem testemunhas.", "Um médico de rua pede escolta para entregar um lote de ciberware.", "Uma jornalista tem provas de um acobertamento e todo mundo quer silenciá-la."];
const COMPLICATIONS = ["A polícia corporativa chega antes do previsto.", "O contratante mentiu sobre o que está em jogo.", "Um aliado vende o grupo por uma oferta melhor.", "O local está cheio de câmeras e drones.", "O equipamento falha no pior momento.", "Uma gangue rival tem o mesmo alvo."];
const PLACES = ["Boate neon no Distrito de Entretenimento", "Galpão abandonado no porto", "Mercado noturno sob a megaestrutura", "Clínica clandestina", "Arranha-céu corporativo", "Posto nômade nos arredores", "Bar de netrunners sem sinal"];
const LOOT = ["Chip de dados criptografado", "500 eb em barras de crédito", "Pistola customizada", "Kit de primeiros socorros avançado", "Agente com contatos valiosos", "Cartão de acesso de segurança"];

export function CampaignGenerators({ api }: { api: CyberpunkApi }) {
  const [npc, setNpc] = useState<{ name?: string; handle?: string; role?: string; trait?: string; motive?: string }>({});
  const [rolls, setRolls] = useState<{ label: string; value: string }[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const steps: { key: keyof typeof npc; label: string; roll: () => string }[] = [
    { key: "name", label: "Nome", roll: randomCyberpunkName },
    { key: "handle", label: "Apelido", roll: randomHandle },
    { key: "role", label: "Papel", roll: () => rand(ROLES).name },
    { key: "trait", label: "Personalidade", roll: () => rand(PERSONALITIES) },
    { key: "motive", label: "Motivação", roll: () => rand(VALUES) },
  ];

  async function save() {
    if (!npc.name) return;
    await api.addChild("npcs", { name: npc.handle ? `${npc.name} "${npc.handle}"` : npc.name, role: npc.role ?? "", trait: npc.trait ?? "", appearance: rand(AFFECTATIONS), notes: npc.motive ? `Valoriza: ${npc.motive}.` : "" });
    setMsg("✓ NPC adicionado à aba NPCs.");
    setTimeout(() => setMsg(null), 3000);
    setNpc({});
  }

  const push = (label: string, value: string) => setRolls((r) => [{ label, value }, ...r].slice(0, 12));
  const card: React.CSSProperties = { background: CP.panel, border: `1px solid ${CP.accentBord}`, borderRadius: "var(--radius-xl)", padding: "18px 20px" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionTitle eyebrow="Geradores" title="Geradores aleatórios" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: 14 }}>
        <div style={card}>
          <p style={{ fontFamily: "var(--font-cinzel), serif", fontWeight: 700, marginBottom: 12 }}>NPC passo a passo</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
            {steps.map((s) => (
              <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.64rem", fontWeight: 700, color: CP.accentLight, textTransform: "uppercase", minWidth: 84 }}>{s.label}</span>
                <span style={{ flex: "1 1 120px", fontSize: "0.82rem", color: npc[s.key] ? "var(--text)" : "var(--text-subtle)" }}>{npc[s.key] ?? "não sorteado"}</span>
                <button type="button" style={pillBtn} onClick={() => setNpc((n) => ({ ...n, [s.key]: s.roll() }))}>🎲</button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" onClick={save} disabled={!npc.name} style={{ ...pillBtn, minHeight: 36, opacity: npc.name ? 1 : 0.5 }}>+ Salvar em NPCs</button>
            <button type="button" onClick={() => setNpc({})} style={{ ...pillBtn, minHeight: 36 }}>Reiniciar</button>
          </div>
          {msg && <p style={{ fontSize: "0.76rem", color: CP.success, marginTop: 8 }}>{msg}</p>}
        </div>

        <div style={card}>
          <p style={{ fontFamily: "var(--font-cinzel), serif", fontWeight: 700, marginBottom: 12 }}>Tabelas rápidas</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            <button type="button" style={{ ...pillBtn, minHeight: 34 }} onClick={() => push("Nome", randomCyberpunkName())}>Nome</button>
            <button type="button" style={{ ...pillBtn, minHeight: 34 }} onClick={() => push("Apelido", randomHandle())}>Apelido</button>
            <button type="button" style={{ ...pillBtn, minHeight: 34 }} onClick={() => push("Gancho", rand(HOOKS))}>Gancho</button>
            <button type="button" style={{ ...pillBtn, minHeight: 34 }} onClick={() => push("Complicação", rand(COMPLICATIONS))}>Complicação</button>
            <button type="button" style={{ ...pillBtn, minHeight: 34 }} onClick={() => push("Local", rand(PLACES))}>Local</button>
            <button type="button" style={{ ...pillBtn, minHeight: 34 }} onClick={() => push("Espólio", rand(LOOT))}>Espólio</button>
          </div>
          {rolls.length === 0 ? <p style={{ fontSize: "0.8rem", color: "var(--text-subtle)" }}>Clique para gerar.</p> : rolls.map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 8, fontSize: "0.82rem", padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: "0.64rem", fontWeight: 700, color: CP.accentLight, textTransform: "uppercase", minWidth: 84 }}>{r.label}</span>
              <span style={{ color: "var(--text-muted)", flex: 1 }}>{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
