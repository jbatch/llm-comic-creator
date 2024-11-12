// src/components/image-cropper/ImageCropper.tsx
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { CropState } from "./types";
import { useCropDimensions } from "./hooks/useCropDimensions";
import { useImageLoader } from "./hooks/useImageLoader";
import { useDragging } from "./hooks/useDragging";
import { StyleCalculator } from "./utils/styleCalculator";
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

  const dimensions = useCropDimensions(containerRef);
  const { isLoading, imageSize, moveDirection } = useImageLoader(
    imageUrl,
    aspectRatio
  );
  const { position, isDragging, startDragging, setPosition } = useDragging(
    moveDirection,
    initialState?.position || { x: 0.5, y: 0.5 },
    cropAreaRef
  );

  const { imageStyle, cropWindowStyle } = StyleCalculator.calculateStyles(
    imageSize,
    dimensions,
    position,
    aspectRatio,
    moveDirection,
    isDragging
  );

  return (
    <div
      className="relative w-full aspect-video bg-gray-950"
      ref={containerRef}
    >
      <div className="absolute inset-6 flex items-center justify-center">
        <div
          ref={cropAreaRef}
          className="relative overflow-hidden bg-black rounded-sm"
          style={{
            width: dimensions.width,
            height: dimensions.height,
          }}
        >
          {isLoading ? (
            <LoadingOverlay />
          ) : (
            <>
              <img
                src={imageUrl}
                alt="Crop preview"
                className="pointer-events-none"
                style={imageStyle}
              />

              <div
                className="border-2 border-white"
                style={cropWindowStyle}
                onMouseDown={startDragging}
              >
                <DragHandle moveDirection={moveDirection} />
              </div>
            </>
          )}
        </div>
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
        Drag the bright area{" "}
        {moveDirection === "horizontal" ? "left/right" : "up/down"} to adjust
        crop
      </div>
    </div>
  );
};
