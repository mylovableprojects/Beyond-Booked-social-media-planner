/** Standalone HTML for a single field upload — same visual language as batch `toStandaloneHtml`. */

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export type FieldUploadHtmlInput = {
  businessName: string;
  city: string;
  workerName: string;
  createdAt: string;
  photoUrl: string;
  rawNotes: string | null;
  caption: string;
  hashtags: string;
};

export function toFieldUploadStandaloneHtml(input: FieldUploadHtmlInput) {
  const formattedDate = (() => {
    try {
      return new Date(input.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return new Date().toLocaleDateString();
    }
  })();

  const initials = input.businessName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "PR";

  const captionEscaped = escapeHtml(input.caption);
  const hashtagsEscaped = escapeHtml(input.hashtags);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(input.businessName)} — Field capture</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --navy: #10172c;
      --accent: #ff5833;
      --gold: #ddab2c;
      --cream: #fbf7f4;
      --border: #e8dfd4;
      --muted: #f0ece5;
      --muted-fg: #5c6470;
    }
    body {
      font-family: 'DM Sans', system-ui, sans-serif;
      background: var(--cream);
      color: var(--navy);
      min-height: 100vh;
    }
    .page { max-width: 720px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
    .header {
      background: var(--navy);
      border-radius: 1.5rem;
      padding: 1.75rem 1.75rem 1.5rem;
      margin-bottom: 1.5rem;
      color: #fff;
    }
    .header-top { display: flex; align-items: flex-start; gap: 1rem; }
    .avatar {
      width: 48px; height: 48px; border-radius: 0.75rem;
      background: var(--accent);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Syne', sans-serif; font-weight: 800; font-size: 0.85rem;
    }
    .brand-name { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.15rem; letter-spacing: -0.02em; }
    .brand-sub { font-size: 0.8rem; opacity: 0.75; margin-top: 0.25rem; }
    .meta { margin-top: 1rem; display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .pill {
      font-size: 0.7rem; font-weight: 600;
      padding: 0.25rem 0.65rem; border-radius: 9999px;
      background: rgba(255,255,255,0.12);
    }
    .card {
      background: #fff;
      border: 1px solid var(--border);
      border-radius: 1.25rem;
      overflow: hidden;
      margin-bottom: 1.25rem;
      box-shadow: 0 4px 24px rgba(16,23,44,0.06);
    }
    .card-top { height: 4px; background: linear-gradient(90deg, var(--gold), var(--accent)); }
    .photo-wrap { padding: 0; background: var(--muted); }
    .photo-wrap img { display: block; width: 100%; max-height: 480px; object-fit: contain; }
    .body { padding: 1.5rem 1.5rem 1.75rem; }
    .section-label {
      font-size: 0.6rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
      color: var(--accent); margin-bottom: 0.35rem;
    }
    .notes { font-size: 0.85rem; color: var(--muted-fg); line-height: 1.6; margin-bottom: 1.25rem; }
    .caption {
      font-size: 0.95rem; line-height: 1.65; white-space: pre-wrap; margin-bottom: 1rem;
    }
    .hashtags { font-size: 0.82rem; color: var(--muted-fg); line-height: 1.5; word-break: break-word; margin-bottom: 1.25rem; }
    .actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .btn {
      font-family: 'Syne', sans-serif; font-size: 0.72rem; font-weight: 700;
      padding: 0.5rem 1rem; border-radius: 0.75rem; border: 1.5px solid var(--border);
      background: var(--muted); color: var(--navy); cursor: pointer;
    }
    .btn:hover { background: #e8e4dc; }
    .btn.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
    .btn.primary:hover { filter: brightness(1.05); }
    .footer {
      margin-top: 2rem; padding-top: 1.25rem; border-top: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;
      font-size: 0.72rem; color: var(--muted-fg);
    }
    .footer-brand { font-family: 'Syne', sans-serif; font-weight: 700; color: var(--navy); display: flex; align-items: center; gap: 0.5rem; }
    .logo-mini {
      width: 22px; height: 22px; border-radius: 0.35rem; background: var(--accent);
      display: flex; align-items: center; justify-content: center; font-size: 0.5rem; font-weight: 800; color: #fff;
    }
  </style>
</head>
<body>
  <div class="page">
    <header class="header">
      <div class="header-top">
        <div class="avatar">${escapeHtml(initials)}</div>
        <div>
          <div class="brand-name">${escapeHtml(input.businessName)}</div>
          <div class="brand-sub">${escapeHtml(input.city)}${input.city ? " · " : ""}Field capture</div>
        </div>
      </div>
      <div class="meta">
        <span class="pill">${escapeHtml(input.workerName)}</span>
        <span class="pill">${escapeHtml(formattedDate)}</span>
      </div>
    </header>

    <div class="card">
      <div class="card-top"></div>
      <div class="photo-wrap">
        <img src="${escapeHtml(input.photoUrl)}" alt="" />
      </div>
      <div class="body">
        ${input.rawNotes ? `
        <div class="section-label">On-site notes</div>
        <p class="notes">${escapeHtml(input.rawNotes)}</p>
        ` : ""}
        <div class="section-label">Caption</div>
        <div class="caption" id="cap">${captionEscaped}</div>
        <div class="section-label">Hashtags</div>
        <div class="hashtags" id="hash">${hashtagsEscaped}</div>
        <div class="actions">
          <button type="button" class="btn primary" onclick="copyEl('cap')">⎘ Copy caption</button>
          <button type="button" class="btn" onclick="copyEl('hash')">⎘ Copy hashtags</button>
        </div>
      </div>
    </div>

    <footer class="footer">
      <div class="footer-brand"><span class="logo-mini">BB</span> The Party Rental Toolkit</div>
      <span>${escapeHtml(formattedDate)}</span>
    </footer>
  </div>
  <script>
    function copyEl(id) {
      var el = document.getElementById(id);
      if (!el) return;
      var text = el.innerText || el.textContent || '';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() { flash(id); });
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); flash(id); } catch(e) {}
        document.body.removeChild(ta);
      }
    }
    function flash(id) {
      var el = document.getElementById(id);
      if (!el) return;
      var o = el.style.opacity;
      el.style.opacity = '0.6';
      setTimeout(function() { el.style.opacity = o || '1'; }, 200);
    }
  </script>
</body>
</html>`;
}
