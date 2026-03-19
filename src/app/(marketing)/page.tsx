import Link from "next/link";

export default function MarketingPage() {
  return (
    <>
      <style>{`
        .lp-nav-login { color: rgba(255,255,255,0.6); text-decoration: none; font-size: 0.875rem; font-weight: 500; transition: color 0.15s; }
        .lp-nav-login:hover { color: #fff; }
        .lp-btn-primary { display: inline-flex; align-items: center; gap: 0.4rem; background: var(--accent); color: #fff; border-radius: 0.875rem; padding: 0.75rem 1.75rem; font-size: 0.9rem; font-weight: 700; font-family: var(--font-syne); text-decoration: none; transition: opacity 0.15s; }
        .lp-btn-primary:hover { opacity: 0.88; }
        .lp-btn-ghost { display: inline-flex; align-items: center; gap: 0.4rem; border: 1.5px solid rgba(255,255,255,0.18); color: rgba(255,255,255,0.7); border-radius: 0.875rem; padding: 0.75rem 1.75rem; font-size: 0.9rem; font-weight: 600; text-decoration: none; transition: all 0.15s; }
        .lp-btn-ghost:hover { border-color: rgba(255,255,255,0.5); color: #fff; }
        .lp-btn-navy { display: inline-flex; align-items: center; gap: 0.4rem; background: var(--navy); color: #fff; border-radius: 0.875rem; padding: 0.875rem 2rem; font-size: 1rem; font-weight: 700; font-family: var(--font-syne); text-decoration: none; transition: opacity 0.15s; }
        .lp-btn-navy:hover { opacity: 0.88; }
        .lp-framework-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .lp-framework-card:hover { transform: translateY(-4px); }
        .lp-step:hover .lp-step-inner { box-shadow: 0 20px 60px rgba(16,23,44,0.12); }
        .lp-platform-card { transition: transform 0.18s ease; }
        .lp-platform-card:hover { transform: translateY(-3px); }
        .lp-login-link { color: rgba(255,255,255,0.45); font-size: 0.82rem; text-decoration: none; transition: color 0.15s; }
        .lp-login-link:hover { color: rgba(255,255,255,0.8); }
        @keyframes lp-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .lp-float { animation: lp-float 6s ease-in-out infinite; }
        @keyframes lp-badge-pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        .lp-badge-pulse { animation: lp-badge-pulse 2.5s ease-in-out infinite; }

        /* ── Responsive: 768px (tablet) ── */
        @media (max-width: 768px) {
          .lp-hero-grid { grid-template-columns: 1fr !important; }
          .lp-frameworks-grid { grid-template-columns: 1fr !important; }
          .lp-featured-inner { grid-template-columns: 1fr !important; }
          .lp-steps-grid { grid-template-columns: 1fr !important; }
          .lp-platforms-grid { grid-template-columns: 1fr !important; }
          .lp-output-cards-grid { grid-template-columns: 1fr !important; }
          .lp-nav-links { display: none !important; }
          .lp-nav-start { display: flex !important; }
          .lp-logo-tagline { display: none !important; }
        }

        /* ── Responsive: 640px (mobile) ── */
        @media (max-width: 640px) {
          .lp-hero-section { padding-bottom: 3rem !important; }
          .lp-hero-inner { padding: 3rem 1rem 1.5rem !important; }
          .lp-hero-card { animation: none !important; }
          .lp-browser-mockup-header { padding: 1rem !important; flex-wrap: wrap; gap: 0.5rem; }
          .lp-browser-mockup-buttons { display: none !important; }
          .lp-browser-mockup-content { padding: 1rem !important; }
          .lp-section-padding { padding: 4rem 1rem !important; }
          .lp-section-padding-top-only { padding-top: 5rem !important; padding-left: 1rem !important; padding-right: 1rem !important; }
          .lp-featured-card { padding: 1.25rem !important; }
          .lp-browser-url { display: none !important; }
          .lp-cta-section { padding: 5rem 1rem !important; }
          .lp-footer { padding: 1.5rem 1rem !important; }
        }
      `}</style>

      <div style={{ fontFamily: "var(--font-dm-sans)", overflowX: "hidden" }}>

        {/* ═══════════════════════════════════════
            NAV
        ═══════════════════════════════════════ */}
        <nav
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            background: "rgba(16,23,44,0.96)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              maxWidth: 1120,
              margin: "0 auto",
              padding: "0 1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: 64,
            }}
          >
            {/* Logo */}
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
              <span
                style={{
                  width: 34, height: 34,
                  background: "var(--accent)",
                  borderRadius: "0.5rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-syne)",
                  fontSize: "0.65rem", fontWeight: 800,
                  color: "#fff",
                  flexShrink: 0,
                  letterSpacing: "0.02em",
                }}
              >
                BB
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
                <span style={{ fontFamily: "var(--font-syne)", fontSize: "0.95rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1 }}>
                  Beyond Booked
                </span>
                <span className="lp-logo-tagline" style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", fontWeight: 500, lineHeight: 1 }}>
                  The Party Rental Content Engine
                </span>
              </div>
            </Link>

            {/* Nav links — hidden on mobile */}
            <div className="lp-nav-links" style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <a href="#how-it-works" className="lp-nav-login">How it works</a>
              <a href="#frameworks" className="lp-nav-login">Frameworks</a>
              <Link href="/login" className="lp-nav-login">Log in</Link>
              <Link href="/signup" className="lp-btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.82rem" }}>
                Start free →
              </Link>
            </div>
            {/* Mobile nav — just the start button */}
            <div className="lp-nav-start" style={{ display: "none", alignItems: "center" }}>
              <Link href="/signup" className="lp-btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}>
                Start free →
              </Link>
            </div>
          </div>
        </nav>

        {/* ═══════════════════════════════════════
            HERO
        ═══════════════════════════════════════ */}
        <section
          className="lp-hero-section"
          style={{
            background: "var(--navy)",
            position: "relative",
            overflow: "hidden",
            paddingBottom: "6rem",
          }}
        >
          {/* Background texture */}
          <div
            aria-hidden
            style={{
              position: "absolute", inset: 0,
              backgroundImage: "radial-gradient(ellipse 60% 50% at 70% 40%, rgba(255,88,51,0.09) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 10% 80%, rgba(221,171,44,0.05) 0%, transparent 60%)",
              pointerEvents: "none",
            }}
          />
          {/* Decorative grid lines */}
          <div
            aria-hidden
            style={{
              position: "absolute", inset: 0,
              backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
              pointerEvents: "none",
            }}
          />

          <div className="lp-hero-inner" style={{ maxWidth: 1120, margin: "0 auto", padding: "5rem 1.5rem 2rem", position: "relative" }}>
            <div className="lp-hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 440px", gap: "3rem", alignItems: "center" }}>

              {/* Left: copy */}
              <div>
                {/* Eyebrow */}
                <div
                  className="animate-fade-up"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.5rem",
                    padding: "0.35rem 1rem",
                    borderRadius: "9999px",
                    border: "1px solid rgba(221,171,44,0.3)",
                    background: "rgba(221,171,44,0.07)",
                    marginBottom: "1.75rem",
                  }}
                >
                  <span className="lp-badge-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold)", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)" }}>
                    Built for party rental businesses
                  </span>
                </div>

                {/* Headline */}
                <h1
                  className="animate-fade-up animate-fade-up-1"
                  style={{
                    fontFamily: "var(--font-syne)",
                    fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
                    fontWeight: 800,
                    color: "#fff",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.05,
                    marginBottom: "1.5rem",
                  }}
                >
                  Your competitors<br />
                  post{" "}
                  <span
                    style={{
                      position: "relative",
                      display: "inline-block",
                      color: "rgba(255,255,255,0.35)",
                    }}
                  >
                    "Book now."
                    {/* Strikethrough */}
                    <span
                      aria-hidden
                      style={{
                        position: "absolute",
                        top: "50%", left: "-4px", right: "-4px",
                        height: 3,
                        background: "var(--accent)",
                        borderRadius: 2,
                        transform: "translateY(-50%) rotate(-2deg)",
                      }}
                    />
                  </span>
                  <br />
                  <span style={{ color: "var(--accent)" }}>You're about to do<br />something different.</span>
                </h1>

                <p
                  className="animate-fade-up animate-fade-up-2"
                  style={{
                    fontSize: "1.05rem",
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.6)",
                    maxWidth: 480,
                    marginBottom: "2.5rem",
                  }}
                >
                  Generate human, emotional, ready-to-post content for Facebook, Instagram, and Google Business Profile. Four content frameworks. Three platforms. About 10 seconds per run.
                </p>

                <div className="animate-fade-up animate-fade-up-3" style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                  <Link href="/signup" className="lp-btn-primary">
                    Start generating free →
                  </Link>
                  <a href="#frameworks" className="lp-btn-ghost">
                    See the frameworks
                  </a>
                </div>

                {/* Social proof line */}
                <p
                  className="animate-fade-up animate-fade-up-4"
                  style={{ marginTop: "2rem", fontSize: "0.78rem", color: "rgba(255,255,255,0.3)" }}
                >
                  No credit card required · Works for any party rental niche
                </p>
              </div>

              {/* Right: floating post card mockup */}
              <div className="animate-fade-up animate-fade-up-2 lp-hero-card" style={{ position: "relative" }}>
                {/* Glow behind card */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: "20%", left: "10%", right: "10%", bottom: "20%",
                    background: "radial-gradient(ellipse, rgba(255,88,51,0.18) 0%, transparent 70%)",
                    filter: "blur(20px)",
                    pointerEvents: "none",
                  }}
                />

                {/* Card */}
                <div
                  className="lp-float"
                  style={{
                    background: "#fff",
                    borderRadius: "1.5rem",
                    boxShadow: "0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06)",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {/* Facebook-style post header */}
                  <div style={{ padding: "1.125rem 1.25rem 0.75rem", borderBottom: "1px solid #f0ece5" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                      <div
                        style={{
                          width: 38, height: 38, borderRadius: "50%",
                          background: "var(--accent)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "var(--font-syne)", fontSize: "0.75rem", fontWeight: 800, color: "#fff",
                          flexShrink: 0,
                        }}
                      >
                        WC
                      </div>
                      <div>
                        <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--navy)", lineHeight: 1.2 }}>
                          Windy City Jump Rentals
                        </p>
                        <p style={{ fontSize: "0.68rem", color: "var(--muted-fg)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <span
                            style={{
                              width: 8, height: 8, borderRadius: "50%",
                              background: "#1877f2",
                              display: "inline-block",
                            }}
                          />
                          Facebook · 2h
                        </p>
                      </div>
                      <div
                        style={{
                          marginLeft: "auto",
                          padding: "0.2rem 0.625rem",
                          borderRadius: "9999px",
                          background: "rgba(255,88,51,0.08)",
                          border: "1px solid rgba(255,88,51,0.2)",
                          fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.1em",
                          textTransform: "uppercase", color: "var(--accent)",
                        }}
                      >
                        Beyond Bookings
                      </div>
                    </div>
                  </div>

                  {/* Post content */}
                  <div style={{ padding: "1rem 1.25rem 1.25rem" }}>
                    <p style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "var(--navy)", marginBottom: "0.875rem" }}>
                      The kids didn't want to leave, and the adults kept sneaking back to the photo booth for one more shot.
                    </p>
                    <p style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "var(--navy)", marginBottom: "0.875rem" }}>
                      That's the kind of grad party people talk about for years. 🎓
                    </p>
                    <p style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "var(--navy)" }}>
                      We help Windsor-Essex families make that happen with electronic games and photo booths that bring everyone together. Tap to get a quick custom quote.
                    </p>

                    {/* Engagement bar */}
                    <div
                      style={{
                        marginTop: "1rem",
                        paddingTop: "0.75rem",
                        borderTop: "1px solid #f0ece5",
                        display: "flex",
                        gap: "1rem",
                      }}
                    >
                      {["👍 47", "💬 12", "↗ Share"].map((item) => (
                        <span key={item} style={{ fontSize: "0.72rem", color: "var(--muted-fg)", fontWeight: 600 }}>{item}</span>
                      ))}
                    </div>
                  </div>

                  {/* Tag */}
                  <div
                    style={{
                      position: "absolute",
                      top: "1rem", right: "1rem",
                      width: 10, height: 10, borderRadius: "50%",
                      background: "var(--accent)",
                    }}
                  />
                </div>

                {/* Framework label floating below card */}
                <div
                  style={{
                    marginTop: "1rem",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>
                    Real output from the Beyond Bookings framework
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom fade */}
          <div
            aria-hidden
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: 80,
              background: "linear-gradient(to bottom, transparent, var(--navy))",
              pointerEvents: "none",
            }}
          />
        </section>

        {/* ═══════════════════════════════════════
            THE PROBLEM
        ═══════════════════════════════════════ */}
        <section className="lp-section-padding" style={{ background: "var(--cream)", padding: "6rem 1.5rem" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div style={{ width: 40, height: 3, background: "var(--accent)", borderRadius: 2 }} />
              <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted-fg)" }}>
                The problem
              </span>
            </div>

            <h2
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                fontWeight: 800,
                color: "var(--navy)",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
                marginBottom: "2.5rem",
              }}
            >
              You already know what party rental<br />social media usually looks like.
            </h2>

            {/* Bad post example */}
            <div
              style={{
                background: "#fff",
                border: "1.5px solid var(--border)",
                borderRadius: "1.25rem",
                padding: "1.5rem",
                marginBottom: "2rem",
                position: "relative",
                opacity: 0.7,
              }}
            >
              {/* Rejected stamp */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: "50%", left: "50%",
                  transform: "translate(-50%, -50%) rotate(-12deg)",
                  border: "3px solid rgba(220,38,38,0.4)",
                  borderRadius: "0.5rem",
                  padding: "0.4rem 1rem",
                  color: "rgba(220,38,38,0.45)",
                  fontFamily: "var(--font-syne)",
                  fontSize: "1.5rem",
                  fontWeight: 900,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                  zIndex: 2,
                }}
              >
                Forgettable
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--muted)", flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--muted-fg)" }}>Party Rentals Inc.</p>
                  <p style={{ fontSize: "0.65rem", color: "#aaa" }}>Facebook · 3h</p>
                </div>
              </div>
              <p style={{ fontSize: "0.875rem", lineHeight: 1.6, color: "var(--muted-fg)" }}>
                🎉 New inventory alert! Book our 18-foot water slide before it's gone! Summer dates are filling fast! Call us today to reserve! Don't miss out! 🎉🎉
                <br /><br />
                #BounceHouse #PartyRentals #BookNow #SummerFun #Inflatables #WaterSlide #KidsParty #CallNow
              </p>
            </div>

            {/* Problem copy */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <p style={{ fontSize: "1.05rem", lineHeight: 1.75, color: "var(--navy)" }}>
                Generic. Forgettable. The same post every competitor has scheduled for the next three months. Here's the thing: your customers scroll past that without thinking. They've seen it a hundred times. They'll see it a hundred more.
              </p>
              <p style={{ fontSize: "1.05rem", lineHeight: 1.75, color: "var(--navy)" }}>
                Meanwhile, parents planning their kid's birthday party are scrolling Instagram hoping to feel something — and walking right past your content.
              </p>
              <p style={{ fontSize: "1.05rem", lineHeight: 1.75, color: "var(--navy)" }}>
                Your business creates real moments. First birthdays. Grad parties. School fundraisers. The water slide that made 40 kids forget their phones existed. The photo booth nobody wanted to leave.{" "}
                <strong style={{ color: "var(--accent)" }}>That story deserves better than "Book now."</strong>
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            FRAMEWORKS SHOWCASE
        ═══════════════════════════════════════ */}
        <section
          id="frameworks"
          className="lp-section-padding"
          style={{
            background: "var(--navy)",
            padding: "6rem 1.5rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute", inset: 0,
              backgroundImage: "radial-gradient(ellipse 50% 40% at 20% 60%, rgba(221,171,44,0.06) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div style={{ maxWidth: 1120, margin: "0 auto", position: "relative" }}>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{ width: 40, height: 3, background: "var(--gold)", borderRadius: 2 }} />
              <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
                Content frameworks
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "3rem" }}>
              <h2
                style={{
                  fontFamily: "var(--font-syne)",
                  fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                  fontWeight: 800,
                  color: "#fff",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.15,
                  maxWidth: 560,
                }}
              >
                Four ways to say something worth reading.
              </h2>
              <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", maxWidth: 300, lineHeight: 1.65 }}>
                Each run rotates through every framework, so your feed never sounds like it was written by a robot on repeat.
              </p>
            </div>

            {/* Framework grid — Beyond Bookings featured */}
            <div className="lp-frameworks-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>

              {/* Beyond Bookings — full width, featured */}
              <div
                className="lp-framework-card lp-featured-card"
                style={{
                  gridColumn: "1 / -1",
                  background: "linear-gradient(135deg, rgba(255,88,51,0.12) 0%, rgba(255,88,51,0.04) 100%)",
                  border: "1.5px solid rgba(255,88,51,0.35)",
                  borderRadius: "1.5rem",
                  padding: "2rem",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  aria-hidden
                  style={{
                    position: "absolute", top: -30, right: -30,
                    width: 160, height: 160,
                    borderRadius: "50%",
                    background: "rgba(255,88,51,0.07)",
                    pointerEvents: "none",
                  }}
                />
                <div className="lp-featured-inner" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "center" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.875rem" }}>
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          borderRadius: "9999px",
                          background: "var(--accent)",
                          color: "#fff",
                          fontSize: "0.6rem", fontWeight: 800,
                          letterSpacing: "0.1em", textTransform: "uppercase",
                        }}
                      >
                        Most powerful
                      </span>
                    </div>
                    <h3
                      style={{
                        fontFamily: "var(--font-syne)",
                        fontSize: "1.625rem", fontWeight: 800,
                        color: "#fff",
                        letterSpacing: "-0.02em",
                        marginBottom: "0.75rem",
                      }}
                    >
                      Beyond Bookings
                    </h3>
                    <p style={{ fontSize: "0.925rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.65, marginBottom: "1rem" }}>
                      Emotional outcomes over equipment specs. This framework positions your rental as the reason the event became a memory — not a transaction.
                    </p>
                    <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.35)", fontStyle: "italic" }}>
                      No equipment lists. No features. Just the feeling after.
                    </p>
                  </div>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "1rem",
                      padding: "1.25rem",
                    }}
                  >
                    <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "0.875rem" }}>
                      Example output
                    </p>
                    <p style={{ fontSize: "0.875rem", lineHeight: 1.75, color: "rgba(255,255,255,0.8)", fontStyle: "italic" }}>
                      "The kids didn't want to leave, and the adults kept sneaking back to the photo booth for one more shot.
                    </p>
                    <p style={{ fontSize: "0.875rem", lineHeight: 1.75, color: "rgba(255,255,255,0.8)", fontStyle: "italic", marginTop: "0.75rem" }}>
                      That's the kind of grad party people talk about for years. We help Windsor-Essex families make that happen."
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Content */}
              <div
                className="lp-framework-card"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "1.25rem",
                  padding: "1.5rem",
                }}
              >
                <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.625rem" }}>02</p>
                <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "1.1rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.01em", marginBottom: "0.625rem" }}>
                  Social Content
                </h3>
                <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: "1rem" }}>
                  Engagement-first. Built to be shared, saved, and commented on — not just scrolled past.
                </p>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1rem" }}>
                  <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.65, fontStyle: "italic" }}>
                    "Hot take: the bounce house isn't the entertainment. It's the reason the adults finally put their phones down."
                  </p>
                </div>
              </div>

              {/* StoryBrand */}
              <div
                className="lp-framework-card"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "1.25rem",
                  padding: "1.5rem",
                }}
              >
                <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.625rem" }}>03</p>
                <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "1.1rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.01em", marginBottom: "0.625rem" }}>
                  StoryBrand
                </h3>
                <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: "1rem" }}>
                  Your customer is the hero. You're the trusted guide who helps them pull it off.
                </p>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1rem" }}>
                  <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.65, fontStyle: "italic" }}>
                    "You're planning a birthday party and you want it to be amazing. We've helped hundreds of families in exactly this spot."
                  </p>
                </div>
              </div>

              {/* Seasonal */}
              <div
                className="lp-framework-card"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "1.25rem",
                  padding: "1.5rem",
                }}
              >
                <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.625rem" }}>04</p>
                <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "1.1rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.01em", marginBottom: "0.625rem" }}>
                  Seasonal / Holiday
                </h3>
                <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: "1rem" }}>
                  Timely urgency without the pressure. Ties your post to the calendar in a way that feels natural, not spammy.
                </p>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1rem" }}>
                  <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.65, fontStyle: "italic" }}>
                    "Spring break is three weeks out. Backyard party bookings are already filling. Here's how to lock in before the good dates are gone."
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            HOW IT WORKS
        ═══════════════════════════════════════ */}
        <section
          id="how-it-works"
          className="lp-section-padding"
          style={{ background: "var(--cream)", padding: "6rem 1.5rem" }}
        >
          <div style={{ maxWidth: 1120, margin: "0 auto" }}>

            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <div style={{ width: 32, height: 3, background: "var(--accent)", borderRadius: 2 }} />
                <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted-fg)" }}>
                  How it works
                </span>
                <div style={{ width: 32, height: 3, background: "var(--accent)", borderRadius: 2 }} />
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-syne)",
                  fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                  fontWeight: 800,
                  color: "var(--navy)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.15,
                }}
              >
                From zero to 15 posts in under a minute.
              </h2>
            </div>

            <div className="lp-steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
              {[
                {
                  n: "01",
                  title: "Build your profile once",
                  body: "Add your business name, city, event types, and service categories. This shapes every post we write — so they sound like you, not a template.",
                  detail: "Takes about 2 minutes",
                  color: "var(--accent)",
                },
                {
                  n: "02",
                  title: "Configure your run",
                  body: "Pick your platforms, choose 2–3 event types to focus on this batch, set the month. That's it. Done in under 60 seconds.",
                  detail: "Different every time",
                  color: "var(--gold)",
                },
                {
                  n: "03",
                  title: "Copy, schedule, repeat",
                  body: "Posts are ready in about 10 seconds. Download as CSV, open the beautiful share page, or copy one at a time. Run it again next month with fresh focuses.",
                  detail: "~10 seconds to generate",
                  color: "var(--accent)",
                },
              ].map((step) => (
                <div key={step.n} className="lp-step">
                  <div
                    className="lp-step-inner"
                    style={{
                      background: "#fff",
                      border: "1px solid var(--border)",
                      borderRadius: "1.5rem",
                      padding: "2rem",
                      height: "100%",
                      transition: "box-shadow 0.2s ease",
                      boxShadow: "0 4px 20px rgba(16,23,44,0.05)",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Big number */}
                    <div
                      style={{
                        fontFamily: "var(--font-syne)",
                        fontSize: "4rem",
                        fontWeight: 800,
                        lineHeight: 1,
                        color: step.color,
                        opacity: 0.15,
                        marginBottom: "0.5rem",
                        letterSpacing: "-0.04em",
                      }}
                    >
                      {step.n}
                    </div>
                    <h3
                      style={{
                        fontFamily: "var(--font-syne)",
                        fontSize: "1.125rem",
                        fontWeight: 800,
                        color: "var(--navy)",
                        letterSpacing: "-0.01em",
                        marginBottom: "0.75rem",
                      }}
                    >
                      {step.title}
                    </h3>
                    <p style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "var(--muted-fg)", marginBottom: "1.5rem", flex: 1 }}>
                      {step.body}
                    </p>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        padding: "0.3rem 0.75rem",
                        borderRadius: "9999px",
                        background: `${step.color}12`,
                        border: `1px solid ${step.color}30`,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: step.color,
                        alignSelf: "flex-start",
                      }}
                    >
                      {step.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            PLATFORMS
        ═══════════════════════════════════════ */}
        <section
          className="lp-section-padding"
          style={{
            background: "#fff",
            padding: "5rem 1.5rem",
            borderTop: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ maxWidth: 1120, margin: "0 auto" }}>
            <p
              style={{
                textAlign: "center",
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--muted-fg)",
                marginBottom: "2.5rem",
              }}
            >
              Platform-specific copy for every channel
            </p>

            <div className="lp-platforms-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}>
              {[
                {
                  name: "Facebook",
                  color: "#1877f2",
                  letter: "f",
                  rule: "Warm, conversational, 40–80 words.",
                  detail: "No hashtags. Reads like a message from a neighbor, not a brand. Ends with one clear CTA sentence.",
                },
                {
                  name: "Instagram",
                  color: "#e1306c",
                  letter: "ig",
                  rule: "Hook line + paragraphs + hashtags.",
                  detail: "The first line stops the scroll. Body builds in short paragraphs. 5–8 relevant hashtags at the end.",
                },
                {
                  name: "Google Business Profile",
                  color: "#34a853",
                  letter: "G",
                  rule: "Professional, local, trust-building.",
                  detail: "75–125 words. Always mentions your city. Direct CTA using: call, book, message, or quote. No emojis.",
                },
              ].map((platform) => (
                <div
                  key={platform.name}
                  className="lp-platform-card"
                  style={{
                    border: "1.5px solid var(--border)",
                    borderRadius: "1.25rem",
                    padding: "1.75rem",
                    background: "#fff",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "1.25rem" }}>
                    <div
                      style={{
                        width: 44, height: 44,
                        borderRadius: "0.875rem",
                        background: platform.color,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "var(--font-syne)",
                        fontSize: platform.letter.length > 1 ? "0.65rem" : "1rem",
                        fontWeight: 800,
                        color: "#fff",
                        flexShrink: 0,
                      }}
                    >
                      {platform.letter}
                    </div>
                    <h3
                      style={{
                        fontFamily: "var(--font-syne)",
                        fontSize: "0.95rem",
                        fontWeight: 800,
                        color: "var(--navy)",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {platform.name}
                    </h3>
                  </div>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      color: platform.color,
                      marginBottom: "0.5rem",
                    }}
                  >
                    {platform.rule}
                  </p>
                  <p style={{ fontSize: "0.82rem", color: "var(--muted-fg)", lineHeight: 1.65 }}>
                    {platform.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            OUTPUT SHOWCASE
        ═══════════════════════════════════════ */}
        <section
          style={{
            background: "var(--navy)",
            padding: "7rem 1.5rem 0",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background glow */}
          <div
            aria-hidden
            style={{
              position: "absolute", inset: 0,
              backgroundImage: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,88,51,0.08) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 80% 80%, rgba(221,171,44,0.05) 0%, transparent 60%)",
              pointerEvents: "none",
            }}
          />

          <div style={{ maxWidth: 1120, margin: "0 auto", position: "relative" }}>

            {/* Section header */}
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                <div style={{ width: 32, height: 3, background: "linear-gradient(90deg, var(--accent), var(--gold))", borderRadius: 2 }} />
                <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
                  What you walk away with
                </span>
                <div style={{ width: 32, height: 3, background: "linear-gradient(90deg, var(--gold), var(--accent))", borderRadius: 2 }} />
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-syne)",
                  fontSize: "clamp(2rem, 4.5vw, 3.25rem)",
                  fontWeight: 800,
                  color: "#fff",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                  marginBottom: "1.25rem",
                }}
              >
                Not a text dump.<br />
                <span style={{ color: "var(--accent)" }}>A complete content delivery.</span>
              </h2>
              <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.45)", maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
                Every run produces a branded, shareable package — not just raw posts pasted into a box.
                This is what separates a tool from a toolkit.
              </p>
            </div>

            {/* Browser mockup — the hero of this section */}
            <div
              style={{
                maxWidth: 860,
                margin: "0 auto 4rem",
                position: "relative",
              }}
            >
              {/* Glow behind browser */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: "30%", left: "5%", right: "5%", bottom: "-10%",
                  background: "radial-gradient(ellipse, rgba(255,88,51,0.2) 0%, transparent 70%)",
                  filter: "blur(40px)",
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />

              {/* Browser chrome */}
              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  borderRadius: "1.25rem",
                  overflow: "hidden",
                  boxShadow: "0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)",
                }}
              >
                {/* Browser top bar */}
                <div
                  style={{
                    background: "#1e2535",
                    padding: "0.75rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {/* Traffic lights */}
                  <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                    {["#ff5f57", "#ffbd2e", "#28c940"].map((c) => (
                      <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
                    ))}
                  </div>
                  {/* URL bar */}
                  <div
                    className="lp-browser-url"
                    style={{
                      flex: 1,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "0.5rem",
                      padding: "0.3rem 0.875rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span style={{ fontSize: "0.65rem", color: "#34a853", fontWeight: 600 }}>🔒</span>
                    <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", fontFamily: "monospace" }}>
                      partyrentaltoolkit.com/share/
                      <span style={{ color: "rgba(255,255,255,0.2)" }}>a1b2c3d4</span>
                    </span>
                  </div>
                </div>

                {/* Page content — mini share page render */}
                <div style={{ background: "#fbf7f4", maxHeight: 560, overflow: "hidden", position: "relative" }}>

                  {/* Share page header */}
                  <div
                    className="lp-browser-mockup-header"
                    style={{
                      background: "var(--navy)",
                      padding: "1.5rem 2rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                      <div
                        style={{
                          width: 44, height: 44,
                          borderRadius: "50%",
                          background: "var(--accent)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "var(--font-syne)", fontSize: "0.875rem", fontWeight: 800, color: "#fff",
                          flexShrink: 0,
                        }}
                      >
                        WC
                      </div>
                      <div>
                        <p style={{ fontFamily: "var(--font-syne)", fontSize: "0.95rem", fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
                          Windy City Jump Rentals
                        </p>
                        <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", marginTop: "0.125rem" }}>
                          June 2025 · 9 posts · Facebook, Instagram, Google
                        </p>
                      </div>
                    </div>
                    <div className="lp-browser-mockup-buttons" style={{ display: "flex", gap: "0.5rem" }}>
                      <div
                        style={{
                          padding: "0.4rem 0.875rem",
                          borderRadius: "9999px",
                          background: "var(--accent)",
                          fontSize: "0.7rem", fontWeight: 700, color: "#fff",
                          fontFamily: "var(--font-syne)",
                        }}
                      >
                        ⬇ Download CSV
                      </div>
                      <div
                        style={{
                          padding: "0.4rem 0.875rem",
                          borderRadius: "9999px",
                          border: "1px solid rgba(255,255,255,0.2)",
                          fontSize: "0.7rem", fontWeight: 600, color: "rgba(255,255,255,0.6)",
                        }}
                      >
                        ⎘ Copy link
                      </div>
                    </div>
                  </div>

                  {/* Posts area */}
                  <div className="lp-browser-mockup-content" style={{ padding: "1.5rem 2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>

                    {/* Platform group label */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.25rem" }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#1877f2", flexShrink: 0 }} />
                      <span style={{ fontFamily: "var(--font-syne)", fontSize: "0.8rem", fontWeight: 800, color: "var(--navy)" }}>Facebook</span>
                      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                      <span style={{ fontSize: "0.65rem", color: "var(--muted-fg)" }}>3 posts</span>
                    </div>

                    {/* Post card 1 */}
                    <div
                      style={{
                        background: "#fff",
                        border: "1px solid var(--border)",
                        borderRadius: "0.875rem",
                        overflow: "hidden",
                        display: "flex",
                      }}
                    >
                      <div style={{ width: 4, background: "#1877f2", flexShrink: 0 }} />
                      <div style={{ padding: "1rem 1.125rem", flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.625rem" }}>
                          <span
                            style={{
                              fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.1em",
                              textTransform: "uppercase", color: "var(--accent)",
                              padding: "0.15rem 0.5rem",
                              borderRadius: "9999px",
                              background: "rgba(255,88,51,0.08)",
                              border: "1px solid rgba(255,88,51,0.15)",
                            }}
                          >
                            Beyond Bookings
                          </span>
                          <span
                            style={{
                              fontSize: "0.65rem", fontWeight: 600, color: "#1877f2",
                              padding: "0.25rem 0.75rem",
                              borderRadius: "9999px",
                              border: "1px solid rgba(24,119,242,0.2)",
                              background: "rgba(24,119,242,0.05)",
                            }}
                          >
                            Copy
                          </span>
                        </div>
                        <p style={{ fontSize: "0.8rem", lineHeight: 1.7, color: "var(--navy)" }}>
                          The kids didn't want to leave, and the adults kept sneaking back to the photo booth for one more shot. That's the kind of grad party people talk about for years.
                        </p>
                        <p style={{ fontSize: "0.8rem", lineHeight: 1.7, color: "var(--navy)", marginTop: "0.5rem" }}>
                          We help Windsor-Essex families make that happen. Tap to get a quick custom quote.
                        </p>
                      </div>
                    </div>

                    {/* Post card 2 — partially visible */}
                    <div
                      style={{
                        background: "#fff",
                        border: "1px solid var(--border)",
                        borderRadius: "0.875rem",
                        overflow: "hidden",
                        display: "flex",
                        opacity: 0.85,
                      }}
                    >
                      <div style={{ width: 4, background: "#1877f2", flexShrink: 0 }} />
                      <div style={{ padding: "1rem 1.125rem", flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.625rem" }}>
                          <span
                            style={{
                              fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.1em",
                              textTransform: "uppercase", color: "var(--gold)",
                              padding: "0.15rem 0.5rem",
                              borderRadius: "9999px",
                              background: "rgba(221,171,44,0.08)",
                              border: "1px solid rgba(221,171,44,0.2)",
                            }}
                          >
                            Social Content
                          </span>
                          <span
                            style={{
                              fontSize: "0.65rem", fontWeight: 600, color: "#1877f2",
                              padding: "0.25rem 0.75rem",
                              borderRadius: "9999px",
                              border: "1px solid rgba(24,119,242,0.2)",
                              background: "rgba(24,119,242,0.05)",
                            }}
                          >
                            Copy
                          </span>
                        </div>
                        <p style={{ fontSize: "0.8rem", lineHeight: 1.7, color: "var(--navy)" }}>
                          Hot take: the bounce house isn't the entertainment. It's the reason the adults finally put their phones down and actually watched their kids play.
                        </p>
                      </div>
                    </div>

                    {/* Instagram group — partially visible */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginTop: "0.25rem", opacity: 0.6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#e1306c", flexShrink: 0 }} />
                      <span style={{ fontFamily: "var(--font-syne)", fontSize: "0.8rem", fontWeight: 800, color: "var(--navy)" }}>Instagram</span>
                      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                      <span style={{ fontSize: "0.65rem", color: "var(--muted-fg)" }}>3 posts</span>
                    </div>

                  </div>

                  {/* Fade-out gradient at bottom */}
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      bottom: 0, left: 0, right: 0,
                      height: 120,
                      background: "linear-gradient(to bottom, transparent, #fbf7f4)",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Output format cards */}
            <div
              className="lp-output-cards-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "1rem",
                marginBottom: "0",
                paddingBottom: "6rem",
              }}
            >
              {[
                {
                  icon: "📋",
                  title: "Copy-ready posts",
                  body: "One click per post. Paste directly into Facebook, Instagram, or Google. No reformatting.",
                  color: "var(--accent)",
                },
                {
                  icon: "📄",
                  title: "CSV download",
                  body: "Every post in a spreadsheet. Drop it into Buffer, Hootsuite, Later, or your own scheduling system.",
                  color: "var(--gold)",
                },
                {
                  icon: "🔗",
                  title: "Shareable page",
                  body: "A branded URL you can send to whoever handles your posting — staff, a VA, a social media manager. No login required.",
                  color: "var(--accent)",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="lp-framework-card"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "1.25rem",
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  <span style={{ fontSize: "1.75rem", lineHeight: 1 }}>{item.icon}</span>
                  <h3
                    style={{
                      fontFamily: "var(--font-syne)",
                      fontSize: "0.95rem",
                      fontWeight: 800,
                      color: "#fff",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}>
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            FINAL CTA
        ═══════════════════════════════════════ */}
        <section
          className="lp-cta-section"
          style={{
            background: "var(--navy)",
            padding: "7rem 1.5rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute", inset: 0,
              backgroundImage: "radial-gradient(ellipse 60% 60% at 50% 100%, rgba(255,88,51,0.1) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute", inset: 0,
              backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
              pointerEvents: "none",
            }}
          />

          <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center", position: "relative" }}>

            {/* Decorative top line */}
            <div
              style={{
                width: 60, height: 3,
                background: "linear-gradient(90deg, var(--accent), var(--gold))",
                borderRadius: 2,
                margin: "0 auto 2rem",
              }}
            />

            <h2
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: "clamp(2rem, 5vw, 3.25rem)",
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                marginBottom: "1.5rem",
              }}
            >
              Your next 15 posts are<br />
              <span style={{ color: "var(--accent)" }}>10 seconds away.</span>
            </h2>

            <p
              style={{
                fontSize: "1rem",
                lineHeight: 1.75,
                color: "rgba(255,255,255,0.55)",
                marginBottom: "2.5rem",
                maxWidth: 500,
                margin: "0 auto 2.5rem",
              }}
            >
              No social media expertise required. No generic AI output. No{" "}
              <span style={{ textDecoration: "line-through", opacity: 0.5 }}>"Book now!"</span>
              {" "}Just posts that sound like a real person who loves what they do.
            </p>

            <Link href="/signup" className="lp-btn-primary" style={{ fontSize: "1rem", padding: "0.875rem 2.25rem" }}>
              Start generating free →
            </Link>

            <p style={{ marginTop: "1.5rem" }}>
              <Link href="/login" className="lp-login-link">
                Already have an account? Log in
              </Link>
            </p>

            {/* Trust badges */}
            <div
              style={{
                marginTop: "3rem",
                display: "flex",
                justifyContent: "center",
                gap: "1.5rem",
                flexWrap: "wrap",
              }}
            >
              {["No credit card", "All 4 frameworks", "3 platforms", "CSV + share link"].map((item) => (
                <span
                  key={item}
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.3)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                >
                  <span style={{ color: "var(--gold)", fontSize: "0.6rem" }}>✓</span>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            FOOTER
        ═══════════════════════════════════════ */}
        <footer
          className="lp-footer"
          style={{
            background: "var(--navy)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "2rem 1.5rem",
          }}
        >
          <div
            style={{
              maxWidth: 1120,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <span
                style={{
                  width: 26, height: 26,
                  background: "var(--accent)",
                  borderRadius: "0.4rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-syne)", fontSize: "0.58rem", fontWeight: 800, color: "#fff",
                }}
              >
                BB
              </span>
              <span style={{ fontFamily: "var(--font-syne)", fontSize: "0.82rem", fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>
                Beyond Booked
              </span>
            </div>
            <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.25)" }}>
              A product of{" "}
              <a
                href="https://www.thepartyrentaltoolkit.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "rgba(255,255,255,0.45)", textDecoration: "underline", textUnderlineOffset: "3px" }}
              >
                The Party Rental Toolkit
              </a>
            </p>
          </div>
        </footer>

      </div>
    </>
  );
}
