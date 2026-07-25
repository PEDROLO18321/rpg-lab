import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { TormentaCharacterCard } from "@/components/dashboard/TormentaCharacterCard";
import { RACE_BY_ID } from "@/lib/tormenta/races";
import { CLASS_BY_ID } from "@/lib/tormenta/classes";

const ACCENT = "#a01818";
const ACCENT_DIM = "rgba(160,24,24,0.12)";
const ACCENT_BORD = "rgba(160,24,24,0.32)";
const ACCENT_GLOW = "rgba(160,24,24,0.22)";

export default async function TormentaJogadorPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [system, characters] = await Promise.all([
    prisma.system.findUnique({ where: { slug: "tormenta20" } }),
    prisma.character.findMany({
      where: { userId, system: { slug: "tormenta20" } },
      include: { tormentaSheet: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  if (!system) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Sistema Tormenta 20 não encontrado. Execute <code>npm run seed</code>.
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      <DashboardNav
        userName={session.user.name ?? session.user.email ?? "Usuário"}
        systemName="Tormenta 20"
        systemHref="/dashboard/tormenta"
        backLabel="Tormenta 20"
        accentColor="#a01818"
      />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 36 }}>
          <div>
            <span className="section-label" style={{ display: "block", marginBottom: 8, color: ACCENT }}>Tormenta 20 · Edição 2020</span>
            <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "clamp(1.4rem, 3vw, 1.9rem)", fontWeight: 700, color: "var(--text)", lineHeight: 1.2 }}>
              Meus <span style={{ color: ACCENT }}>Heróis</span>
            </h1>
          </div>

          <Link href="/dashboard/tormenta/new" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: `linear-gradient(135deg, #c94040 0%, ${ACCENT} 100%)`, color: "#fff", border: "none", borderRadius: "var(--radius)", fontSize: "0.86rem", fontWeight: 700, textDecoration: "none", boxShadow: `0 0 20px ${ACCENT_GLOW}`, whiteSpace: "nowrap" }}>
            + Criar personagem
          </Link>
        </div>

        {characters.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>
            {characters.map((char) => {
              const sheet = char.tormentaSheet;
              const race = sheet?.race ? RACE_BY_ID[sheet.race]?.name ?? null : null;
              const cls = sheet?.className ? CLASS_BY_ID[sheet.className]?.name ?? null : null;
              return (
                <TormentaCharacterCard
                  key={char.id}
                  id={char.id}
                  name={char.name}
                  race={race}
                  className={cls}
                  level={sheet?.level ?? 1}
                  pvCurrent={sheet?.pvCurrent ?? 0}
                  pvMax={sheet?.pvMax ?? 1}
                  portraitUrl={char.portraitUrl}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ marginTop: 40, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "72px 24px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", gap: 12 }}>
      <div style={{ width: 56, height: 56, borderRadius: "var(--radius-lg)", background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/><path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/><path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z"/><path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z"/><path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z"/><path d="M10 9.5C10 8.67 9.33 8 8.5 8H3.5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z"/></svg>
      </div>
      <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>Nenhum herói ainda</h2>
      <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", maxWidth: 320, lineHeight: 1.65 }}>Crie seu primeiro herói e comece sua aventura em Arton.</p>
      <Link href="/dashboard/tormenta/new" style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 22px", background: `linear-gradient(135deg, #c94040 0%, ${ACCENT} 100%)`, color: "#fff", borderRadius: "var(--radius)", fontSize: "0.86rem", fontWeight: 700, textDecoration: "none", boxShadow: `0 0 20px ${ACCENT_GLOW}` }}>
        + Criar primeiro herói
      </Link>
    </div>
  );
}
