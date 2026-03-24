"use client";

import { useCallback, useRef, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  userId: string;
  workerName: string;
};

function safeFileSegment(name: string) {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_");
  return base.slice(0, 120) || "photo.jpg";
}

export function FieldUploadClient({ userId, workerName }: Props) {
  /** Rear camera — on many phones `capture` skips the photo library. */
  const cameraInputRef = useRef<HTMLInputElement>(null);
  /** No `capture` — opens library / Files / “Choose existing” on mobile. */
  const libraryInputRef = useRef<HTMLInputElement>(null);
  const supabase = createSupabaseBrowserClient();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [storagePath, setStoragePath] = useState<string | null>(null);
  const [generatedCaption, setGeneratedCaption] = useState<string | null>(null);
  const [generatedHashtags, setGeneratedHashtags] = useState<string | null>(null);

  const clearFileInputs = useCallback(() => {
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (libraryInputRef.current) libraryInputRef.current.value = "";
  }, []);

  const resetPreview = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFile(null);
    clearFileInputs();
  }, [previewUrl, clearFileInputs]);

  const resetFormForNextUpload = useCallback(() => {
    resetPreview();
    setNotes("");
    setPublicUrl(null);
    setStoragePath(null);
    setGeneratedCaption(null);
    setGeneratedHashtags(null);
    setError(null);
  }, [resetPreview]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccessMessage(null);
    const next = e.target.files?.[0];
    if (!next) return;
    if (!next.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(next);
    setPreviewUrl(URL.createObjectURL(next));
    setPublicUrl(null);
    setStoragePath(null);
    setGeneratedCaption(null);
    setGeneratedHashtags(null);
  };

  const handleGenerate = async () => {
    setError(null);
    setSuccessMessage(null);
    if (!file) {
      setError("Add a photo first.");
      return;
    }
    if (!notes.trim()) {
      setError("Describe the setup or event so we can write the post.");
      return;
    }

    setUploading(true);
    try {
      const segment = safeFileSegment(file.name);
      const path = `${userId}/${Date.now()}-${segment}`;

      const { error: upErr } = await supabase.storage.from("field-photos").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "image/jpeg",
      });

      if (upErr) {
        setError(upErr.message || "Upload failed.");
        return;
      }

      const { data: pub } = supabase.storage.from("field-photos").getPublicUrl(path);
      const url = pub.publicUrl;
      setPublicUrl(url);
      setStoragePath(path);

      setUploading(false);
      setGenerating(true);

      const res = await fetch("/api/generate-field-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerNotes: notes.trim(),
          photoUrl: url,
        }),
      });

      const data = (await res.json()) as {
        error?: string;
        details?: unknown;
        caption?: string;
        hashtags?: string;
      };

      if (!res.ok || !data.caption || !data.hashtags) {
        setError(data.error ?? "Could not generate a post. Try again.");
        return;
      }

      setGeneratedCaption(data.caption);
      setGeneratedHashtags(data.hashtags);
    } catch {
      setError("Something went wrong. Check your connection and try again.");
    } finally {
      setUploading(false);
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setError(null);
    setSuccessMessage(null);
    if (!publicUrl || !storagePath || !generatedCaption || !generatedHashtags) {
      setError("Generate a post first.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/field-upload/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerName,
          rawNotes: notes.trim(),
          generatedCaption,
          hashtags: generatedHashtags,
          photoUrl: publicUrl,
          photoPath: storagePath,
          eventType: null,
        }),
      });

      const payload = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !payload.ok) {
        setError(payload.error ?? "Could not save.");
        return;
      }

      setSuccessMessage("✅ Saved to your content archive!");
      resetFormForNextUpload();
    } catch {
      setError("Save failed. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const busy = uploading || generating;

  return (
    <div className="mx-auto max-w-lg pb-16 pt-2">
      <div
        className="mb-8 rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-orange-50/90 to-rose-50 p-6 shadow-sm sm:p-8"
        style={{ boxShadow: "0 12px 40px rgba(255, 120, 60, 0.12)" }}
      >
        <p
          className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-800/80"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          Field mode
        </p>
        <h1
          className="mb-2 text-2xl font-extrabold leading-tight sm:text-3xl"
          style={{ fontFamily: "var(--font-syne)", color: "var(--navy)" }}
        >
          Snap it. Note it. Post it.
        </h1>
        <p className="text-base leading-relaxed text-stone-600" style={{ fontFamily: "var(--font-dm-sans)" }}>
          Big buttons, one-handed friendly — built for crews on the go.
        </p>
      </div>

      <div
        className="mb-6 rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-sm leading-relaxed text-stone-700 shadow-sm"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        <p className="font-bold text-stone-800" style={{ fontFamily: "var(--font-syne)" }}>
          Add to your phone home screen
        </p>
        <p className="mt-1.5">
          <strong>iPhone (Safari)</strong> — Share → <em>Add to Home Screen</em>.{" "}
          <strong>Android (Chrome)</strong> — ⋮ → <em>Add to Home screen</em> or <em>Install app</em>.
          The icon opens this field screen; first time you may need to log in.
        </p>
      </div>

      <div className="space-y-6">
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={onFileChange}
        />
        <input
          ref={libraryInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={onFileChange}
        />

        <p className="text-center text-sm text-stone-600" style={{ fontFamily: "var(--font-dm-sans)" }}>
          Camera for a new shot, or library if you already have the picture.
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            disabled={busy || saving}
            className="flex min-h-[3.75rem] w-full items-center justify-center gap-3 rounded-2xl px-5 text-lg font-bold text-white shadow-lg transition active:scale-[0.99] disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, var(--accent) 0%, #e8451f 100%)",
              fontFamily: "var(--font-syne)",
              boxShadow: "0 8px 28px rgba(255, 88, 51, 0.35)",
            }}
          >
            <span className="text-2xl" aria-hidden>
              📷
            </span>
            Take photo
          </button>
          <button
            type="button"
            onClick={() => libraryInputRef.current?.click()}
            disabled={busy || saving}
            className="flex min-h-[3.75rem] w-full items-center justify-center gap-3 rounded-2xl border-2 border-amber-400/60 bg-white px-5 text-lg font-bold text-amber-950 shadow-md transition active:scale-[0.99] disabled:opacity-60"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            <span className="text-2xl" aria-hidden>
              🖼️
            </span>
            Choose from library
          </button>
        </div>

        {previewUrl && (
          <div className="overflow-hidden rounded-2xl border-2 border-white shadow-md" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Selected preview" className="max-h-72 w-full object-cover" />
            <button
              type="button"
              onClick={() => {
                resetPreview();
                setPublicUrl(null);
                setStoragePath(null);
                setGeneratedCaption(null);
                setGeneratedHashtags(null);
              }}
              className="w-full bg-stone-100 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-200"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Remove photo
            </button>
          </div>
        )}

        <label className="block">
          <span
            className="mb-2 block text-sm font-bold text-stone-800"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            What are we looking at?
          </span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={busy || saving}
            rows={5}
            placeholder="Setup, event type, neighborhood, weather, crowd energy — anything that makes this post feel real."
            className="w-full rounded-2xl border-2 border-amber-100 bg-white/90 px-4 py-4 text-base text-stone-800 shadow-inner outline-none ring-amber-300/30 placeholder:text-stone-400 focus:border-amber-300 focus:ring-4 disabled:opacity-60"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          />
        </label>

        {error && (
          <div
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
            style={{ fontFamily: "var(--font-dm-sans)" }}
            role="alert"
          >
            {error}
          </div>
        )}

        {successMessage && (
          <div
            className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-base font-bold text-emerald-900"
            style={{ fontFamily: "var(--font-dm-sans)" }}
            role="status"
          >
            {successMessage}
          </div>
        )}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={busy || saving || !file || !notes.trim()}
          className="flex min-h-[3.75rem] w-full items-center justify-center gap-2 rounded-2xl border-2 border-amber-400/50 bg-white px-5 text-lg font-bold text-amber-950 shadow-md transition active:scale-[0.99] disabled:opacity-50"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          {uploading && (
            <>
              <Spinner />
              Uploading…
            </>
          )}
          {generating && !uploading && (
            <>
              <Spinner />
              Generating magic…
            </>
          )}
          {!busy && "Generate Post"}
        </button>
      </div>

      {(generatedCaption || generatedHashtags) && (
        <div
          className="animate-fade-up mt-10 rounded-3xl border border-amber-200/60 bg-white p-6 shadow-lg"
          style={{ boxShadow: "0 16px 48px rgba(255, 140, 80, 0.15)" }}
        >
          <div className="mb-4 flex items-center gap-2">
            <span className="text-2xl" aria-hidden>
              ✨
            </span>
            <h2 className="text-xl font-extrabold" style={{ fontFamily: "var(--font-syne)", color: "var(--navy)" }}>
              Your generated post
            </h2>
          </div>
          <div
            className="mb-4 whitespace-pre-wrap rounded-2xl bg-amber-50/80 px-4 py-4 text-base leading-relaxed text-stone-800"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            {generatedCaption}
          </div>
          <p className="text-xs font-bold uppercase tracking-wide text-stone-500" style={{ fontFamily: "var(--font-syne)" }}>
            Hashtags
          </p>
          <p className="mt-1 break-words text-sm text-amber-950" style={{ fontFamily: "var(--font-dm-sans)" }}>
            {generatedHashtags}
          </p>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || busy || !generatedCaption}
            className="mt-6 flex min-h-[3.5rem] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 text-lg font-bold text-white shadow-lg transition active:scale-[0.99] disabled:opacity-50"
            style={{ fontFamily: "var(--font-syne)", boxShadow: "0 8px 24px rgba(16, 185, 129, 0.35)" }}
          >
            {saving ? (
              <>
                <Spinner light />
                Saving…
              </>
            ) : (
              "Save to Archive"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function Spinner({ light }: { light?: boolean }) {
  return (
    <span
      className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid ${light ? "border-white border-t-transparent" : "border-amber-900 border-t-transparent"}`}
      aria-hidden
    />
  );
}
