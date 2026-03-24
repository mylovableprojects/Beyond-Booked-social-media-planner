import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { HistoryDownloadButton } from "@/components/history/history-download-button";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const PLATFORM_COLORS: Record<string, string> = {
  facebook: "#1877f2",
  instagram: "#e1306c",
  google_business_profile: "#34a853",
};

const PLATFORM_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  google_business_profile: "GBP",
};

export default async function HistoryPage() {
  const user = await requireUser();
  const supabase = createSupabaseAdminClient();

  // Fetch runs with their platform selections
  const { data: runs } = await supabase
    .from("generation_runs")
    .select("id, month, year, post_count, promo_text, featured_product, status, created_at")
    .eq("profile_id", user.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  const runList = runs ?? [];

  // Fetch platform selections for all runs in one query
  let selectionMap: Record<string, string[]> = {};
  if (runList.length > 0) {
    const { data: selections } = await supabase
      .from("generation_selections")
      .select("generation_run_id, platforms")
      .in("generation_run_id", runList.map((r) => r.id));
    for (const s of selections ?? []) {
      selectionMap[s.generation_run_id] = s.platforms as string[];
    }
  }

  return (
    <div>
      {/* Page header */}
      <div className="animate-fade-up mb-8">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <div style={{ width: 32, height: 3, background: "var(--gold)", borderRadius: 2 }} />
          <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted-fg)" }}>
            Generation History
          </span>
        </div>
        <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 800, color: "var(--navy)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          Your content archive
        </h1>
        <p style={{ marginTop: "0.4rem", fontSize: "0.9rem", color: "var(--muted-fg)" }}>
          {runList.length > 0
            ? `${runList.length} batch${runList.length !== 1 ? "es" : ""} — copy, export, or revisit anytime.`
            : "Every run you generate will appear here."}
        </p>
      </div>

      {runList.length === 0 ? (
        /* Empty state */
        <div
          className="animate-fade-up"
          style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "1.5rem", overflow: "hidden" }}
        >
          <div style={{ height: 4, background: "linear-gradient(90deg, var(--navy) 0%, var(--accent) 50%, var(--gold) 100%)" }} />
          <div style={{ padding: "4rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "1.25rem" }}>
            <div style={{ width: 64, height: 64, borderRadius: "1rem", background: "var(--navy)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem" }}>
              📋
            </div>
            <div>
              <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "1.375rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.5rem" }}>No runs yet</h2>
              <p style={{ fontSize: "0.875rem", color: "var(--muted-fg)", lineHeight: 1.6, maxWidth: 340 }}>
                Once you generate content, every batch will appear here for quick re-copy or export.
              </p>
            </div>
            <Link href="/generator" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "var(--accent)", color: "#fff", borderRadius: "0.875rem", padding: "0.75rem 1.75rem", fontSize: "0.875rem", fontWeight: 700, fontFamily: "var(--font-syne)", textDecoration: "none" }}>
              Generate your first batch →
            </Link>
          </div>
        </div>
      ) : (
        /* Run list */
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          {runList.map((run) => {
            const platforms = selectionMap[run.id] ?? [];
            const monthName = MONTH_NAMES[(run.month ?? 1) - 1] ?? "";
            const createdDate = new Date(run.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

            return (
              <div
                key={run.id}
                className="animate-fade-up"
                style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "1.25rem", overflow: "hidden", display: "grid", gridTemplateColumns: "4px 1fr" }}
              >
                {/* Accent stripe */}
                <div style={{ background: "var(--accent)" }} />

                <div style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                  {/* Left: meta */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "0.95rem", color: "var(--navy)" }}>
                        {monthName} {run.year}
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "var(--muted-fg)", fontWeight: 500 }}>
                        {run.post_count} post{run.post_count !== 1 ? "s" : ""}
                      </span>
                      {/* Platform pills */}
                      {platforms.map((p) => (
                        <span
                          key={p}
                          style={{
                            padding: "0.15rem 0.5rem",
                            borderRadius: "9999px",
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            background: `${PLATFORM_COLORS[p] ?? "#999"}18`,
                            color: PLATFORM_COLORS[p] ?? "#999",
                            border: `1px solid ${PLATFORM_COLORS[p] ?? "#999"}30`,
                          }}
                        >
                          {PLATFORM_LABELS[p] ?? p}
                        </span>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                      {run.featured_product && (
                        <span style={{ fontSize: "0.72rem", color: "var(--muted-fg)" }}>
                          ✦ {run.featured_product}
                        </span>
                      )}
                      {run.promo_text && (
                        <span style={{ fontSize: "0.72rem", color: "var(--muted-fg)" }}>
                          🏷 {run.promo_text}
                        </span>
                      )}
                      <span style={{ fontSize: "0.72rem", color: "var(--muted-fg)" }}>
                        Generated {createdDate}
                      </span>
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                    <HistoryDownloadButton runId={run.id} label={`${monthName} ${run.year}`} />
                    <Link
                      href={`/share/${run.id}`}
                      target="_blank"
                      style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.45rem 0.875rem", borderRadius: "0.625rem", border: "1.5px solid var(--accent)", background: "var(--accent)", color: "#fff", fontSize: "0.78rem", fontWeight: 700, fontFamily: "var(--font-syne)", textDecoration: "none" }}
                    >
                      ↗ View
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
