export type LlmGenerationInput = {
  prompt: string;
  responseSchemaHint?: string;
};

export type LlmGenerationOutput = {
  content: string;
};

export interface LlmProvider {
  generate(input: LlmGenerationInput): Promise<LlmGenerationOutput>;
}
