// src/utils/pdf/types.ts
export interface ExportToPDFOptions {
  title?: string;
  orientation: "portrait" | "landscape";
}

export interface DrawContext {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  mmToPoints: number;
}
