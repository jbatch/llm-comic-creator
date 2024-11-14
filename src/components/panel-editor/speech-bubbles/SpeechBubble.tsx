import React from "react";
import { FlipHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextBox } from "@/components/comic/types";

interface SpeechBubbleProps {
  textBox: TextBox;
  position: {
    x: number;
    y: number;
    isFlipped: boolean;
  };
  onPositionChange: (position: {
    x: number;
    y: number;
    isFlipped: boolean;
  }) => void;
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  textBox,
  position,
  onPositionChange,
}) => {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    // Required for Firefox
    e.dataTransfer.setData("text/plain", "");
  };

  const handleDrag = (e: React.DragEvent) => {
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

  const handleFlip = () => {
    onPositionChange({
      ...position,
      isFlipped: !position.isFlipped,
    });
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={() => setIsDragging(false)}
      className={`absolute cursor-move ${isDragging ? "opacity-50" : ""}`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `translate(-50%, -50%)`,
      }}
    >
      <div className="relative group">
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

        {/* Main bubble content */}
        <div
          className="bg-white border shadow-lg rounded-lg p-3 max-w-xs relative"
          style={{
            transform: position.isFlipped ? "scaleX(-1)" : "none",
            borderBottomRightRadius: position.isFlipped ? "0.5rem" : "0",
            borderBottomLeftRadius: position.isFlipped ? "0" : "0.5rem",
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
          <div
            className="absolute bottom-[-12px]"
            style={{
              right: position.isFlipped ? "20px" : "auto",
              left: position.isFlipped ? "auto" : "20px",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              style={{
                transform: position.isFlipped ? "scaleX(-1)" : "none",
              }}
            >
              <path
                d="M0 0 L16 0 L0 16 Z"
                fill="white"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeechBubble;
