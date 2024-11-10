// src/components/prompt/types.ts
export interface PromptInputProps {
  onSubmit: (prompt: string) => Promise<void>;
  isLoading: boolean;
}

export interface PreviewAreaProps {
  generatedContent: string | null;
}

export interface GenerateResponse {
  content: string;
  error?: string;
}
