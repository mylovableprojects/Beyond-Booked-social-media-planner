export function GenerationProgress({ running }: { running: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-2.5 text-sm shadow-sm">
      {running ? "Generating content..." : "Ready to generate."}
    </div>
  );
}
