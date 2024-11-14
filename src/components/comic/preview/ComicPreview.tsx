import React, { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Panel, type LayoutTemplate } from "../types";
import { PreviewPanel } from "./PreviewPanel";
import { usePreviewDimensions } from "./usePreviewDimensions";
import { PanelEditorDialog } from "../../panel-editor/PanelEditorDialog";
import { useComicPanels } from "@/context/ComicPanelContext";

interface ComicPreviewProps {
  layout: LayoutTemplate;
  startIndex: number;
  pageIndex: number;
  orientation: "portrait" | "landscape";
}

export const ComicPreview: React.FC<ComicPreviewProps> = ({
  layout,
  startIndex,
  pageIndex,
  orientation,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { dimensions } = usePreviewDimensions(wrapperRef, orientation);
  const [selectedPanelIndex, setSelectedPanelIndex] = useState<number | null>(
    null
  );
  const {
    state: { panels },
  } = useComicPanels();

  const getPanelAspectRatio = (panel: Panel): number => {
    const panelWidth = (panel.width / 100) * dimensions.width;
    const panelHeight = (panel.height / 100) * dimensions.height;
    return panelWidth / panelHeight;
  };

  const handlePanelClick = (panelIndex: number) => {
    const imageIndex = startIndex + panelIndex;
    const comicPanel = panels[imageIndex];

    if (comicPanel?.imageUrl) {
      setSelectedPanelIndex(imageIndex);
    }
  };

  return (
    <>
      <Card
        ref={wrapperRef}
        className="flex-1 relative bg-white flex items-center justify-center p-6 h-[calc(100vh-theme(spacing.64))]"
      >
        <div
          style={{
            width: dimensions.width,
            height: dimensions.height,
            transition: "width 0.3s, height 0.3s",
          }}
          className="relative bg-white shadow-lg"
          data-page-index={pageIndex}
        >
          {layout.panels.map((panel, index) => (
            <PreviewPanel
              key={index}
              panel={panel}
              image={panels[startIndex + index]}
              imageIndex={startIndex + index}
              onClick={() => handlePanelClick(index)}
            />
          ))}
        </div>
      </Card>

      {selectedPanelIndex !== null && (
        <PanelEditorDialog
          open={selectedPanelIndex !== null}
          onOpenChange={(open) => !open && setSelectedPanelIndex(null)}
          panelIndex={selectedPanelIndex}
          aspectRatio={
            selectedPanelIndex !== null
              ? getPanelAspectRatio(
                  layout.panels[selectedPanelIndex - startIndex]
                )
              : 1
          }
        />
      )}
    </>
  );
};
