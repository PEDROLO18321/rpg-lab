import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

const ACCENT = "#ffffff";

export default async function OrdemMestrePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      <DashboardNav
        userName={session.user.name ?? session.user.email ?? "Usuário"}
        systemName="Ordem Paranormal"
        systemHref="/dashboard/ordem"
        backLabel="Ordem Paranormal"
      />

      <main
        style={{
          maxWidth: 640,
          margin: "0 auto",
          padding: "96px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 18,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "5px 16px",
            background: `${ACCENT}18`,
            border: `1px solid ${ACCENT}44`,
            borderRadius: "var(--radius-full)",
          }}
        >
          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: ACCENT, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Em breve
          </span>
        </div>

        <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 700, color: "var(--text)", lineHeight: 1.2 }}>
          Painel do <span style={{ color: ACCENT }}>Mestre</span>
        </h1>

        <p style={{ fontSize: "0.92rem", color: "var(--text-muted)", maxWidth: 420, lineHeight: 1.75 }}>
          Rolador de dados, cenas de ação, iniciativa e ameaças do Outro Lado chegam aqui em breve. Por enquanto, recrute e gerencie seus agentes pelo painel de Agente.
        </p>
      </main>
    </div>
  );
}
