// src/components/comic/preview/PreviewPanel.tsx
import React from "react";
import { ComicPanel, Panel } from "../types";

interface PreviewPanelProps {
  panel: Panel;
  image?: ComicPanel;
  imageIndex: number;
  onClick: () => void;
  orientation: "portrait" | "landscape";
  containerWidth: number;
  containerHeight: number;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  panel,
  image,
  imageIndex,
  onClick,
  orientation,
  containerWidth,
  containerHeight,
}) => {
  const A4_ASPECT = 1.4142;

  // Adjust percentages to maintain square-based aspect ratios on A4
  const adjustedDimensions = {
    x: panel.x,
    y: panel.y * A4_ASPECT,
    width: panel.width,
    height: panel.height * A4_ASPECT,
  };

  // Calculate actual dimensions based on container size
  const width = (adjustedDimensions.width / 100) * containerWidth;
  const height =
    ((adjustedDimensions.height / 100) * containerHeight) / A4_ASPECT;

  console.log(`Panel ${imageIndex} dimensions:`, {
    original: {
      x: panel.x,
      y: panel.y,
      width: panel.width,
      height: panel.height,
      aspectRatio: panel.width / panel.height,
    },
    adjusted: {
      width,
      height,
      aspectRatio: width / height,
      containerWidth,
      containerHeight,
    },
  });

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
          className="w-full h-full overflow-hidden cursor-pointer group"
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
