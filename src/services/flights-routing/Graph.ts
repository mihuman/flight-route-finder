import {
  Edge,
  GraphMap,
  NodeKey,
  ShortestPath,
  ShortestPathOptions,
  ShortestPathResult,
  ShortestPathState,
} from '@/types/graph.types';
import Queue from './PriorityQueue';

class Graph {
  private graph: GraphMap = null;
  private static MAX_PATH_STOPS = 1000;

  constructor(source: GraphMap) {
    this.graph = source;
  }

  /**
   * Defines a condition to decide whether to skip traversing neighboring edge
   * based on current state.
   * Returns true if the current neighbor should be skipped.
   */
  protected skipCondition({ node, maxStops }: ShortestPathState): Boolean {
    return node.depth > maxStops;
  }

  /**
   * Defines a condition to decide whether to increase depth (number of stops)
   * for current state.
   * Returns true if depth should be increased.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected depthIncreaseCondition(_: ShortestPathState): Boolean {
    return true;
  }

  /**
   * Computes the shortest path between the specified nodes.
   */
  public path(start: NodeKey, goal: NodeKey, options: ShortestPathOptions): ShortestPathResult {
    // Don't run when we don't have nodes set
    if (!this.graph.size) {
      return { path: null, cost: 0 };
    }

    const maxStops = options.maxStops === undefined ? Graph.MAX_PATH_STOPS : options.maxStops;

    const explored = new Set<NodeKey>();
    const frontier = new Queue();
    const previous = new Map<NodeKey, NodeKey>();

    let path: ShortestPath = [];
    let totalCost = 0;

    // Add the starting point to the frontier, it will be the first node visited
    frontier.set(start, { priority: 0, depth: 0 });

    // Run until we have visited every node in the frontier
    while (!frontier.isEmpty()) {
      // Get the node in the frontier with the lowest cost (`priority`)
      const node = frontier.next();

      // When the node with the lowest cost in the frontier in our goal node,
      // we can compute the path and exit the loop
      if (node.key === goal) {
        // Set the total cost to the current value
        totalCost = node.priority;

        let nodeKey = node.key;
        while (previous.has(nodeKey)) {
          path.push(nodeKey);
          nodeKey = previous.get(nodeKey);
        }

        break;
      }

      // Add the current node to the explored set
      explored.add(node.key);

      // Loop all the neighboring nodes
      const neighbors: Map<NodeKey, Edge> = this.graph.get(node.key) || new Map();
      neighbors.forEach((neighborEdge, neighborNode) => {
        // If we already explored the node, or the stop condition is true, skip it
        if (explored.has(neighborNode) || this.skipCondition({ node, neighborEdge, maxStops })) {
          return null;
        }

        // If the neighboring node is not yet in the frontier, we add it with
        // the correct cost and depth
        if (!frontier.has(neighborNode)) {
          previous.set(neighborNode, node.key);
          return frontier.set(neighborNode, {
            priority: node.priority + neighborEdge.cost,
            depth: this.depthIncreaseCondition({ node, neighborEdge, maxStops })
              ? node.depth + 1
              : node.depth,
          });
        }

        const frontierPriority = frontier.get(neighborNode).priority;
        const nodeCost = node.priority + neighborEdge.cost;

        // Otherwise we only update the cost and depth of this node in the frontier when
        // it's below what's currently set
        if (nodeCost < frontierPriority) {
          previous.set(neighborNode, node.key);
          return frontier.set(neighborNode, {
            priority: nodeCost,
            depth: this.depthIncreaseCondition({ node, neighborEdge, maxStops })
              ? node.depth + 1
              : node.depth,
          });
        }

        return null;
      });
    }

    // Return null when no path can be found
    if (!path.length) {
      return { path: null, cost: 0 };
    }

    // Add the origin waypoint at the end of the array
    path = path.concat([start]);

    return {
      // The path is in reverse order (from destination to origin), reverse it
      path: path.reverse(),
      cost: totalCost,
    };
  }
}

export default Graph;
