// src/components/comic/preview/ComicPreview.tsx
import React, { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Panel, type ComicPanel, type LayoutTemplate } from "../types";
import { ImageCropper } from "../../image-cropper/ImageCropper";
import { PreviewPanel } from "./PreviewPanel";
import { usePreviewDimensions } from "./usePreviewDimensions";

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
    imageUrl: string;
  } | null>(null);

  const handlePanelClick = (panelIndex: number, panel: Panel) => {
    const imageIndex = startIndex + panelIndex;
    const comicPanel = panels[imageIndex];

    if (comicPanel?.imageUrl) {
      const aspectRatio = panel.width / panel.height;
      setSelectedPanel({
        index: imageIndex,
        aspectRatio,
        imageUrl: comicPanel.imageUrl,
      });
    }
  };

  const handleCropSave = (cropState: {
    position: { x: number; y: number };
  }) => {
    console.log({ selectedPanel, onUpdatePanel });
    if (selectedPanel && onUpdatePanel) {
      console.log("Updating panel crop settings", { cropSettings: cropState });
      onUpdatePanel(selectedPanel.index, {
        cropSettings: cropState,
      });
    }
    setSelectedPanel(null);
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

      <Dialog
        open={selectedPanel !== null}
        onOpenChange={() => setSelectedPanel(null)}
      >
        <DialogContent className="max-w-4xl p-0">
          {selectedPanel && (
            <ImageCropper
              imageUrl={selectedPanel.imageUrl}
              aspectRatio={selectedPanel.aspectRatio}
              onSave={handleCropSave}
              initialState={panels[selectedPanel.index].cropSettings}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ComicPreview;
