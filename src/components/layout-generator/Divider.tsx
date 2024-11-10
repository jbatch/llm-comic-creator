// src/components/layout-generator/PageCanvas/Divider.tsx

import { Bounds, Split } from "./types";

interface DividerProps {
  bounds: Bounds;
  splitType: Split;
  ratio: number;
  isDragging: boolean;
  onDragStart: (e: React.MouseEvent) => void;
}

export const Divider: React.FC<DividerProps> = ({
  bounds,
  splitType,
  ratio,
  isDragging,
  onDragStart,
}) => {
  const dividerStyle =
    splitType === "vertical"
      ? {
          left: `${bounds.x + bounds.width * ratio}%`,
          top: `${bounds.y}%`,
          width: "4px",
          height: `${bounds.height}%`,
          cursor: "col-resize",
          transform: "translateX(-2px)",
        }
      : {
          left: `${bounds.x}%`,
          top: `${bounds.y + bounds.height * ratio}%`,
          width: `${bounds.width}%`,
          height: "4px",
          cursor: "row-resize",
          transform: "translateY(-2px)",
        };

  return (
    <div
      className={`absolute bg-transparent hover:bg-blue-500/50 z-10
        ${isDragging ? "bg-blue-500/50" : ""}`}
      style={dividerStyle}
      onMouseDown={onDragStart}
    />
  );
};
