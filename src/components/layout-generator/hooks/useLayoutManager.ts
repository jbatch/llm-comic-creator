// src/components/layout-generator/hooks/useLayoutManager.ts
import { useState, useCallback } from "react";
import { Node, Split, Orientation } from "../types";

interface LayoutState {
  rootNode: Node;
  selectedId: string | null;
  orientation: Orientation;
  isDragging: boolean;
}

export function useLayoutManager(initialOrientation: Orientation = "portrait") {
  const [state, setState] = useState<LayoutState>({
    rootNode: { id: "root", type: "leaf" },
    selectedId: null,
    orientation: initialOrientation,
    isDragging: false,
  });

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const toggleOrientation = useCallback(() => {
    setState((prev) => ({
      ...prev,
      orientation: prev.orientation === "portrait" ? "landscape" : "portrait",
    }));
  }, []);

  const updateNodeRatio = useCallback((nodeId: string, newRatio: number) => {
    setState((prev) => {
      const updateNode = (node: Node): Node => {
        if (node.id === nodeId && node.type === "split") {
          return {
            ...node,
            ratio: Math.max(0.1, Math.min(0.9, newRatio)),
          };
        }
        if (node.type === "split") {
          return {
            ...node,
            children: [
              updateNode(node.children[0]),
              updateNode(node.children[1]),
            ],
          };
        }
        return node;
      };

      return {
        ...prev,
        rootNode: updateNode(prev.rootNode),
      };
    });
  }, []);

  const splitNode = useCallback((nodeId: string, splitType: Split) => {
    setState((prev) => {
      const updateNode = (node: Node): Node => {
        if (node.id === nodeId && node.type === "leaf") {
          return {
            id: node.id,
            type: "split",
            splitType,
            ratio: 0.5,
            children: [
              { id: generateId(), type: "leaf" },
              { id: generateId(), type: "leaf" },
            ],
          };
        }
        if (node.type === "split") {
          return {
            ...node,
            children: [
              updateNode(node.children[0]),
              updateNode(node.children[1]),
            ],
          };
        }
        return node;
      };

      return {
        ...prev,
        rootNode: updateNode(prev.rootNode),
      };
    });
  }, []);

  const setSelectedId = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, selectedId: id }));
  }, []);

  const setIsDragging = useCallback((isDragging: boolean) => {
    setState((prev) => ({ ...prev, isDragging }));
  }, []);

  return {
    ...state,
    toggleOrientation,
    updateNodeRatio,
    splitNode,
    setSelectedId,
    setIsDragging,
  };
}
