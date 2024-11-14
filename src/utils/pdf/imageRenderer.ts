// src/utils/pdf/imageRenderer.ts
import { CropSettings } from "@/components/comic/types";
import { DrawContext } from "./types";

export async function drawImageFill(
  { ctx, x, y, width, height }: DrawContext,
  img: HTMLImageElement,
  cropSettings?: CropSettings
): Promise<void> {
  return new Promise((resolve) => {
    const imgAspect = img.width / img.height;
    const targetAspect = width / height;

    let sourceWidth = img.width;
    let sourceHeight = img.height;
    let sourceX = 0;
    let sourceY = 0;

    if (imgAspect > targetAspect) {
      sourceWidth = Math.round(img.height * targetAspect);
      if (cropSettings) {
        sourceX = Math.round(
          (img.width - sourceWidth) * cropSettings.position.x
        );
      } else {
        sourceX = Math.round((img.width - sourceWidth) / 2);
      }
    } else if (imgAspect < targetAspect) {
      sourceHeight = Math.round(img.width / targetAspect);
      if (cropSettings) {
        sourceY = Math.round(
          (img.height - sourceHeight) * cropSettings.position.y
        );
      } else {
        sourceY = Math.round((img.height - sourceHeight) / 2);
      }
    }

    sourceX = Math.max(0, Math.min(sourceX, img.width - sourceWidth));
    sourceY = Math.max(0, Math.min(sourceY, img.height - sourceHeight));

    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      x,
      y,
      width,
      height
    );

    resolve();
  });
}
