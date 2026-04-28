"use client";

const LINKS = [
  { label: "Recursos", href: "#features" },
  { label: "Sistemas", href: "#systems"  },
  { label: "Entrar",   href: "/login"    },
];

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--bg)",
        padding: "40px 28px",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div
            style={{
              width: 28, height: 28,
              background: "var(--accent-dim)",
              border: "1px solid var(--border-accent)",
              borderRadius: "var(--radius-sm)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.8rem",
            }}
          >
            ⚔️
          </div>
          <span
            style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "0.82rem",
              fontWeight: 700,
              color: "var(--text-muted)",
              letterSpacing: "0.06em",
            }}
          >
            RPG Lab
          </span>
        </div>

        <p style={{ fontSize: "0.78rem", color: "var(--text-subtle)" }}>
          Laboratório digital de fichas de personagem
        </p>

        {/* Links */}
        <div style={{ display: "flex", gap: 6 }}>
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              style={{
                padding: "5px 12px",
                fontSize: "0.78rem",
                color: "var(--text-subtle)",
                textDecoration: "none",
                borderRadius: "var(--radius-sm)",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-subtle)"; }}
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
