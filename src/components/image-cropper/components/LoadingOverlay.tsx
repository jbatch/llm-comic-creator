// src/components/image-cropper/components/LoadingOverlay.tsx
import React from "react";
import { LoaderCircle } from "lucide-react";

export const LoadingOverlay: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center">
    <LoaderCircle className="w-8 h-8 animate-spin text-white/50" />
  </div>
);
