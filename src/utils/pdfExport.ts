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
    // Initialize PDF
    const pdf = new jsPDF({
      orientation,
      unit: "mm", // Switch to millimeters for more precise control
      format: "a4",
    });

    // Get PDF dimensions in mm
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Set margins and panel spacing
    const marginOuter = 2; // 2mm outer margin
    const panelSpacing = 2; // 2mm spacing between panels

    // Calculate usable area
    const usableWidth = pdfWidth - marginOuter * 2;
    const usableHeight = pdfHeight - marginOuter * 2;

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      if (pageIndex > 0) {
        pdf.addPage(undefined, orientation);
      }

      // Create canvas (convert mm to pixels for higher resolution)
      const pxPerMm = 8; // 8 pixels per mm for good resolution
      const canvas = document.createElement("canvas");
      canvas.width = usableWidth * pxPerMm;
      canvas.height = usableHeight * pxPerMm;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(pxPerMm, pxPerMm);

      // Set white background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, usableWidth, usableHeight);

      const page = pages[pageIndex];

      // Draw each panel with spacing
      for (
        let panelIndex = 0;
        panelIndex < page.layout.panels.length;
        panelIndex++
      ) {
        const panel = page.layout.panels[panelIndex];
        const imageIndex = page.startIndex + panelIndex;
        const panelData = panels[imageIndex];

        // Calculate panel position and size with spacing
        const x =
          (panel.x / 100) * usableWidth + (panel.x > 0 ? panelSpacing / 2 : 0);
        const y =
          (panel.y / 100) * usableHeight + (panel.y > 0 ? panelSpacing / 2 : 0);
        const width =
          (panel.width / 100) * usableWidth -
          (panel.width < 100 ? panelSpacing : 0);
        const height =
          (panel.height / 100) * usableHeight -
          (panel.height < 100 ? panelSpacing : 0);

        if (panelData?.imageBase64) {
          const img = new Image();
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = reject;
            img.src = `data:image/png;base64,${panelData.imageBase64}`;
          });

          // Draw the image
          await drawImageFill(ctx, img, x, y, width, height);
        } else {
          // Fallback for empty panels
          ctx.fillStyle = "#f3f4f6";
          ctx.fillRect(x, y, width, height);
        }

        // Draw panel border
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 0.2; // Thinner border (in mm)
        ctx.strokeRect(x, y, width, height);
      }

      // Add the page to the PDF
      const pageData = canvas.toDataURL("image/jpeg", 1.0);
      pdf.addImage(
        pageData,
        "JPEG",
        marginOuter,
        marginOuter,
        usableWidth,
        usableHeight
      );
    }

    pdf.save(`${title}.pdf`);
  } finally {
    document.body.removeChild(loading);
  }
}
