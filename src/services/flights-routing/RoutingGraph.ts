import { RouteType } from '@/enums/route.enum';
import RouteRepository from '@/repositories/route.repository';
import { NodeInfo, ShortestPathOptions, ShortestPathState } from '@/types/graph.types';
import Graph from './Graph';

class RoutingGraph extends Graph {
  private static MAX_PATH_STOPS = 1000;
  private static MAX_PATH_GROUND_SWITCHES = 1000;

  constructor() {
    super(RouteRepository.getAll());
  }

  protected getOptions({ maxStops, maxSwitches }: ShortestPathOptions): ShortestPathOptions {
    return {
      maxStops: maxStops === undefined ? RoutingGraph.MAX_PATH_STOPS : maxStops,
      maxSwitches: maxSwitches === undefined ? RoutingGraph.MAX_PATH_GROUND_SWITCHES : maxSwitches,
    };
  }

  protected skipCondition(state: ShortestPathState): Boolean {
    switch (state.neighborEdge.type) {
      case RouteType.FLIGHT:
        return this.hasUsedAllStops(state);
      case RouteType.GROUND:
        return this.hasUsedAllSwitches(state);
      case RouteType.EITHER:
        return this.hasUsedAllStops(state) && this.hasUsedAllSwitches(state);
      default:
        return true;
    }
  }

  protected getStartNodeState(): NodeInfo {
    return { priority: 0, depth: 0, switches: 0 };
  }

  protected calculateNodeState({ node, neighborEdge, options }: ShortestPathState): NodeInfo {
    if (neighborEdge.type === RouteType.EITHER) {
      // If the edge can be traversed either with a flight or a ground switch,
      // just prefer the ground switch if all of the switches are not used yet.
      const useGroundSwitch = this.shouldUseGroundSwitch({ node, neighborEdge, options });

      return {
        priority: node.priority + neighborEdge.cost,
        depth: useGroundSwitch ? node.depth : node.depth + 1,
        switches: useGroundSwitch ? node.switches + 1 : node.switches,
      };
    }

    return {
      priority: node.priority + neighborEdge.cost,
      depth: neighborEdge.type === RouteType.FLIGHT ? node.depth + 1 : node.depth,
      switches: neighborEdge.type === RouteType.GROUND ? node.switches + 1 : node.switches,
    };
  }

  private hasUsedAllStops({ node, options }: ShortestPathState): Boolean {
    return node.depth > options.maxStops;
  }

  private hasUsedAllSwitches({ node, options }: ShortestPathState): Boolean {
    return node.switches >= options.maxSwitches;
  }

  private shouldUseGroundSwitch(state: ShortestPathState): Boolean {
    return !this.hasUsedAllSwitches(state);
  }
}

export default RoutingGraph;
