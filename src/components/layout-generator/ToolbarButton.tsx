// src/components/layout-generator/ToolbarButton.tsx

import React from "react";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface ToolbarButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  disabled,
}) => (
  <Button
    onClick={onClick}
    variant="outline"
    size="sm"
    disabled={disabled}
    className="gap-1"
  >
    <Icon className="w-4 h-4" />
    {label}
  </Button>
);
