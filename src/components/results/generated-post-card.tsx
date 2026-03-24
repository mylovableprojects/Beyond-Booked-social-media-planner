"use client";

import { useMemo, useState } from "react";

import type { GeneratedPost } from "@/types/content";
import { toTitleCase } from "@/lib/text/to-title-case";

const PLATFORM_COLORS: Record<string, string> = {
  facebook:                "#1877f2",
  instagram:               "#e1306c",
  google_business_profile: "#34a853",
};

function formatPlatform(platform: GeneratedPost["platform"]) {
  return toTitleCase(platform.replaceAll("_", " "));
}

function formatFramework(framework: GeneratedPost["frameworkUsed"]) {
  return toTitleCase(framework.replaceAll("-", " ").replaceAll("_", " "));
}

export function GeneratedPostCard({ post }: { post: GeneratedPost }) {
  const [copied, setCopied] = useState(false);

  const postNumber = post.postIndex + 1;
  const platformColor = PLATFORM_COLORS[post.platform] ?? "var(--accent)";

  const copyText = useMemo(() => {
    return `Post ${postNumber} (${formatPlatform(post.platform)})\nFramework: ${formatFramework(post.frameworkUsed)}\n\n${post.content}\n\nImage suggestion: ${post.imageSuggestion}`;
  }, [post.content, post.imageSuggestion, post.frameworkUsed, post.platform, postNumber]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard failures silently no-op
    }
  };

  return (
    <article
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "1.25rem",
        boxShadow: "0 4px 24px rgba(16,23,44,0.06)",
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: "4px 1fr",
      }}
    >
      {/* Platform color stripe */}
      <div style={{ background: platformColor }} />

      <div style={{ padding: "1.25rem 1.5rem" }}>
        {/* Card header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "0.875rem",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span
              style={{
                padding: "0.25rem 0.75rem",
                borderRadius: "9999px",
                background: platformColor,
                color: "#fff",
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "capitalize",
              }}
            >
              {formatPlatform(post.platform)}
            </span>
            <span
              style={{
                padding: "0.25rem 0.75rem",
                borderRadius: "9999px",
                border: "1px solid var(--border)",
                color: "var(--muted-fg)",
                fontSize: "0.7rem",
                fontWeight: 500,
              }}
            >
              {formatFramework(post.frameworkUsed)}
            </span>
            <span style={{ fontSize: "0.65rem", color: "var(--muted-fg)", fontWeight: 500 }}>
              #{postNumber}
            </span>
          </div>

          <button
            type="button"
            onClick={() => void onCopy()}
            aria-label={`Copy post ${postNumber}`}
            style={{
              padding: "0.375rem 0.875rem",
              borderRadius: "0.5rem",
              border: "1.5px solid var(--border)",
              background: copied ? "var(--navy)" : "transparent",
              color: copied ? "#fff" : "var(--navy)",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              transition: "all 0.15s ease",
            }}
          >
            <span style={{ fontSize: "0.8rem" }}>⎘</span>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Post content */}
        <p
          style={{
            whiteSpace: "pre-wrap",
            fontSize: "0.9rem",
            lineHeight: 1.7,
            color: "var(--navy)",
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          {post.content}
        </p>

        {/* Image suggestion */}
        {post.imageSuggestion && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.625rem 0.875rem",
              borderRadius: "0.625rem",
              background: "var(--muted)",
              fontSize: "0.75rem",
              color: "var(--muted-fg)",
              fontStyle: "italic",
              display: "flex",
              gap: "0.5rem",
              alignItems: "flex-start",
            }}
          >
            <span style={{ flexShrink: 0 }}>📷</span>
            <span>{post.imageSuggestion}</span>
          </div>
        )}

        {/* CTA used */}
        {post.ctaUsed && (
          <p style={{ marginTop: "0.5rem", fontSize: "0.7rem", color: "var(--muted-fg)" }}>
            CTA: {post.ctaUsed}
          </p>
        )}
      </div>
    </article>
  );
}
