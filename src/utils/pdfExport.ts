import { ComicPanel, CropSettings, PageData } from "@/components/comic/types";
import jsPDF from "jspdf";

interface ExportToPDFOptions {
  title?: string;
  orientation: "portrait" | "landscape";
}

function drawImageFill(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
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

export async function exportToPDF(
  pages: PageData[],
  panels: ComicPanel[],
  options: ExportToPDFOptions
): Promise<void> {
  const { title = "Comic", orientation } = options;

  // Create loading overlay
  const loading = document.createElement("div");
  loading.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;

  const loadingContent = document.createElement("div");
  loadingContent.style.cssText = `
    background: white;
    padding: 24px;
    border-radius: 8px;
    text-align: center;
  `;
  loadingContent.innerHTML = `
    <div>Generating PDF...</div>
    <div style="color: #666; margin-top: 8px; font-size: 14px;">This may take a few moments</div>
  `;

  loading.appendChild(loadingContent);
  document.body.appendChild(loading);

  try {
    const pdf = new jsPDF({
      orientation,
      unit: "mm",
      format: "a4",
    });

    // Get dimensions in mm
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Set smaller margins and panel padding
    const margin = 2; // 2mm margin
    const panelPadding = 1; // 1mm padding between panels

    // Calculate usable area
    const usableWidth = pdfWidth - margin * 2;
    const usableHeight = pdfHeight - margin * 2;

    // Convert mm to points for canvas drawing
    const mmToPoints = 2.83465;
    const canvasWidth = usableWidth * mmToPoints * 2; // Double resolution
    const canvasHeight = usableHeight * mmToPoints * 2;

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      if (pageIndex > 0) {
        pdf.addPage(undefined, orientation);
      }

      const canvas = document.createElement("canvas");
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(2, 2);

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvasWidth / 2, canvasHeight / 2);

      const page = pages[pageIndex];

      // Draw each panel with padding
      for (
        let panelIndex = 0;
        panelIndex < page.layout.panels.length;
        panelIndex++
      ) {
        const panel = page.layout.panels[panelIndex];
        const imageIndex = page.startIndex + panelIndex;
        const panelData = panels[imageIndex];

        const x = ((panel.x / 100) * usableWidth + panelPadding) * mmToPoints;
        const y = ((panel.y / 100) * usableHeight + panelPadding) * mmToPoints;
        const width =
          ((panel.width / 100) * usableWidth - panelPadding * 2) * mmToPoints;
        const height =
          ((panel.height / 100) * usableHeight - panelPadding * 2) * mmToPoints;

        if (panelData?.imageBase64) {
          const img = new Image();
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = reject;
            img.src = `data:image/png;base64,${panelData.imageBase64}`;
          });

          await drawImageFill(
            ctx,
            img,
            x,
            y,
            width,
            height,
            panelData.cropSettings
          );
        } else if (panelData?.imageUrl) {
          const img = new Image();
          img.crossOrigin = "anonymous";
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = reject;
            img.src = panelData.imageUrl!;
          });

          await drawImageFill(
            ctx,
            img,
            x,
            y,
            width,
            height,
            panelData.cropSettings
          );
        } else {
          ctx.fillStyle = "#f3f4f6";
          ctx.fillRect(x, y, width, height);
        }

        // Draw panel border
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
      }

      // Add the page to PDF with mm units
      const pageData = canvas.toDataURL("image/jpeg", 1.0);
      pdf.addImage(pageData, "JPEG", margin, margin, usableWidth, usableHeight);
    }

    pdf.save(`${title}.pdf`);
  } finally {
    document.body.removeChild(loading);
  }
}
