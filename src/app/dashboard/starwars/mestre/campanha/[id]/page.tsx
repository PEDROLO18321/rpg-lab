"use client";

import { useState, use, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { useStarWarsCampaign } from "@/lib/starwars/useStarWarsCampaign";
import { NpcCreator } from "./NpcCreator";
import { StarWarsBestiary } from "./StarWarsBestiary";
import { InitiativeTracker } from "./InitiativeTracker";
import { SessionNotes } from "./SessionNotes";
import { CampaignStory } from "./CampaignStory";
import { CampaignItems } from "./CampaignItems";
import { CampaignClues } from "./CampaignClues";
import { CampaignClocks } from "./CampaignClocks";
import { CampaignGenerators } from "./CampaignGenerators";
import { StarWarsGuide } from "./StarWarsGuide";
import { StarWarsMasterDiceRoller } from "../../StarWarsMasterDiceRoller";
import { SW, SectionTitle } from "../../../ui";

type Tab = "story" | "items" | "npc" | "bestiary" | "initiative" | "clues" | "clocks" | "generators" | "notes" | "guide";

function icon(d: string) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: "story",      label: "História",   icon: icon("M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z") },
  { id: "npc",        label: "NPCs",       icon: icon("M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 7a4 4 0 1 0 0 0") },
  { id: "bestiary",   label: "Bestiário",  icon: icon("M12 2 4 7v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V7z M9 10h.01 M15 10h.01 M9 15c1 1 5 1 6 0") },
  { id: "initiative", label: "Iniciativa", icon: icon("M12 2 15 8l6 1-5 5 1 7-6-3-6 3 1-7-5-5 6-1z") },
  { id: "clues",      label: "Pistas",     icon: icon("M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.35-4.35") },
  { id: "clocks",     label: "Relógios",   icon: icon("M12 22a10 10 0 1 0 0-20 M12 12l5-3 M12 12V7") },
  { id: "items",      label: "Itens",      icon: icon("M21 8 21 21 3 21 3 8 M1 3h22v5H1z M10 12h4") },
  { id: "generators", label: "Geradores",  icon: icon("M5 3v4 M3 5h4 M6 17v4 M4 19h4 M13 3l3 6 6 1-5 5 1 7-5-3") },
  { id: "notes",      label: "Notas",      icon: icon("M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M8 13h8 M8 17h8") },
  { id: "guide",      label: "Guia",       icon: icon("M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z") },
];

export default function StarWarsCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const { status: cStatus, api } = useStarWarsCampaign(id);
  const [tab, setTab] = useState<Tab>("story");

  if (status === "unauthenticated") { router.push("/login"); return null; }

  if (status === "loading" || cStatus === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Carregando...</p>
      </div>
    );
  }

  if (cStatus === "notfound" || !api) {
    return (
      <div style={{ minHeight: "100vh", background: "transparent", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>Campanha não encontrada.</p>
        <Link href="/dashboard/starwars/mestre" style={{ color: SW.accentLight, fontSize: "0.86rem", textDecoration: "none" }}>
          ← Voltar ao Painel do Mestre
        </Link>
      </div>
    );
  }

  const c = api.campaign;

  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      <StarWarsMasterDiceRoller />
      <DashboardNav
        userName={session?.user?.name ?? session?.user?.email ?? "Mestre"}
        systemName={c.name}
        systemHref="/dashboard/starwars/mestre"
        backLabel="Campanhas"
        accentColor={SW.accent}
      />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 24px 80px" }}>
        <div style={{ marginBottom: 32 }}>
          <SectionTitle eyebrow="Star Wars · Mestre" title={c.name} />
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 28, background: SW.panel, border: `1px solid ${SW.panelBorder}`, borderRadius: 10, padding: 4, flexWrap: "wrap" }}>
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ flex: "1 1 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "9px 14px", background: active ? SW.accentDim : "transparent", color: active ? SW.accentLight : SW.textMuted, border: active ? `1px solid ${SW.accentBord}` : "1px solid transparent", borderRadius: 6, fontSize: "0.8rem", fontWeight: active ? 700 : 500, cursor: "pointer", transition: "all 0.18s", whiteSpace: "nowrap" }}>
                {t.icon}{t.label}
              </button>
            );
          })}
        </div>

        {tab === "story"      && <CampaignStory api={api} />}
        {tab === "npc"        && <NpcCreator api={api} />}
        {tab === "bestiary"   && <StarWarsBestiary api={api} />}
        {tab === "initiative" && <InitiativeTracker api={api} />}
        {tab === "clues"      && <CampaignClues api={api} />}
        {tab === "clocks"     && <CampaignClocks api={api} />}
        {tab === "items"      && <CampaignItems api={api} />}
        {tab === "generators" && <CampaignGenerators api={api} />}
        {tab === "notes"      && <SessionNotes api={api} />}
        {tab === "guide"      && <StarWarsGuide />}
      </main>
    </div>
  );
}
