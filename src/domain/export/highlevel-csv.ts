import type { GeneratedPost } from "@/types/content";

function escapeCsv(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function daysInMonth(year: number, month: number) {
  // month is 1-12
  return new Date(year, month, 0).getDate();
}

function formatPostAtSpecificTime(month: number, year: number, postIndex: number) {
  const day = Math.min(postIndex + 1, daysInMonth(year, month));
  // v1: only month/year are known, so we schedule at a deterministic HH:mm:ss.
  return `${year}-${pad2(month)}-${pad2(day)} 09:00:00`;
}

export function toHighLevelCsv(posts: GeneratedPost[], month: number, year: number) {
  // v1: exact header names required by HighLevel import mapping.
  const header = [
    "postAtSpecificTime (YYYY-MM-DD HH:mm:ss)",
    "content",
    "link (OGmetaUrl)",
    "imageUrls",
    "gifUrl",
    "videoUrls",
  ];

  const rows = posts.map((post) => [
    escapeCsv(formatPostAtSpecificTime(month, year, post.postIndex ?? 0)),
    escapeCsv(post.content ?? ""),
    // v1: leave all media/link fields blank by default.
    escapeCsv(""), // link (OGmetaUrl)
    escapeCsv(""), // imageUrls
    escapeCsv(""), // gifUrl
    escapeCsv(""), // videoUrls
  ]);

  return [header.join(","), ...rows.map((row) => row.join(","))].join("\n");
}
