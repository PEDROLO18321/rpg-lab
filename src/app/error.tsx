"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
      <span className="section-label">Erro inesperado</span>
      <h1
        style={{
          fontFamily: "var(--font-cinzel), serif",
          fontSize: "clamp(2rem, 5vw, 3rem)",
          fontWeight: 700,
          color: "var(--text)",
          margin: 0,
        }}
      >
        Algo deu errado
      </h1>
      <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", maxWidth: 420, lineHeight: 1.7 }}>
        Uma falha inesperada interrompeu esta página. Você pode tentar de novo.
      </p>
      <button
        onClick={reset}
        style={{
          marginTop: 8,
          padding: "11px 28px",
          fontSize: "0.9rem",
          fontWeight: 600,
          color: "#06090f",
          background: "linear-gradient(135deg, #c9941fee 0%, #c9941f 100%)",
          border: "none",
          borderRadius: "var(--radius)",
          cursor: "pointer",
        }}
      >
        Tentar novamente
      </button>
    </div>
  );
}
