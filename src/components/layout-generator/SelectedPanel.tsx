// src/components/layout-generator/SelectedPanel.tsx

import { X } from "lucide-react";
import { Button } from "../ui/button";

interface SelectedPanelProps {
  id: string;
  onClose: () => void;
}

export const SelectedPanel: React.FC<SelectedPanelProps> = ({
  id,
  onClose,
}) => (
  <div className="w-64 bg-gray-50 rounded-lg p-3 shrink-0">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium">Selected Panel</span>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={onClose}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
    <div className="text-sm text-gray-500">ID: {id}</div>
  </div>
);
