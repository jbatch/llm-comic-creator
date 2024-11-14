// src/utils/pdf/speechBubbles.ts
import { TextBox } from "@/components/comic/types";
import { TextPosition } from "@/types/comicPanelTypes";
import { DrawContext } from "./types";

// Match the dimensions from the SpeechBubble component
const SPEECH_BUBBLE_WIDTH = 200;
const SPEECH_BUBBLE_PADDING = 12;
const FONT_SIZE = 14;
const LINE_HEIGHT = 1.4;
const BORDER_RADIUS = 8;
const TAIL_SIZE = 12;
const TAIL_OFFSET = 6;

export function drawSpeechBubble(
  {
    ctx,
    x: panelX,
    y: panelY,
    width: panelWidth,
    height: panelHeight,
  }: DrawContext,
  text: TextBox,
  position: TextPosition
) {
  // Calculate actual position within the panel
  const x = panelX + (position.x / 100) * panelWidth;
  const y = panelY + (position.y / 100) * panelHeight;

  // Set up text properties
  ctx.font = `${FONT_SIZE}px Arial`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  // Measure text and handle wrapping
  const words = text.text.split(" ");
  const lines = [];
  let currentLine = words[0];

  const maxWidth = SPEECH_BUBBLE_WIDTH - SPEECH_BUBBLE_PADDING * 2;

  for (let i = 1; i < words.length; i++) {
    const testLine = currentLine + " " + words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine);

  // Calculate bubble dimensions
  const lineHeight = FONT_SIZE * LINE_HEIGHT;
  const bubbleWidth = SPEECH_BUBBLE_WIDTH;
  const bubbleHeight = lines.length * lineHeight + SPEECH_BUBBLE_PADDING * 2;

  // Draw bubble background
  ctx.fillStyle = "white";
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;

  const bubbleX = x - bubbleWidth / 2;
  const bubbleY = y - bubbleHeight / 2;

  // Draw the main bubble
  ctx.beginPath();
  ctx.moveTo(bubbleX + BORDER_RADIUS, bubbleY);
  ctx.lineTo(bubbleX + bubbleWidth - BORDER_RADIUS, bubbleY);
  ctx.quadraticCurveTo(
    bubbleX + bubbleWidth,
    bubbleY,
    bubbleX + bubbleWidth,
    bubbleY + BORDER_RADIUS
  );
  ctx.lineTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight - BORDER_RADIUS);
  ctx.quadraticCurveTo(
    bubbleX + bubbleWidth,
    bubbleY + bubbleHeight,
    bubbleX + bubbleWidth - BORDER_RADIUS,
    bubbleY + bubbleHeight
  );
  ctx.lineTo(bubbleX + BORDER_RADIUS, bubbleY + bubbleHeight);
  ctx.quadraticCurveTo(
    bubbleX,
    bubbleY + bubbleHeight,
    bubbleX,
    bubbleY + bubbleHeight - BORDER_RADIUS
  );
  ctx.lineTo(bubbleX, bubbleY + BORDER_RADIUS);
  ctx.quadraticCurveTo(bubbleX, bubbleY, bubbleX + BORDER_RADIUS, bubbleY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Draw tail if it's a speech bubble
  if (text.type === "SPEECH") {
    const { side, offset } = position.tailPosition;

    // First draw the white tail
    ctx.beginPath();
    switch (side) {
      case "bottom": {
        const tailX = bubbleX + (offset / 100) * bubbleWidth;
        ctx.moveTo(tailX - TAIL_SIZE / 2, bubbleY + bubbleHeight);
        ctx.lineTo(tailX, bubbleY + bubbleHeight + TAIL_SIZE - TAIL_OFFSET);
        ctx.lineTo(tailX + TAIL_SIZE / 2, bubbleY + bubbleHeight);
        break;
      }
      case "top": {
        const tailTopX = bubbleX + (offset / 100) * bubbleWidth;
        ctx.moveTo(tailTopX - TAIL_SIZE / 2, bubbleY);
        ctx.lineTo(tailTopX, bubbleY - TAIL_SIZE + TAIL_OFFSET);
        ctx.lineTo(tailTopX + TAIL_SIZE / 2, bubbleY);
        break;
      }
      case "left": {
        const tailLeftY = bubbleY + (offset / 100) * bubbleHeight;
        ctx.moveTo(bubbleX, tailLeftY - TAIL_SIZE / 2);
        ctx.lineTo(bubbleX - TAIL_SIZE + TAIL_OFFSET, tailLeftY);
        ctx.lineTo(bubbleX, tailLeftY + TAIL_SIZE / 2);
        break;
      }
      case "right": {
        const tailRightY = bubbleY + (offset / 100) * bubbleHeight;
        ctx.moveTo(bubbleX + bubbleWidth, tailRightY - TAIL_SIZE / 2);
        ctx.lineTo(bubbleX + bubbleWidth + TAIL_SIZE - TAIL_OFFSET, tailRightY);
        ctx.lineTo(bubbleX + bubbleWidth, tailRightY + TAIL_SIZE / 2);
        break;
      }
    }
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.fill();

    // Draw tail stroke, but not where it meets the bubble
    ctx.beginPath();
    switch (side) {
      case "bottom": {
        const tailX = bubbleX + (offset / 100) * bubbleWidth;
        ctx.moveTo(tailX - TAIL_SIZE / 2, bubbleY + bubbleHeight);
        ctx.lineTo(tailX, bubbleY + bubbleHeight + TAIL_SIZE - TAIL_OFFSET);
        ctx.lineTo(tailX + TAIL_SIZE / 2, bubbleY + bubbleHeight);
        break;
      }
      case "top": {
        const tailTopX = bubbleX + (offset / 100) * bubbleWidth;
        ctx.moveTo(tailTopX - TAIL_SIZE / 2, bubbleY);
        ctx.lineTo(tailTopX, bubbleY - TAIL_SIZE + TAIL_OFFSET);
        ctx.lineTo(tailTopX + TAIL_SIZE / 2, bubbleY);
        break;
      }
      case "left": {
        const tailLeftY = bubbleY + (offset / 100) * bubbleHeight;
        ctx.moveTo(bubbleX, tailLeftY - TAIL_SIZE / 2);
        ctx.lineTo(bubbleX - TAIL_SIZE + TAIL_OFFSET, tailLeftY);
        ctx.lineTo(bubbleX, tailLeftY + TAIL_SIZE / 2);
        break;
      }
      case "right": {
        const tailRightY = bubbleY + (offset / 100) * bubbleHeight;
        ctx.moveTo(bubbleX + bubbleWidth, tailRightY - TAIL_SIZE / 2);
        ctx.lineTo(bubbleX + bubbleWidth + TAIL_SIZE - TAIL_OFFSET, tailRightY);
        ctx.lineTo(bubbleX + bubbleWidth, tailRightY + TAIL_SIZE / 2);
        break;
      }
    }
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw white line to cover connection point
    ctx.beginPath();
    switch (side) {
      case "bottom": {
        const tailX = bubbleX + (offset / 100) * bubbleWidth;
        ctx.moveTo(tailX - TAIL_SIZE / 2, bubbleY + bubbleHeight);
        ctx.lineTo(tailX + TAIL_SIZE / 2, bubbleY + bubbleHeight);
        break;
      }
      case "top": {
        const tailTopX = bubbleX + (offset / 100) * bubbleWidth;
        ctx.moveTo(tailTopX - TAIL_SIZE / 2, bubbleY);
        ctx.lineTo(tailTopX + TAIL_SIZE / 2, bubbleY);
        break;
      }
      case "left": {
        const tailLeftY = bubbleY + (offset / 100) * bubbleHeight;
        ctx.moveTo(bubbleX, tailLeftY - TAIL_SIZE / 2);
        ctx.lineTo(bubbleX, tailLeftY + TAIL_SIZE / 2);
        break;
      }
      case "right": {
        const tailRightY = bubbleY + (offset / 100) * bubbleHeight;
        ctx.moveTo(bubbleX + bubbleWidth, tailRightY - TAIL_SIZE / 2);
        ctx.lineTo(bubbleX + bubbleWidth, tailRightY + TAIL_SIZE / 2);
        break;
      }
    }
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2; // Slightly thicker to ensure complete coverage
    ctx.stroke();
  }

  // Draw text
  ctx.fillStyle = "black";
  lines.forEach((line, i) => {
    const lineX = bubbleX + SPEECH_BUBBLE_PADDING;
    const lineY = bubbleY + SPEECH_BUBBLE_PADDING + i * lineHeight;
    ctx.fillText(line, lineX, lineY);
  });
}
