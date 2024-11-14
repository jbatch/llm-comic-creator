// src/types/comicPanelTypes.ts

import {
  CropSettings,
  PanelShape,
  type TextBox,
} from "@/components/comic/types";

export interface ComicPanel {
  imagePrompt: string;
  text?: TextBox[];
  textPositions?: TextPosition[];
  panelShape: PanelShape;
  imageUrl?: string;
  imageBase64?: string;
  isGenerating?: boolean;
  cropSettings?: CropSettings;
}

export type ComicState = {
  storyContent: string;
  panels: ComicPanel[];
  isLoading: boolean;
  error: string | null;
};

export type TailPosition = {
  side: "top" | "right" | "bottom" | "left";
  offset: number; // Percentage along the side (0-100)
};

export type TextPosition = {
  x: number;
  y: number;
  isFlipped: boolean;
  tailPosition: TailPosition;
};

export type ComicPanelAction =
  | { type: "SET_STORY"; payload: string }
  | { type: "SET_PANELS"; payload: ComicPanel[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | {
      type: "UPDATE_PANEL";
      payload: { index: number; updates: Partial<ComicPanel> };
    }
  | {
      type: "UPDATE_TEXT_POSITION";
      payload: {
        panelIndex: number;
        textIndex: number;
        position: TextPosition;
      };
    }
  | { type: "GENERATE_IMAGE_START"; payload: { index: number } }
  | {
      type: "GENERATE_IMAGE_SUCCESS";
      payload: { index: number; imageUrl: string; imageBase64?: string };
    }
  | { type: "GENERATE_IMAGE_ERROR"; payload: { index: number; error: string } }
  | { type: "UPDATE_TEXT"; payload: { panelIndex: number; text: TextBox[] } }
  | { type: "APPEND_TEXT"; payload: { panelIndex: number; text: TextBox[] } };
