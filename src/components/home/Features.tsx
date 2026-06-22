"use client";

import { useEffect, useRef } from "react";

const FEATURES = [
  {
    icon: "🎲",
    title: "Multi-sistema",
    desc: "D&D 5e e Call of Cthulhu disponíveis. Ordem Paranormal em desenvolvimento. Mais sistemas chegando.",
  },
  {
    icon: "⚙️",
    title: "Mecânicas automáticas",
    desc: "Modificadores, proficiências, bônus de ataque e salvaguardas calculados sem erro. Foco na história.",
  },
  {
    icon: "🔗",
    title: "Compartilhamento por link",
    desc: "Gere um link único para sua ficha e compartilhe com o Mestre ou grupo. Sem necessidade de cadastro.",
  },
  {
    icon: "👤",
    title: "Múltiplos personagens",
    desc: "Gerencie todos os seus personagens em um único lugar, organizados e acessíveis a qualquer momento.",
  },
  {
    icon: "🏕️",
    title: "Campanhas",
    desc: "Agrupe personagens por campanha e acompanhe a evolução da sua aventura de forma organizada.",
  },
  {
    icon: "☁️",
    title: "Salvo na nuvem",
    desc: "Seus dados sincronizados e seguros. Acesse de qualquer dispositivo, sem perder nada.",
  },
];

export function Features() {
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
      id="features"
      ref={ref}
      style={{ padding: "112px 28px", background: "var(--bg-alt)" }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: 72 }}>
          <p className="section-label" style={{ marginBottom: 14 }}>Recursos</p>
          <h2
            style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "clamp(1.7rem, 3.5vw, 2.4rem)",
              fontWeight: 700,
              color: "var(--text)",
              lineHeight: 1.2,
            }}
          >
            Tudo que você precisa para jogar
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
            gap: 18,
          }}
        >
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="reveal"
              style={{
                padding: "28px 26px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                transitionDelay: `${i * 0.06}s`,
                transition: "border-color 0.22s, background 0.22s, transform 0.22s, box-shadow 0.22s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = "var(--border-hover)";
                el.style.background = "var(--surface-2)";
                el.style.transform = "translateY(-4px)";
                el.style.boxShadow = "0 16px 40px rgba(0,0,0,0.35)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = "var(--border)";
                el.style.background = "var(--surface)";
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  width: 46, height: 46,
                  background: "var(--accent-dim)",
                  border: "1px solid var(--border-accent)",
                  borderRadius: "var(--radius)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.3rem",
                  marginBottom: 18,
                }}
              >
                {f.icon}
              </div>
              <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
                {f.title}
              </h3>
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.72 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
