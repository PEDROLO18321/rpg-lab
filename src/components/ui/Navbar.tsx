"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const LINKS = [
  { label: "Recursos",      href: "#features" },
  { label: "Sistemas",      href: "#systems"  },
  { label: "Como funciona", href: "#about"    },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 100,
        transition: "background 0.35s, backdrop-filter 0.35s, border-color 0.35s",
        background: scrolled ? "rgba(7, 9, 15, 0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(160%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px) saturate(160%)" : "none",
        borderBottom: `1px solid ${scrolled ? "var(--border)" : "transparent"}`,
      }}
    >
      <div
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          padding: "0 28px",
          height: 66,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
          <div
            style={{
              width: 34,
              height: 34,
              background: "var(--accent-dim)",
              border: "1px solid var(--border-accent)",
              borderRadius: "var(--radius)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.9rem",
            }}
          >
            ⚔️
          </div>
          <span
            style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "0.92rem",
              fontWeight: 700,
              color: "var(--text)",
              letterSpacing: "0.06em",
            }}
          >
            RPG Lab
          </span>
        </Link>

        {/* Nav */}
        <nav style={{ display: "flex", gap: 2, flex: 1, justifyContent: "center" }}>
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              style={{
                padding: "6px 15px",
                fontSize: "0.865rem",
                color: "var(--text-muted)",
                textDecoration: "none",
                borderRadius: "var(--radius)",
                transition: "color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text)";
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-muted)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <Link
            href="/login"
            style={{
              padding: "7px 16px",
              fontSize: "0.865rem",
              fontWeight: 500,
              color: "var(--text-muted)",
              textDecoration: "none",
              borderRadius: "var(--radius)",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)"; }}
          >
            Entrar
          </Link>

          <Link
            href="/register"
            style={{
              padding: "7px 20px",
              fontSize: "0.865rem",
              fontWeight: 600,
              color: "#06090f",
              background: "linear-gradient(135deg, var(--accent-light) 0%, var(--accent) 100%)",
              textDecoration: "none",
              borderRadius: "var(--radius)",
              boxShadow: "0 0 18px var(--accent-glow)",
              transition: "filter 0.2s, box-shadow 0.2s, transform 0.2s",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.filter = "brightness(1.1)";
              el.style.boxShadow = "0 0 30px var(--accent-glow-lg)";
              el.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.filter = "brightness(1)";
              el.style.boxShadow = "0 0 18px var(--accent-glow)";
              el.style.transform = "translateY(0)";
            }}
          >
            Começar grátis
          </Link>
        </div>
      </div>
    </header>
  );
}
