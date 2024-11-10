import { Bounds, Split } from "./types";

export const calculateChildBounds = (
  bounds: Bounds,
  splitType: Split,
  ratio: number
): { firstChildBounds: Bounds; secondChildBounds: Bounds } => {
  if (splitType === "vertical") {
    return {
      firstChildBounds: {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width * ratio,
        height: bounds.height,
      },
      secondChildBounds: {
        x: bounds.x + bounds.width * ratio,
        y: bounds.y,
        width: bounds.width * (1 - ratio),
        height: bounds.height,
      },
    };
  }

  return {
    firstChildBounds: {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height * ratio,
    },
    secondChildBounds: {
      x: bounds.x,
      y: bounds.y + bounds.height * ratio,
      width: bounds.width,
      height: bounds.height * (1 - ratio),
    },
  };
};
