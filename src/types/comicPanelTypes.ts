// src/types/comicPanelTypes.ts

import { type ComicPanel, type TextBox } from "@/components/comic/types";

export type ComicPanelState = {
  panels: ComicPanel[];
  isLoading: boolean;
  error: string | null;
};

export type TextPosition = {
  x: number;
  y: number;
  isFlipped: boolean;
};

// Extend ComicPanel type with text positions
export type ExtendedComicPanel = ComicPanel & {
  textPositions?: TextPosition[];
};

export type ComicPanelAction =
  | { type: "SET_PANELS"; payload: ComicPanel[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | {
      type: "UPDATE_PANEL";
      payload: { index: number; updates: Partial<ExtendedComicPanel> };
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
