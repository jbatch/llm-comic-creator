// src/components/comic/types.ts
export interface CropSettings {
  position: {
    x: number;
    y: number;
  };
}

export interface ComicPanel {
  imagePrompt: string;
  imageUrl?: string;
  imageBase64?: string;
  isGenerating?: boolean;
  cropSettings?: CropSettings;
}

export interface Panel {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutTemplate {
  id: string;
  name: string;
  panels: Panel[];
}
