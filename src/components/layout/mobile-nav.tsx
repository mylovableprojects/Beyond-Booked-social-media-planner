"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/generator", label: "Generator" },
  { href: "/profile", label: "Profile" },
  { href: "/history", label: "History" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <style>{`
        .mobile-nav-btn { display: none; }
        @media (max-width: 640px) {
          .mobile-nav-btn { display: flex !important; }
        }
        .mobile-menu-overlay {
          position: fixed;
          inset: 0;
          z-index: 40;
          background: rgba(0,0,0,0.45);
        }
        .mobile-menu-panel {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 260px;
          z-index: 50;
          background: var(--navy);
          border-left: 1px solid rgba(255,255,255,0.1);
          display: flex;
          flex-direction: column;
          padding: 1.5rem 1.25rem;
          gap: 0.25rem;
        }
        .mobile-menu-link {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          font-family: var(--font-dm-sans);
          font-size: 0.95rem;
          font-weight: 600;
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }
        .mobile-menu-link:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .mobile-menu-link.active { background: rgba(255,88,51,0.12); color: #ff5833; }
        .mobile-menu-close {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }
      `}</style>

      {/* Hamburger button — only visible on mobile */}
      <button
        className="mobile-nav-btn"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        style={{
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 36,
          borderRadius: "0.625rem",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
          cursor: "pointer",
          flexDirection: "column",
          gap: 4,
          padding: 0,
        }}
      >
        <span style={{ display: "block", width: 16, height: 1.5, background: "rgba(255,255,255,0.85)", borderRadius: 2 }} />
        <span style={{ display: "block", width: 16, height: 1.5, background: "rgba(255,255,255,0.85)", borderRadius: 2 }} />
        <span style={{ display: "block", width: 11, height: 1.5, background: "rgba(255,255,255,0.85)", borderRadius: 2, alignSelf: "flex-start", marginLeft: "10px" }} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="mobile-menu-overlay" onClick={() => setOpen(false)} />

          {/* Slide-in panel */}
          <div className="mobile-menu-panel">
            {/* Header row */}
            <div className="mobile-menu-close">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span
                  style={{
                    display: "flex",
                    width: 26,
                    height: 26,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "0.5rem",
                    background: "var(--accent)",
                    fontFamily: "var(--font-syne)",
                    fontSize: "0.55rem",
                    fontWeight: 800,
                    color: "#fff",
                    letterSpacing: "0.02em",
                  }}
                >
                  BB
                </span>
                <span style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "0.875rem", color: "#fff" }}>
                  Beyond Booked
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "none",
                  borderRadius: "0.5rem",
                  width: 30,
                  height: 30,
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* Nav links */}
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`mobile-menu-link${pathname === href ? " active" : ""}`}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "0.75rem 0" }} />

            {/* Logout */}
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                style={{
                  width: "100%",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "0.75rem",
                  background: "transparent",
                  border: "none",
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.45)",
                  cursor: "pointer",
                }}
              >
                ↩ Log out
              </button>
            </form>
          </div>
        </>
      )}
    </>
  );
}
