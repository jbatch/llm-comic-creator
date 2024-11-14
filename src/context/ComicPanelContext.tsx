// src/context/ComicPanelContext.tsx

import React, { createContext, useContext, useReducer, useMemo } from "react";
import { comicPanelReducer, initialState } from "../reducers/comicPanelReducer";
import {
  ComicPanelState,
  ComicPanelAction,
  TailPosition,
  ComicPanel,
} from "../types/comicPanelTypes";
import { TextBox } from "@/components/comic/types";

type ComicPanelContextType = {
  state: ComicPanelState;
  dispatch: React.Dispatch<ComicPanelAction>;
};

const ComicPanelContext = createContext<ComicPanelContextType | undefined>(
  undefined
);

export function ComicPanelProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(comicPanelReducer, initialState);

  const value = useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state]
  );

  return (
    <ComicPanelContext.Provider value={value}>
      {children}
    </ComicPanelContext.Provider>
  );
}

export function useComicPanels() {
  const context = useContext(ComicPanelContext);
  if (context === undefined) {
    throw new Error("useComicPanels must be used within a ComicPanelProvider");
  }
  return context;
}

// Helper hooks for common operations
export function useComicPanelActions() {
  const { dispatch } = useComicPanels();

  return useMemo(
    () => ({
      setPanels: (panels: ComicPanel[]) =>
        dispatch({ type: "SET_PANELS", payload: panels }),

      updatePanel: (index: number, updates: Partial<ComicPanel>) =>
        dispatch({ type: "UPDATE_PANEL", payload: { index, updates } }),

      updateTextPosition: (
        panelIndex: number,
        textIndex: number,
        position: {
          x: number;
          y: number;
          isFlipped: boolean;
          tailPosition: TailPosition;
        }
      ) =>
        dispatch({
          type: "UPDATE_TEXT_POSITION",
          payload: { panelIndex, textIndex, position },
        }),

      generateImageStart: (index: number) =>
        dispatch({ type: "GENERATE_IMAGE_START", payload: { index } }),

      generateImageSuccess: (
        index: number,
        imageUrl: string,
        imageBase64?: string
      ) =>
        dispatch({
          type: "GENERATE_IMAGE_SUCCESS",
          payload: { index, imageUrl, imageBase64 },
        }),

      generateImageError: (index: number, error: string) =>
        dispatch({
          type: "GENERATE_IMAGE_ERROR",
          payload: { index, error },
        }),

      updateText: (panelIndex: number, text: ComicPanel["text"]) =>
        dispatch({
          type: "UPDATE_TEXT",
          payload: { panelIndex, text: text || [] },
        }),

      appendText: (panelIndex: number, text: TextBox[]) =>
        dispatch({
          type: "APPEND_TEXT",
          payload: { panelIndex, text },
        }),
    }),
    [dispatch]
  );
}
