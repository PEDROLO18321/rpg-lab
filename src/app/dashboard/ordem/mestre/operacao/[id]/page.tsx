"use client";

import { useState, useEffect, use, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { getOrdemCampaign, saveOrdemCampaign, TIER_LABEL, type OrdemCampaign } from "@/lib/ordem/ordemCampaignStorage";
import { OrdemScenario } from "./OrdemScenario";
import { OrdemItems } from "./OrdemItems";
import { OrdemNpcCreator } from "./OrdemNpcCreator";
import { OrdemInitiative } from "./OrdemInitiative";
import { OrdemSessionNotes } from "./OrdemSessionNotes";
import { OrdemSanity } from "./OrdemSanity";
import { OrdemBestiary } from "./OrdemBestiary";
import { OrdemMasterDiceRoller } from "../../OrdemMasterDiceRoller";

const A = "#ffffff";
const AL = "#e8e8ef";
const AD = "rgba(255,255,255,0.1)";
const AB = "rgba(255,255,255,0.28)";

type Tab = "scenario" | "items" | "npc" | "initiative" | "notes" | "sanity" | "bestiary";

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  {
    id: "scenario",
    label: "Cena",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
  },
  {
    id: "items",
    label: "Itens",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
  {
    id: "npc",
    label: "NPCs",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    id: "initiative",
    label: "Ordem de Ação",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    id: "notes",
    label: "Notas",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    id: "sanity",
    label: "Sanidade",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
  {
    id: "bestiary",
    label: "Ameaças",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
];

export default function OrdemOperacaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [campaign, setCampaign] = useState<OrdemCampaign | null>(null);
  const [tab, setTab] = useState<Tab>("scenario");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    const c = getOrdemCampaign(id);
    if (!c) setNotFound(true);
    else setCampaign(c);
  }, [id]);

  function update(updated: OrdemCampaign) {
    setCampaign(updated);
    saveOrdemCampaign(updated);
  }

  if (status === "loading" || (!campaign && !notFound)) {
    return (
      <div style={{ minHeight: "100vh", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Carregando...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={{ minHeight: "100vh", background: "transparent", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>Operação não encontrada.</p>
        <Link href="/dashboard/ordem/mestre" style={{ color: AL, fontSize: "0.86rem", textDecoration: "none" }}>
          ← Voltar ao Painel do Mestre
        </Link>
      </div>
    );
  }

  const c = campaign!;

  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      <OrdemMasterDiceRoller />
      <DashboardNav
        userName={session?.user?.name ?? session?.user?.email ?? "Mestre"}
        systemName={c.name}
        systemHref="/dashboard/ordem/mestre"
        backLabel="Operações"
      />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 24px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span className="section-label" style={{ color: A }}>
              Ordem Paranormal · Mestre
            </span>
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
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{ flex: "1 1 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "9px 16px", background: active ? AD : "transparent", color: active ? AL : "var(--text-muted)", border: active ? `1px solid ${AB}` : "1px solid transparent", borderRadius: "var(--radius-lg)", fontSize: "0.82rem", fontWeight: active ? 700 : 500, cursor: "pointer", transition: "all 0.18s", whiteSpace: "nowrap" }}
              >
                {t.icon}
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {tab === "scenario" && <OrdemScenario campaign={c} onChange={update} />}
        {tab === "items" && <OrdemItems campaign={c} onChange={update} />}
        {tab === "npc" && <OrdemNpcCreator campaign={c} onChange={update} />}
        {tab === "initiative" && <OrdemInitiative campaign={c} onChange={update} />}
        {tab === "notes" && <OrdemSessionNotes campaign={c} onChange={update} />}
        {tab === "sanity" && <OrdemSanity campaign={c} onChange={update} />}
        {tab === "bestiary" && <OrdemBestiary campaign={c} onChange={update} />}
      </main>
    </div>
  );
}
