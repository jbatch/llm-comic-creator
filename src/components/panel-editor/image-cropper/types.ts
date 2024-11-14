// src/components/image-cropper/types.ts
export interface Position {
  x: number;
  y: number;
}

export interface CropState {
  position: Position;
}

export interface ImageSize {
  width: number;
  height: number;
}

export interface ViewportDimensions {
  width: number;
  height: number;
}

export interface CropStyles {
  imageStyle: React.CSSProperties;
  cropWindowStyle: React.CSSProperties;
}

export type MoveDirection = "horizontal" | "vertical";
