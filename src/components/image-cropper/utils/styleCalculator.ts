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
    targetAspectRatio: number,
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

    // Calculate the fixed crop window size based on viewport dimensions
    // while maintaining the target aspect ratio
    let cropWidth, cropHeight;
    const viewportAspect = dimensions.width / dimensions.height;

    if (viewportAspect > targetAspectRatio) {
      // Viewport is wider than target - fit to height
      cropHeight = Math.min(
        dimensions.height,
        dimensions.width / targetAspectRatio
      );
      cropWidth = cropHeight * targetAspectRatio;
    } else {
      // Viewport is taller than target - fit to width
      cropWidth = Math.min(
        dimensions.width,
        dimensions.height * targetAspectRatio
      );
      cropHeight = cropWidth / targetAspectRatio;
    }

    // Center the crop window in the viewport
    const cropLeft = (dimensions.width - cropWidth) / 2;
    const cropTop = (dimensions.height - cropHeight) / 2;

    // Calculate image display size to cover the crop area
    const imageAspect = imageSize.width / imageSize.height;
    let displayWidth, displayHeight;

    if (imageAspect > targetAspectRatio) {
      // Image is wider than crop - match heights and allow horizontal movement
      displayHeight = cropHeight;
      displayWidth = displayHeight * imageAspect;
    } else {
      // Image is taller than crop - match widths and allow vertical movement
      displayWidth = cropWidth;
      displayHeight = displayWidth / imageAspect;
    }

    // Calculate the maximum amount the image can move
    const maxOffsetX = (displayWidth - cropWidth) / 2;
    const maxOffsetY = (displayHeight - cropHeight) / 2;

    // Calculate image position with bounded movement
    const imageLeft = cropLeft + maxOffsetX - maxOffsetX * 2 * position.x;
    const imageTop = cropTop + maxOffsetY - maxOffsetY * 2 * position.y;

    return {
      imageStyle: {
        position: "absolute",
        width: `${displayWidth}px`,
        height: `${displayHeight}px`,
        left: `${imageLeft}px`,
        top: `${imageTop}px`,
        willChange: isDragging ? "left, top" : undefined,
        transition: isDragging ? "none" : "left 0.2s, top 0.2s",
      },
      cropWindowStyle: {
        position: "absolute",
        width: `${cropWidth}px`,
        height: `${cropHeight}px`,
        left: `${cropLeft}px`,
        top: `${cropTop}px`,
        cursor: isDragging ? "grabbing" : "grab",
      },
    };
  }
}
