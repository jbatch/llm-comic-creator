// src/components/panel/PanelPage.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { OpenAIService, ComicPanel } from "../../services/openai";
import { useApiKey } from "../../hooks/useApiKey";
import { useToast } from "../../hooks/use-toast";
import PanelBreadcrumb from "./PanelBreadcrumb";
import PanelGrid from "./PanelGrid";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

const PanelPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getApiKey } = useApiKey();
  const storyContent = location.state?.content;

  const [panels, setPanels] = useState<ComicPanel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create a memoized function to get the OpenAI service
  const getOpenAIService = useCallback(() => {
    const apiKey = getApiKey();
    if (!apiKey) {
      navigate("/settings");
      return null;
    }
    return new OpenAIService(apiKey);
  }, [getApiKey, navigate]);

  const generatePanels = useCallback(async () => {
    const openai = getOpenAIService();
    if (!openai || !storyContent) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await openai.generateComicPanels(storyContent);
      setPanels(response.panels);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred while generating the panels";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [getOpenAIService, storyContent, toast]);

  // Initialize panels when the component mounts
  useEffect(() => {
    if (!storyContent) {
      navigate("/");
      return;
    }

    generatePanels();
  }, [storyContent, generatePanels, navigate]);

  const handleRegeneratePanels = () => {
    generatePanels();
  };

  const handleGenerateImage = async (panelIndex: number) => {
    const openai = getOpenAIService();
    if (!openai) return;

    setPanels((prevPanels) =>
      prevPanels.map((panel, idx) =>
        idx === panelIndex ? { ...panel, isGenerating: true } : panel
      )
    );

    try {
      const { imageUrl, imageBase64 } = await openai.generateImage(
        panels[panelIndex].imagePrompt
      );

      setPanels((prevPanels) =>
        prevPanels.map((panel, idx) =>
          idx === panelIndex
            ? { ...panel, imageUrl, imageBase64, isGenerating: false }
            : panel
        )
      );

      toast({
        title: "Image Generated",
        description: `Panel ${
          panelIndex + 1
        } image has been generated successfully.`,
      });
    } catch (error) {
      setPanels((prevPanels) =>
        prevPanels.map((panel, idx) =>
          idx === panelIndex ? { ...panel, isGenerating: false } : panel
        )
      );

      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to generate image",
      });
    }
  };

  const allPanelsHaveImages = useCallback(() => {
    return panels.length > 0 && panels.every((panel) => panel.imageUrl);
  }, [panels]);

  return (
    <div className="min-h-screen bg-gray-50">
      <PanelBreadcrumb />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Story Panels
            </h1>
            <p className="text-gray-600">
              Your story visualized as comic panels
            </p>
          </div>
          <Button
            onClick={handleRegeneratePanels}
            disabled={isLoading}
            variant="outline"
          >
            Regenerate Panels
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        <PanelGrid
          panels={panels}
          isLoading={isLoading}
          onGenerateImage={handleGenerateImage}
        />

        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="outline" asChild>
            <Link to="/">Back to Story</Link>
          </Button>

          {allPanelsHaveImages() && (
            <Button asChild className="gap-2">
              <Link to="/comic2" state={{ panels }}>
                <BookOpen className="h-4 w-4" />
                Generate Comic
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PanelPage;
