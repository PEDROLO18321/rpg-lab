"use client";

import Link from "next/link";

/* Decorative character sheet preview */
function SheetPreview() {
  return (
    <div
      className="float"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-xl)",
        padding: "24px",
        width: "100%",
        maxWidth: 340,
        boxShadow: "0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-cinzel), serif" }}>
            Thorin Ferreiro
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>
            Guerreiro · Nível 8 · Anão
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "0.65rem", color: "var(--text-subtle)", marginBottom: 2 }}>CA</div>
          <div
            style={{
              width: 36, height: 36,
              background: "var(--accent-dim)",
              border: "1px solid var(--border-accent)",
              borderRadius: "var(--radius)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.9rem", fontWeight: 700, color: "var(--accent-light)",
            }}
          >
            18
          </div>
        </div>
      </div>

      {/* HP Bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: "0.72rem", color: "var(--text-subtle)", fontWeight: 600, letterSpacing: "0.06em" }}>
            PONTOS DE VIDA
          </span>
          <span style={{ fontSize: "0.78rem", color: "var(--green)", fontWeight: 700 }}>72 / 86</span>
        </div>
        <div style={{ height: 6, background: "var(--surface-3)", borderRadius: 3, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: "84%",
              background: "linear-gradient(90deg, #22c55e, #4ade80)",
              borderRadius: 3,
              transition: "width 0.5s ease",
            }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
        {[
          { label: "FOR", val: "20", mod: "+5" },
          { label: "DES", val: "14", mod: "+2" },
          { label: "CON", val: "18", mod: "+4" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "10px 0",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "0.62rem", color: "var(--text-subtle)", letterSpacing: "0.08em", marginBottom: 4 }}>
              {s.label}
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", lineHeight: 1 }}>
              {s.val}
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--accent-light)", fontWeight: 600, marginTop: 2 }}>
              {s.mod}
            </div>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          { name: "Atletismo", val: "+9", prof: true },
          { name: "Percepção", val: "+4", prof: false },
          { name: "Intimidação", val: "+7", prof: true },
        ].map((sk) => (
          <div
            key={sk.name}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div
                style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: sk.prof ? "var(--accent)" : "var(--surface-3)",
                  border: sk.prof ? "none" : "1px solid var(--border)",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{sk.name}</span>
            </div>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: sk.prof ? "var(--accent-light)" : "var(--text-muted)" }}>
              {sk.val}
            </span>
          </div>
        ))}
      </div>

      {/* Footer badge */}
      <div
        style={{
          marginTop: 18,
          paddingTop: 16,
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: "0.7rem", color: "var(--text-subtle)" }}>D&D 5e · Campeão</span>
        <div
          style={{
            padding: "3px 10px",
            background: "var(--green-dim)",
            border: "1px solid var(--green-ring)",
            borderRadius: "var(--radius-full)",
            fontSize: "0.65rem",
            fontWeight: 700,
            color: "var(--green)",
            letterSpacing: "0.05em",
          }}
        >
          ATIVO
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        padding: "100px 28px 80px",
        overflow: "hidden",
      }}
    >
      {/* Background mesh */}
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `
            radial-gradient(ellipse 80% 70% at 35% 40%, rgba(201,148,31,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 60%, rgba(59,130,246,0.03) 0%, transparent 55%),
            radial-gradient(ellipse 40% 40% at 15% 80%, rgba(201,148,31,0.04) 0%, transparent 50%)
          `,
        }}
      />
      {/* Subtle grid */}
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          opacity: 0.018,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 64,
          alignItems: "center",
        }}
      >
        {/* Left — copy */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 620 }}>
          {/* Eyebrow */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              background: "var(--accent-dim)",
              border: "1px solid var(--border-accent)",
              borderRadius: "var(--radius-full)",
              alignSelf: "flex-start",
            }}
          >
            <span style={{ fontSize: "0.85rem" }}>⚔️</span>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--accent-light)", letterSpacing: "0.04em" }}>
              D&amp;D 5e · Call of Cthulhu · Tormenta 20
            </span>
          </div>

          {/* Heading */}
          <h1
            style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "clamp(2.2rem, 4.5vw, 3.75rem)",
              fontWeight: 700,
              color: "var(--text)",
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
            }}
          >
            Suas fichas de RPG,{" "}
            <span
              style={{
                background: "linear-gradient(135deg, var(--accent-light) 0%, var(--accent) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              organizadas
            </span>
            <br />e sempre acessíveis
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: "clamp(0.975rem, 1.8vw, 1.1rem)",
              color: "var(--text-muted)",
              lineHeight: 1.85,
              maxWidth: 500,
            }}
          >
            Crie e gerencie fichas de personagem para os principais sistemas de RPG.
            Mecânicas calculadas automaticamente, compartilhamento por link e tudo salvo na nuvem.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 4 }}>
            <Link
              href="/register"
              className="pulse-glow"
              style={{
                padding: "13px 30px",
                fontSize: "0.9375rem",
                fontWeight: 700,
                color: "#06090f",
                background: "linear-gradient(135deg, var(--accent-light) 0%, var(--accent) 100%)",
                textDecoration: "none",
                borderRadius: "var(--radius)",
                boxShadow: "0 0 28px var(--accent-glow), 0 4px 14px rgba(0,0,0,0.35)",
                transition: "filter 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.filter = "brightness(1.1)";
                el.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.filter = "brightness(1)";
                el.style.transform = "translateY(0)";
              }}
            >
              Começar gratuitamente
            </Link>
            <a
              href="#features"
              style={{
                padding: "13px 28px",
                fontSize: "0.9375rem",
                fontWeight: 500,
                color: "var(--text-muted)",
                border: "1px solid var(--border)",
                background: "rgba(255,255,255,0.025)",
                textDecoration: "none",
                borderRadius: "var(--radius)",
                transition: "color 0.2s, border-color 0.2s, background 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.color = "var(--text)";
                el.style.borderColor = "var(--border-hover)";
                el.style.background = "rgba(255,255,255,0.06)";
                el.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.color = "var(--text-muted)";
                el.style.borderColor = "var(--border)";
                el.style.background = "rgba(255,255,255,0.025)";
                el.style.transform = "translateY(0)";
              }}
            >
              Ver recursos →
            </a>
          </div>

          <p style={{ fontSize: "0.78rem", color: "var(--text-subtle)" }}>
            Gratuito para começar · Sem cartão de crédito · Acesso de qualquer dispositivo
          </p>
        </div>

        {/* Right — preview card */}
        <div style={{ display: "flex", justifyContent: "center" }} className="hidden lg:flex">
          <SheetPreview />
        </div>
      </div>

      {/* Bottom gradient */}
      <div
        aria-hidden
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: 140, pointerEvents: "none",
          background: "linear-gradient(to bottom, transparent, var(--bg))",
        }}
      />
    </section>
  );
}
