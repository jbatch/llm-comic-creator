// src/reducers/comicPanelReducer.ts

import { ComicPanelState, ComicPanelAction } from "../types/comicPanelTypes";

export const initialState: ComicPanelState = {
  panels: [],
  isLoading: false,
  error: null,
};

export function comicPanelReducer(
  state: ComicPanelState,
  action: ComicPanelAction
): ComicPanelState {
  switch (action.type) {
    case "SET_PANELS":
      return {
        ...state,
        panels: action.payload,
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };

    case "UPDATE_PANEL":
      return {
        ...state,
        panels: state.panels.map((panel, index) =>
          index === action.payload.index
            ? { ...panel, ...action.payload.updates }
            : panel
        ),
      };

    case "UPDATE_TEXT_POSITION":
      return {
        ...state,
        panels: state.panels.map((panel, pIndex) => {
          if (pIndex !== action.payload.panelIndex) return panel;

          const textPositions = [...(panel.textPositions || [])];
          textPositions[action.payload.textIndex] = action.payload.position;

          return {
            ...panel,
            textPositions,
          };
        }),
      };

    case "GENERATE_IMAGE_START":
      return {
        ...state,
        panels: state.panels.map((panel, index) =>
          index === action.payload.index
            ? { ...panel, isGenerating: true }
            : panel
        ),
      };

    case "GENERATE_IMAGE_SUCCESS":
      return {
        ...state,
        panels: state.panels.map((panel, index) =>
          index === action.payload.index
            ? {
                ...panel,
                imageUrl: action.payload.imageUrl,
                imageBase64: action.payload.imageBase64,
                isGenerating: false,
              }
            : panel
        ),
      };

    case "GENERATE_IMAGE_ERROR":
      return {
        ...state,
        panels: state.panels.map((panel, index) =>
          index === action.payload.index
            ? { ...panel, isGenerating: false }
            : panel
        ),
        error: action.payload.error,
      };

    case "UPDATE_TEXT":
      return {
        ...state,
        panels: state.panels.map((panel, index) =>
          index === action.payload.panelIndex
            ? {
                ...panel,
                text: action.payload.text,
                // Initialize positions for new text entries
                textPositions: action.payload.text.map(
                  (_, i) =>
                    (panel.textPositions && panel.textPositions[i]) || {
                      x: 50,
                      y: 50,
                      isFlipped: false,
                      tailPosition: {
                        side: "bottom",
                        offset: 20, // Default 20% from the left/top of the side
                      },
                    }
                ),
              }
            : panel
        ),
      };

    case "APPEND_TEXT":
      return {
        ...state,
        panels: state.panels.map((panel, index) => {
          if (index !== action.payload.panelIndex) return panel;

          const currentText = panel.text || [];
          const newText = [...currentText, ...action.payload.text];

          return {
            ...panel,
            text: newText,
            textPositions: newText.map(
              (_, i) =>
                (panel.textPositions && panel.textPositions[i]) || {
                  x: 50,
                  y: 50,
                  isFlipped: false,
                  tailPosition: {
                    side: "bottom",
                    offset: 20,
                  },
                }
            ),
          };
        }),
      };
    default:
      return state;
  }
}
