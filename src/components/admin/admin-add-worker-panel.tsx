"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type EmployerOption = { id: string; label: string };

type Props = {
  employers: EmployerOption[];
  /** False when DB is missing worker columns (employer_profile_id, etc.) */
  workerSchemaReady: boolean;
};

export function AdminAddWorkerPanel({ employers, workerSchemaReady }: Props) {
  const router = useRouter();
  const [employerId, setEmployerId] = useState(employers[0]?.id ?? "");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!employerId) {
      setMsg({ ok: false, text: "Select a business owner first." });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/create-worker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employerProfileId: employerId,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; hint?: string };
      if (!res.ok) {
        setMsg({
          ok: false,
          text: [data.error, data.hint].filter(Boolean).join(" "),
        });
        return;
      }
      setMsg({ ok: true, text: "Worker created. They only see Field capture when they log in." });
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      router.refresh();
    } catch {
      setMsg({ ok: false, text: "Request failed." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="animate-fade-up mb-8 rounded-2xl border p-5 sm:p-6"
      style={{ borderColor: "var(--border)", background: "var(--card)" }}
    >
      <p
        style={{
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--muted-fg)",
          marginBottom: "0.35rem",
        }}
      >
        Add account
      </p>
      <h2
        style={{
          fontFamily: "var(--font-syne)",
          fontSize: "1.15rem",
          fontWeight: 800,
          color: "var(--navy)",
          marginBottom: "0.35rem",
        }}
      >
        Field worker
      </h2>
      <p style={{ fontSize: "0.82rem", color: "var(--muted-fg)", lineHeight: 1.6, marginBottom: "1rem" }}>
        Assign a crew login to a business. They get <strong>Field capture</strong> only (no generator, billing, or this admin area).{" "}
        <strong>Platform admin / support:</strong> use the table below — <em>Make admin</em> or <em>Make support</em>. New business owners still use{" "}
        <strong>Sign up</strong> on the marketing site.
      </p>

      {!workerSchemaReady && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.75rem 1rem",
            borderRadius: "0.75rem",
            background: "rgba(220,38,38,0.08)",
            border: "1px solid rgba(220,38,38,0.25)",
            fontSize: "0.82rem",
            color: "#991b1b",
            lineHeight: 1.5,
          }}
        >
          Database is missing worker columns. In Supabase → SQL Editor, run{" "}
          <code style={{ fontSize: "0.75rem" }}>supabase/migrations/202603260001_account_roles_workers_support.sql</code>, then refresh.
        </div>
      )}

      <form onSubmit={(e) => void onSubmit(e)} style={{ opacity: workerSchemaReady ? 1 : 0.5, pointerEvents: workerSchemaReady ? "auto" : "none" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginBottom: "0.75rem" }}>
          <span style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", color: "var(--muted-fg)" }}>
            Business owner (employer)
          </span>
          <select
            required
            value={employerId}
            onChange={(e) => setEmployerId(e.target.value)}
            className="rounded-xl border px-3 py-2 text-sm"
            style={{ borderColor: "var(--border)", maxWidth: "100%" }}
          >
            {employers.length === 0 ? (
              <option value="">No owner accounts loaded</option>
            ) : (
              employers.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))
            )}
          </select>
        </label>

        <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", marginBottom: "0.75rem" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <span style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", color: "var(--muted-fg)" }}>First name</span>
            <input
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="rounded-xl border px-3 py-2 text-sm"
              style={{ borderColor: "var(--border)" }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <span style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", color: "var(--muted-fg)" }}>Last name</span>
            <input
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="rounded-xl border px-3 py-2 text-sm"
              style={{ borderColor: "var(--border)" }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <span style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", color: "var(--muted-fg)" }}>Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border px-3 py-2 text-sm"
              style={{ borderColor: "var(--border)" }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <span style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", color: "var(--muted-fg)" }}>Password</span>
            <input
              required
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border px-3 py-2 text-sm"
              style={{ borderColor: "var(--border)" }}
              placeholder="Min 8 characters"
            />
          </label>
        </div>

        {msg && (
          <p style={{ fontSize: "0.85rem", marginBottom: "0.75rem", color: msg.ok ? "#15803d" : "#b91c1c" }}>{msg.text}</p>
        )}

        <button
          type="submit"
          disabled={busy || employers.length === 0}
          className="rounded-xl px-5 py-2.5 text-sm font-bold text-white"
          style={{ background: "var(--accent)", fontFamily: "var(--font-syne)", opacity: busy ? 0.7 : 1 }}
        >
          {busy ? "Creating…" : "Create field worker"}
        </button>
      </form>
    </div>
  );
}
