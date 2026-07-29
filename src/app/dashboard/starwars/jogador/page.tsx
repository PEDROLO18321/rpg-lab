import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { StarWarsCharacterCard } from "@/components/dashboard/StarWarsCharacterCard";
import { SPECIES_BY_ID } from "@/lib/starwars/species";
import { CLASS_BY_ID } from "@/lib/starwars/classes";

const ACCENT = "#3b82c4";
const ACCENT_DIM = "rgba(59,130,196,0.12)";
const ACCENT_BORD = "rgba(59,130,196,0.32)";
const ACCENT_GLOW = "rgba(59,130,196,0.22)";

export default async function StarWarsJogadorPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [system, characters] = await Promise.all([
    prisma.system.findUnique({ where: { slug: "starwars" } }),
    prisma.character.findMany({
      where: { userId, system: { slug: "starwars" } },
      include: { starWarsSheet: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  if (!system) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Sistema Star Wars não encontrado. Execute <code>npm run seed</code>.
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      <DashboardNav
        userName={session.user.name ?? session.user.email ?? "Usuário"}
        systemName="Star Wars: Além da Fronteira"
        systemHref="/dashboard/starwars"
        backLabel="Star Wars"
        accentColor="#3b82c4"
      />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 36 }}>
          <div>
            <span className="section-label" style={{ display: "block", marginBottom: 8, color: ACCENT }}>Star Wars: Além da Fronteira</span>
            <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "clamp(1.4rem, 3vw, 1.9rem)", fontWeight: 700, color: "var(--text)", lineHeight: 1.2 }}>
              Meus <span style={{ color: ACCENT }}>Personagens</span>
            </h1>
          </div>

          <Link href="/dashboard/starwars/new" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: `linear-gradient(135deg, #69a8e0 0%, ${ACCENT} 100%)`, color: "#fff", border: "none", borderRadius: "var(--radius)", fontSize: "0.86rem", fontWeight: 700, textDecoration: "none", boxShadow: `0 0 20px ${ACCENT_GLOW}`, whiteSpace: "nowrap" }}>
            + Criar personagem
          </Link>
        </div>

        {characters.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>
            {characters.map((char) => {
              const sheet = char.starWarsSheet;
              const species = sheet?.species ? SPECIES_BY_ID[sheet.species]?.name ?? null : null;
              const classLevels: Record<string, number> = sheet?.classes ? JSON.parse(sheet.classes) : {};
              const primaryClassId = Object.keys(classLevels)[0];
              const cls = primaryClassId ? CLASS_BY_ID[primaryClassId]?.name ?? null : null;
              return (
                <StarWarsCharacterCard
                  key={char.id}
                  id={char.id}
                  name={char.name}
                  species={species}
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
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" /></svg>
      </div>
      <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>Nenhum personagem ainda</h2>
      <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", maxWidth: 320, lineHeight: 1.65 }}>Crie seu primeiro personagem e comece sua aventura nas Regiões Desconhecidas.</p>
      <Link href="/dashboard/starwars/new" style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 22px", background: `linear-gradient(135deg, #69a8e0 0%, ${ACCENT} 100%)`, color: "#fff", borderRadius: "var(--radius)", fontSize: "0.86rem", fontWeight: 700, textDecoration: "none", boxShadow: `0 0 20px ${ACCENT_GLOW}` }}>
        + Criar primeiro personagem
      </Link>
    </div>
  );
}
