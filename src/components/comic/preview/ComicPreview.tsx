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

  const getPanelAspectRatio = (panel: Panel): number => {
    const A4_ASPECT = orientation === "portrait" ? 1.4142 : 1 / 1.4142;

    // Calculate actual panel dimensions on A4 page
    const panelWidth = (panel.width / 100) * dimensions.width;
    const panelHeight = (panel.height / 100) * dimensions.height;

    const aspectRatio = panelWidth / panelHeight;

    console.log("Panel aspect ratio calculation:", {
      panel: {
        percentWidth: panel.width,
        percentHeight: panel.height,
      },
      a4: {
        pageWidth: dimensions.width,
        pageHeight: dimensions.height,
        pageAspect: A4_ASPECT,
      },
      actual: {
        pixelWidth: panelWidth,
        pixelHeight: panelHeight,
        aspectRatio,
      },
    });

    return aspectRatio;
  };

  const handlePanelClick = (panelIndex: number, panel: Panel) => {
    const imageIndex = startIndex + panelIndex;
    const comicPanel = panels[imageIndex];

    if (comicPanel?.imageUrl) {
      const aspectRatio = getPanelAspectRatio(panel);
      console.log("Opening crop dialog:", {
        panelIndex,
        imageIndex,
        aspectRatio,
      });

      setSelectedPanel({
        index: imageIndex,
        aspectRatio,
        imageUrl: comicPanel.imageUrl,
      });
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
              orientation={orientation}
              containerWidth={dimensions.width}
              containerHeight={dimensions.height}
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
              onSave={(cropState) => {
                if (onUpdatePanel) {
                  onUpdatePanel(selectedPanel.index, {
                    cropSettings: cropState,
                  });
                }
                setSelectedPanel(null);
              }}
              initialState={panels[selectedPanel.index].cropSettings}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ComicPreview;
