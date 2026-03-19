import Link from "next/link";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--cream)" }}>
      {/* Nav */}
      <header
        className="sticky top-0 z-20 border-b"
        style={{
          background: "var(--navy)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 font-display text-white"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white"
              style={{ background: "var(--accent)" }}
            >
              PR
            </span>
            <span className="text-sm font-semibold tracking-tight">
              Party Rental Toolkit
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <nav className="flex items-center gap-1 mr-3">
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
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        {children}
      </main>
    </div>
  );
}
