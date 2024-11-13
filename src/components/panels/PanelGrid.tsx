// src/components/panel/PanelGrid.tsx
import React from "react";
import PanelCard from "./PanelCard";
import PanelCardSkeleton from "./PanelCardSekeleton";
import { ComicPanel } from "../comic/types";

interface PanelGridProps {
  panels: ComicPanel[];
  isLoading: boolean;
  onGenerateImage: (index: number) => void;
}

const PanelGrid: React.FC<PanelGridProps> = ({
  panels,
  isLoading,
  onGenerateImage,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {isLoading
      ? [...Array(4)].map((_, index) => <PanelCardSkeleton key={index} />)
      : panels.map((panel, index) => (
          <PanelCard
            key={`panel-${index}-${panel.isGenerating ? "generating" : "idle"}`} // Add panel state to key
            index={index}
            imagePrompt={panel.imagePrompt}
            imageUrl={panel.imageUrl}
            isGenerating={panel.isGenerating}
            onGenerateImage={onGenerateImage}
          />
        ))}
  </div>
);

export default PanelGrid;
