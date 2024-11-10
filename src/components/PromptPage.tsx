// src/components/PromptPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PromptInput, Instructions, MarkdownPreview } from "./prompt";
import { useApiKey } from "../hooks/useApiKey";
import { useToast } from "../hooks/use-toast";
import { OpenAIService } from "../services/openai";

const PromptPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { getApiKey, hasApiKey } = useApiKey();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!hasApiKey()) {
      navigate("/settings");
    }
  }, [hasApiKey, navigate]);

  const handlePromptSubmit = async (prompt: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    const apiKey = getApiKey();
    if (!apiKey) {
      setError(
        "API key not found. Please add your OpenAI API key in settings."
      );
      setIsLoading(false);
      return;
    }

    try {
      const openai = new OpenAIService(apiKey);
      const content = await openai.generateStoryOutline(prompt);
      setGeneratedContent(content);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred while generating the story outline";
      setError(errorMessage);

      if (errorMessage.toLowerCase().includes("api key")) {
        navigate("/settings");
      }

      console.error("Error generating story outline:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePanelGeneration = () => {
    if (generatedContent) {
      navigate("/panels", { state: { content: generatedContent } });
    }
  };

  const handleSaveContent = (newContent: string) => {
    setGeneratedContent(newContent);
    toast({
      title: "Changes saved",
      description: "Your edited content has been saved.",
      duration: 2000,
    });
  };

  return (
    <div className="flex h-[calc(100vh-theme(spacing.32))] overflow-hidden">
      {/* Left half - Input */}
      <div className="w-1/2 p-4 overflow-y-auto">
        <div className="space-y-1 mb-4">
          <h1 className="text-xl font-bold">Create Your Story</h1>
          <p className="text-sm text-gray-600">
            Enter your prompt below and we'll help you generate a narrative.
          </p>
        </div>

        <div className="space-y-4">
          <Instructions />

          <Card>
            <CardContent className="pt-4">
              <PromptInput
                onSubmit={handlePromptSubmit}
                isLoading={isLoading}
              />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right half - Preview */}
      <div className="w-1/2 p-4 bg-gray-50 border-l overflow-hidden flex flex-col">
        <div className="flex-grow overflow-hidden">
          <MarkdownPreview
            content={generatedContent}
            isLoading={isLoading}
            onSave={handleSaveContent}
          />
        </div>

        {/* Action buttons */}
        {generatedContent && !isLoading && (
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handlePanelGeneration}
              className="w-full sm:w-auto"
            >
              Continue to Panels
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptPage;
