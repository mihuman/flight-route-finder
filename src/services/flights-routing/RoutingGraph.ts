import { RouteType } from '@/enums/route.enum';
import RouteRepository from '@/repositories/route.repository';
import { ShortestPathState } from '@/types/graph.types';
import Graph from './Graph';

class RoutingGraph extends Graph {
  constructor() {
    super(RouteRepository.getAll());
  }

  protected skipCondition({ node, neighborEdge, maxStops }: ShortestPathState): Boolean {
    return node.depth > maxStops && neighborEdge.type === RouteType.FLIGHT;
  }

  protected depthIncreaseCondition(state: ShortestPathState): Boolean {
    return state.neighborEdge.type === RouteType.FLIGHT;
  }
}

export default RoutingGraph;
