import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Toolbar } from "./Toolbar";
import { PageCanvas } from "./PageCanvas";
import { SelectedPanel } from "./SelectedPanel";
import { Node, Orientation, Split } from "./types";

const LayoutGeneratorPage: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [rootNode, setRootNode] = useState<Node>({
    id: "root",
    type: "leaf",
  });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Calculate and update dimensions based on container size
  useEffect(() => {
    const updateDimensions = () => {
      if (wrapperRef.current) {
        const wrapper = wrapperRef.current;
        const wrapperWidth = wrapper.clientWidth;
        const wrapperHeight = wrapper.clientHeight;
        const padding = 48; // 24px padding on each side
        const availableWidth = wrapperWidth - padding;
        const availableHeight = wrapperHeight - padding;

        // A4 aspect ratio is 1:1.4142 (portrait)
        const aspectRatio = orientation === "portrait" ? 1.4142 : 1 / 1.4142;

        let width, height;

        if (orientation === "portrait") {
          // In portrait mode, constrain by height if needed
          if (availableHeight < availableWidth * aspectRatio) {
            height = availableHeight;
            width = height / aspectRatio;
          } else {
            width = availableWidth;
            height = width * aspectRatio;
          }
        } else {
          // In landscape mode, constrain by width if needed
          if (availableWidth < availableHeight / aspectRatio) {
            width = availableWidth;
            height = width * aspectRatio;
          } else {
            height = availableHeight;
            width = height / aspectRatio;
          }
        }

        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [orientation]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const toggleOrientation = () => {
    setOrientation((prev) => (prev === "portrait" ? "landscape" : "portrait"));
  };

  const splitNode = (nodeId: string, splitType: Split) => {
    const updateNode = (node: Node): Node => {
      if (node.id === nodeId && node.type === "leaf") {
        return {
          id: node.id,
          type: "split",
          splitType,
          ratio: 0.5,
          children: [
            { id: generateId(), type: "leaf" },
            { id: generateId(), type: "leaf" },
          ],
        };
      }
      if (node.type === "split") {
        return {
          ...node,
          children: [
            updateNode(node.children[0]),
            updateNode(node.children[1]),
          ],
        };
      }
      return node;
    };
    setRootNode(updateNode(rootNode));
  };

  const updateNodeRatio = (nodeId: string, newRatio: number) => {
    const updateNode = (node: Node): Node => {
      if (node.id === nodeId && node.type === "split") {
        return {
          ...node,
          ratio: Math.max(0.1, Math.min(0.9, newRatio)),
        };
      }
      if (node.type === "split") {
        return {
          ...node,
          children: [
            updateNode(node.children[0]),
            updateNode(node.children[1]),
          ],
        };
      }
      return node;
    };
    setRootNode(updateNode(rootNode));
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
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

  const handleSplitVertical = () => {
    if (selectedId) {
      splitNode(selectedId, "vertical");
    }
  };

  const handleSplitHorizontal = () => {
    if (selectedId) {
      splitNode(selectedId, "horizontal");
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
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
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
