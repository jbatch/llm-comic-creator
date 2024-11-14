// src/components/image-cropper/hooks/useDragging.ts
import { useState, useRef, useEffect, RefObject } from "react";
import { Position, MoveDirection } from "../types";

interface DragState {
  startMouseX: number;
  startMouseY: number;
  startPosition: Position;
}

export function useDragging(
  moveDirection: MoveDirection,
  initialPosition: Position,
  cropAreaRef: RefObject<HTMLDivElement>
) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<Position>(initialPosition);
  const dragRef = useRef<DragState | null>(null);

  useEffect(() => {
    if (!isDragging || !dragRef.current || !cropAreaRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = cropAreaRef.current!.getBoundingClientRect();
      const { startMouseX, startMouseY, startPosition } = dragRef.current!;

      if (moveDirection === "horizontal") {
        const deltaX = (e.clientX - startMouseX) / rect.width;
        const newX = Math.max(0, Math.min(1, startPosition.x + deltaX));
        setPosition({ x: newX, y: 0.5 });
      } else {
        const deltaY = (e.clientY - startMouseY) / rect.height;
        const newY = Math.max(0, Math.min(1, startPosition.y + deltaY));
        setPosition({ x: 0.5, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, moveDirection]);

  const startDragging = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = {
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startPosition: { ...position },
    };
    setIsDragging(true);
  };

  return { position, isDragging, startDragging, setPosition };
}
