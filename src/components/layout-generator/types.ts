export type Split = "horizontal" | "vertical";
export type Orientation = "portrait" | "landscape";

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BaseNode {
  id: string;
  type: "leaf" | "split";
}

export interface LeafNode extends BaseNode {
  type: "leaf";
}

export interface SplitNode extends BaseNode {
  type: "split";
  splitType: Split;
  ratio: number;
  children: [Node, Node];
}

export type Node = LeafNode | SplitNode;
