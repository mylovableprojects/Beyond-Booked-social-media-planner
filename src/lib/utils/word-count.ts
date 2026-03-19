export function countWords(input: string) {
  return input.trim().split(/\s+/).filter(Boolean).length;
}
