// src/components/prompt/PromptInput.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { PromptInputProps } from "./types";

const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState<string>(`
The origin story of the superhero Aura Echo - A deaf musician with the ability to generate sonic waves and manipulate vibrations, with an empathic link to emotions.
`);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(prompt);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder="Enter your story prompt here..."
        className="min-h-[120px] p-4"
        value={prompt}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setPrompt(e.target.value)
        }
      />
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || !prompt.trim()}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          "Generate Narrative"
        )}
      </Button>
    </form>
  );
};

export default PromptInput;
