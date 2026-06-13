import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default async function TormentaDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      <DashboardNav
        userName={session.user.name ?? session.user.email ?? "Usuário"}
        systemName="Tormenta 20"
        systemHref="/dashboard/tormenta"
      />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          textAlign: "center",
          padding: "72px 40px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          maxWidth: 480,
          width: "100%",
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: "var(--radius-xl)",
            background: "var(--surface-2)", border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.8rem", margin: "0 auto 20px",
          }}>
            🛡️
          </div>
          <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
            Em desenvolvimento
          </p>
          <h1 style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "1.5rem", fontWeight: 700,
            color: "var(--text)", marginBottom: 12,
          }}>
            Tormenta 20
          </h1>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
            O suporte ao sistema Tormenta 20 ainda está sendo desenvolvido.
            Por enquanto, utilize o sistema de D&amp;D 5e disponível.
          </p>
        </div>
      </main>
    </div>
  );
}
