import Link from "next/link";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--cream)" }}>
      <style>{`
        @media (max-width: 640px) {
          .app-nav-links { display: none !important; }
          .app-logout-text { display: none !important; }
          .app-logout-icon { display: inline !important; }
          .app-logo-tagline { display: none !important; }
          .app-main { padding-left: 1rem !important; padding-right: 1rem !important; padding-top: 1.5rem !important; padding-bottom: 1.5rem !important; }
        }
        @media (max-width: 768px) {
          .app-nav-links a { padding-left: 0.5rem !important; padding-right: 0.5rem !important; font-size: 0.8rem !important; }
        }
      `}</style>

      {/* Nav */}
      <header
        className="sticky top-0 z-20 border-b"
        style={{
          background: "var(--navy)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5" style={{ gap: "0.5rem" }}>
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5"
            style={{ textDecoration: "none", flexShrink: 0 }}
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg font-bold text-white"
              style={{ background: "var(--accent)", fontFamily: "var(--font-syne)", fontSize: "0.6rem", letterSpacing: "0.02em", flexShrink: 0 }}
            >
              BB
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
              <span style={{ fontFamily: "var(--font-syne)", fontSize: "0.875rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1 }}>
                Beyond Booked
              </span>
              <span className="app-logo-tagline" style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.4)", fontWeight: 500, lineHeight: 1 }}>
                The Party Rental Content Engine
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            <nav className="app-nav-links flex items-center gap-1 mr-3">
              {[
                { href: "/generator", label: "Generator" },
                { href: "/profile", label: "Profile" },
                { href: "/history", label: "History" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="nav-link rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-colors"
                style={{
                  borderColor: "rgba(255,255,255,0.2)",
                  color: "rgba(255,255,255,0.8)",
                  background: "transparent",
                }}
              >
                <span className="app-logout-text">Log out</span>
                <span className="app-logout-icon" style={{ display: "none" }}>↩</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="app-main mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        {children}
      </main>
    </div>
  );
}
