// src/components/image-cropper/utils/styleCalculator.ts
import {
  CropStyles,
  ImageSize,
  ViewportDimensions,
  Position,
  MoveDirection,
} from "../types";

export class StyleCalculator {
  static calculateStyles(
    imageSize: ImageSize,
    dimensions: ViewportDimensions,
    position: Position,
    aspectRatio: number,
    moveDirection: MoveDirection,
    isDragging: boolean
  ): CropStyles {
    if (
      !imageSize.width ||
      !imageSize.height ||
      !dimensions.width ||
      !dimensions.height
    ) {
      return {
        imageStyle: {},
        cropWindowStyle: {},
      };
    }

    const imageAspect = imageSize.width / imageSize.height;
    let displayWidth, displayHeight, windowWidth, windowHeight;

    if (moveDirection === "horizontal") {
      displayHeight = dimensions.height;
      displayWidth = displayHeight * imageAspect;
      windowWidth = dimensions.height * aspectRatio;
      windowHeight = dimensions.height;
    } else {
      displayWidth = dimensions.width;
      displayHeight = displayWidth / imageAspect;
      windowWidth = dimensions.width;
      windowHeight = dimensions.width / aspectRatio;
    }

    const excessWidth = displayWidth - windowWidth;
    const excessHeight = displayHeight - windowHeight;

    const windowLeft = (dimensions.width - windowWidth) / 2;
    const windowTop = (dimensions.height - windowHeight) / 2;

    const imageLeft = windowLeft - excessWidth * position.x;
    const imageTop = windowTop - excessHeight * position.y;

    return {
      imageStyle: {
        position: "absolute",
        width: `${displayWidth}px`,
        height: `${displayHeight}px`,
        left: `${imageLeft}px`,
        top: `${imageTop}px`,
        willChange: "left, top",
      },
      cropWindowStyle: {
        position: "absolute",
        width: `${windowWidth}px`,
        height: `${windowHeight}px`,
        left: `${windowLeft}px`,
        top: `${windowTop}px`,
        boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
        cursor: isDragging ? "grabbing" : "grab",
      },
    };
  }
}
