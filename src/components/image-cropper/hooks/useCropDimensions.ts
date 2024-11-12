// src/components/image-cropper/hooks/useCropDimensions.ts
import { useState, useEffect, RefObject } from "react";
import { ViewportDimensions } from "../types";

export function useCropDimensions(
  containerRef: RefObject<HTMLDivElement>,
  aspectRatio: number
) {
  const [dimensions, setDimensions] = useState<ViewportDimensions>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const padding = 48; // 24px padding on each side
        const availableWidth = container.clientWidth - padding * 2;
        const availableHeight = container.clientHeight - padding * 2;

        let width, height;

        // If we're trying to fit width/height = 0.666...
        // First try setting width = availableWidth and check if height fits
        width = availableWidth;
        height = width / aspectRatio;

        // If the height is too big, constrain by height instead
        if (height > availableHeight) {
          height = availableHeight;
          width = height * aspectRatio;
        }

        console.log("Container dimensions:", {
          containerWidth: container.clientWidth,
          containerHeight: container.clientHeight,
          availableWidth,
          availableHeight,
          calculatedWidth: width,
          calculatedHeight: height,
          aspectRatio,
        });

        setDimensions({ width, height });
      }
    };

    // Run immediately
    updateDimensions();

    // Add resize listener
    window.addEventListener("resize", updateDimensions);

    // Cleanup
    return () => window.removeEventListener("resize", updateDimensions);
  }, [containerRef, aspectRatio]); // Added containerRef to deps

  return dimensions;
}
