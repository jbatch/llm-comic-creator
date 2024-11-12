// src/utils/pdfExport.ts
import jsPDF from "jspdf";
import { createLoadingOverlay } from "./loadingOverlay";
import { ComicPanel } from "@/components/comic/types";

interface Panel {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PageData {
  layout: {
    panels: Panel[];
  };
  startIndex: number;
}

interface ExportToPDFOptions {
  title?: string;
  orientation: "portrait" | "landscape";
}

interface PanelDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface RenderDimensions {
  usableWidth: number;
  usableHeight: number;
  gutterSize: number;
}

async function drawImageFill(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<void> {
  const imgAspect = img.width / img.height;
  const targetAspect = width / height;

  let sourceWidth = img.width;
  let sourceHeight = img.height;
  let sourceX = 0;
  let sourceY = 0;

  if (imgAspect > targetAspect) {
    sourceWidth = Math.round(img.height * targetAspect);
    sourceX = Math.round((img.width - sourceWidth) / 2);
  } else if (imgAspect < targetAspect) {
    sourceHeight = Math.round(img.width / targetAspect);
    sourceY = Math.round((img.height - sourceHeight) / 2);
  }

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
}

export async function exportToPDF(
  pages: PageData[],
  panels: ComicPanel[],
  options: ExportToPDFOptions
): Promise<void> {
  const { title = "Comic", orientation } = options;
  const loading = createLoadingOverlay();
  document.body.appendChild(loading);

  try {
    const pdf = new jsPDF({
      orientation,
      unit: "pt",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const gutterSize = 4;
    const usableWidth = pdfWidth - margin * 2;
    const usableHeight = pdfHeight - margin * 2;

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      if (pageIndex > 0) {
        pdf.addPage(undefined, orientation);
      }

      const canvas = document.createElement("canvas");
      canvas.width = usableWidth * 2;
      canvas.height = usableHeight * 2;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Failed to get canvas context");
      }

      ctx.scale(2, 2);
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, usableWidth, usableHeight);

      const page = pages[pageIndex];
      await renderPagePanels(ctx, page, panels, {
        usableWidth,
        usableHeight,
        gutterSize,
      });

      const pageData = canvas.toDataURL("image/jpeg", 1.0);
      pdf.addImage(pageData, "JPEG", margin, margin, usableWidth, usableHeight);
    }

    pdf.save(`${title}.pdf`);
  } finally {
    document.body.removeChild(loading);
  }
}

async function renderPagePanels(
  ctx: CanvasRenderingContext2D,
  page: PageData,
  panels: ComicPanel[],
  dimensions: RenderDimensions
): Promise<void> {
  const { usableWidth, usableHeight, gutterSize } = dimensions;

  for (
    let panelIndex = 0;
    panelIndex < page.layout.panels.length;
    panelIndex++
  ) {
    const panel = page.layout.panels[panelIndex];
    const imageIndex = page.startIndex + panelIndex;
    const panelData = panels[imageIndex];

    const bounds: PanelDimensions = {
      x: (panel.x / 100) * usableWidth,
      y: (panel.y / 100) * usableHeight,
      width: (panel.width / 100) * usableWidth - gutterSize,
      height: (panel.height / 100) * usableHeight - gutterSize,
    };

    await renderPanel(ctx, panelData, bounds);
  }
}

async function renderPanel(
  ctx: CanvasRenderingContext2D,
  panelData: ComicPanel | undefined,
  bounds: PanelDimensions
): Promise<void> {
  const { x, y, width, height } = bounds;

  if (panelData?.imageBase64) {
    const img = await loadImage(
      `data:image/png;base64,${panelData.imageBase64}`
    );
    await drawImageFill(ctx, img, x, y, width, height);
  } else {
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(x, y, width, height);
  }

  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, height);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
