import Graph from '@/services/flights-routing/Graph';
import { EdgeMap, GraphMap, NodeKey } from '@/types/graph.types';

describe('Testing Graph', () => {
  const A = { B: { cost: 20 }, C: { cost: 80 } };
  const B = { A: { cost: 20 }, C: { cost: 20 } };
  const C = { A: { cost: 80 }, B: { cost: 20 } };

  const graphMap: GraphMap = new Map<NodeKey, EdgeMap>();
  graphMap.set('A', new Map(Object.entries(A)));
  graphMap.set('B', new Map(Object.entries(B)));
  graphMap.set('C', new Map(Object.entries(C)));

  /**
   * Graph:
   *            A
   *          /  \
   *     20  /    \  80
   *        /      \
   *       B--------C
   *           20
   */

  describe('#path()', () => {
    it('returns null if the graph is empty', () => {
      const graph = new Graph(new Map<NodeKey, EdgeMap>());
      const { path, cost } = graph.path('A', 'B');
      expect(path).toStrictEqual(null);
      expect(cost).toBeCloseTo(0);
    });

    it('returns the shortest path', () => {
      const graph = new Graph(graphMap);
      const { path, cost } = graph.path('A', 'C');
      expect(path).toStrictEqual(['A', 'B', 'C']);
      expect(cost).toBeCloseTo(40);
    });
  });
});
