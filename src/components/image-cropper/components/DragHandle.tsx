// src/components/image-cropper/components/DragHandle.tsx
import React from "react";
import { MoveDirection } from "../types";
import { MoveHorizontal, MoveVertical } from "lucide-react";

interface DragHandleProps {
  moveDirection: MoveDirection;
}

export const DragHandle: React.FC<DragHandleProps> = ({ moveDirection }) => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
      {moveDirection === "horizontal" ? (
        <MoveHorizontal className="w-6 h-6 text-white" />
      ) : (
        <MoveVertical className="w-6 h-6 text-white" />
      )}
    </div>
  </div>
);
