import React from "react";
import { type ComicPanel, type Panel } from "../types";

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
  const applyTransform = (
    imageUrl: string,
    cropSettings?: { position: { x: number; y: number } }
  ) => {
    console.log("Apply transform", cropSettings);
    if (!cropSettings)
      return {
        objectFit: "cover" as const,
        objectPosition: `50% 50%%`,
      };

    return {
      objectFit: "cover" as const,
      objectPosition: `${cropSettings.position.x * 100}% ${
        cropSettings.position.y * 100
      }%`,
    };
  };

  return (
    <div
      className="absolute"
      style={{
        left: `${panel.x}%`,
        top: `${panel.y}%`,
        width: `${panel.width}%`,
        height: `${panel.height}%`,
        padding: "4px",
      }}
    >
      {image?.imageUrl ? (
        <div
          className="w-full h-full overflow-hidden cursor-pointer group"
          onClick={onClick}
        >
          <img
            src={image.imageUrl}
            alt={`Panel ${imageIndex + 1}`}
            className="w-full h-full"
            style={applyTransform(image.imageUrl, image.cropSettings)}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="text-white text-sm">Click to adjust crop</span>
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
