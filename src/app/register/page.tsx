"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm]       = useState({ name: "", email: "", password: "" });
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erro ao criar conta.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 1500);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "transparent",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(201,148,31,0.06) 0%, transparent 65%)",
        }}
      />

      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none", marginBottom: 36 }}
        >
          <div
            style={{
              width: 32, height: 32,
              background: "var(--accent-dim)",
              border: "1px solid var(--border-accent)",
              borderRadius: "var(--radius)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.85rem",
            }}
          >
            ⚔️
          </div>
          <span
            style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "var(--text)",
              letterSpacing: "0.06em",
            }}
          >
            RPG Lab
          </span>
        </Link>

        {/* Card */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)",
            padding: "36px 32px",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "var(--text)",
              marginBottom: 6,
              textAlign: "center",
            }}
          >
            Criar conta
          </h1>
          <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", textAlign: "center", marginBottom: 28 }}>
            Comece gratuitamente. Sem cartão de crédito.
          </p>

          {success && (
            <div
              style={{
                padding: "10px 14px",
                background: "rgba(74,222,128,0.1)",
                border: "1px solid rgba(74,222,128,0.25)",
                borderRadius: "var(--radius)",
                fontSize: "0.84rem",
                color: "#4ade80",
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              Conta criada! Redirecionando para o login…
            </div>
          )}

          {error && (
            <div
              style={{
                padding: "10px 14px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: "var(--radius)",
                fontSize: "0.84rem",
                color: "#f87171",
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field
              label="Nome"
              type="text"
              placeholder="Seu nome"
              value={form.name}
              onChange={set("name")}
              autoComplete="name"
              required
            />
            <Field
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={set("email")}
              autoComplete="email"
              required
            />
            <Field
              label="Senha"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={form.password}
              onChange={set("password")}
              autoComplete="new-password"
              required
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4,
                padding: "12px",
                background: loading
                  ? "var(--accent-dim)"
                  : "linear-gradient(135deg, var(--accent-light) 0%, var(--accent) 100%)",
                color: loading ? "var(--accent-light)" : "#06090f",
                border: loading ? "1px solid var(--border-accent)" : "none",
                borderRadius: "var(--radius)",
                fontSize: "0.9rem",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "filter 0.2s",
                boxShadow: loading ? "none" : "0 0 20px var(--accent-glow)",
              }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.08)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1)"; }}
            >
              {loading ? "Criando conta…" : "Criar conta"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: "0.84rem", color: "var(--text-muted)", marginTop: 20 }}>
          Já tem uma conta?{" "}
          <Link href="/login" style={{ color: "var(--accent-light)", textDecoration: "none", fontWeight: 500 }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.03em" }}>
        {label}
      </label>
      <input
        {...props}
        style={{
          padding: "10px 14px",
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          color: "var(--text)",
          fontSize: "0.9rem",
          outline: "none",
          transition: "border-color 0.15s",
          width: "100%",
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--border-accent)"; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
      />
    </div>
  );
}
