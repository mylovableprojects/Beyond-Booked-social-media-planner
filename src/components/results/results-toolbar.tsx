export function ResultsToolbar() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className="rounded-md border px-3 py-2 text-sm">
        Copy all
      </button>
      <button type="button" className="rounded-md border px-3 py-2 text-sm">
        Export HighLevel CSV
      </button>
      <button type="button" className="rounded-md border px-3 py-2 text-sm">
        Export HTML
      </button>
    </div>
  );
}
