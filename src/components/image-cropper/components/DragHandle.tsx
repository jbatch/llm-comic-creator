// src/components/image-cropper/components/DragHandle.tsx
import React from "react";
import { MoveDirection } from "../types";

interface DragHandleProps {
  moveDirection: MoveDirection;
}

export const DragHandle: React.FC<DragHandleProps> = ({ moveDirection }) => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <div className="bg-white/20 rounded-full p-2">
      <span className="text-white text-sm">
        {moveDirection === "horizontal" ? "⬄" : "⬍"}
      </span>
    </div>
  </div>
);
