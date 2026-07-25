import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { InvestigatorCard } from "@/components/dashboard/InvestigatorCard";

const ACCENT      = "#7d9c3e";
const ACCENT_DIM  = "rgba(125,156,62,0.1)";
const ACCENT_BORD = "rgba(125,156,62,0.28)";
const ACCENT_GLOW = "rgba(125,156,62,0.22)";

export default async function CthulhuJogadorPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [system, characters] = await Promise.all([
    prisma.system.findUnique({ where: { slug: "cthulhu" } }),
    prisma.character.findMany({
      where: { userId, system: { slug: "cthulhu" } },
      include: { cthulhuSheet: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  if (!system) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Sistema Call of Cthulhu não encontrado. Execute <code>npm run seed</code>.
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      <DashboardNav
        userName={session.user.name ?? session.user.email ?? "Usuário"}
        systemName="Call of Cthulhu"
        systemHref="/dashboard/cthulhu"
        backLabel="Call of Cthulhu"
        accentColor="#6b7a3a"
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
              Call of Cthulhu · 7ª Edição
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
              <span style={{ color: ACCENT }}>Investigadores</span>
            </h1>
          </div>

          <Link
            href="/dashboard/cthulhu/new"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              background: `linear-gradient(135deg, #a3b86c 0%, ${ACCENT} 100%)`,
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
            + Criar investigador
          </Link>
        </div>

        {characters.length === 0 ? (
          <EmptyState accentColor={ACCENT} accentDim={ACCENT_DIM} accentBord={ACCENT_BORD} accentGlow={ACCENT_GLOW} />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 18,
            }}
          >
            {characters.map((char) => (
              <InvestigatorCard
                key={char.id}
                id={char.id}
                name={char.name}
                occupation={char.cthulhuSheet?.occupation ?? null}
                era={char.cthulhuSheet?.era ?? null}
                age={char.cthulhuSheet?.age ?? null}
                sanCurrent={char.cthulhuSheet?.sanCurrent ?? 50}
                sanMax={char.cthulhuSheet?.sanMax ?? 99}
                portraitUrl={char.portraitUrl}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState({
  accentColor,
  accentDim,
  accentBord,
  accentGlow,
}: {
  accentColor: string;
  accentDim: string;
  accentBord: string;
  accentGlow: string;
}) {
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
          background: accentDim,
          border: `1px solid ${accentBord}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 4,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </div>
      <h2
        style={{
          fontFamily: "var(--font-cinzel), serif",
          fontSize: "1.1rem",
          fontWeight: 700,
          color: "var(--text)",
        }}
      >
        Nenhum investigador ainda
      </h2>
      <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", maxWidth: 340, lineHeight: 1.65 }}>
        Crie seu primeiro investigador e mergulhe nos horrores do Mythos de Cthulhu.
      </p>
      <Link
        href="/dashboard/cthulhu/new"
        style={{
          marginTop: 8,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "10px 22px",
          background: `linear-gradient(135deg, #a3b86c 0%, ${accentColor} 100%)`,
          color: "#06090f",
          borderRadius: "var(--radius)",
          fontSize: "0.86rem",
          fontWeight: 700,
          textDecoration: "none",
          boxShadow: `0 0 20px ${accentGlow}`,
        }}
      >
        + Criar primeiro investigador
      </Link>
    </div>
  );
}
