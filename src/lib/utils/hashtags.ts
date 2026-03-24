export function countHashtags(input: string) {
  return (input.match(/(^|\s)#[a-zA-Z0-9_]+/g) ?? []).length;
}
