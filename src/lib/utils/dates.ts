export function monthYearLabel(month: number, year: number) {
  return `${String(month).padStart(2, "0")}/${year}`;
}
