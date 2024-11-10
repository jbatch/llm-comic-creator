import React, { memo } from "react";
import { ImageIcon, LoaderCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PanelCardProps {
  index: number;
  imagePrompt: string;
  imageUrl?: string;
  isGenerating?: boolean;
  onGenerateImage: (index: number) => void;
}

const PanelCard = memo(
  ({
    index,
    imagePrompt,
    imageUrl,
    isGenerating,
    onGenerateImage,
  }: PanelCardProps) => {
    const handleGenerateClick = () => {
      if (!isGenerating) {
        onGenerateImage(index);
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Panel {index + 1}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {imageUrl ? (
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <img
                src={imageUrl}
                alt={`Panel ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <Button
                variant="outline"
                size="sm"
                className="absolute bottom-2 right-2"
                onClick={handleGenerateClick}
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : "Regenerate"}
              </Button>
            </div>
          ) : (
            <button
              onClick={handleGenerateClick}
              disabled={isGenerating}
              className="w-full focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg group"
            >
              <div
                className={`bg-gray-100 w-full aspect-video rounded-lg flex items-center justify-center border
              ${
                isGenerating
                  ? "border-blue-200 bg-blue-50"
                  : "border-gray-200 group-hover:border-blue-200 group-hover:bg-gray-50"
              } 
              transition-colors`}
              >
                <div className="text-center p-4">
                  {isGenerating ? (
                    <>
                      <LoaderCircle className="mx-auto h-12 w-12 text-blue-400 animate-spin mb-2" />
                      <p className="text-sm text-gray-500">
                        Generating image...
                      </p>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-400 transition-colors mb-2" />
                      <p className="text-sm text-gray-500 group-hover:text-gray-600">
                        Click to generate image
                      </p>
                    </>
                  )}
                </div>
              </div>
            </button>
          )}
          <p className="text-gray-600 text-sm">{imagePrompt}</p>
        </CardContent>
      </Card>
    );
  }
);

PanelCard.displayName = "PanelCard";

export default PanelCard;
