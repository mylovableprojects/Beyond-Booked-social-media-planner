"use client";

import { useMemo, useState } from "react";

import { GeneratedPostCard } from "./generated-post-card";
import type { GeneratedPost } from "@/types/content";
import { PLATFORMS } from "@/types/platform";
import { toTitleCase } from "@/lib/text/to-title-case";

type GroupMode = "platform" | "postNumber";

const PLATFORM_COLORS: Record<string, string> = {
  facebook:                "#1877f2",
  instagram:               "#e1306c",
  google_business_profile: "#34a853",
};

function formatPlatform(platform: GeneratedPost["platform"]) {
  return toTitleCase(platform.replaceAll("_", " "));
}

function platformSortIndex(platform: GeneratedPost["platform"]) {
  return PLATFORMS.indexOf(platform);
}

export function BatchResults({ posts, defaultMode = "platform" }: { posts: GeneratedPost[]; defaultMode?: GroupMode }) {
  const [mode, setMode] = useState<GroupMode>(defaultMode);

  const platformsInOrder = useMemo(() => {
    const present = new Set(posts.map((p) => p.platform));
    return PLATFORMS.filter((p) => present.has(p));
  }, [posts]);

  const groups = useMemo(() => {
    if (mode === "platform") {
      return platformsInOrder.map((platform) => {
        const platformPosts = posts
          .filter((p) => p.platform === platform)
          .sort((a, b) => a.postIndex - b.postIndex);
        return {
          key: platform,
          title: formatPlatform(platform),
          subtitle: `${platformPosts.length} post${platformPosts.length === 1 ? "" : "s"}`,
          color: PLATFORM_COLORS[platform] ?? "var(--accent)",
          items: platformPosts,
        };
      });
    }

    const postNumbers = Array.from(new Set(posts.map((p) => p.postIndex))).sort((a, b) => a - b);
    return postNumbers.map((postIndex) => {
      const postItems = posts
        .filter((p) => p.postIndex === postIndex)
        .sort((a, b) => platformSortIndex(a.platform) - platformSortIndex(b.platform));
      return {
        key: String(postIndex),
        title: `Post #${postIndex + 1}`,
        subtitle: `${postItems.length} platform${postItems.length === 1 ? "" : "s"}`,
        color: "var(--navy)",
        items: postItems,
      };
    });
  }, [mode, platformsInOrder, posts]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <p style={{ fontSize: "0.85rem", color: "var(--muted-fg)" }}>
          <span style={{ color: "var(--navy)", fontWeight: 700 }}>{posts.length}</span> posts ready to copy and schedule
        </p>

        {/* Group toggle */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            borderRadius: "0.875rem",
            border: "1px solid var(--border)",
            background: "var(--muted)",
            padding: "0.25rem",
            gap: "0.125rem",
          }}
        >
          {(["platform", "postNumber"] as GroupMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              style={{
                padding: "0.4rem 0.875rem",
                borderRadius: "0.625rem",
                border: "none",
                background: mode === m ? "var(--navy)" : "transparent",
                color: mode === m ? "#fff" : "var(--muted-fg)",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
            >
              {m === "platform" ? "By platform" : "By post #"}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 ? (
        <div
          style={{
            padding: "3rem",
            textAlign: "center",
            borderRadius: "1.25rem",
            border: "1px solid var(--border)",
            background: "var(--muted)",
          }}
        >
          <p style={{ fontSize: "0.85rem", color: "var(--muted-fg)" }}>No posts found for this batch.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
          {groups.map((group) => (
            <section key={group.key}>
              {/* Group header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "1rem",
                  paddingBottom: "1rem",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: group.color,
                    flexShrink: 0,
                  }}
                />
                <h2
                  style={{
                    fontFamily: "var(--font-syne)",
                    fontSize: "1rem",
                    fontWeight: 800,
                    color: "var(--navy)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {group.title}
                </h2>
                <span
                  style={{
                    padding: "0.2rem 0.625rem",
                    borderRadius: "9999px",
                    background: "var(--muted)",
                    border: "1px solid var(--border)",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: "var(--muted-fg)",
                  }}
                >
                  {group.subtitle}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {group.items.map((post) => (
                  <GeneratedPostCard key={`${post.platform}-${post.postIndex}`} post={post} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
