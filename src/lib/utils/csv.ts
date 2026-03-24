export function csvEscape(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}
