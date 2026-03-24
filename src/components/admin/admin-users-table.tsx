"use client";

import { useEffect, useState } from "react";

type UserRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  business_name: string;
  city: string;
  email: string;
  trial_runs_used: number;
  is_admin: boolean;
  is_support_admin: boolean;
  account_role: "owner" | "worker";
  created_at: string;
};

type Props = {
  users: UserRow[];
  currentUserId: string;
  /** Super admins can delete, impersonate, reset trials, promote admins/support. Support admins are read-only. */
  canFullAdmin: boolean;
};

function roleLabel(u: UserRow): string {
  if (u.is_admin) return "Super admin";
  if (u.is_support_admin) return "Support";
  if (u.account_role === "worker") return "Worker";
  return "Owner";
}

export function AdminUsersTable({ users: initial, currentUserId, canFullAdmin }: Props) {
  const [users, setUsers] = useState(initial);
  const [loading, setLoading] = useState<Record<string, string>>({}); // id → action

  useEffect(() => {
    setUsers(initial);
  }, [initial]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [impersonateLink, setImpersonateLink] = useState<{ link: string; email: string } | null>(null);

  async function deleteUser(id: string) {
    setLoading((p) => ({ ...p, [id]: "delete" }));
    const res = await fetch("/api/admin/delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id }),
    });
    if (res.ok) {
      setUsers((p) => p.filter((u) => u.id !== id));
    } else {
      const { error } = await res.json();
      alert(error ?? "Delete failed");
    }
    setLoading((p) => { const n = { ...p }; delete n[id]; return n; });
    setConfirmDelete(null);
  }

  async function toggleAdmin(id: string, current: boolean) {
    setLoading((p) => ({ ...p, [id]: "admin" }));
    const res = await fetch("/api/admin/toggle-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id, isAdmin: !current }),
    });
    if (res.ok) {
      setUsers((p) => p.map((u) => u.id === id ? { ...u, is_admin: !current } : u));
    } else {
      const { error } = await res.json();
      alert(error ?? "Update failed");
    }
    setLoading((p) => { const n = { ...p }; delete n[id]; return n; });
  }

  async function impersonate(id: string) {
    setLoading((p) => ({ ...p, [id]: "impersonate" }));
    const res = await fetch("/api/admin/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id }),
    });
    const data = await res.json();
    if (res.ok) {
      setImpersonateLink({ link: data.link, email: data.email });
    } else {
      alert(data.error ?? "Failed to generate link");
    }
    setLoading((p) => { const n = { ...p }; delete n[id]; return n; });
  }

  async function resetTrial(id: string) {
    setLoading((p) => ({ ...p, [id]: "reset" }));
    const res = await fetch("/api/admin/reset-trial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id }),
    });
    if (res.ok) {
      setUsers((p) => p.map((u) => u.id === id ? { ...u, trial_runs_used: 0 } : u));
    } else {
      const { error } = await res.json();
      alert(error ?? "Reset failed");
    }
    setLoading((p) => { const n = { ...p }; delete n[id]; return n; });
  }

  async function toggleSupport(id: string, current: boolean) {
    setLoading((p) => ({ ...p, [id]: "support" }));
    const res = await fetch("/api/admin/toggle-support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id, isSupportAdmin: !current }),
    });
    if (res.ok) {
      setUsers((p) => p.map((u) => (u.id === id ? { ...u, is_support_admin: !current } : u)));
    } else {
      const { error } = await res.json();
      alert(error ?? "Update failed");
    }
    setLoading((p) => { const n = { ...p }; delete n[id]; return n; });
  }

  return (
    <>
      <style>{`
        .admin-table-wrap { overflow-x: auto; border-radius: 1.25rem; border: 1px solid var(--border); }
        .admin-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
        .admin-table th { background: var(--navy); color: rgba(255,255,255,0.5); font-size: 0.6rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 0.75rem 1rem; text-align: left; white-space: nowrap; }
        .admin-table td { padding: 0.875rem 1rem; border-bottom: 1px solid var(--border); vertical-align: middle; color: var(--navy); }
        .admin-table tr:last-child td { border-bottom: none; }
        .admin-table tr:hover td { background: var(--muted); }
        .admin-badge { display: inline-flex; align-items: center; padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.05em; }
        .admin-btn { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.3rem 0.7rem; border-radius: 0.5rem; font-size: 0.72rem; font-weight: 600; border: 1px solid; cursor: pointer; font-family: var(--font-dm-sans); transition: opacity 0.15s; }
        .admin-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .admin-btn:hover:not(:disabled) { opacity: 0.8; }
        .admin-btn-danger { background: rgba(255,88,51,0.06); border-color: rgba(255,88,51,0.3); color: #ff5833; }
        .admin-btn-neutral { background: var(--muted); border-color: var(--border); color: var(--navy); }
        .admin-btn-gold { background: rgba(221,171,44,0.08); border-color: rgba(221,171,44,0.3); color: #b08a1a; }
        .confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .confirm-box { background: #fff; border-radius: 1.25rem; padding: 2rem; max-width: 400px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
      `}</style>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="confirm-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "1.1rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.75rem" }}>
              Delete this account?
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--muted-fg)", lineHeight: 1.6, marginBottom: "1.5rem" }}>
              This permanently deletes the user and all their data. This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button className="admin-btn admin-btn-neutral" onClick={() => setConfirmDelete(null)}>
                Cancel
              </button>
              <button
                className="admin-btn admin-btn-danger"
                disabled={!!loading[confirmDelete]}
                onClick={() => deleteUser(confirmDelete)}
                style={{ background: "#ff5833", color: "#fff", borderColor: "#ff5833" }}
              >
                {loading[confirmDelete] === "delete" ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Impersonate link modal */}
      {impersonateLink && (
        <div className="confirm-overlay" onClick={() => setImpersonateLink(null)}>
          <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "1.1rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.5rem" }}>
              Login as {impersonateLink.email}
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--muted-fg)", lineHeight: 1.6, marginBottom: "1rem" }}>
              Copy this link and open it in an <strong>incognito / private window</strong> so you don't get logged out of your own account. It expires after one use.
            </p>
            <div style={{
              background: "var(--muted)",
              border: "1px solid var(--border)",
              borderRadius: "0.625rem",
              padding: "0.625rem 0.875rem",
              fontSize: "0.72rem",
              color: "var(--muted-fg)",
              wordBreak: "break-all",
              marginBottom: "1.25rem",
              fontFamily: "monospace",
            }}>
              {impersonateLink.link}
            </div>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button className="admin-btn admin-btn-neutral" onClick={() => setImpersonateLink(null)}>
                Close
              </button>
              <button
                className="admin-btn admin-btn-neutral"
                onClick={() => void navigator.clipboard.writeText(impersonateLink.link)}
                style={{ background: "var(--navy)", color: "#fff", borderColor: "var(--navy)" }}
              >
                Copy link
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-table-wrap animate-fade-up">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Business</th>
              <th>Email</th>
              <th>City</th>
              <th>Trial runs</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                  {u.first_name || u.last_name
                    ? `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim()
                    : <span style={{ color: "var(--muted-fg)", fontStyle: "italic" }}>No name</span>}
                </td>
                <td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {u.business_name || <span style={{ color: "var(--muted-fg)", fontStyle: "italic" }}>—</span>}
                </td>
                <td style={{ color: "var(--muted-fg)", whiteSpace: "nowrap" }}>{u.email}</td>
                <td style={{ whiteSpace: "nowrap" }}>{u.city || <span style={{ color: "var(--muted-fg)" }}>—</span>}</td>
                <td>
                  <span
                    className="admin-badge"
                    style={{
                      background: u.trial_runs_used >= 1 ? "rgba(255,88,51,0.08)" : "rgba(16,23,44,0.05)",
                      color: u.trial_runs_used >= 1 ? "#ff5833" : "var(--muted-fg)",
                    }}
                  >
                    {u.trial_runs_used} used
                  </span>
                </td>
                <td>
                  <span
                    className="admin-badge"
                    style={{
                      background:
                        u.is_admin
                          ? "rgba(221,171,44,0.12)"
                          : u.is_support_admin
                            ? "rgba(59,130,246,0.1)"
                            : u.account_role === "worker"
                              ? "rgba(16,23,44,0.06)"
                              : "rgba(16,23,44,0.04)",
                      color:
                        u.is_admin ? "#b08a1a" : u.is_support_admin ? "#2563eb" : "var(--muted-fg)",
                    }}
                  >
                    {roleLabel(u)}
                  </span>
                </td>
                <td style={{ color: "var(--muted-fg)", whiteSpace: "nowrap" }}>
                  {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td>
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
                    {u.id === currentUserId && (
                      <span style={{ fontSize: "0.7rem", color: "var(--muted-fg)", fontStyle: "italic" }}>You</span>
                    )}
                    {!canFullAdmin && (
                      <span style={{ fontSize: "0.7rem", color: "var(--muted-fg)", fontStyle: "italic" }}>View only</span>
                    )}
                    {canFullAdmin && u.id !== currentUserId && (
                      <>
                        <button
                          className="admin-btn admin-btn-neutral"
                          disabled={!!loading[u.id]}
                          onClick={() => impersonate(u.id)}
                          title="Login as this user"
                        >
                          {loading[u.id] === "impersonate" ? "…" : "Login as"}
                        </button>
                        {!u.is_admin && u.trial_runs_used > 0 && (
                          <button
                            className="admin-btn admin-btn-neutral"
                            disabled={!!loading[u.id]}
                            onClick={() => resetTrial(u.id)}
                            title="Reset trial to 0"
                          >
                            {loading[u.id] === "reset" ? "…" : "↺ Reset"}
                          </button>
                        )}
                        <button
                          className="admin-btn admin-btn-gold"
                          disabled={!!loading[u.id]}
                          onClick={() => toggleAdmin(u.id, u.is_admin)}
                          title={u.is_admin ? "Remove admin" : "Make admin"}
                        >
                          {loading[u.id] === "admin" ? "…" : u.is_admin ? "Revoke admin" : "Make admin"}
                        </button>
                        {!u.is_admin && u.account_role === "owner" && (
                          <button
                            className="admin-btn admin-btn-neutral"
                            disabled={!!loading[u.id]}
                            onClick={() => toggleSupport(u.id, u.is_support_admin)}
                            title={u.is_support_admin ? "Remove support access" : "Grant read-only admin"}
                          >
                            {loading[u.id] === "support"
                              ? "…"
                              : u.is_support_admin
                                ? "Revoke support"
                                : "Make support"}
                          </button>
                        )}
                        <button
                          className="admin-btn admin-btn-danger"
                          disabled={!!loading[u.id]}
                          onClick={() => setConfirmDelete(u.id)}
                          title="Delete user"
                        >
                          {loading[u.id] === "delete" ? "…" : "Delete"}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
