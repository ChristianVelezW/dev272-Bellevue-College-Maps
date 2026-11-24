import type { CampusGraph, Coordinate, PathEdge, Route } from "@/types/campus";
import { closestPointOnSegment, distanceMeters } from "@/utils/geo";

const maxSnapDistanceMeters = 60;

type SnapResult = {
  edge: PathEdge;
  point: Coordinate;
  distanceMeters: number;
};

export function snapToNetwork(
  graph: CampusGraph,
  position: Coordinate,
  avoidStairs = false,
): SnapResult | null {
  let best: SnapResult | null = null;
  for (const [nodeId, neighbors] of graph.neighbors) {
    for (const { edge } of neighbors) {
      if (edge.from !== nodeId || (avoidStairs && edge.stairs)) continue;
      const from = graph.nodes.get(edge.from)!.coordinate;
      const to = graph.nodes.get(edge.to)!.coordinate;
      const snap = closestPointOnSegment(position, from, to);
      if (best === null || snap.distanceMeters < best.distanceMeters) {
        best = { edge, ...snap };
      }
    }
  }
  return best;
}

export function shortestRoute(
  graph: CampusGraph,
  startNodeId: number,
  targetBuildingId: string,
  avoidStairs = false,
): Route | null {
  const unvisited = new Map<number, number>();
  const cameFrom = new Map<number, number>();
  for (const id of graph.nodes.keys()) {
    unvisited.set(id, id === startNodeId ? 0 : Infinity);
  }

  while (unvisited.size > 0) {
    let currentId: number | undefined;
    let currentDistance = Infinity;
    for (const [id, distance] of unvisited) {
      if (distance < currentDistance) {
        currentId = id;
        currentDistance = distance;
      }
    }
    if (currentId === undefined) break;

    const { entrance } = graph.nodes.get(currentId)!;
    if (
      entrance?.buildingId === targetBuildingId &&
      (!avoidStairs || entrance.accessible)
    ) {
      const nodeIds = [currentId];
      let previous = cameFrom.get(currentId);
      while (previous !== undefined) {
        nodeIds.push(previous);
        previous = cameFrom.get(previous);
      }
      nodeIds.reverse();
      return {
        nodeIds,
        coordinates: nodeIds.map((id) => graph.nodes.get(id)!.coordinate),
        lengthMeters: currentDistance,
      };
    }

    unvisited.delete(currentId);
    for (const { nodeId, edge } of graph.neighbors.get(currentId) ?? []) {
      const bestDistance = unvisited.get(nodeId);
      if (bestDistance === undefined || (avoidStairs && edge.stairs)) continue;
      const distance = currentDistance + edge.lengthMeters;
      if (distance < bestDistance) {
        unvisited.set(nodeId, distance);
        cameFrom.set(nodeId, currentId);
      }
    }
  }
  return null;
}

export function routeFromPosition(
  graph: CampusGraph,
  position: Coordinate,
  targetBuildingId: string,
  avoidStairs = false,
): Route | null {
  const snap = snapToNetwork(graph, position, avoidStairs);
  if (!snap || snap.distanceMeters > maxSnapDistanceMeters) return null;

  let best: Route | null = null;
  for (const id of [snap.edge.from, snap.edge.to]) {
    const endpoint = graph.nodes.get(id)!.coordinate;
    const partialLength = distanceMeters(snap.point, endpoint);
    const route = shortestRoute(graph, id, targetBuildingId, avoidStairs);
    if (partialLength === 0) return route;
    if (!route) continue;

    const lengthMeters = partialLength + route.lengthMeters;
    if (best === null || lengthMeters < best.lengthMeters) {
      best = {
        nodeIds: route.nodeIds,
        coordinates: [snap.point, ...route.coordinates],
        lengthMeters,
      };
    }
  }
  return best;
}
