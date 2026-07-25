import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { RoleSelectGrid } from "./RoleSelectGrid";

export default async function CthulhuRolePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      <DashboardNav
        userName={session.user.name ?? session.user.email ?? "Usuário"}
        systemName="Call of Cthulhu"
        systemHref="/dashboard"
        accentColor="#6b7a3a"
      />

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "72px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <span className="section-label" style={{ display: "block", marginBottom: 12, color: "#7d9c3e" }}>
            Call of Cthulhu · 7ª Edição
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
            <span style={{ color: "#7d9c3e" }}>papel</span>?
          </h1>
          <p
            style={{
              fontSize: "0.92rem",
              color: "var(--text-muted)",
              maxWidth: 400,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Investigador ou Guardião do Conhecimento Arcano — cada um tem seu próprio painel.
          </p>
        </div>

        <RoleSelectGrid />
      </main>
    </div>
  );
}
