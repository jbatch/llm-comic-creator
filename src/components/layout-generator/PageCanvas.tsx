// src/components/layout-generator/PageCanvas/index.tsx

import React, { useCallback } from "react";
import { Divider } from "./Divider";
import { Panel } from "./Panel";
import { Split, Bounds, Node } from "./types";
import { calculateChildBounds } from "./utils";

interface PageCanvasProps {
  node: Node;
  selectedId: string | null;
  isDragging: boolean;
  onSelectPanel: (id: string | null) => void;
  onDividerDrag: (nodeId: string, splitType: Split, e: MouseEvent) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export const PageCanvas: React.FC<PageCanvasProps> = ({
  node,
  selectedId,
  isDragging,
  onSelectPanel,
  onDividerDrag,
  onDragStart,
  onDragEnd,
}) => {
  const handleDividerDragStart = useCallback(
    (nodeId: string, splitType: Split, e: React.MouseEvent) => {
      e.preventDefault();
      onDragStart();

      const handleMouseMove = (moveEvent: MouseEvent) => {
        onDividerDrag(nodeId, splitType, moveEvent);
      };

      const handleMouseUp = () => {
        onDragEnd();
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [onDragStart, onDragEnd, onDividerDrag]
  );

  const renderNode = (node: Node, bounds: Bounds): React.ReactNode => {
    if (node.type === "leaf") {
      return (
        <Panel
          key={node.id}
          id={node.id}
          bounds={bounds}
          isSelected={selectedId === node.id}
          onClick={onSelectPanel}
        />
      );
    }

    const { firstChildBounds, secondChildBounds } = calculateChildBounds(
      bounds,
      node.splitType,
      node.ratio
    );

    return (
      <>
        <Divider
          key={`divider-${node.id}`}
          bounds={bounds}
          splitType={node.splitType}
          ratio={node.ratio}
          isDragging={isDragging}
          onDragStart={(e) =>
            handleDividerDragStart(node.id, node.splitType, e)
          }
        />
        {renderNode(node.children[0], firstChildBounds)}
        {renderNode(node.children[1], secondChildBounds)}
      </>
    );
  };

  return (
    <div className="w-full h-full" onClick={() => onSelectPanel(null)}>
      {renderNode(node, { x: 0, y: 0, width: 100, height: 100 })}
    </div>
  );
};
