export function countEmojis(input: string) {
  const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
  return (input.match(emojiRegex) ?? []).length;
}
