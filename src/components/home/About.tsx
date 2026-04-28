"use client";

import { useEffect, useRef } from "react";

const STEPS = [
  {
    num: "01",
    title: "Crie sua conta",
    desc: "Cadastro gratuito em segundos com Google ou e-mail. Sem cartão de crédito.",
    icon: "🧙",
  },
  {
    num: "02",
    title: "Escolha o sistema",
    desc: "Selecione D&D 5e ou outro sistema disponível e comece a montar sua ficha.",
    icon: "📖",
  },
  {
    num: "03",
    title: "Monte sua ficha",
    desc: "Preencha os dados do personagem. As mecânicas são calculadas automaticamente.",
    icon: "📋",
  },
  {
    num: "04",
    title: "Compartilhe",
    desc: "Gere um link e compartilhe com seu grupo ou Mestre na hora.",
    icon: "🔗",
  },
];

export function About() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.06 }
    );
    ref.current?.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={ref}
      style={{ padding: "112px 28px", background: "var(--bg-alt)" }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div className="reveal" style={{ textAlign: "center", marginBottom: 72 }}>
          <p className="section-label" style={{ marginBottom: 14 }}>Como funciona</p>
          <h2
            style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "clamp(1.7rem, 3.5vw, 2.4rem)",
              fontWeight: 700,
              color: "var(--text)",
              lineHeight: 1.2,
              marginBottom: 14,
            }}
          >
            De zero à mesa em minutos
          </h2>
          <p style={{ fontSize: "0.975rem", color: "var(--text-muted)", maxWidth: 440, margin: "0 auto" }}>
            RPG Lab foi criado para eliminar a fricção entre o jogador e a aventura.
          </p>
        </div>

        {/* Steps */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: 20,
          }}
        >
          {STEPS.map((s, i) => (
            <div
              key={s.num}
              className="reveal"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                padding: "28px 24px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                transitionDelay: `${i * 0.08}s`,
                transition: "border-color 0.22s, background 0.22s, transform 0.22s",
                cursor: "default",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = "var(--border-accent)";
                el.style.background = "var(--surface-2)";
                el.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = "var(--border)";
                el.style.background = "var(--surface)";
                el.style.transform = "translateY(0)";
              }}
            >
              {/* Number */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span
                  style={{
                    fontFamily: "var(--font-cinzel), serif",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "var(--accent)",
                    letterSpacing: "0.1em",
                  }}
                >
                  {s.num}
                </span>
                <span style={{ fontSize: "1.3rem" }}>{s.icon}</span>
              </div>

              {/* Content */}
              <div>
                <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
                  {s.title}
                </div>
                <div style={{ fontSize: "0.86rem", color: "var(--text-muted)", lineHeight: 1.68 }}>
                  {s.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
