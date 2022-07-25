import {
  Edge,
  GraphMap,
  NodeInfo,
  NodeKey,
  ShortestPath,
  ShortestPathOptions,
  ShortestPathResult,
  ShortestPathState,
} from '@/types/graph.types';
import Queue from './PriorityQueue';

class Graph {
  private graph: GraphMap = null;

  constructor(source: GraphMap) {
    this.graph = source;
  }

  /**
   * Returns processed input options,
   * enabling enriching options with default values.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected getOptions(_: ShortestPathOptions): ShortestPathOptions {
    return {};
  }

  /**
   * Defines a condition to decide whether to skip traversing neighboring edge
   * based on current state.
   * Returns true if the current neighbor should be skipped.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected skipCondition(_: ShortestPathState): Boolean {
    return false;
  }

  /**
   * Returns the state for starting node.
   */
  protected getStartNodeState(): NodeInfo {
    return { priority: 0 };
  }

  /**
   * Returns the state for a frontier node
   * based on current shortest path state.
   */
  protected calculateNodeState({ node, neighborEdge }: ShortestPathState): NodeInfo {
    return {
      priority: node.priority + neighborEdge.cost,
    };
  }

  /**
   * Computes the shortest path between the specified nodes.
   */
  public path(
    start: NodeKey,
    goal: NodeKey,
    initialOptions: ShortestPathOptions = {},
  ): ShortestPathResult {
    // Don't run when we don't have nodes set
    if (!this.graph.size) {
      return { path: null, cost: 0 };
    }

    const options: ShortestPathOptions = this.getOptions(initialOptions);

    const explored = new Set<NodeKey>();
    const frontier = new Queue();
    const previous = new Map<NodeKey, NodeKey>();

    let path: ShortestPath = [];
    let totalCost = 0;

    // Add the starting point to the frontier, it will be the first node visited
    frontier.set(start, this.getStartNodeState());

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
        if (explored.has(neighborNode) || this.skipCondition({ node, neighborEdge, options })) {
          return null;
        }

        // If the neighboring node is not yet in the frontier, we add it with
        // the correct cost
        if (!frontier.has(neighborNode)) {
          previous.set(neighborNode, node.key);
          return frontier.set(
            neighborNode,
            this.calculateNodeState({ node, neighborEdge, options }),
          );
        }

        const frontierPriority = frontier.get(neighborNode).priority;
        const nodeCost = node.priority + neighborEdge.cost;

        // Otherwise we only update the cost of this node in the frontier when
        // it's below what's currently set
        if (nodeCost < frontierPriority) {
          previous.set(neighborNode, node.key);
          return frontier.set(
            neighborNode,
            this.calculateNodeState({ node, neighborEdge, options }),
          );
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
