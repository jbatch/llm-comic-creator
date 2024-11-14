// src/components/image-cropper/hooks/useImageLoader.ts
import { useState, useEffect } from "react";
import { ImageSize, MoveDirection } from "../types";

export function useImageLoader(imageUrl: string, aspectRatio: number) {
  const [isLoading, setIsLoading] = useState(true);
  const [imageSize, setImageSize] = useState<ImageSize>({
    width: 0,
    height: 0,
  });
  const [moveDirection, setMoveDirection] = useState<MoveDirection>("vertical");

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      setImageSize({ width: image.width, height: image.height });
      setIsLoading(false);

      const imageAspect = image.width / image.height;
      // If image is significantly wider than panel, use horizontal movement
      // Otherwise (including when ratios are close), use vertical
      setMoveDirection(
        imageAspect > aspectRatio * 1.1 ? "horizontal" : "vertical"
      );
    };
    image.src = imageUrl;
  }, [imageUrl, aspectRatio]);

  return { isLoading, imageSize, moveDirection };
}
