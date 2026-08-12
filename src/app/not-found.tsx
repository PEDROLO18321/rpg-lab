import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 28px",
        textAlign: "center",
        gap: 20,
      }}
    >
      <span className="section-label">Erro 404</span>
      <h1
        style={{
          fontFamily: "var(--font-cinzel), serif",
          fontSize: "clamp(2rem, 5vw, 3rem)",
          fontWeight: 700,
          color: "var(--text)",
          margin: 0,
        }}
      >
        Página não encontrada
      </h1>
      <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", maxWidth: 420, lineHeight: 1.7 }}>
        Este caminho não leva a lugar nenhum — como um portal que se fechou antes da hora.
      </p>
      <Link
        href="/dashboard"
        style={{
          marginTop: 8,
          padding: "11px 28px",
          fontSize: "0.9rem",
          fontWeight: 600,
          color: "#06090f",
          background: "linear-gradient(135deg, #c9941fee 0%, #c9941f 100%)",
          textDecoration: "none",
          borderRadius: "var(--radius)",
        }}
      >
        Ir para o Laboratório
      </Link>
    </div>
  );
}
