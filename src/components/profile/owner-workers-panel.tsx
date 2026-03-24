"use client";

import { useCallback, useEffect, useState } from "react";

type WorkerRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  created_at: string;
};

export function OwnerWorkersPanel() {
  const [workers, setWorkers] = useState<WorkerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formMsg, setFormMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/owner/workers");
      const data = (await res.json()) as { workers?: WorkerRow[]; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not load team");
        setWorkers([]);
        return;
      }
      setWorkers(data.workers ?? []);
    } catch {
      setError("Could not load team");
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormMsg(null);
    setBusy("create");
    try {
      const res = await fetch("/api/owner/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setFormMsg({ ok: false, text: data.error ?? "Could not create worker" });
        return;
      }
      setFormMsg({ ok: true, text: "Worker can log in with that email and password. They only see Field capture." });
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      await load();
    } catch {
      setFormMsg({ ok: false, text: "Something went wrong" });
    } finally {
      setBusy(null);
    }
  }

  async function onRemove(id: string) {
    if (!window.confirm("Remove this worker login? Their saved field captures stay in your history.")) return;
    setBusy(id);
    try {
      const res = await fetch("/api/owner/workers/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        window.alert(data.error ?? "Remove failed");
        return;
      }
      await load();
    } catch {
      window.alert("Remove failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div
      className="animate-fade-up mt-10 rounded-2xl border p-6 sm:p-8"
      style={{ borderColor: "var(--border)", background: "var(--card)" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
        <div style={{ width: 32, height: 3, background: "var(--accent)", borderRadius: 2 }} />
        <span
          style={{
            fontSize: "0.65rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--muted-fg)",
          }}
        >
          Field team
        </span>
      </div>
      <h2
        style={{
          fontFamily: "var(--font-syne)",
          fontSize: "1.35rem",
          fontWeight: 800,
          color: "var(--navy)",
          marginBottom: "0.35rem",
        }}
      >
        Worker logins (no extra charge)
      </h2>
      <p style={{ fontSize: "0.875rem", color: "var(--muted-fg)", lineHeight: 1.6, marginBottom: "1.25rem" }}>
        Add crew accounts that can only use <strong>Field capture</strong> — no generator, billing, or admin. Share the login or have them add the field URL to their home screen.
      </p>

      {error && (
        <p style={{ fontSize: "0.85rem", color: "#b91c1c", marginBottom: "1rem" }}>{error}</p>
      )}

      <form onSubmit={(e) => void onCreate(e)} style={{ marginBottom: "2rem" }}>
        <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
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
        {formMsg && (
          <p style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: formMsg.ok ? "#15803d" : "#b91c1c" }}>{formMsg.text}</p>
        )}
        <button
          type="submit"
          disabled={busy === "create"}
          className="mt-4 rounded-xl px-5 py-2.5 text-sm font-bold text-white"
          style={{ background: "var(--accent)", fontFamily: "var(--font-syne)", opacity: busy === "create" ? 0.7 : 1 }}
        >
          {busy === "create" ? "Adding…" : "Add worker"}
        </button>
      </form>

      <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "1rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.75rem" }}>
        Active workers
      </h3>
      {loading ? (
        <p style={{ fontSize: "0.85rem", color: "var(--muted-fg)" }}>Loading…</p>
      ) : workers.length === 0 ? (
        <p style={{ fontSize: "0.85rem", color: "var(--muted-fg)" }}>No worker logins yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {workers.map((w) => (
            <li
              key={w.id}
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.5rem",
                padding: "0.65rem 0.85rem",
                borderRadius: "0.75rem",
                border: "1px solid var(--border)",
                fontSize: "0.85rem",
              }}
            >
              <div>
                <span style={{ fontWeight: 600, color: "var(--navy)" }}>
                  {[w.first_name, w.last_name].filter(Boolean).join(" ") || "Worker"}
                </span>
                <span style={{ color: "var(--muted-fg)", marginLeft: "0.5rem" }}>{w.email}</span>
              </div>
              <button
                type="button"
                className="rounded-lg border px-2.5 py-1 text-xs font-semibold"
                style={{ borderColor: "rgba(255,88,51,0.35)", color: "#ff5833" }}
                disabled={busy === w.id}
                onClick={() => void onRemove(w.id)}
              >
                {busy === w.id ? "…" : "Remove"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
