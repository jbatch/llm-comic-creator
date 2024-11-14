// src/components/comic/types.ts
export interface CropSettings {
  position: {
    x: number;
    y: number;
  };
}

export interface CharacterDescriptions {
  [characterName: string]: string;
}

export type PanelShape = "SQUARE" | "PORTRAIT" | "LANDSCAPE";

export type TextBox = {
  type: "SPEECH" | "NARRATION";
  character: string;
  text: string;
};

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

export interface PageData {
  layout: LayoutTemplate;
  startIndex: number;
}
