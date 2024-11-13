// src/components/comic/preview/usePreviewDimensions.ts
import { useState, useEffect, type RefObject } from "react";

interface Dimensions {
  width: number;
  height: number;
}

export function usePreviewDimensions(
  wrapperRef: RefObject<HTMLElement>,
  orientation: "portrait" | "landscape"
): { dimensions: Dimensions } {
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const updateDimensions = () => {
      if (!wrapperRef.current) return;

      const wrapper = wrapperRef.current;
      const padding = 48;
      const availableWidth = wrapper.clientWidth - padding;
      const availableHeight = wrapper.clientHeight - padding;
      const aspectRatio = orientation === "portrait" ? 1.4142 : 1 / 1.4142;

      let width, height;
      if (orientation === "portrait") {
        if (availableHeight < availableWidth * aspectRatio) {
          height = availableHeight;
          width = height / aspectRatio;
        } else {
          width = availableWidth;
          height = width * aspectRatio;
        }
      } else {
        if (availableWidth < availableHeight / aspectRatio) {
          width = availableWidth;
          height = width * aspectRatio;
        } else {
          height = availableHeight;
          width = height / aspectRatio;
        }
      }

      setDimensions({ width, height });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [orientation, wrapperRef]);

  return { dimensions };
}
