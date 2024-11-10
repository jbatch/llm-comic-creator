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

export async function exportToPDF(
  pages: PageData[],
  panels: ComicPanel[],
  title: string = "Comic"
): Promise<void> {
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

  const pageWidth = 595.276;
  const pageHeight = 841.89;
  const margin = 40;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  try {
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      if (pageIndex > 0) {
        pdf.addPage();
      }

      const canvas = document.createElement("canvas");
      canvas.width = pageWidth - margin * 2;
      canvas.height = pageHeight - margin * 2;
      const ctx = canvas.getContext("2d")!;

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const page = pages[pageIndex];

      for (
        let panelIndex = 0;
        panelIndex < page.layout.panels.length;
        panelIndex++
      ) {
        const panel = page.layout.panels[panelIndex];
        const imageIndex = page.startIndex + panelIndex;
        const panelData = panels[imageIndex];

        const x = (panel.x / 100) * canvas.width;
        const y = (panel.y / 100) * canvas.height;
        const width = (panel.width / 100) * canvas.width;
        const height = (panel.height / 100) * canvas.height;

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);

        if (panelData?.imageBase64) {
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = `data:image/png;base64,${panelData.imageBase64}`;
          });

          ctx.drawImage(img, x, y, width, height);
        } else {
          ctx.fillStyle = "#f3f4f6";
          ctx.fillRect(x, y, width, height);
        }
      }

      const pageData = canvas.toDataURL("image/jpeg", 1.0);
      pdf.addImage(
        pageData,
        "JPEG",
        margin,
        margin,
        pageWidth - margin * 2,
        pageHeight - margin * 2
      );
    }

    pdf.save(`${title}.pdf`);
  } finally {
    document.body.removeChild(loading);
  }
}
