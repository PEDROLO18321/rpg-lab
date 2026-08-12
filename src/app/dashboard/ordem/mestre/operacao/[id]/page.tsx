"use client";

import { useState, use, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { TIER_LABEL } from "@/lib/ordem/ordemCampaignClient";
import { useOperacao } from "@/lib/ordem/useOperacao";
import { OrdemMasterDiceRoller } from "../../OrdemMasterDiceRoller";

const OrdemScenario = dynamic(() => import("./OrdemScenario").then((m) => m.OrdemScenario));
const OrdemItems = dynamic(() => import("./OrdemItems").then((m) => m.OrdemItems));
const OrdemNpcCreator = dynamic(() => import("./OrdemNpcCreator").then((m) => m.OrdemNpcCreator));
const OrdemInitiative = dynamic(() => import("./OrdemInitiative").then((m) => m.OrdemInitiative));
const OrdemSessionNotes = dynamic(() => import("./OrdemSessionNotes").then((m) => m.OrdemSessionNotes));
const OrdemSanity = dynamic(() => import("./OrdemSanity").then((m) => m.OrdemSanity));
const OrdemEconomy = dynamic(() => import("./OrdemEconomy").then((m) => m.OrdemEconomy));
const OrdemClues = dynamic(() => import("./OrdemClues").then((m) => m.OrdemClues));
const OrdemClocks = dynamic(() => import("./OrdemClocks").then((m) => m.OrdemClocks));
const OrdemGenerators = dynamic(() => import("./OrdemGenerators").then((m) => m.OrdemGenerators));
const OrdemAgenda = dynamic(() => import("./OrdemAgenda").then((m) => m.OrdemAgenda));
const OrdemBestiary = dynamic(() => import("./OrdemBestiary").then((m) => m.OrdemBestiary));
const OrdemGuide = dynamic(() => import("./OrdemGuide").then((m) => m.OrdemGuide));

const A = "#ffffff";
const AL = "#e8e8ef";
const AD = "rgba(255,255,255,0.1)";
const AB = "rgba(255,255,255,0.28)";

type Tab =
  | "scenario" | "npc" | "initiative" | "sanity" | "economy"
  | "clues" | "clocks" | "items" | "bestiary" | "generators" | "notes" | "agenda" | "guide";

function icon(d: string) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: "scenario",   label: "Cena",          icon: icon("M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z") },
  { id: "npc",        label: "NPCs",          icon: icon("M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 7a4 4 0 1 0 0 0") },
  { id: "initiative", label: "Ordem de Ação", icon: icon("M12 22a10 10 0 1 0 0-20 M12 6v6l4 2") },
  { id: "sanity",     label: "Sanidade",      icon: icon("M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3 M12 17h.01 M12 22a10 10 0 1 0 0-20") },
  { id: "economy",    label: "Recompensas",   icon: icon("M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6") },
  { id: "clues",      label: "Pistas",        icon: icon("M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.35-4.35") },
  { id: "clocks",     label: "Relógios",      icon: icon("M12 22a10 10 0 1 0 0-20 M12 12l5-3 M12 12V7") },
  { id: "items",      label: "Itens",         icon: icon("M12 2 15 8l6 1-5 5 1 7-6-3-6 3 1-7-5-5 6-1z") },
  { id: "bestiary",   label: "Ameaças",       icon: icon("M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z") },
  { id: "generators", label: "Geradores",     icon: icon("M5 3v4 M3 5h4 M6 17v4 M4 19h4 M13 3l3 6 6 1-5 5 1 7-5-3") },
  { id: "notes",      label: "Sessões",       icon: icon("M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M8 13h8 M8 17h8") },
  { id: "agenda",     label: "Agenda",        icon: icon("M8 2v4 M16 2v4 M3 8h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z") },
  { id: "guide",      label: "Guia",          icon: icon("M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z") },
];

export default function OrdemOperacaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const { status: opStatus, api } = useOperacao(id);
  const [tab, setTab] = useState<Tab>("scenario");

  if (status === "unauthenticated") { router.push("/login"); return null; }

  if (status === "loading" || opStatus === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Carregando...</p>
      </div>
    );
  }

  if (opStatus === "notfound" || !api) {
    return (
      <div style={{ minHeight: "100vh", background: "transparent", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>Operação não encontrada.</p>
        <Link href="/dashboard/ordem/mestre" style={{ color: AL, fontSize: "0.86rem", textDecoration: "none" }}>
          ← Voltar ao Painel do Mestre
        </Link>
      </div>
    );
  }

  const c = api.campaign;

  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      <OrdemMasterDiceRoller />
      <DashboardNav
        userName={session?.user?.name ?? session?.user?.email ?? "Mestre"}
        systemName={c.name}
        systemHref="/dashboard/ordem/mestre"
        backLabel="Operações"
        accentColor="#ffffff"
      />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 24px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span className="section-label" style={{ color: A }}>Ordem Paranormal · Mestre</span>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: AL, background: AD, border: `1px solid ${AB}`, borderRadius: "var(--radius-xs)", padding: "2px 8px" }}>
              {TIER_LABEL[c.tier]}
            </span>
          </div>
          <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "clamp(1.3rem, 3vw, 1.8rem)", fontWeight: 700, color: "var(--text)", lineHeight: 1.2 }}>
            {c.name}
          </h1>
        </div>

        {/* Tab nav */}
        <div style={{ display: "flex", gap: 4, marginBottom: 28, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: 4, flexWrap: "wrap" }}>
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ flex: "1 1 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "9px 14px", background: active ? AD : "transparent", color: active ? AL : "var(--text-muted)", border: active ? `1px solid ${AB}` : "1px solid transparent", borderRadius: "var(--radius-lg)", fontSize: "0.8rem", fontWeight: active ? 700 : 500, cursor: "pointer", transition: "all 0.18s", whiteSpace: "nowrap" }}>
                {t.icon}{t.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {tab === "scenario"   && <OrdemScenario api={api} />}
        {tab === "npc"        && <OrdemNpcCreator api={api} />}
        {tab === "initiative" && <OrdemInitiative api={api} />}
        {tab === "sanity"     && <OrdemSanity api={api} />}
        {tab === "economy"    && <OrdemEconomy api={api} />}
        {tab === "clues"      && <OrdemClues api={api} />}
        {tab === "clocks"     && <OrdemClocks api={api} />}
        {tab === "items"      && <OrdemItems api={api} />}
        {tab === "bestiary"   && <OrdemBestiary api={api} />}
        {tab === "generators" && <OrdemGenerators api={api} />}
        {tab === "notes"      && <OrdemSessionNotes api={api} />}
        {tab === "agenda"     && <OrdemAgenda api={api} />}
        {tab === "guide"      && <OrdemGuide />}
      </main>
    </div>
  );
}
