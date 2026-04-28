"use client";

import { useEffect, useRef } from "react";

const SYSTEMS = [
  {
    icon: "⚔️",
    name: "Dungeons & Dragons 5e",
    abbr: "D&D 5e",
    status: "available" as const,
    desc: "Ficha completa com 6 atributos, classes com subclasses, grimório de magias, equipamento e traços. Modificadores e proficiências calculados automaticamente.",
    highlights: ["Classes e subclasses", "Grimório de magias", "Multi-classe", "Pontos de vida e dado de vida"],
  },
  {
    icon: "🕯️",
    name: "Call of Cthulhu",
    abbr: "CoC 7ª Ed.",
    status: "soon" as const,
    desc: "Ficha de investigador com perícias percentuais, sanidade, pontos de vida e dados de vida. Ocupações e histórico personalizáveis.",
    highlights: ["Perícias com %", "Sanidade e Sanidade Máxima", "Pontos de Sorte", "Ocupações"],
  },
  {
    icon: "🌙",
    name: "Tormenta 20",
    abbr: "T20",
    status: "soon" as const,
    desc: "O maior sistema nacional. Raças e classes brasileiras, monstros do folclore e um universo épico criado por autores do Brasil.",
    highlights: ["Raças nacionais", "Sistema de pontos", "Magias e rituais", "Divindades de Arton"],
  },
  {
    icon: "🤖",
    name: "Cyberpunk RED",
    abbr: "CP RED",
    status: "planned" as const,
    desc: "Metrópoles neon, implantes cibernéticos e corporações sombrias. Função e papel social como pilares do personagem.",
    highlights: ["Implantes e ciberware", "Funções e papéis", "Humanidade", "Combate tático"],
  },
];

const STATUS = {
  available: { label: "Disponível", cls: "badge-available" },
  soon:      { label: "Em breve",   cls: "badge-soon"      },
  planned:   { label: "Planejado",  cls: "badge-planned"   },
};

export function Systems() {
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
      id="systems"
      ref={ref}
      style={{ padding: "112px 28px", background: "var(--bg)" }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div className="reveal" style={{ textAlign: "center", marginBottom: 72 }}>
          <p className="section-label" style={{ marginBottom: 14 }}>Sistemas</p>
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
            Escolha seu universo
          </h2>
          <p style={{ fontSize: "0.975rem", color: "var(--text-muted)", maxWidth: 440, margin: "0 auto" }}>
            Começando por D&amp;D 5e, com novos sistemas sendo adicionados progressivamente.
          </p>
        </div>

        {/* Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 18,
          }}
        >
          {SYSTEMS.map((s, i) => {
            const st = STATUS[s.status];
            const isAvailable = s.status === "available";
            return (
              <div
                key={s.name}
                className="reveal"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                  padding: "24px",
                  background: "var(--surface)",
                  border: `1px solid ${isAvailable ? "var(--border-accent)" : "var(--border)"}`,
                  borderRadius: "var(--radius-lg)",
                  transitionDelay: `${i * 0.07}s`,
                  transition: "border-color 0.22s, background 0.22s, transform 0.22s, box-shadow 0.22s",
                  cursor: "default",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = isAvailable ? "rgba(201,148,31,0.5)" : "var(--border-hover)";
                  el.style.background = "var(--surface-2)";
                  el.style.transform = "translateY(-4px)";
                  el.style.boxShadow = isAvailable
                    ? "0 16px 40px rgba(0,0,0,0.35), 0 0 24px rgba(201,148,31,0.08)"
                    : "0 16px 40px rgba(0,0,0,0.35)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = isAvailable ? "var(--border-accent)" : "var(--border)";
                  el.style.background = "var(--surface)";
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "none";
                }}
              >
                {/* Top */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div
                    style={{
                      width: 44, height: 44,
                      background: isAvailable ? "var(--accent-dim)" : "var(--surface-3)",
                      border: `1px solid ${isAvailable ? "var(--border-accent)" : "var(--border)"}`,
                      borderRadius: "var(--radius)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.2rem",
                    }}
                  >
                    {s.icon}
                  </div>
                  <span className={`badge ${st.cls}`}>{st.label}</span>
                </div>

                {/* Name */}
                <div>
                  <div style={{ fontSize: "0.9375rem", fontWeight: 650, color: "var(--text)", marginBottom: 3 }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-subtle)", fontWeight: 500 }}>
                    {s.abbr}
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", lineHeight: 1.68, flexGrow: 1 }}>
                  {s.desc}
                </p>

                {/* Highlights */}
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 7 }}>
                  {s.highlights.map((h) => (
                    <li key={h} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      <span style={{ color: isAvailable ? "var(--accent)" : "var(--text-subtle)", fontSize: "0.5rem", flexShrink: 0 }}>◆</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
