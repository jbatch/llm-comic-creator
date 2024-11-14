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
}

// Define snapping positions for each side
const SNAP_POSITIONS = {
  top: [15, 50, 85],
  right: [15, 50, 85],
  bottom: [15, 50, 85],
  left: [15, 50, 85],
};

const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  textBox,
  position,
  onPositionChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const handleBubbleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", "");
  };

  const handleBubbleDrag = (e: React.DragEvent) => {
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
    onPositionChange({
      ...position,
      tailPosition: { side, offset },
    });
  };

  const handleFlip = () => {
    onPositionChange({
      ...position,
      isFlipped: !position.isFlipped,
    });
  };

  // Render snapping points for a given side
  const renderSnappingPoints = (side: TailPosition["side"]) => {
    const baseClasses = "absolute flex items-center justify-center";
    const positions = SNAP_POSITIONS[side];
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

    return positions.map((offset) => (
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

  // Get tail SVG path and position
  const getTailStyles = () => {
    const { side, offset } = position.tailPosition;
    const styles: React.CSSProperties = {
      position: "absolute",
      pointerEvents: "none",
    };

    switch (side) {
      case "bottom":
        styles.bottom = "-11px"; // Move 1px closer
        styles.left = `${offset}%`;
        styles.transform = "translateX(-50%)";
        break;
      case "top":
        styles.top = "-11px"; // Move 1px closer
        styles.left = `${offset}%`;
        styles.transform = "translateX(-50%)";
        break;
      case "left":
        styles.left = "-11px"; // Move 1px closer
        styles.top = `${offset}%`;
        styles.transform = "translateY(-50%)";
        break;
      case "right":
        styles.right = "-11px"; // Move 1px closer
        styles.top = `${offset}%`;
        styles.transform = "translateY(-50%)";
        break;
    }

    return styles;
  };

  const getTailPath = (side: TailPosition["side"]) => {
    switch (side) {
      case "bottom":
        // Draw path with top side slightly extended
        return "M-0.5 0 L12.5 0 L6 12 Z";
      case "top":
        // Draw path with bottom side slightly extended
        return "M6 0 L12.5 12 L-0.5 12 Z";
      case "left":
        // Draw path with right side slightly extended
        return "M12 -0.5 L12 12.5 L0 6 Z";
      case "right":
        // Draw path with left side slightly extended
        return "M0 -0.5 L12 6 L0 12.5 Z";
    }
  };

  return (
    <div
      draggable
      onDragStart={handleBubbleDragStart}
      onDrag={handleBubbleDrag}
      onDragEnd={() => setIsDragging(false)}
      className={cn("absolute cursor-move", isDragging && "opacity-50")}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `translate(-50%, -50%)`,
      }}
    >
      <div className="relative group" ref={bubbleRef}>
        {/* Controls */}
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

        {/* Snapping points */}
        {textBox.type === "SPEECH" && (
          <>
            {renderSnappingPoints("top")}
            {renderSnappingPoints("right")}
            {renderSnappingPoints("bottom")}
            {renderSnappingPoints("left")}
          </>
        )}

        {/* Main bubble content */}
        <div
          className={cn(
            "bg-white border shadow-lg p-3 max-w-xs relative",
            position.tailPosition.side === "bottom" && "rounded-t-lg",
            position.tailPosition.side === "top" && "rounded-b-lg",
            position.tailPosition.side === "left" && "rounded-r-lg",
            position.tailPosition.side === "right" && "rounded-l-lg"
          )}
          style={{
            transform: position.isFlipped ? "scaleX(-1)" : "none",
          }}
        >
          <p
            className="text-sm whitespace-pre-wrap"
            style={{
              transform: position.isFlipped ? "scaleX(-1)" : "none",
            }}
          >
            {textBox.text}
          </p>
        </div>

        {/* Speech tail */}
        {textBox.type === "SPEECH" && (
          <div style={getTailStyles()}>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              style={{
                transform: position.isFlipped ? "scaleX(-1)" : "none",
              }}
            >
              {/* Draw white background path slightly larger to create seamless connection */}
              <path
                d={getTailPath(position.tailPosition.side)}
                fill="white"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              {/* Draw connecting edge in white to hide the border */}
              <path
                d={(() => {
                  switch (position.tailPosition.side) {
                    case "bottom":
                      return "M0 0 L12 0";
                    case "top":
                      return "M0 12 L12 12";
                    case "left":
                      return "M12 0 L12 12";
                    case "right":
                      return "M0 0 L0 12";
                  }
                })()}
                stroke="white"
                strokeWidth="2"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeechBubble;
