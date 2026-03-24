import { BatchResults } from "@/components/results/batch-results";
import { EmptyState } from "@/components/layout/empty-state";
import { requireUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { GeneratedPost } from "@/types/content";
import { HighLevelExportButtons } from "@/components/results/highlevel-export-buttons";
import { HtmlExportButtons } from "@/components/results/html-export-buttons";
import { validationReportSchema } from "@/lib/validation/post-output.schema";

export default async function ResultsBatchPage({
  params,
}: {
  params: { batchId: string };
}) {
  const user = await requireUser();
  const batchId = params.batchId;

  const supabase = await createSupabaseServerClient();

  const {
    data: batch,
    error: batchError,
  } = await supabase
    .from("generation_runs")
    .select("id, month, year, post_count, status, created_at")
    .eq("id", batchId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (batchError) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "1.75rem", fontWeight: 800, color: "var(--navy)" }}>Results</h1>
        <EmptyState title="Could not load batch results" description="Please try again." />
      </div>
    );
  }

  if (!batch) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "1.75rem", fontWeight: 800, color: "var(--navy)" }}>Results</h1>
        <EmptyState title="Batch not found" description="The requested batchId doesn’t exist (or isn’t yours)." />
      </div>
    );
  }

  const { data: rows, error: postsError } = await supabase
    .from("generated_posts")
    .select(
      "platform, framework_used, cta_used, post_index, content, image_suggestion, validation_report",
    )
    .eq("generation_run_id", batchId)
    .order("post_index", { ascending: true });

  if (postsError) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "1.75rem", fontWeight: 800, color: "var(--navy)" }}>Results</h1>
        <EmptyState title="Could not load posts" description="Please try again." />
      </div>
    );
  }

  type GeneratedPostRow = {
    platform: GeneratedPost["platform"];
    framework_used: GeneratedPost["frameworkUsed"];
    cta_used: GeneratedPost["ctaUsed"];
    post_index: GeneratedPost["postIndex"];
    content: GeneratedPost["content"];
    image_suggestion: GeneratedPost["imageSuggestion"];
    validation_report: unknown;
  };

  const posts: GeneratedPost[] = (rows ?? []).map((row: GeneratedPostRow) => {
    const parsedValidationReport = validationReportSchema.safeParse(row.validation_report);
    return {
      platform: row.platform,
      frameworkUsed: row.framework_used,
      ctaUsed: row.cta_used,
      postIndex: row.post_index,
      content: row.content,
      imageSuggestion: row.image_suggestion,
      validationReport: parsedValidationReport.success
        ? parsedValidationReport.data
        : { isValid: false, errors: [], stats: {} },
    };
  });

  const monthName =
    typeof batch.month === "number"
      ? new Date(2000, batch.month - 1, 1).toLocaleString(undefined, { month: "long" })
      : null;

  return (
    <div>
      {/* Page header */}
      <div className="animate-fade-up mb-8">
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
            Batch Results
          </span>
        </div>
        <h1
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
            fontWeight: 800,
            color: "var(--navy)",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          {monthName && typeof batch.year === "number"
            ? `${monthName} ${batch.year}`
            : "Content batch"}
        </h1>
        <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <p style={{ fontSize: "0.9rem", color: "var(--muted-fg)" }}>
            {posts.length} posts generated
          </p>
          <a
            href={`/share/${batchId}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.35rem 0.875rem",
              borderRadius: "9999px",
              border: "1.5px solid var(--accent)",
              background: "rgba(255,88,51,0.06)",
              color: "var(--accent)",
              fontSize: "0.72rem",
              fontWeight: 700,
              textDecoration: "none",
              fontFamily: "var(--font-syne)",
            }}
          >
            ↗ Open share page
          </a>
        </div>
      </div>

      {/* Export row */}
      <div
        className="animate-fade-up animate-fade-up-1"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2.5rem" }}
      >
        <HighLevelExportButtons batchId={batchId} disabled={posts.length === 0} />
        <HtmlExportButtons batchId={batchId} disabled={posts.length === 0} />
      </div>

      {/* Posts */}
      <div className="animate-fade-up animate-fade-up-2">
        {posts.length === 0 ? (
          <EmptyState
            title="No posts found for this batch"
            description="This batch has no generated posts yet."
          />
        ) : (
          <BatchResults posts={posts} defaultMode="platform" />
        )}
      </div>
    </div>
  );
}

