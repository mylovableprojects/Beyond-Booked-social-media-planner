import Anthropic from "@anthropic-ai/sdk";
import type { LlmGenerationInput, LlmGenerationOutput, LlmProvider } from "./provider";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export class AnthropicProvider implements LlmProvider {
  async generate(input: LlmGenerationInput): Promise<LlmGenerationOutput> {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: input.prompt }],
    });

    const block = message.content[0];
    const content = block.type === "text" ? block.text : "";
    return { content };
  }
}
