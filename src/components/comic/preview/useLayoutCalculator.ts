// src/components/comic/preview/useLayoutCalculator.ts
import { Panel } from "../types";

const A4_ASPECT_RATIO = 1.4142;

export function calculateAdjustedPanel(
  panel: Panel,
  orientation: "portrait" | "landscape"
): Panel {
  if (orientation === "portrait") {
    // In portrait mode, height percentages need to be adjusted
    // If layout says 50% height, it should be 50% / 1.4142
    return {
      x: panel.x,
      y: panel.y / A4_ASPECT_RATIO,
      width: panel.width,
      height: panel.height / A4_ASPECT_RATIO,
    };
  } else {
    // In landscape mode, width percentages need to be adjusted
    // If layout says 33.33% width, it should be 33.33% / 1.4142
    return {
      x: panel.x / A4_ASPECT_RATIO,
      y: panel.y,
      width: panel.width / A4_ASPECT_RATIO,
      height: panel.height,
    };
  }
}

export function useLayoutCalculator(orientation: "portrait" | "landscape") {
  const adjustPanel = (panel: Panel): Panel => {
    const adjusted = calculateAdjustedPanel(panel, orientation);

    console.log("Panel adjustment:", {
      original: {
        x: panel.x,
        y: panel.y,
        width: panel.width,
        height: panel.height,
        aspectRatio: panel.width / panel.height,
      },
      adjusted: {
        x: adjusted.x,
        y: adjusted.y,
        width: adjusted.width,
        height: adjusted.height,
        aspectRatio: adjusted.width / adjusted.height,
      },
    });

    return adjusted;
  };

  return { adjustPanel };
}
