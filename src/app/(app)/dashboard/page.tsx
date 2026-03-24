import Link from "next/link";

import { requireUser } from "@/lib/auth/session";
import { isWorkerAccount } from "@/lib/auth/account-roles";
import { getProfileWithLibraries } from "@/services/repositories/profiles.repository";

export default async function DashboardPage() {
  const user = await requireUser();
  const { profile, eventTypes, serviceCategories } = await getProfileWithLibraries(user.id);

  const profileComplete =
    profile &&
    profile.city &&
    profile.city.trim() !== "" &&
    eventTypes.length > 0 &&
    serviceCategories.length > 0;

  const showFieldCrewTools = Boolean(
    profile && !isWorkerAccount(profile) && !profile.is_admin && !profile.is_support_admin,
  );

  return (
    <div className="space-y-6">
      <style>{`
        @media (max-width: 640px) {
          .dash-hero { padding: 1.75rem 1.25rem !important; }
          .dash-profile-prompt { padding-left: 1.25rem !important; padding-right: 1.25rem !important; padding-top: 1.25rem !important; padding-bottom: 1.25rem !important; }
          .dash-quick-links { min-width: 0 !important; }
        }
      `}</style>

      {/* ── Profile setup prompt ── */}
      {!profileComplete && (
        <div
          className="dash-profile-prompt animate-fade-up relative overflow-hidden rounded-2xl px-8 py-7"
          style={{
            background: "linear-gradient(135deg, rgba(255,88,51,0.08) 0%, rgba(255,88,51,0.03) 100%)",
            border: "1.5px solid rgba(255,88,51,0.25)",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1.25rem", flexWrap: "wrap" }}>
            <div
              style={{
                width: 44, height: 44,
                borderRadius: "50%",
                background: "var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                fontFamily: "var(--font-syne)",
                fontSize: "1rem", fontWeight: 800, color: "#fff",
              }}
            >
              1
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <h2
                style={{
                  fontFamily: "var(--font-syne)",
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  color: "var(--navy)",
                  letterSpacing: "-0.01em",
                  marginBottom: "0.35rem",
                }}
              >
                Set up your profile before generating
              </h2>
              <p style={{ fontSize: "0.875rem", color: "var(--muted-fg)", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                Add your city, event types, and service categories. This is what makes every post sound like <em>your</em> business — not a template. Takes about 2 minutes.
              </p>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: "var(--accent)", fontFamily: "var(--font-syne)" }}
              >
                Complete your profile →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Hero header ── */}
      <div
        className="dash-hero animate-fade-up relative overflow-hidden rounded-3xl px-10 py-12"
        style={{
          background: "var(--navy)",
          boxShadow: "0 32px 80px rgba(16,23,44,0.18)",
        }}
      >
        {/* Large decorative letters */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            right: "-0.5rem",
            top: "-2rem",
            fontFamily: "var(--font-syne)",
            fontSize: "clamp(160px, 20vw, 260px)",
            fontWeight: 800,
            lineHeight: 1,
            color: "rgba(255,255,255,0.03)",
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          BB
        </div>

        <div
          style={{
            width: 40,
            height: 3,
            background: "var(--gold)",
            borderRadius: 2,
            marginBottom: "1.25rem",
          }}
        />

        <p
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--gold)", marginBottom: "0.5rem" }}
        >
          Beyond Booked
        </p>

        <h1
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            maxWidth: "26ch",
          }}
        >
          {profileComplete ? "Your posts are one click away." : "Welcome — let's get you set up."}
        </h1>

        <p
          className="mt-3 text-base"
          style={{ color: "rgba(255,255,255,0.5)", maxWidth: "44ch" }}
        >
          {profileComplete
            ? "Platform-specific copy, four writing frameworks, zero AI tell. Built for party rental pros."
            : "Complete your profile first — it's what makes the content sound like you, not a generic template."}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {profileComplete ? (
            <>
              <Link
                href="/generator"
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: "var(--accent)", letterSpacing: "0.01em" }}
              >
                Generate content
                <span aria-hidden style={{ fontSize: "1rem" }}>→</span>
              </Link>
              <Link
                href="/profile"
                className="inline-flex items-center rounded-xl border px-6 py-3 text-sm font-medium transition-opacity hover:opacity-70"
                style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.65)" }}
              >
                Edit profile
              </Link>
            </>
          ) : (
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: "var(--accent)", letterSpacing: "0.01em" }}
            >
              Complete your profile →
            </Link>
          )}
        </div>
      </div>

      {/* ── Field crew: big shortcut + home-screen hint (non-admins) ── */}
      {showFieldCrewTools && profileComplete && (
        <div
          className="animate-fade-up rounded-3xl border-2 border-amber-300/60 px-6 py-6 sm:px-8 sm:py-7"
          style={{
            background: "linear-gradient(135deg, rgba(255,200,120,0.2) 0%, rgba(255,88,51,0.08) 100%)",
            boxShadow: "0 12px 40px rgba(255, 120, 60, 0.12)",
          }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p
                className="mb-1 text-xs font-bold uppercase tracking-widest text-amber-900/70"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                Drivers &amp; setup crew
              </p>
              <h2
                className="text-xl font-extrabold sm:text-2xl"
                style={{ fontFamily: "var(--font-syne)", color: "var(--navy)" }}
              >
                Post from the job site
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-700" style={{ fontFamily: "var(--font-dm-sans)" }}>
                On your phone, use <strong>Add to Home Screen</strong> (Share on iPhone, browser menu on Android).{" "}
                The saved icon opens <strong>Field capture</strong> — log in the first time if asked, then you&apos;re set.
              </p>
            </div>
            <Link
              href="/dashboard/field-upload"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-bold text-white shadow-lg transition-opacity hover:opacity-95 sm:min-w-[200px]"
              style={{
                background: "linear-gradient(135deg, var(--accent) 0%, #e8451f 100%)",
                fontFamily: "var(--font-syne)",
                boxShadow: "0 8px 28px rgba(255, 88, 51, 0.35)",
              }}
            >
              <span aria-hidden>📸</span>
              Open field capture
            </Link>
          </div>
        </div>
      )}

      {/* ── Stats row ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Runs",       value: "0",  note: "all time"         },
          { label: "Posts Generated",  value: "0",  note: "across platforms" },
          { label: "Platforms",        value: "3",  note: "FB · IG · GBP"   },
        ].map(({ label, value, note }, i) => (
          <div
            key={label}
            className="animate-fade-up relative overflow-hidden rounded-2xl px-7 py-6"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              boxShadow: "0 4px 24px rgba(16,23,44,0.06)",
              animationDelay: `${0.08 * (i + 1)}s`,
            }}
          >
            <div
              aria-hidden
              style={{
                position: "absolute",
                top: 0, right: 0,
                width: 60, height: 60,
                background:
                  i === 2
                    ? "radial-gradient(circle at top right, rgba(221,171,44,0.12), transparent 70%)"
                    : i === 0
                    ? "radial-gradient(circle at top right, rgba(255,88,51,0.08), transparent 70%)"
                    : "radial-gradient(circle at top right, rgba(16,23,44,0.05), transparent 70%)",
                borderRadius: "0 1rem 0 0",
              }}
            />
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-fg)" }}>
              {label}
            </p>
            <p
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
                fontWeight: 800,
                color: "var(--navy)",
                lineHeight: 1,
                marginTop: "0.35rem",
                letterSpacing: "-0.03em",
              }}
            >
              {value}
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--muted-fg)" }}>{note}</p>
          </div>
        ))}
      </div>

      {/* ── Bottom two-col section ── */}
      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">

        {/* Platform status */}
        <div
          className="animate-fade-up animate-fade-up-3 rounded-2xl px-7 py-6"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            boxShadow: "0 4px 24px rgba(16,23,44,0.06)",
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-fg)" }}>
            Active Platforms
          </p>
          <div className="mt-5 space-y-3">
            {[
              { name: "Facebook",                rule: "40–80 words · no hashtags · max 2 emojis"           },
              { name: "Instagram",               rule: "100–150 words · hook first · 5–8 hashtags last line" },
              { name: "Google Business Profile", rule: "75–125 words · no emojis · city + CTA required"     },
            ].map(({ name, rule }) => (
              <div
                key={name}
                className="flex items-start gap-3 rounded-xl px-4 py-3"
                style={{ background: "var(--muted)" }}
              >
                <span
                  style={{
                    marginTop: 3, width: 8, height: 8,
                    borderRadius: "50%", background: "var(--accent)", flexShrink: 0,
                  }}
                />
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--navy)", fontFamily: "var(--font-syne)" }}>
                    {name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-fg)" }}>{rule}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div
          className="dash-quick-links animate-fade-up animate-fade-up-4 flex flex-col gap-3 rounded-2xl px-7 py-6"
          style={{
            background: "var(--navy)",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 4px 24px rgba(16,23,44,0.12)",
            minWidth: 220,
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--gold)" }}>
            Quick Actions
          </p>
          <div className="mt-2 flex flex-col gap-2">
            {[
              { href: profileComplete ? "/generator" : "/onboarding", label: profileComplete ? "New generation" : "Complete profile", primary: true  },
              ...(showFieldCrewTools
                ? [{ href: "/dashboard/field-upload" as const, label: "📸 Field capture (mobile)", primary: false as const }]
                : []),
              { href: "/profile",   label: "Update profile", primary: false },
              { href: "/history",   label: "View history",   primary: false },
            ].map(({ href, label, primary }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-opacity hover:opacity-80"
                style={
                  primary
                    ? { background: "var(--accent)", color: "#fff", fontWeight: 700 }
                    : { background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)" }
                }
              >
                {label}
                <span aria-hidden style={{ opacity: 0.6 }}>→</span>
              </Link>
            ))}
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "0.5rem 0" }} />
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>
            Posts are ready to copy-paste or download as CSV after each run.
          </p>
        </div>

      </div>
    </div>
  );
}
