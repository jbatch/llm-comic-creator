import { Bounds } from "./types";

// src/components/layout-generator/PageCanvas/Panel.tsx

interface PanelProps {
  id: string;
  bounds: Bounds;
  isSelected: boolean;
  onClick: (id: string) => void;
}

export const Panel: React.FC<PanelProps> = ({
  id,
  bounds,
  isSelected,
  onClick,
}) => (
  <div
    key={id}
    className={`absolute cursor-pointer ${
      isSelected
        ? "border-2 border-blue-500 bg-blue-50/10"
        : "border-2 border-dashed border-gray-300 hover:bg-gray-50/10"
    } transition-colors`}
    style={{
      left: `${bounds.x}%`,
      top: `${bounds.y}%`,
      width: `${bounds.width}%`,
      height: `${bounds.height}%`,
    }}
    onClick={(e) => {
      e.stopPropagation();
      onClick(id);
    }}
  />
);
