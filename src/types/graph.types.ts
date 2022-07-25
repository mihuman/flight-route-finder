export type NodeKey = any;

export type NodeInfo = {
  priority: number;
  depth?: number;
  switches?: number;
};

export type Node = NodeInfo & {
  key: NodeKey;
};

export type Edge = {
  cost: number;
  type?: string | number | Boolean;
};

export type EdgeMap = Map<NodeKey, Edge>;

export type GraphMap = Map<NodeKey, EdgeMap>;

export type ShortestPathOptions = {
  maxStops?: number;
  maxSwitches?: number;
};

export type ShortestPathState = {
  node: Node;
  neighborEdge: Edge;
  options: ShortestPathOptions;
};

export type ShortestPath = NodeKey[];

export type ShortestPathResult = {
  path: ShortestPath;
  cost: number;
};
