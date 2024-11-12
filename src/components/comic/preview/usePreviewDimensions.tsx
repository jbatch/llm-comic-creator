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
      if (wrapperRef.current) {
        const wrapper = wrapperRef.current;
        const wrapperWidth = wrapper.clientWidth;
        const wrapperHeight = wrapper.clientHeight;
        const padding = 48;
        const availableWidth = wrapperWidth - padding;
        const availableHeight = wrapperHeight - padding;

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
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [orientation]);

  return { dimensions };
}
