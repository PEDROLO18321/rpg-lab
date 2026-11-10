import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { CyberpunkCharacterCard } from "@/components/dashboard/CyberpunkCharacterCard";
import { getRole } from "@/lib/cyberpunk/data";

const ACCENT      = "#c084fc";
const ACCENT_DIM  = "rgba(168,85,247,0.1)";
const ACCENT_BORD = "rgba(168,85,247,0.3)";
const ACCENT_GLOW = "rgba(168,85,247,0.24)";

export default async function CyberpunkJogadorPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const characters = await prisma.character.findMany({
    where: { userId, system: { slug: "cyberpunk" } },
    // `select` em vez de `include`: a ficha guarda listas inteiras em coluna Json
    // (perícias, armas, ciberware, equipamento, lifepath) e nada disso aparece no
    // cartão. Sem isto, o payload da lista carregava a ficha completa de cada
    // personagem só para mostrar papel, HP e Humanidade.
    select: {
      id: true, name: true, portraitUrl: true,
      cyberpunkSheet: { select: { role: true, roleRank: true, hpCurrent: true, hpMax: true, humanity: true, humanityMax: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      <DashboardNav
        userName={session.user.name ?? session.user.email ?? "Usuário"}
        systemName="Cyberpunk RED"
        systemHref="/dashboard/cyberpunk"
        backLabel="Cyberpunk RED"
        accentColor="#a855f7"
      />

      <main id="conteudo" style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>
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
              Cyberpunk RED · Night City 2045
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
              <span style={{ color: ACCENT }}>Edgerunners</span>
            </h1>
          </div>

          <Link
            href="/dashboard/cyberpunk/new"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              background: `linear-gradient(135deg, ${ACCENT} 0%, #a855f7 100%)`,
              color: "#0b0614",
              border: "none",
              borderRadius: "var(--radius)",
              fontSize: "0.86rem",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: `0 0 20px ${ACCENT_GLOW}`,
              whiteSpace: "nowrap",
            }}
          >
            + Criar edgerunner
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
              <CyberpunkCharacterCard
                key={char.id}
                id={char.id}
                name={char.name}
                roleName={char.cyberpunkSheet ? getRole(char.cyberpunkSheet.role)?.name ?? char.cyberpunkSheet.role : null}
                roleRank={char.cyberpunkSheet?.roleRank ?? 4}
                hpCurrent={char.cyberpunkSheet?.hpCurrent ?? 0}
                hpMax={char.cyberpunkSheet?.hpMax ?? 35}
                humanity={char.cyberpunkSheet?.humanity ?? 0}
                humanityMax={char.cyberpunkSheet?.humanityMax ?? 50}
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
        Nenhum edgerunner ainda
      </h2>
      <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", maxWidth: 340, lineHeight: 1.65 }}>
        Crie seu primeiro edgerunner e mergulhe nas ruas de Night City.
      </p>
      <Link
        href="/dashboard/cyberpunk/new"
        style={{
          marginTop: 8,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "10px 22px",
          background: `linear-gradient(135deg, ${accentColor} 0%, #a855f7 100%)`,
          color: "#0b0614",
          borderRadius: "var(--radius)",
          fontSize: "0.86rem",
          fontWeight: 700,
          textDecoration: "none",
          boxShadow: `0 0 20px ${accentGlow}`,
        }}
      >
        + Criar primeiro edgerunner
      </Link>
    </div>
  );
}
