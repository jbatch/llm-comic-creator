// src/components/image-cropper/hooks/useCropDimensions.ts
import { useState, useEffect, RefObject } from "react";
import { ViewportDimensions } from "../types";

export function useCropDimensions(containerRef: RefObject<HTMLDivElement>) {
  const [dimensions, setDimensions] = useState<ViewportDimensions>({
    width: 800,
    height: 450,
  });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const padding = 48;
        const maxWidth = container.clientWidth - padding;
        const maxHeight = container.clientHeight - padding;

        const targetAspect = 16 / 9;
        let width, height;

        if (maxWidth / maxHeight > targetAspect) {
          height = maxHeight;
          width = height * targetAspect;
        } else {
          width = maxWidth;
          height = width / targetAspect;
        }

        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return dimensions;
}
