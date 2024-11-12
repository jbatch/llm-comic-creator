// src/components/image-cropper/ImageCropper.tsx
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { CropState } from "./types";
import { useCropDimensions } from "./hooks/useCropDimensions";
import { useImageLoader } from "./hooks/useImageLoader";
import { useDragging } from "./hooks/useDragging";
import { DragHandle } from "./components/DragHandle";
import { LoadingOverlay } from "./components/LoadingOverlay";

interface ImageCropperProps {
  imageUrl: string;
  aspectRatio: number;
  onSave: (cropState: CropState) => void;
  initialState?: CropState;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  imageUrl,
  aspectRatio,
  onSave,
  initialState,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cropAreaRef = useRef<HTMLDivElement>(null);
  console.log(`Open imagecropper with aspectRatio: ${aspectRatio}`);

  const dimensions = useCropDimensions(containerRef, aspectRatio);
  console.log("calculated dimensions", { dimensions });
  const { isLoading, moveDirection } = useImageLoader(imageUrl, aspectRatio);
  const { position, isDragging, startDragging, setPosition } = useDragging(
    moveDirection,
    initialState?.position || { x: 0.5, y: 0.5 },
    cropAreaRef
  );

  const previewStyle: React.CSSProperties = {
    width: dimensions.width,
    height: dimensions.height,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "black",
  };

  const imageStyle: React.CSSProperties = {
    position: "absolute",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: `${position.x * 100}% ${position.y * 100}%`,
    transition: isDragging ? "none" : "object-position 0.2s",
  };

  return (
    <div
      className="relative w-full aspect-video bg-gray-950"
      ref={containerRef}
    >
      <div className="absolute inset-6 flex items-center justify-center">
        {isLoading ? (
          <LoadingOverlay />
        ) : (
          <div
            ref={cropAreaRef}
            style={previewStyle}
            className="rounded-sm shadow-lg"
            onMouseDown={startDragging}
          >
            <img
              src={imageUrl}
              alt="Crop preview"
              style={imageStyle}
              draggable={false}
            />
            <DragHandle moveDirection={moveDirection} />
          </div>
        )}
      </div>

      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setPosition({ x: 0.5, y: 0.5 })}
        >
          Center
        </Button>
        <Button size="sm" onClick={() => onSave({ position })}>
          Save Crop
        </Button>
      </div>

      <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
        {moveDirection === "horizontal" ? "Drag left/right" : "Drag up/down"} to
        adjust crop
      </div>
    </div>
  );
};
