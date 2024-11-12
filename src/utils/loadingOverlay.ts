// src/utils/loadingOverlay.ts
export function createLoadingOverlay(): HTMLDivElement {
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
  return loading;
}
