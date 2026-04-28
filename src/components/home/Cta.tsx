"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

export function Cta() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.15 }
    );
    ref.current?.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      style={{
        padding: "112px 28px",
        background: "var(--bg)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(201,148,31,0.07) 0%, transparent 65%)",
        }}
      />

      <div
        style={{
          maxWidth: 640,
          margin: "0 auto",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Icon */}
        <div
          className="reveal"
          style={{
            width: 64,
            height: 64,
            background: "var(--accent-dim)",
            border: "1px solid var(--border-accent)",
            borderRadius: "var(--radius-xl)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.75rem",
            boxShadow: "0 0 32px var(--accent-glow)",
          }}
        >
          🎲
        </div>

        <h2
          className="reveal"
          style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "clamp(1.6rem, 3.5vw, 2.5rem)",
            fontWeight: 700,
            color: "var(--text)",
            lineHeight: 1.18,
          }}
        >
          Pronto para a sua{" "}
          <span
            style={{
              background: "linear-gradient(135deg, var(--accent-light) 0%, var(--accent) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            próxima aventura?
          </span>
        </h2>

        <p
          className="reveal"
          style={{
            fontSize: "1rem",
            color: "var(--text-muted)",
            lineHeight: 1.8,
            maxWidth: 420,
          }}
        >
          Crie sua conta gratuitamente e comece a montar sua primeira ficha agora mesmo.
        </p>

        <div className="reveal" style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
          <Link
            href="/register"
            style={{
              padding: "13px 32px",
              fontSize: "0.9375rem",
              fontWeight: 700,
              color: "#06090f",
              background: "linear-gradient(135deg, var(--accent-light) 0%, var(--accent) 100%)",
              textDecoration: "none",
              borderRadius: "var(--radius)",
              boxShadow: "0 0 28px var(--accent-glow), 0 4px 14px rgba(0,0,0,0.35)",
              transition: "filter 0.2s, transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.filter = "brightness(1.1)";
              el.style.transform = "translateY(-2px)";
              el.style.boxShadow = "0 0 40px var(--accent-glow-lg), 0 8px 20px rgba(0,0,0,0.4)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.filter = "brightness(1)";
              el.style.transform = "translateY(0)";
              el.style.boxShadow = "0 0 28px var(--accent-glow), 0 4px 14px rgba(0,0,0,0.35)";
            }}
          >
            Criar conta grátis
          </Link>
          <Link
            href="/login"
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
            Já tenho conta
          </Link>
        </div>

        <p className="reveal" style={{ fontSize: "0.78rem", color: "var(--text-subtle)" }}>
          Gratuito para começar · Sem cartão de crédito · Dados salvos na nuvem
        </p>
      </div>
    </section>
  );
}
