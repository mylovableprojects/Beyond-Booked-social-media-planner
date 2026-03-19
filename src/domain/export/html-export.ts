import type { Platform } from "@/types/platform";
import type { GeneratedPost } from "@/types/content";
import { toTitleCase } from "@/lib/text/to-title-case";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatPlatform(platform: Platform) {
  return toTitleCase(platform.replaceAll("_", " "));
}

function formatFramework(framework: string) {
  return toTitleCase(framework.replaceAll("-", " ").replaceAll("_", " "));
}

const PLATFORM_COLORS: Record<string, string> = {
  facebook:                "#1877f2",
  instagram:               "#e1306c",
  google_business_profile: "#34a853",
};

type StandaloneHtmlExportPost = {
  platform: Platform;
  frameworkUsed: GeneratedPost["frameworkUsed"];
  postIndex: number;
  content: string;
  imageSuggestion: string;
};

type StandaloneHtmlExportInput = {
  businessName: string;
  city: string;
  generationDate: string;
  month: number;
  year: number;
  selectedEventTypes: string[];
  selectedServiceCategories: string[];
  featuredProduct: string | null;
  posts: StandaloneHtmlExportPost[];
};

export function toStandaloneHtml(input: StandaloneHtmlExportInput) {
  const grouped = input.posts.reduce<Record<string, StandaloneHtmlExportPost[]>>((acc, post) => {
    acc[post.platform] = acc[post.platform] ?? [];
    acc[post.platform]!.push(post);
    return acc;
  }, {});

  const monthName = (() => {
    try {
      return new Date(input.year, input.month - 1, 1).toLocaleString("en-US", { month: "long" });
    } catch {
      return String(input.month);
    }
  })();

  const formattedDate = (() => {
    try {
      return new Date(input.generationDate).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      });
    } catch {
      return new Date().toLocaleDateString();
    }
  })();

  const platformOrder = ["facebook", "instagram", "google_business_profile"];
  const sortedPlatforms = Object.keys(grouped).sort(
    (a, b) => platformOrder.indexOf(a) - platformOrder.indexOf(b),
  );

  // Build a lookup map: postKey → raw content string (for the JS copy table)
  const postContentMap: Record<string, string> = {};

  const platformSections = sortedPlatforms.map((platform) => {
    const platformPosts = (grouped[platform] ?? []).slice().sort((a, b) => a.postIndex - b.postIndex);
    const color = PLATFORM_COLORS[platform] ?? "#10172c";
    const label = formatPlatform(platform as Platform);

    const cards = platformPosts.map((post) => {
      const postKey = `${platform}_${post.postIndex}`;
      postContentMap[postKey] = post.content;

      // Render paragraphs — split on \n\n
      const paragraphs = post.content.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
      const contentHtml = paragraphs.map((p) => `<p class="post-para">${escapeHtml(p)}</p>`).join("");

      return `
      <article class="card" style="border-top: 3px solid ${escapeHtml(color)};">
        <div class="card-meta">
          <span class="badge" style="background:${escapeHtml(color)}20; color:${escapeHtml(color)}; border:1px solid ${escapeHtml(color)}40;">${escapeHtml(formatFramework(post.frameworkUsed))}</span>
          <div class="card-meta-right">
            <span class="post-num">#${post.postIndex + 1}</span>
            <button class="copy-btn" onclick="copyPost(this)" data-key="${escapeHtml(postKey)}">
              <span class="copy-icon">⎘</span>
              <span class="copy-label">Copy</span>
            </button>
          </div>
        </div>
        <div class="post-content">${contentHtml}</div>
        <div class="img-row">
          <span class="img-icon">📷</span>
          <span class="img-text">${escapeHtml(post.imageSuggestion)}</span>
        </div>
      </article>
    `;
    }).join("");

    return `
      <section class="platform-section">
        <div class="platform-header">
          <span class="platform-dot" style="background:${escapeHtml(color)};"></span>
          <h2 class="platform-title" style="color:${escapeHtml(color)};">${escapeHtml(label)}</h2>
          <span class="platform-count">${platformPosts.length} post${platformPosts.length !== 1 ? "s" : ""}</span>
        </div>
        <div class="cards-grid">${cards}</div>
      </section>
    `;
  }).join("");

  const eventChips = (input.selectedEventTypes ?? [])
    .map((t) => `<span class="chip chip-navy">${escapeHtml(t)}</span>`).join("");
  const serviceChips = (input.selectedServiceCategories ?? [])
    .map((c) => `<span class="chip chip-gold">${escapeHtml(c)}</span>`).join("");

  const initials = input.businessName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "PR";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(input.businessName)} — ${escapeHtml(monthName)} ${escapeHtml(String(input.year))} Content</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --navy:   #10172c;
      --accent: #ff5833;
      --gold:   #ddab2c;
      --cream:  #fbf7f4;
      --card:   #ffffff;
      --border: #e8dfd4;
      --muted:  #f0ece5;
      --muted-fg: #5c6470;
    }

    body {
      font-family: 'DM Sans', system-ui, sans-serif;
      background: var(--cream);
      color: var(--navy);
      min-height: 100vh;
    }

    .page {
      max-width: 1080px;
      margin: 0 auto;
      padding: 2.5rem 1.25rem 5rem;
    }

    /* ── Header ── */
    .header {
      background: var(--navy);
      border-radius: 1.5rem;
      padding: 2rem 2rem 1.75rem;
      margin-bottom: 2rem;
      position: relative;
      overflow: hidden;
    }
    .header::after {
      content: '';
      position: absolute;
      top: -40px; right: -40px;
      width: 180px; height: 180px;
      border-radius: 50%;
      background: rgba(255,88,51,0.07);
      pointer-events: none;
    }
    .header-top {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .avatar {
      width: 52px; height: 52px;
      border-radius: 0.875rem;
      background: var(--accent);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Syne', sans-serif;
      font-size: 1rem; font-weight: 800;
      color: #fff;
      flex-shrink: 0;
    }
    .brand-name {
      font-family: 'Syne', sans-serif;
      font-size: 1.5rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.02em;
      line-height: 1.1;
    }
    .brand-city {
      font-size: 0.85rem;
      color: rgba(255,255,255,0.45);
      margin-top: 0.2rem;
    }
    .header-meta {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .meta-pill {
      padding: 0.35rem 0.875rem;
      border-radius: 9999px;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.07);
      font-size: 0.75rem;
      font-weight: 600;
      color: rgba(255,255,255,0.7);
    }
    .meta-pill strong { color: #fff; }

    .divider {
      height: 1px;
      background: rgba(255,255,255,0.08);
      margin: 1.25rem 0;
    }

    .chips-row {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .chips-label {
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.35);
      margin-bottom: 0.35rem;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }
    .chip {
      padding: 0.3rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.72rem;
      font-weight: 600;
    }
    .chip-navy {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      color: rgba(255,255,255,0.8);
    }
    .chip-gold {
      background: rgba(221,171,44,0.15);
      border: 1px solid rgba(221,171,44,0.3);
      color: var(--gold);
    }

    .featured-promo {
      margin-top: 1rem;
      padding: 0.875rem 1rem;
      border-radius: 0.875rem;
      background: rgba(255,88,51,0.1);
      border: 1px solid rgba(255,88,51,0.25);
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
    }
    .featured-label {
      font-size: 0.6rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 0.2rem;
    }
    .featured-value {
      font-size: 0.9rem;
      font-weight: 600;
      color: #fff;
    }

    /* ── Platform sections ── */
    .platform-section {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 1.25rem;
      padding: 1.5rem;
      margin-bottom: 1.25rem;
      box-shadow: 0 4px 24px rgba(16,23,44,0.06);
    }
    .platform-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border);
    }
    .platform-dot {
      width: 10px; height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .platform-title {
      font-family: 'Syne', sans-serif;
      font-size: 1rem;
      font-weight: 800;
      letter-spacing: -0.01em;
    }
    .platform-count {
      margin-left: auto;
      padding: 0.2rem 0.625rem;
      border-radius: 9999px;
      background: var(--muted);
      border: 1px solid var(--border);
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--muted-fg);
    }

    /* ── Cards ── */
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 0.875rem;
    }
    .card {
      border: 1px solid var(--border);
      border-radius: 1rem;
      padding: 1.125rem 1.25rem;
      background: var(--card);
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .card-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.875rem;
    }
    .card-meta-right {
      display: flex;
      align-items: center;
      gap: 0.625rem;
    }
    .badge {
      padding: 0.2rem 0.625rem;
      border-radius: 9999px;
      font-size: 0.68rem;
      font-weight: 700;
    }
    .post-num {
      font-size: 0.65rem;
      color: var(--muted-fg);
      font-weight: 600;
    }
    .copy-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.3rem 0.75rem;
      border-radius: 0.5rem;
      border: 1.5px solid var(--border);
      background: transparent;
      color: var(--navy);
      font-size: 0.72rem;
      font-weight: 600;
      cursor: pointer;
      font-family: 'DM Sans', sans-serif;
      transition: all 0.15s ease;
    }
    .copy-btn:hover { background: var(--muted); }
    .copy-btn.copied {
      background: var(--navy);
      color: #fff;
      border-color: var(--navy);
    }
    .copy-icon { font-size: 0.8rem; }
    .post-content {
      margin-bottom: 1rem;
    }
    .post-para {
      font-size: 0.875rem;
      line-height: 1.7;
      color: var(--navy);
      margin: 0 0 0.75rem;
    }
    .post-para:last-child { margin-bottom: 0; }
    .img-row {
      display: flex;
      gap: 0.5rem;
      align-items: flex-start;
      padding: 0.625rem 0.75rem;
      border-radius: 0.625rem;
      background: var(--muted);
    }
    .img-icon { flex-shrink: 0; font-size: 0.8rem; }
    .img-text {
      font-size: 0.75rem;
      color: var(--muted-fg);
      font-style: italic;
      line-height: 1.5;
    }

    /* ── Footer ── */
    .footer {
      margin-top: 2.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .footer-brand {
      font-family: 'Syne', sans-serif;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--navy);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .footer-logo {
      width: 22px; height: 22px;
      border-radius: 0.35rem;
      background: var(--accent);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.5rem;
      font-weight: 800;
      color: #fff;
    }
    .footer-date {
      font-size: 0.72rem;
      color: var(--muted-fg);
    }

    @media (max-width: 640px) {
      .page { padding: 1.25rem 0.875rem 3rem; }
      .header { padding: 1.5rem; }
      .cards-grid { grid-template-columns: 1fr; }
    }

    @media print {
      body { background: #fff; }
      .page { padding: 0; }
      .header { box-shadow: none; }
      .platform-section { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="page">

    <!-- Header -->
    <header class="header">
      <div class="header-top">
        <div class="avatar">${escapeHtml(initials)}</div>
        <div>
          <div class="brand-name">${escapeHtml(input.businessName)}</div>
          <div class="brand-city">${escapeHtml(input.city)}${input.city ? " · " : ""}Social content batch</div>
        </div>
      </div>

      <div class="header-meta">
        <span class="meta-pill"><strong>${escapeHtml(monthName)} ${escapeHtml(String(input.year))}</strong></span>
        <span class="meta-pill">${input.posts.length} post${input.posts.length !== 1 ? "s" : ""}</span>
        <span class="meta-pill">Generated ${escapeHtml(formattedDate)}</span>
      </div>

      <div class="divider"></div>

      <div class="chips-row">
        ${input.selectedEventTypes?.length ? `
          <div>
            <div class="chips-label">Event types</div>
            <div class="chips">${eventChips}</div>
          </div>
        ` : ""}
        ${input.selectedServiceCategories?.length ? `
          <div>
            <div class="chips-label">Service categories</div>
            <div class="chips">${serviceChips}</div>
          </div>
        ` : ""}
      </div>

      ${input.featuredProduct ? `
        <div class="featured-promo">
          <div>
            <div class="featured-label">Featured product</div>
            <div class="featured-value">${escapeHtml(input.featuredProduct)}</div>
          </div>
        </div>
      ` : ""}
    </header>

    <!-- Platform sections -->
    <main>
      ${platformSections || `<div class="platform-section"><p style="color:var(--muted-fg);font-size:0.9rem;">No posts available for this batch.</p></div>`}
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-brand">
        <div class="footer-logo">PR</div>
        The Party Rental Toolkit
      </div>
      <div class="footer-date">Generated ${escapeHtml(formattedDate)}</div>
    </footer>

  </div>

  <script>
    var POST_CONTENT = ${JSON.stringify(postContentMap)};

    function copyPost(btn) {
      var key = btn.getAttribute('data-key');
      var content = POST_CONTENT[key];
      if (!content) return;

      var label = btn.querySelector('.copy-label');

      function onSuccess() {
        btn.classList.add('copied');
        if (label) label.textContent = 'Copied!';
        setTimeout(function() {
          btn.classList.remove('copied');
          if (label) label.textContent = 'Copy';
        }, 2000);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(content).then(onSuccess).catch(function() {
          fallbackCopy(content, onSuccess);
        });
      } else {
        fallbackCopy(content, onSuccess);
      }
    }

    function fallbackCopy(text, onSuccess) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); onSuccess(); } catch(e) {}
      document.body.removeChild(ta);
    }
  </script>
</body>
</html>`;
}
