import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Type,
  Sparkles,
  Trash2,
  LoaderCircle,
  Quote,
} from "lucide-react";
import SpeechBubble from "./SpeechBubble";
import {
  useComicPanels,
  useComicPanelActions,
} from "@/context/ComicPanelContext";

interface SpeechBubblesTabProps {
  panelIndex: number;
  imageUrl: string;
  imagePrompt: string;
  aspectRatio: number;
  cropSettings?: {
    position: {
      x: number;
      y: number;
    };
  };
  isGenerating?: boolean;
  onGenerateSpeech?: () => Promise<void>;
  onGenerateNarration?: () => Promise<void>;
}

const SpeechBubblesTab: React.FC<SpeechBubblesTabProps> = ({
  panelIndex,
  imageUrl,
  imagePrompt,
  aspectRatio,
  cropSettings,
  isGenerating = false,
  onGenerateSpeech,
  onGenerateNarration,
}) => {
  const {
    state: { panels },
  } = useComicPanels();
  const { updateText, updateTextPosition } = useComicPanelActions();
  const panel = panels[panelIndex];
  const text = panel.text || [];
  const textPositions = panel.textPositions || [];

  const handlePositionChange = (
    textIndex: number,
    position: { x: number; y: number; isFlipped: boolean }
  ) => {
    updateTextPosition(panelIndex, textIndex, position);
  };

  const onRemoveText = (index: number) => {
    const newText = text.filter((_, i) => i !== index);
    updateText(panelIndex, newText);
  };

  return (
    <div className="grid grid-cols-2 h-[500px]">
      {/* Left Column - Controls */}
      <div className="p-4 border-r">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-medium text-sm">Scene Description</h3>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                {imagePrompt}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-sm">Generate Text</h3>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={onGenerateSpeech}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                  ) : (
                    <MessageSquare className="w-4 h-4" />
                  )}
                  Generate Speech
                  <Sparkles className="w-3 h-3 ml-auto text-blue-500" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={onGenerateNarration}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                  ) : (
                    <Type className="w-4 h-4" />
                  )}
                  Generate Narration
                  <Sparkles className="w-3 h-3 ml-auto text-blue-500" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-sm">Text Elements</h3>
              <div className="space-y-2">
                {text.length === 0 ? (
                  <div className="border rounded-lg p-3 space-y-1">
                    <p className="text-sm text-gray-500">
                      No text elements added yet
                    </p>
                    <p className="text-xs text-gray-400">
                      Generated text will appear here for editing
                    </p>
                  </div>
                ) : (
                  text.map((textBox, index) => (
                    <div
                      key={index}
                      className="group border rounded-lg p-3 space-y-2 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {textBox.type === "SPEECH" ? (
                            <>
                              <MessageSquare className="h-4 w-4 text-blue-500" />
                              {textBox.character && (
                                <span className="text-xs font-medium text-blue-600">
                                  {textBox.character}
                                </span>
                              )}
                            </>
                          ) : (
                            <Quote className="h-4 w-4 text-purple-500" />
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => onRemoveText?.(index)}
                        >
                          <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                        </Button>
                      </div>
                      <p className="text-sm">{textBox.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Right Column - Image Preview */}
      <div className="bg-gray-50">
        <div className="w-full h-full flex items-center justify-center p-2">
          <div
            className="relative bg-white shadow-md"
            style={{
              width: "100%",
              height: "100%",
              maxWidth: aspectRatio > 1 ? "95%" : `${95 * aspectRatio}%`,
              maxHeight: aspectRatio > 1 ? `${95 / aspectRatio}%` : "95%",
            }}
          >
            <img
              src={imageUrl}
              alt="Panel preview"
              className="w-full h-full object-cover"
              style={{
                objectPosition: cropSettings
                  ? `${cropSettings.position.x * 100}% ${
                      cropSettings.position.y * 100
                    }%`
                  : "50% 50%",
              }}
            />

            {/* Overlay speech bubbles */}
            {text.map((textBox, index) => (
              <SpeechBubble
                key={index}
                textBox={textBox}
                position={
                  textPositions[index] || { x: 50, y: 50, isFlipped: false }
                }
                onPositionChange={(newPosition) =>
                  handlePositionChange(index, newPosition)
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeechBubblesTab;
