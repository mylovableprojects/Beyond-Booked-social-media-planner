export type LlmGenerationInput = {
  prompt: string;
  responseSchemaHint?: string;
  /** Optional system prompt (e.g. field-post generation). */
  system?: string;
  /** Override default model (e.g. claude-sonnet-4-20250514). */
  model?: string;
  maxTokens?: number;
};

export type LlmGenerationOutput = {
  content: string;
};

export interface LlmProvider {
  generate(input: LlmGenerationInput): Promise<LlmGenerationOutput>;
}
