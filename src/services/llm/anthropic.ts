import Anthropic from "@anthropic-ai/sdk";
import type { LlmGenerationInput, LlmGenerationOutput, LlmProvider } from "./provider";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const DEFAULT_MODEL = "claude-sonnet-4-6";

export class AnthropicProvider implements LlmProvider {
  async generate(input: LlmGenerationInput): Promise<LlmGenerationOutput> {
    const message = await client.messages.create({
      model: input.model ?? DEFAULT_MODEL,
      max_tokens: input.maxTokens ?? 1024,
      ...(input.system ? { system: input.system } : {}),
      messages: [{ role: "user", content: input.prompt }],
    });

    const block = message.content[0];
    const content = block.type === "text" ? block.text : "";
    return { content };
  }
}
