import type { CampusGraph, Coordinate, PathNode } from "@/types/campus";
import { distanceMeters } from "@/utils/geo";

type Position = readonly [longitude: number, latitude: number, ...number[]];

export type CampusPathCollection = {
  type: string;
  features: readonly {
    type: string;
    geometry: { type: string; coordinates?: unknown } | null;
    properties?: {
      stairs?: unknown;
      buildingId?: unknown;
      accessible?: unknown;
    } | null;
  }[];
};

const mergeRadiusMeters = 3;

function isPosition(value: unknown): value is Position {
  return (
    Array.isArray(value) && value.length >= 2 && value.every(Number.isFinite)
  );
}

function toCoordinate([longitude, latitude]: Position): Coordinate {
  return { latitude, longitude };
}

function nearbyNode(graph: CampusGraph, coordinate: Coordinate) {
  let nearest: PathNode | undefined;
  let bestDistance = Infinity;
  for (const node of graph.nodes.values()) {
    const distance = distanceMeters(node.coordinate, coordinate);
    if (distance <= mergeRadiusMeters && distance < bestDistance) {
      nearest = node;
      bestDistance = distance;
    }
  }
  return nearest;
}

function walkwayNode(graph: CampusGraph, position: Position): PathNode {
  const coordinate = toCoordinate(position);
  const existing = nearbyNode(graph, coordinate);
  if (existing) return existing;

  const id = graph.nodes.size;
  const node = { id, coordinate };
  graph.nodes.set(id, node);
  graph.neighbors.set(id, []);
  return node;
}

export function buildGraph(data: CampusPathCollection): {
  graph: CampusGraph;
  problems: string[];
} {
  const graph: CampusGraph = { nodes: new Map(), neighbors: new Map() };
  const problems: string[] = [];

  if (data.type !== "FeatureCollection") {
    return { graph, problems: ["Expected a GeoJSON FeatureCollection."] };
  }

  for (const [
    index,
    { type, geometry, properties },
  ] of data.features.entries()) {
    if (type !== "Feature" || !geometry) {
      problems.push(`Feature ${index} needs a GeoJSON Feature with geometry.`);
      continue;
    }
    if (geometry.type === "Point") continue;
    if (geometry.type !== "LineString") {
      problems.push(
        `Unsupported geometry ${geometry.type} at feature ${index}.`,
      );
      continue;
    }
    const coordinates = geometry.coordinates;
    if (!Array.isArray(coordinates) || !coordinates.every(isPosition)) {
      problems.push(`LineString feature ${index} needs valid coordinates.`);
      continue;
    }
    const stairs = properties?.stairs;
    if (typeof stairs !== "boolean") {
      problems.push(
        `LineString feature ${index} needs a boolean stairs value.`,
      );
      continue;
    }

    let previous: PathNode | undefined;
    for (const position of coordinates) {
      const node = walkwayNode(graph, position);
      if (previous && previous.id !== node.id) {
        const edge = {
          from: previous.id,
          to: node.id,
          lengthMeters: distanceMeters(previous.coordinate, node.coordinate),
          stairs,
        };
        graph.neighbors.get(previous.id)!.push({ nodeId: node.id, edge });
        graph.neighbors.get(node.id)!.push({ nodeId: previous.id, edge });
      }
      previous = node;
    }
  }

  for (const [
    index,
    { type, geometry, properties },
  ] of data.features.entries()) {
    if (type !== "Feature" || geometry?.type !== "Point") continue;
    if (!isPosition(geometry.coordinates)) {
      problems.push(`Point feature ${index} needs valid coordinates.`);
      continue;
    }
    const buildingId = properties?.buildingId;
    const accessible = properties?.accessible;
    const hasBuildingId =
      typeof buildingId === "string" && buildingId.trim() !== "";
    if (!hasBuildingId) {
      problems.push(`Point feature ${index} needs a buildingId.`);
    }
    if (typeof accessible !== "boolean") {
      problems.push(`Point feature ${index} needs a boolean accessible value.`);
      continue;
    }
    if (!hasBuildingId) continue;
    const node = nearbyNode(graph, toCoordinate(geometry.coordinates));
    if (!node) {
      problems.push(
        `Entrance ${buildingId} (feature ${index}) has no walkway node within ${mergeRadiusMeters} m.`,
      );
      continue;
    }
    node.entrance = { buildingId, accessible };
  }

  return { graph, problems };
}
