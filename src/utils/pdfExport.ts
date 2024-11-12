// src/utils/pdfExport.ts
import jsPDF from "jspdf";

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

interface ComicPanel {
  imageUrl?: string;
  imageBase64?: string;
}

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
  height: number
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
      unit: "pt",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const margin = 10; // Reduced from 20 to 10
    const gutterSize = 4; // Small gap between panels

    // Calculate usable area
    const usableWidth = pdfWidth - margin * 2;
    const usableHeight = pdfHeight - margin * 2;

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      if (pageIndex > 0) {
        pdf.addPage(undefined, orientation);
      }

      const canvas = document.createElement("canvas");
      canvas.width = usableWidth * 2;
      canvas.height = usableHeight * 2;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(2, 2);

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, usableWidth, usableHeight);

      const page = pages[pageIndex];

      // Draw each panel
      for (
        let panelIndex = 0;
        panelIndex < page.layout.panels.length;
        panelIndex++
      ) {
        const panel = page.layout.panels[panelIndex];
        const imageIndex = page.startIndex + panelIndex;
        const panelData = panels[imageIndex];

        // Calculate panel dimensions
        const x = (panel.x / 100) * usableWidth;
        const y = (panel.y / 100) * usableHeight;
        const width = (panel.width / 100) * usableWidth - gutterSize;
        const height = (panel.height / 100) * usableHeight - gutterSize;

        if (panelData?.imageBase64) {
          const img = new Image();
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = reject;
            img.src = `data:image/png;base64,${panelData.imageBase64}`;
          });

          await drawImageFill(ctx, img, x, y, width, height);
        } else {
          ctx.fillStyle = "#f3f4f6";
          ctx.fillRect(x, y, width, height);
        }

        // Draw panel border
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
      }

      // Add the page to the PDF
      const pageData = canvas.toDataURL("image/jpeg", 1.0);
      pdf.addImage(pageData, "JPEG", margin, margin, usableWidth, usableHeight);
    }

    pdf.save(`${title}.pdf`);
  } finally {
    document.body.removeChild(loading);
  }
}
