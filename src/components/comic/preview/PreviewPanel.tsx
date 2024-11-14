import React from "react";
import { Panel } from "../types";
import SpeechBubble from "../../panel-editor/speech-bubbles/SpeechBubble";
import { ComicPanel } from "@/types/comicPanelTypes";
import { Pencil } from "lucide-react";

interface PreviewPanelProps {
  panel: Panel;
  image?: ComicPanel;
  imageIndex: number;
  onClick: () => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  panel,
  image,
  imageIndex,
  onClick,
}) => {
  const A4_ASPECT = 1.4142;
  const adjustedDimensions = {
    x: panel.x,
    y: panel.y * A4_ASPECT,
    width: panel.width,
    height: panel.height * A4_ASPECT,
  };

  // Add a scaling factor to match the speech tab view exactly
  // The 0.65 factor was determined by comparing the visual sizes
  const scale = (panel.width / 100) * 0.65;

  return (
    <div
      className="absolute"
      style={{
        left: `${adjustedDimensions.x}%`,
        top: `${adjustedDimensions.y / A4_ASPECT}%`,
        width: `${adjustedDimensions.width}%`,
        height: `${adjustedDimensions.height / A4_ASPECT}%`,
        padding: "1px",
      }}
    >
      {image?.imageUrl ? (
        <div
          className="w-full h-full overflow-hidden cursor-pointer group relative"
          onClick={onClick}
          style={{
            backgroundColor: "#fff",
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.1)",
          }}
        >
          <img
            src={image.imageUrl}
            alt={`Panel ${imageIndex + 1}`}
            className="w-full h-full"
            style={{
              objectFit: "cover",
              objectPosition: image.cropSettings
                ? `${image.cropSettings.position.x * 100}% ${
                    image.cropSettings.position.y * 100
                  }%`
                : "50% 50%",
            }}
          />

          {/* Speech bubbles container with refined scaling */}
          <div
            className="absolute inset-0"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              width: `${100 / scale}%`,
              height: `${100 / scale}%`,
            }}
          >
            {image.text?.map((textBox, textIndex) => {
              const position = image.textPositions?.[textIndex] || {
                x: 50,
                y: 50,
                isFlipped: false,
                tailPosition: { offset: 20, side: "bottom" },
              };
              return (
                <SpeechBubble
                  key={textIndex}
                  textBox={textBox}
                  position={position}
                  onPositionChange={() => {}} // Read-only in preview
                  isPreview={true}
                />
              );
            })}
          </div>

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white/20 rounded-full">
              <Pencil className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
          No image
        </div>
      )}
    </div>
  );
};
