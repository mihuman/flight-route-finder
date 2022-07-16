import { NodeKey, NodeInfo, Node } from '@/types/graph.types';

/**
 * This very basic implementation of a priority queue is used to select the
 * next node of the graph to walk to.
 *
 * The queue is always sorted to have the least expensive node on top.
 * Some helper methods are also implemented.
 */
class PriorityQueue {
  // The `keys` set is used to greatly improve the speed at which we can check
  // the presence of a value in the queue
  private keys: Set<any> = new Set();
  private queue: Node[] = [];

  /**
   * Sorts the queue to have the least expensive node to visit on top.
   */
  private sort() {
    this.queue.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Sets priority and depth for a key in the queue.
   * Inserts it in the queue if it does not already exists.
   * Returns the size of the queue.
   */
  public set(key: NodeKey, value: NodeInfo): number {
    const { priority, depth } = value;

    if (!this.keys.has(key)) {
      // Insert a new entry if the key is not already in the queue
      this.keys.add(key);
      this.queue.push({ key, priority, depth });
    } else {
      // Update priority and depth of an existing key
      this.queue.map(element => {
        if (element.key === key) {
          Object.assign(element, { priority, depth });
        }

        return element;
      });
    }

    this.sort();
    return this.queue.length;
  }

  /**
   * Dequeues a key: removes the first element from the queue and returns it.
   * Returns queue entry with first priority.
   */
  public next(): Node {
    const element = this.queue.shift();

    this.keys.delete(element.key);

    return element;
  }

  /**
   * Checks if the queue is empty.
   */
  public isEmpty(): Boolean {
    return Boolean(this.queue.length === 0);
  }

  /**
   * Checks if the queue has an element with the specified key.
   */
  public has(key: NodeKey): Boolean {
    return this.keys.has(key);
  }

  /**
   * Gets the element in the queue with the specified key.
   */
  public get(key: NodeKey): Node {
    return this.queue.find(element => element.key === key);
  }
}

export default PriorityQueue;
