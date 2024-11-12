// src/components/layout-generator/hooks/useCanvasDimensions.ts
import { useState, useEffect, RefObject } from "react";
import { Orientation } from "../types";

interface Dimensions {
  width: number;
  height: number;
}

export function useCanvasDimensions(
  wrapperRef: RefObject<HTMLElement>,
  orientation: Orientation
) {
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
        height = Math.min(availableHeight, availableWidth * aspectRatio);
        width = height / aspectRatio;
      } else {
        width = Math.min(availableWidth, availableHeight / aspectRatio);
        height = width * aspectRatio;
      }

      setDimensions({ width, height });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [orientation]);

  return { dimensions };
}
