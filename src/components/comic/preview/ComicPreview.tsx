// src/components/comic/preview/ComicPreview.tsx
import React, { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Panel, type ComicPanel, type LayoutTemplate } from "../types";
import { PreviewPanel } from "./PreviewPanel";
import { usePreviewDimensions } from "./usePreviewDimensions";
import { PanelEditorDialog } from "../../panel-editor/PanelEditorDialog";

interface ComicPreviewProps {
  layout: LayoutTemplate;
  panels: ComicPanel[];
  startIndex: number;
  pageIndex: number;
  orientation: "portrait" | "landscape";
  onUpdatePanel?: (panelIndex: number, updates: Partial<ComicPanel>) => void;
}

export const ComicPreview: React.FC<ComicPreviewProps> = ({
  layout,
  panels,
  startIndex,
  pageIndex,
  orientation,
  onUpdatePanel,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { dimensions } = usePreviewDimensions(wrapperRef, orientation);
  const [selectedPanel, setSelectedPanel] = useState<{
    index: number;
    aspectRatio: number;
    panel: ComicPanel;
  } | null>(null);

  const getPanelAspectRatio = (panel: Panel): number => {
    const panelWidth = (panel.width / 100) * dimensions.width;
    const panelHeight = (panel.height / 100) * dimensions.height;
    return panelWidth / panelHeight;
  };

  const handlePanelClick = (panelIndex: number, panel: Panel) => {
    const imageIndex = startIndex + panelIndex;
    const comicPanel = panels[imageIndex];

    if (comicPanel?.imageUrl) {
      setSelectedPanel({
        index: imageIndex,
        aspectRatio: getPanelAspectRatio(panel),
        panel: comicPanel,
      });
    }
  };

  const handleUpdatePanel = (updates: Partial<ComicPanel>) => {
    console.log("handleUpdatePanel", { selectedPanel, onUpdatePanel });
    if (selectedPanel && onUpdatePanel) {
      onUpdatePanel(selectedPanel.index, updates);
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
              onClick={() => handlePanelClick(index, panel)}
            />
          ))}
        </div>
      </Card>

      <PanelEditorDialog
        open={selectedPanel !== null}
        onOpenChange={(open) => !open && setSelectedPanel(null)}
        panel={selectedPanel?.panel ?? null}
        aspectRatio={selectedPanel?.aspectRatio ?? 1}
        onUpdatePanel={handleUpdatePanel}
      />
    </>
  );
};
