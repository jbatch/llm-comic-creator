// src/components/layout-generator/hooks/usePageDimensions.ts
import { useState, useEffect, RefObject } from "react";
import { Orientation } from "../types";

export const usePageDimensions = (
  wrapperRef: RefObject<HTMLDivElement>,
  orientation: Orientation
) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

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
  }, [orientation, wrapperRef]);

  return dimensions;
};
