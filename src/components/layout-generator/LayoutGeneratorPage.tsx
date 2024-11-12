// src/components/layout-generator/LayoutGeneratorPage.tsx
import React, { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Toolbar } from "./Toolbar";
import { PageCanvas } from "./PageCanvas";
import { SelectedPanel } from "./SelectedPanel";
import { Split } from "./types";
import { useLayoutManager } from "./hooks/useLayoutManager";
import { useCanvasDimensions } from "./hooks/useCanvasDimensions";

const LayoutGeneratorPage: React.FC = () => {
  const {
    rootNode,
    selectedId,
    orientation,
    isDragging,
    toggleOrientation,
    updateNodeRatio,
    splitNode,
    setSelectedId,
    setIsDragging,
  } = useLayoutManager();

  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { dimensions } = useCanvasDimensions(wrapperRef, orientation);

  const handleSplitVertical = () => {
    if (selectedId) splitNode(selectedId, "vertical");
  };

  const handleSplitHorizontal = () => {
    if (selectedId) splitNode(selectedId, "horizontal");
  };

  const handleDividerDrag = (
    nodeId: string,
    splitType: Split,
    e: MouseEvent
  ) => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();

    if (splitType === "vertical") {
      const mouseX = e.clientX - containerRect.left;
      const ratio = mouseX / containerRect.width;
      updateNodeRatio(nodeId, ratio);
    } else {
      const mouseY = e.clientY - containerRect.top;
      const ratio = mouseY / containerRect.height;
      updateNodeRatio(nodeId, ratio);
    }
  };

  return (
    <div className="h-[calc(100vh-theme(spacing.16))] flex flex-col">
      <Toolbar
        orientation={orientation}
        selectedId={selectedId}
        onOrientationToggle={toggleOrientation}
        onSplitVertical={handleSplitVertical}
        onSplitHorizontal={handleSplitHorizontal}
      />

      <div className="flex-1 p-6 flex gap-4 overflow-hidden">
        <Card
          ref={wrapperRef}
          className="flex-1 relative bg-white flex items-center justify-center p-6"
        >
          <div
            style={{
              width: dimensions.width,
              height: dimensions.height,
            }}
            className="relative bg-white shadow-lg"
          >
            <div
              ref={containerRef}
              className={`absolute inset-0 ${
                isDragging ? "cursor-grabbing" : ""
              }`}
            >
              <PageCanvas
                node={rootNode}
                selectedId={selectedId}
                isDragging={isDragging}
                onSelectPanel={setSelectedId}
                onDividerDrag={handleDividerDrag}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
              />
            </div>
          </div>
        </Card>

        {selectedId && (
          <SelectedPanel id={selectedId} onClose={() => setSelectedId(null)} />
        )}
      </div>
    </div>
  );
};

export default LayoutGeneratorPage;
