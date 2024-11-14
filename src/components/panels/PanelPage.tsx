import React, { useEffect, useCallback, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { OpenAIService } from "../../services/openai";
import { useApiKey } from "../../hooks/useApiKey";
import { useToast } from "../../hooks/useToast";
import PanelBreadcrumb from "./PanelBreadcrumb";
import PanelGrid from "./PanelGrid";
import { BookOpen } from "lucide-react";
import { CharacterDescriptions } from "../comic/types";
import { LeonardoService } from "@/services/leonardo";
import {
  useComicPanels,
  useComicPanelActions,
} from "@/context/ComicPanelContext";

const PanelPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getApiKeys } = useApiKey();
  const storyContent = location.state?.content;

  // Replace useState with context
  const {
    state: { panels, isLoading, error },
  } = useComicPanels();
  const {
    setPanels,
    generateImageStart,
    generateImageSuccess,
    generateImageError,
  } = useComicPanelActions();

  const [characters, setCharacters] = useState<CharacterDescriptions>({});

  const getOpenAIService = useCallback(() => {
    const apiKey = getApiKeys()?.openAi;
    if (!apiKey) {
      navigate("/settings");
      return null;
    }
    return new OpenAIService(apiKey);
  }, [getApiKeys, navigate]);

  const getLeonardoService = useCallback(() => {
    const apiKey = getApiKeys()?.leonardo;
    if (!apiKey) {
      navigate("/settings");
      return null;
    }
    return new LeonardoService(apiKey);
  }, [getApiKeys, navigate]);

  const generatePanels = useCallback(async () => {
    const openai = getOpenAIService();
    if (!openai || !storyContent) return;

    try {
      const response = await openai.generateComicPanels(storyContent);
      console.log({ response });
      setPanels(response.panels);
      setCharacters(response.characters);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred while generating the panels";
      generateImageError(0, errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  }, [getOpenAIService, storyContent, toast, setPanels, generateImageError]);

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

  const handleGenerateAllImages = () => {
    panels.forEach((_, index) => handleGenerateImage(index));
  };

  const handleGenerateImage = async (panelIndex: number) => {
    const imageGenerationService = getLeonardoService();
    if (!imageGenerationService) return;
    const panel = panels[panelIndex];

    const charactersInScene = Object.keys(characters)
      .filter((characterName) => panel.imagePrompt.includes(characterName))
      .map((name) => `${name}: ${characters[name]}`)
      .join("\n");

    generateImageStart(panelIndex);

    try {
      const promptWithCharacters = charactersInScene + "\n" + panel.imagePrompt;
      console.log("Generating", { panel, promptWithCharacters });
      const { imageUrl, imageBase64 } =
        await imageGenerationService.generateImage(
          promptWithCharacters,
          panel.panelShape
        );

      generateImageSuccess(panelIndex, imageUrl!, imageBase64);

      toast({
        title: "Image Generated",
        description: `Panel ${
          panelIndex + 1
        } image has been generated successfully.`,
      });
    } catch (error) {
      generateImageError(
        panelIndex,
        error instanceof Error ? error.message : "Failed to generate image"
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
          <div>
            <Button
              onClick={handleRegeneratePanels}
              disabled={isLoading}
              variant="outline"
              className="mr-2"
            >
              Regenerate Panels
            </Button>
            <Button
              onClick={handleGenerateAllImages}
              disabled={isLoading}
              variant="outline"
            >
              Generate All Images
            </Button>
          </div>
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
              <Link to="/comic">
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
