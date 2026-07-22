import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { RoleSelectGrid } from "./RoleSelectGrid";

export default async function TormentaRolePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      <DashboardNav
        userName={session.user.name ?? session.user.email ?? "Usuário"}
        systemName="Tormenta 20"
        systemHref="/dashboard"
      />

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "72px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <span className="section-label" style={{ display: "block", marginBottom: 12 }}>
            Tormenta 20 · O RPG Nacional
          </span>
          <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 700, color: "var(--text)", lineHeight: 1.2, marginBottom: 12 }}>
            Como você vai <span style={{ color: "#c94040" }}>jogar</span>?
          </h1>
          <p style={{ fontSize: "0.92rem", color: "var(--text-muted)", maxWidth: 380, margin: "0 auto", lineHeight: 1.7 }}>
            Selecione seu papel em Arton. Jogador ou Mestre — cada um tem seu próprio painel.
          </p>
        </div>

        <RoleSelectGrid />
      </main>
    </div>
  );
}
