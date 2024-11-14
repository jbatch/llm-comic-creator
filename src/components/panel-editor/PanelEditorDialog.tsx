import React, { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageCropper } from "./image-cropper/ImageCropper";
import { LoaderCircle, Image, MessageSquare, Wand2 } from "lucide-react";
import { CropSettings, TextBox } from "../comic/types";
import SpeechBubblesTab from "./speech-bubbles/SpeechBubblesTab";
import { OpenAIService } from "@/services/openai";
import { useNavigate } from "react-router-dom";
import { useApiKey } from "@/hooks/useApiKey";
import {
  useComicPanels,
  useComicPanelActions,
} from "@/context/ComicPanelContext";

interface PanelEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  panelIndex: number;
  aspectRatio: number;
}

export const PanelEditorDialog: React.FC<PanelEditorDialogProps> = ({
  open,
  onOpenChange,
  panelIndex,
  aspectRatio,
}) => {
  const [activeTab, setActiveTab] = useState("crop");
  const [isGenerating, setIsGenerating] = useState(false);
  const {
    state: { panels },
  } = useComicPanels();
  const { updatePanel, appendText } = useComicPanelActions();
  const { getApiKeys } = useApiKey();
  const navigate = useNavigate();

  const panel = panels[panelIndex];

  const getOpenAIService = useCallback(() => {
    const apiKey = getApiKeys()?.openAi;
    if (!apiKey) {
      navigate("/settings");
      return null;
    }
    return new OpenAIService(apiKey);
  }, [getApiKeys, navigate]);

  if (!panel?.imageUrl) return null;

  const handleSaveCrop = (cropSettings: CropSettings) => {
    updatePanel(panelIndex, { cropSettings });
  };

  const handleGenerateSpeech = async () => {
    const openAi = getOpenAIService();
    if (!openAi) {
      throw new Error("Could not get open ai service");
    }
    try {
      setIsGenerating(true);
      const speech = await openAi.generateSpeechForPanel(panel.imagePrompt);
      appendText(panelIndex, speech);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateNarration = async () => {
    const openAi = getOpenAIService();
    if (!openAi) {
      throw new Error("Could not get open ai service");
    }
    try {
      setIsGenerating(true);
      // Assuming the API returns a single narration box
      const narration: TextBox = {
        type: "NARRATION",
        character: "",
        text: "TEST", //await openAi.generateNarrationForPanel(panel.imagePrompt),
      };
      appendText(panelIndex, [narration]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b px-3">
            <TabsList className="bg-transparent border-b-0">
              <TabsTrigger value="crop" className="gap-2">
                <Image className="w-4 h-4" />
                Crop
              </TabsTrigger>
              <TabsTrigger value="text" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Speech & Text
              </TabsTrigger>
              <TabsTrigger value="prompt" className="gap-2">
                <Wand2 className="w-4 h-4" />
                Image Generation
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="crop" className="mt-0">
            <ImageCropper
              imageUrl={panel.imageUrl}
              aspectRatio={aspectRatio}
              onSave={handleSaveCrop}
              initialState={panel.cropSettings}
            />
          </TabsContent>

          <TabsContent value="text" className="mt-0">
            <SpeechBubblesTab
              panelIndex={panelIndex}
              imageUrl={panel.imageUrl}
              imagePrompt={panel.imagePrompt}
              aspectRatio={aspectRatio}
              cropSettings={panel.cropSettings}
              isGenerating={isGenerating}
              onGenerateSpeech={handleGenerateSpeech}
              onGenerateNarration={handleGenerateNarration}
            />
          </TabsContent>

          <TabsContent value="prompt" className="mt-0 p-4 space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium text-sm">Image Prompt</h3>
                <Textarea
                  placeholder="Enter your image prompt here..."
                  value={panel.imagePrompt}
                  readOnly
                  className="min-h-[80px]"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Wand2 className="w-4 h-4" />
                  Edit Prompt
                </Button>
                <Button variant="secondary" size="sm" className="gap-2">
                  <LoaderCircle className="w-4 h-4" />
                  Regenerate Image
                </Button>
              </div>

              <div className="border rounded-lg p-3">
                <p className="text-sm text-gray-500">
                  Image Generation History
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Previous versions will appear here
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
