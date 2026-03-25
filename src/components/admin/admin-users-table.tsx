"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

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

function displayName(u: UserRow): string {
  if (u.first_name || u.last_name) return `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim();
  return "";
}

function EllipsisCell({ children, title, maxWidth }: { children: ReactNode; title?: string; maxWidth: number }) {
  return (
    <span
      title={title}
      style={{
        display: "block",
        maxWidth,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

type RowMenuProps = {
  u: UserRow;
  currentUserId: string;
  canFullAdmin: boolean;
  loading: Record<string, string>;
  onImpersonate: (id: string) => void;
  onResetTrial: (id: string) => void;
  onToggleAdmin: (id: string, current: boolean) => void;
  onToggleSupport: (id: string, current: boolean) => void;
  onConfirmDelete: (id: string) => void;
};

function RowActionsMenu({
  u,
  currentUserId,
  canFullAdmin,
  loading,
  onImpersonate,
  onResetTrial,
  onToggleAdmin,
  onToggleSupport,
  onConfirmDelete,
}: RowMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const busy = !!loading[u.id];

  if (u.id === currentUserId) {
    return <span style={{ fontSize: "0.68rem", color: "var(--muted-fg)", fontStyle: "italic" }}>You</span>;
  }

  if (!canFullAdmin) {
    return <span style={{ fontSize: "0.68rem", color: "var(--muted-fg)", fontStyle: "italic" }}>View only</span>;
  }

  return (
    <div ref={wrapRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        className="admin-actions-trigger"
        disabled={busy}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {busy ? "…" : "Actions"}
        <span style={{ marginLeft: "0.2rem", opacity: 0.7 }} aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <div className="admin-actions-menu" role="menu">
          <button
            type="button"
            className="admin-actions-item"
            role="menuitem"
            disabled={busy}
            onClick={() => {
              setOpen(false);
              onImpersonate(u.id);
            }}
          >
            Login as user
          </button>
          {!u.is_admin && u.trial_runs_used > 0 && (
            <button
              type="button"
              className="admin-actions-item"
              role="menuitem"
              disabled={busy}
              onClick={() => {
                setOpen(false);
                onResetTrial(u.id);
              }}
            >
              Reset trial
            </button>
          )}
          <button
            type="button"
            className="admin-actions-item"
            role="menuitem"
            disabled={busy}
            onClick={() => {
              setOpen(false);
              onToggleAdmin(u.id, u.is_admin);
            }}
          >
            {u.is_admin ? "Revoke platform admin" : "Make platform admin"}
          </button>
          {!u.is_admin && u.account_role === "owner" && (
            <button
              type="button"
              className="admin-actions-item"
              role="menuitem"
              disabled={busy}
              onClick={() => {
                setOpen(false);
                onToggleSupport(u.id, u.is_support_admin);
              }}
            >
              {u.is_support_admin ? "Revoke support access" : "Grant support (read-only admin)"}
            </button>
          )}
          <button
            type="button"
            className="admin-actions-item admin-actions-item-danger"
            role="menuitem"
            disabled={busy}
            onClick={() => {
              setOpen(false);
              onConfirmDelete(u.id);
            }}
          >
            Delete account
          </button>
        </div>
      )}
    </div>
  );
}

export function AdminUsersTable({ users: initial, currentUserId, canFullAdmin }: Props) {
  const [users, setUsers] = useState(initial);
  const [loading, setLoading] = useState<Record<string, string>>({});

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
    setLoading((p) => {
      const n = { ...p };
      delete n[id];
      return n;
    });
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
      setUsers((p) => p.map((u) => (u.id === id ? { ...u, is_admin: !current } : u)));
    } else {
      const { error } = await res.json();
      alert(error ?? "Update failed");
    }
    setLoading((p) => {
      const n = { ...p };
      delete n[id];
      return n;
    });
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
    setLoading((p) => {
      const n = { ...p };
      delete n[id];
      return n;
    });
  }

  async function resetTrial(id: string) {
    setLoading((p) => ({ ...p, [id]: "reset" }));
    const res = await fetch("/api/admin/reset-trial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id }),
    });
    if (res.ok) {
      setUsers((p) => p.map((u) => (u.id === id ? { ...u, trial_runs_used: 0 } : u)));
    } else {
      const { error } = await res.json();
      alert(error ?? "Reset failed");
    }
    setLoading((p) => {
      const n = { ...p };
      delete n[id];
      return n;
    });
  }

  async function toggleSupport(id: string, current: boolean) {
    setLoading((p) => ({ ...p, [id]: "support" }));
    const res = await fetch("/api/admin/toggle-support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id, isSupportAdmin: !current }),
    });
    if (res.ok) {
      setUsers((p) => p.map((row) => (row.id === id ? { ...row, is_support_admin: !current } : row)));
    } else {
      const { error } = await res.json();
      alert(error ?? "Update failed");
    }
    setLoading((p) => {
      const n = { ...p };
      delete n[id];
      return n;
    });
  }

  return (
    <>
      <style>{`
        .admin-table-wrap {
          overflow-x: auto;
          border-radius: 1rem;
          border: 1px solid var(--border);
          background: var(--card);
          box-shadow: 0 1px 3px rgba(16, 23, 44, 0.06);
        }
        .admin-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; table-layout: fixed; }
        .admin-table th {
          background: var(--navy);
          color: rgba(255,255,255,0.55);
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.5rem 0.6rem;
          text-align: left;
          white-space: nowrap;
          position: sticky;
          top: 0;
          z-index: 1;
        }
        .admin-table td {
          padding: 0.45rem 0.6rem;
          border-bottom: 1px solid var(--border);
          vertical-align: middle;
          color: var(--navy);
          line-height: 1.35;
        }
        .admin-table tr:last-child td { border-bottom: none; }
        .admin-table tbody tr:hover td { background: rgba(16, 23, 44, 0.03); }
        .admin-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.12rem 0.45rem;
          border-radius: 9999px;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.03em;
        }
        .admin-actions-trigger {
          display: inline-flex;
          align-items: center;
          padding: 0.28rem 0.55rem;
          border-radius: 0.45rem;
          font-size: 0.68rem;
          font-weight: 600;
          border: 1px solid var(--border);
          background: var(--muted);
          color: var(--navy);
          cursor: pointer;
          font-family: var(--font-dm-sans);
        }
        .admin-actions-trigger:hover:not(:disabled) { background: rgba(16,23,44,0.06); }
        .admin-actions-trigger:disabled { opacity: 0.45; cursor: not-allowed; }
        .admin-actions-menu {
          position: absolute;
          right: 0;
          top: 100%;
          margin-top: 0.25rem;
          min-width: 11.5rem;
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 0.65rem;
          box-shadow: 0 10px 40px rgba(16, 23, 44, 0.12);
          padding: 0.35rem;
          z-index: 50;
        }
        .admin-actions-item {
          display: block;
          width: 100%;
          text-align: left;
          padding: 0.45rem 0.65rem;
          border: none;
          border-radius: 0.45rem;
          background: transparent;
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--navy);
          cursor: pointer;
          font-family: var(--font-dm-sans);
        }
        .admin-actions-item:hover:not(:disabled) { background: var(--muted); }
        .admin-actions-item:disabled { opacity: 0.45; cursor: not-allowed; }
        .admin-actions-item-danger { color: #ff5833; }
        .admin-actions-item-danger:hover:not(:disabled) { background: rgba(255,88,51,0.08); }
        .admin-btn { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.3rem 0.7rem; border-radius: 0.5rem; font-size: 0.72rem; font-weight: 600; border: 1px solid; cursor: pointer; font-family: var(--font-dm-sans); transition: opacity 0.15s; }
        .admin-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .admin-btn:hover:not(:disabled) { opacity: 0.8; }
        .admin-btn-danger { background: rgba(255,88,51,0.06); border-color: rgba(255,88,51,0.3); color: #ff5833; }
        .admin-btn-neutral { background: var(--muted); border-color: var(--border); color: var(--navy); }
        .confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .confirm-box { background: #fff; border-radius: 1.25rem; padding: 2rem; max-width: 400px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
        .admin-col-user { width: 14%; }
        .admin-col-business { width: 15%; }
        .admin-col-email { width: 22%; }
        .admin-col-city { width: 14%; }
        .admin-col-trial { width: 8%; }
        .admin-col-role { width: 11%; }
        .admin-col-joined { width: 9%; }
        .admin-col-actions { width: 7%; }
        @media (max-width: 1100px) {
          .admin-table { table-layout: auto; min-width: 920px; }
        }
      `}</style>

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

      {impersonateLink && (
        <div className="confirm-overlay" onClick={() => setImpersonateLink(null)}>
          <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "1.1rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.5rem" }}>
              Login as {impersonateLink.email}
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--muted-fg)", lineHeight: 1.6, marginBottom: "1rem" }}>
              Copy this link and open it in an <strong>incognito / private window</strong> so you don&apos;t get logged out of your own account. It expires after one use.
            </p>
            <div
              style={{
                background: "var(--muted)",
                border: "1px solid var(--border)",
                borderRadius: "0.625rem",
                padding: "0.625rem 0.875rem",
                fontSize: "0.72rem",
                color: "var(--muted-fg)",
                wordBreak: "break-all",
                marginBottom: "1.25rem",
                fontFamily: "monospace",
              }}
            >
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
              <th className="admin-col-user">User</th>
              <th className="admin-col-business">Business</th>
              <th className="admin-col-email">Email</th>
              <th className="admin-col-city">City / area</th>
              <th className="admin-col-trial">Trial</th>
              <th className="admin-col-role">Role</th>
              <th className="admin-col-joined">Joined</th>
              <th className="admin-col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const name = displayName(u);
              const cityRaw = u.city?.trim() || "";
              const cityDisplay = cityRaw || "—";
              return (
                <tr key={u.id}>
                  <td className="admin-col-user" style={{ fontWeight: 600 }}>
                    {name ? (
                      <EllipsisCell title={name} maxWidth={160}>
                        {name}
                      </EllipsisCell>
                    ) : (
                      <span style={{ color: "var(--muted-fg)", fontStyle: "italic" }}>No name</span>
                    )}
                  </td>
                  <td className="admin-col-business">
                    <EllipsisCell title={u.business_name || undefined} maxWidth={200}>
                      {u.business_name || <span style={{ color: "var(--muted-fg)", fontStyle: "italic" }}>—</span>}
                    </EllipsisCell>
                  </td>
                  <td className="admin-col-email" style={{ color: "var(--muted-fg)" }}>
                    <EllipsisCell title={u.email} maxWidth={260}>
                      {u.email}
                    </EllipsisCell>
                  </td>
                  <td className="admin-col-city" style={{ color: cityRaw ? "var(--navy)" : "var(--muted-fg)" }}>
                    <EllipsisCell title={cityRaw || undefined} maxWidth={180}>
                      {cityDisplay}
                    </EllipsisCell>
                  </td>
                  <td className="admin-col-trial">
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
                  <td className="admin-col-role">
                    <span
                      className="admin-badge"
                      style={{
                        background: u.is_admin
                          ? "rgba(221,171,44,0.12)"
                          : u.is_support_admin
                            ? "rgba(59,130,246,0.1)"
                            : u.account_role === "worker"
                              ? "rgba(139,92,246,0.1)"
                              : "rgba(16,23,44,0.04)",
                        color: u.is_admin ? "#b08a1a" : u.is_support_admin ? "#2563eb" : u.account_role === "worker" ? "#6d28d9" : "var(--muted-fg)",
                      }}
                    >
                      {roleLabel(u)}
                    </span>
                  </td>
                  <td className="admin-col-joined" style={{ color: "var(--muted-fg)", whiteSpace: "nowrap" }}>
                    {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="admin-col-actions" style={{ textAlign: "right" }}>
                    <RowActionsMenu
                      u={u}
                      currentUserId={currentUserId}
                      canFullAdmin={canFullAdmin}
                      loading={loading}
                      onImpersonate={impersonate}
                      onResetTrial={resetTrial}
                      onToggleAdmin={toggleAdmin}
                      onToggleSupport={toggleSupport}
                      onConfirmDelete={setConfirmDelete}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
