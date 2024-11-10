// src/components/layout-generator/Toolbar.tsx

import {
  SplitSquareVertical,
  SplitSquareHorizontal,
  RotateCcw,
} from "lucide-react";
import { ToolbarButton } from "./ToolbarButton";
import { Orientation } from "./types";

interface ToolbarProps {
  orientation: Orientation;
  selectedId: string | null;
  onOrientationToggle: () => void;
  onSplitVertical: () => void;
  onSplitHorizontal: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  orientation,
  selectedId,
  onOrientationToggle,
  onSplitVertical,
  onSplitHorizontal,
}) => (
  <div className="flex items-center justify-between px-6 py-3 border-b bg-white">
    <h1 className="text-lg font-semibold">Layout Generator</h1>
    <div className="flex gap-2">
      <ToolbarButton
        icon={RotateCcw}
        label={orientation === "portrait" ? "Portrait" : "Landscape"}
        onClick={onOrientationToggle}
      />
      <ToolbarButton
        icon={SplitSquareHorizontal}
        label="Split V"
        onClick={onSplitVertical}
        disabled={!selectedId}
      />
      <ToolbarButton
        icon={SplitSquareVertical}
        label="Split H"
        onClick={onSplitHorizontal}
        disabled={!selectedId}
      />
    </div>
  </div>
);
