"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "Email ou senha incorretos.",
  Default: "Ocorreu um erro. Tente novamente.",
};

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";

  const urlError = params.get("error");
  const [form, setForm]   = useState({ email: "", password: "" });
  const [error, setError] = useState(urlError ? (ERROR_MESSAGES[urlError] ?? ERROR_MESSAGES.Default) : "");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError(ERROR_MESSAGES[result.code ?? ""] ?? ERROR_MESSAGES.Default);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
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
        background: "var(--bg)",
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

      <div style={{ width: "100%", maxWidth: 400, position: "relative", zIndex: 1 }}>
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
            Bem-vindo de volta
          </h1>
          <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", textAlign: "center", marginBottom: 28 }}>
            Entre para acessar suas fichas.
          </p>

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
              placeholder="Sua senha"
              value={form.password}
              onChange={set("password")}
              autoComplete="current-password"
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
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: "0.84rem", color: "var(--text-muted)", marginTop: 20 }}>
          Não tem uma conta?{" "}
          <Link href="/register" style={{ color: "var(--accent-light)", textDecoration: "none", fontWeight: 500 }}>
            Criar conta grátis
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
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
