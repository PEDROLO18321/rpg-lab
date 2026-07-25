import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { RoleSelectGrid } from "./RoleSelectGrid";

export default async function OrdemRolePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      <DashboardNav
        userName={session.user.name ?? session.user.email ?? "Usuário"}
        systemName="Ordem Paranormal"
        systemHref="/dashboard"
        accentColor="#ffffff"
      />

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "72px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <span className="section-label" style={{ display: "block", marginBottom: 12, color: "#ffffff" }}>
            Ordem Paranormal · Versão 1.3
          </span>
          <h1
            style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
              fontWeight: 700,
              color: "var(--text)",
              lineHeight: 1.2,
              marginBottom: 12,
            }}
          >
            Qual é o seu{" "}
            <span style={{ color: "#ffffff" }}>papel</span>?
          </h1>
          <p
            style={{
              fontSize: "0.92rem",
              color: "var(--text-muted)",
              maxWidth: 420,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Agente de campo ou Mestre da Ordem — cada um tem seu próprio painel para enfrentar o Outro Lado.
          </p>
        </div>

        <RoleSelectGrid />
      </main>
    </div>
  );
}
