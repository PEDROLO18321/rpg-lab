import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default async function CthulhuGuardiaoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      <DashboardNav
        userName={session.user.name ?? session.user.email ?? "Usuário"}
        systemName="Call of Cthulhu"
        systemHref="/dashboard/cthulhu"
        backLabel="Call of Cthulhu"
      />

      <main
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "72px 24px 80px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "var(--radius-xl)",
            background: "rgba(125,156,62,0.1)",
            border: "1px solid rgba(125,156,62,0.28)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 8,
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7d9c3e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
        </div>

        <span className="section-label">Guardião do Conhecimento Arcano</span>

        <h1
          style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "clamp(1.4rem, 3vw, 1.9rem)",
            fontWeight: 700,
            color: "var(--text)",
            lineHeight: 1.2,
          }}
        >
          Painel do <span style={{ color: "#7d9c3e" }}>Guardião</span>
        </h1>

        <p
          style={{
            fontSize: "0.9rem",
            color: "var(--text-muted)",
            maxWidth: 420,
            lineHeight: 1.75,
          }}
        >
          Cenários, NPCs, criaturas do Mythos e ferramentas de Guardião chegam em breve.
          O horror está sendo preparado com cuidado.
        </p>

        <div
          style={{
            marginTop: 8,
            padding: "8px 18px",
            background: "rgba(125,156,62,0.08)",
            border: "1px solid rgba(125,156,62,0.2)",
            borderRadius: "var(--radius-full)",
            fontSize: "0.78rem",
            fontWeight: 700,
            color: "#7d9c3e",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Em Desenvolvimento
        </div>
      </main>
    </div>
  );
}
