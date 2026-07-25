import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { AgentCard } from "@/components/dashboard/AgentCard";
import { ORIGIN_BY_ID } from "@/lib/ordem/origins";

const ACCENT      = "#ffffff";
const ACCENT_DIM  = "rgba(255,255,255,0.1)";
const ACCENT_BORD = "rgba(255,255,255,0.28)";
const ACCENT_GLOW = "rgba(255,255,255,0.22)";

export default async function OrdemJogadorPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [system, characters] = await Promise.all([
    prisma.system.findUnique({ where: { slug: "ordem" } }),
    prisma.character.findMany({
      where: { userId, system: { slug: "ordem" } },
      include: { ordemSheet: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  if (!system) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Sistema Ordem Paranormal não encontrado. Execute <code>npm run seed</code>.
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      <DashboardNav
        userName={session.user.name ?? session.user.email ?? "Usuário"}
        systemName="Ordem Paranormal"
        systemHref="/dashboard/ordem"
        backLabel="Ordem Paranormal"
        accentColor="#ffffff"
      />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 36,
          }}
        >
          <div>
            <span className="section-label" style={{ display: "block", marginBottom: 8, color: ACCENT }}>
              Ordem Paranormal · Versão 1.3
            </span>
            <h1
              style={{
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "clamp(1.4rem, 3vw, 1.9rem)",
                fontWeight: 700,
                color: "var(--text)",
                lineHeight: 1.2,
              }}
            >
              Meus{" "}
              <span style={{ color: ACCENT }}>Agentes</span>
            </h1>
          </div>

          <Link
            href="/dashboard/ordem/new"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              background: `linear-gradient(135deg, #ffffff 0%, ${ACCENT} 100%)`,
              color: "#06090f",
              border: "none",
              borderRadius: "var(--radius)",
              fontSize: "0.86rem",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: `0 0 20px ${ACCENT_GLOW}`,
              whiteSpace: "nowrap",
            }}
          >
            + Criar agente
          </Link>
        </div>

        {characters.length === 0 ? (
          <EmptyState />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 18,
            }}
          >
            {characters.map((char) => (
              <AgentCard
                key={char.id}
                id={char.id}
                name={char.name}
                className={char.ordemSheet?.className ?? null}
                origin={char.ordemSheet?.origin ? (ORIGIN_BY_ID[char.ordemSheet.origin]?.name ?? null) : null}
                nex={char.ordemSheet?.nex ?? 5}
                sanCurrent={char.ordemSheet?.sanCurrent ?? 0}
                sanMax={char.ordemSheet?.sanMax ?? 1}
                portraitUrl={char.portraitUrl}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        marginTop: 40,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: "72px 24px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-xl)",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "var(--radius-lg)",
          background: ACCENT_DIM,
          border: `1px solid ${ACCENT_BORD}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 4,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
      <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>
        Nenhum agente ainda
      </h2>
      <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", maxWidth: 340, lineHeight: 1.65 }}>
        Recrute seu primeiro agente e enfrente o Outro Lado a serviço da Ordem.
      </p>
      <Link
        href="/dashboard/ordem/new"
        style={{
          marginTop: 8,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "10px 22px",
          background: `linear-gradient(135deg, #ffffff 0%, ${ACCENT} 100%)`,
          color: "#06090f",
          borderRadius: "var(--radius)",
          fontSize: "0.86rem",
          fontWeight: 700,
          textDecoration: "none",
          boxShadow: `0 0 20px ${ACCENT_GLOW}`,
        }}
      >
        + Recrutar primeiro agente
      </Link>
    </div>
  );
}
