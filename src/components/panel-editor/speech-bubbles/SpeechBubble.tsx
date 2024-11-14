import React, { useState, useRef } from "react";
import { FlipHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextBox } from "@/components/comic/types";
import { TextPosition, TailPosition } from "@/types/comicPanelTypes";
import { cn } from "@/lib/utils";

interface SpeechBubbleProps {
  textBox: TextBox;
  position: TextPosition;
  onPositionChange: (position: TextPosition) => void;
  isPreview?: boolean;
}

const SPEECH_BUBBLE_WIDTH = 200; // Fixed width in pixels
const SPEECH_BUBBLE_PADDING = 12;
const FONT_SIZE = 14;
const LINE_HEIGHT = 1.4;

const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  textBox,
  position,
  onPositionChange,
  isPreview = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const handleBubbleDragStart = (e: React.DragEvent) => {
    if (isPreview) return;
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", "");
  };

  const handleBubbleDrag = (e: React.DragEvent) => {
    if (isPreview) return;
    if (e.clientX === 0 && e.clientY === 0) return;
    const container = e.currentTarget.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    onPositionChange({
      ...position,
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const handleTailPositionClick = (
    side: TailPosition["side"],
    offset: number
  ) => {
    if (isPreview) return;
    onPositionChange({
      ...position,
      tailPosition: { side, offset },
    });
  };

  const handleFlip = () => {
    if (isPreview) return;
    onPositionChange({
      ...position,
      isFlipped: !position.isFlipped,
    });
  };

  // Render snapping points for a given side
  const renderSnappingPoints = (side: TailPosition["side"]) => {
    if (isPreview) return null;

    const baseClasses = "absolute flex items-center justify-center";
    const isActiveSide = position.tailPosition.side === side;

    const getPositionStyles = (offset: number): React.CSSProperties => {
      switch (side) {
        case "top":
          return { top: "-8px", left: `${offset}%` };
        case "right":
          return { right: "-8px", top: `${offset}%` };
        case "bottom":
          return { bottom: "-8px", left: `${offset}%` };
        case "left":
          return { left: "-8px", top: `${offset}%` };
      }
    };

    return [20, 50, 80].map((offset) => (
      <button
        key={`${side}-${offset}`}
        className={cn(
          baseClasses,
          "w-4 h-4 rounded-full",
          "opacity-0 group-hover:opacity-100",
          "transition-opacity hover:scale-125",
          isActiveSide && position.tailPosition.offset === offset
            ? "bg-blue-500"
            : "bg-gray-200 hover:bg-gray-300"
        )}
        style={getPositionStyles(offset)}
        onClick={() => handleTailPositionClick(side, offset)}
      />
    ));
  };

  // Calculate tail path
  const getTailPath = () => {
    const tailSize = 12;
    const { side } = position.tailPosition;

    switch (side) {
      case "bottom": {
        return `M-0.5 0 L${tailSize - 0.5} 0 L${tailSize / 2} ${tailSize} Z`;
      }
      case "top": {
        return `M${tailSize / 2} 0 L${tailSize} ${tailSize} L0 ${tailSize} Z`;
      }
      case "left": {
        return `M${tailSize} 0 L${tailSize} ${tailSize} L0 ${tailSize / 2} Z`;
      }
      case "right": {
        return `M0 0 L${tailSize} ${tailSize / 2} L0 ${tailSize} Z`;
      }
    }
  };

  // Get tail position styles
  const getTailStyles = () => {
    const { side, offset } = position.tailPosition;
    const styles: React.CSSProperties = {
      position: "absolute",
      pointerEvents: "none",
    };

    switch (side) {
      case "bottom": {
        styles.bottom = "-11px";
        styles.left = `${offset}%`;
        styles.transform = "translateX(-50%)";
        break;
      }
      case "top": {
        styles.top = "-11px";
        styles.left = `${offset}%`;
        styles.transform = "translateX(-50%)";
        break;
      }
      case "left": {
        styles.left = "-11px";
        styles.top = `${offset}%`;
        styles.transform = "translateY(-50%)";
        break;
      }
      case "right": {
        styles.right = "-11px";
        styles.top = `${offset}%`;
        styles.transform = "translateY(-50%)";
        break;
      }
    }

    return styles;
  };

  const renderTail = () => {
    if (textBox.type !== "SPEECH") return null;

    const { side } = position.tailPosition;
    const styles = getTailStyles();

    // Create the connecting line path based on the side
    const connectionPath = (() => {
      switch (side) {
        case "bottom": {
          return "M0 0 L12 0";
        }
        case "top": {
          return "M0 12 L12 12";
        }
        case "left": {
          return "M12 0 L12 12";
        }
        case "right": {
          return "M0 0 L0 12";
        }
      }
    })();

    return (
      <div style={styles}>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          style={{
            transform: position.isFlipped ? "scaleX(-1)" : "none",
          }}
        >
          {/* White fill for tail */}
          <path
            d={getTailPath()}
            fill="white"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
          {/* White line to cover the stroke where tail meets bubble */}
          <path d={connectionPath} stroke="white" strokeWidth="2" />
        </svg>
      </div>
    );
  };

  return (
    <div
      draggable={!isPreview}
      onDragStart={handleBubbleDragStart}
      onDrag={handleBubbleDrag}
      onDragEnd={() => setIsDragging(false)}
      className={cn(
        "absolute cursor-move",
        isDragging && "opacity-50",
        isPreview && "cursor-default"
      )}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `translate(-50%, -50%)`,
      }}
    >
      <div className="relative group" ref={bubbleRef}>
        {!isPreview && (
          <div className="absolute -top-8 left-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <Button
              variant="secondary"
              size="icon"
              className="h-6 w-6"
              onClick={handleFlip}
            >
              <FlipHorizontal className="h-4 w-4" />
            </Button>
          </div>
        )}

        {textBox.type === "SPEECH" && !isPreview && (
          <>
            {renderSnappingPoints("top")}
            {renderSnappingPoints("right")}
            {renderSnappingPoints("bottom")}
            {renderSnappingPoints("left")}
          </>
        )}

        <div
          className="bg-white border shadow-lg relative rounded-lg"
          style={{
            transform: position.isFlipped ? "scaleX(-1)" : "none",
            width: SPEECH_BUBBLE_WIDTH,
            padding: SPEECH_BUBBLE_PADDING,
          }}
        >
          <p
            className="whitespace-pre-wrap"
            style={{
              transform: position.isFlipped ? "scaleX(-1)" : "none",
              fontSize: FONT_SIZE,
              lineHeight: LINE_HEIGHT,
            }}
          >
            {textBox.text}
          </p>
        </div>
        {renderTail()}
      </div>
    </div>
  );
};

export default SpeechBubble;
