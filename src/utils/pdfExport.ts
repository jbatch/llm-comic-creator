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

interface CropSettings {
  position: {
    x: number;
    y: number;
  };
}

interface ComicPanel {
  imageUrl?: string;
  imageBase64?: string;
  cropSettings?: CropSettings;
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
  height: number,
  cropSettings?: CropSettings
): Promise<void> {
  return new Promise((resolve) => {
    // Calculate scaling to fill entire space
    const imgAspect = img.width / img.height;
    const targetAspect = width / height;

    let sourceWidth = img.width;
    let sourceHeight = img.height;
    let sourceX = 0;
    let sourceY = 0;

    if (imgAspect > targetAspect) {
      // Image is wider than target area
      sourceWidth = Math.round(img.height * targetAspect);

      // Apply horizontal crop position
      if (cropSettings) {
        sourceX = Math.round(
          (img.width - sourceWidth) * cropSettings.position.x
        );
      } else {
        sourceX = Math.round((img.width - sourceWidth) / 2);
      }
    } else if (imgAspect < targetAspect) {
      // Image is taller than target area
      sourceHeight = Math.round(img.width / targetAspect);

      // Apply vertical crop position
      if (cropSettings) {
        sourceY = Math.round(
          (img.height - sourceHeight) * cropSettings.position.y
        );
      } else {
        sourceY = Math.round((img.height - sourceHeight) / 2);
      }
    }

    // Ensure source coordinates don't exceed image boundaries
    sourceX = Math.max(0, Math.min(sourceX, img.width - sourceWidth));
    sourceY = Math.max(0, Math.min(sourceY, img.height - sourceHeight));

    // Draw the cropped and scaled image
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight, // Source rectangle
      x,
      y,
      width,
      height // Destination rectangle
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
    // Initialize PDF with correct orientation
    const pdf = new jsPDF({
      orientation,
      unit: "pt",
      format: "a4",
    });

    // Get actual dimensions of the PDF page based on orientation
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 40;

    // Calculate usable area
    const usableWidth = pdfWidth - margin * 2;
    const usableHeight = pdfHeight - margin * 2;

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      if (pageIndex > 0) {
        pdf.addPage(undefined, orientation);
      }

      // Create canvas with dimensions matching PDF page
      const canvas = document.createElement("canvas");
      canvas.width = usableWidth * 2; // Double resolution for better quality
      canvas.height = usableHeight * 2;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(2, 2); // Scale context for higher resolution

      // Set white background
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

        // Calculate panel position and size
        const x = (panel.x / 100) * usableWidth;
        const y = (panel.y / 100) * usableHeight;
        const width = (panel.width / 100) * usableWidth;
        const height = (panel.height / 100) * usableHeight;

        if (panelData?.imageBase64) {
          const img = new Image();
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = reject;
            img.src = `data:image/png;base64,${panelData.imageBase64}`;
          });

          // Draw the image using fill behavior with crop settings
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
          // Fallback for empty panels
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
