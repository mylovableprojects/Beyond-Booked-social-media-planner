const BANNED_PHRASES = [
  "elevate your",
  "elevating your",
  "elevates your",
  "unleash",
  "unlock the",
  "seamlessly",
  "seamless experience",
  "game-changer",
  "game changer",
  "dive in",
  "dive into",
  "leverage",
  "leveraging",
  "robust",
  "cutting-edge",
  "state-of-the-art",
  "unforgettable experience",
  "unforgettable memories",
  "look no further",
  "we are thrilled",
  "we are excited to announce",
  "transformative",
  "transform your",
  "in today's world",
  "in today's fast-paced",
  "it's important to note",
  "it's worth noting",
  "at the end of the day",
  "to the next level",
  "don't miss out",
  "are you ready to",
  "have you ever wondered",
  "imagine a world where",
];

export function humanizeContent(content: string): string {
  let output = content.trim();

  // Remove banned phrases
  for (const phrase of BANNED_PHRASES) {
    const regex = new RegExp(phrase, "gi");
    output = output.replace(regex, "");
  }

  // Replace em dashes with commas
  output = output.replace(/\s*[—–]\s*/g, ", ");

  // Strip multiple exclamation marks — keep at most one in the whole post
  const exclamationCount = (output.match(/!/g) ?? []).length;
  if (exclamationCount > 1) {
    let kept = false;
    output = output.replace(/!/g, () => {
      if (!kept) { kept = true; return "!"; }
      return ".";
    });
  }

  // Clean up double spaces and leading/trailing commas from phrase removal
  // Use [^\S\n] so we collapse horizontal whitespace only — never touch newlines
  output = output.replace(/,\s*,/g, ",");
  output = output.replace(/[^\S\n]+/g, " ");
  output = output.replace(/^\s*,\s*/gm, "");

  // Normalize paragraph spacing: 3+ newlines → 2 (one blank line)
  output = output.replace(/\n{3,}/g, "\n\n");

  return output.trim();
}
