import campusPaths from "@/data/campus-paths.json";
import { buildGraph } from "@/utils/graph";
import {
  routeFromPosition,
  shortestRoute,
  snapToNetwork,
} from "@/utils/routing";

const { graph: campus } = buildGraph(campusPaths);

test("a position beside the C walkway snaps to the middle of its nearest edge", () => {
  const snap = snapToNetwork(campus, {
    latitude: 47.584432,
    longitude: -122.149237,
  });
  expect(snap?.point.latitude).toBeCloseTo(47.584412, 8);
  expect(snap?.point.longitude).toBeCloseTo(-122.149237, 8);
  expect(snap?.distanceMeters).toBeCloseTo(2.22, 2);
  expect(campus.nodes.get(snap!.edge.from)?.coordinate.longitude).toBe(
    -122.149175,
  );
  expect(campus.nodes.get(snap!.edge.to)?.coordinate.longitude).toBe(
    -122.149299,
  );
});

test("a graph with no edges has no snap", () => {
  const graph = { nodes: new Map(), neighbors: new Map() };
  expect(snapToNetwork(graph, { latitude: 47, longitude: -122 })).toBeNull();
});

test.each([
  { from: "D", to: "L", meters: 127, nodes: 9 },
  { from: "D", to: "C", meters: 128, nodes: 14 },
  { from: "L", to: "C", meters: 170, nodes: 16 },
])(
  "$from to $to takes $nodes nodes and about $meters m",
  ({ from, to, meters, nodes }) => {
    const start = [...campus.nodes.values()].find(
      (node) => node.entrance?.buildingId === from,
    )!;
    const route = shortestRoute(campus, start.id, to)!;
    expect(route.lengthMeters).toBeCloseTo(meters, 0);
    expect(route.nodeIds).toHaveLength(nodes);
    expect(route.nodeIds[0]).toBe(start.id);
    const last = route.nodeIds[nodes - 1];
    expect(campus.nodes.get(last)?.entrance?.buildingId).toBe(to);
    expect(route.coordinates).toEqual(
      route.nodeIds.map((id) => campus.nodes.get(id)!.coordinate),
    );
    expect(
      route.nodeIds.some((id) => campus.neighbors.get(id)?.length === 3),
    ).toBe(true);
  },
);

test("a building missing from the campus graph has no route", () => {
  const start = [...campus.nodes.values()].find(
    (node) => node.entrance?.buildingId === "D",
  )!;
  expect(shortestRoute(campus, start.id, "missing")).toBeNull();
});

function walkway(coordinates: number[][], stairs: boolean) {
  return {
    type: "Feature",
    geometry: { type: "LineString", coordinates },
    properties: { stairs },
  };
}

function entrance(
  coordinates: number[],
  buildingId: string,
  accessible: boolean,
) {
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates },
    properties: { buildingId, accessible },
  };
}

const west = [0, 0];
const east = [0.001, 0];
const north = [0.0005, 0.0005];
const { graph: alternatives } = buildGraph({
  type: "FeatureCollection",
  features: [
    walkway([west, east], true),
    walkway([west, north, east], false),
    entrance(west, "B", true),
    entrance(east, "T", true),
    entrance(north, "B", false),
  ],
});

test("the short stairs path wins by default and the longer flat path wins with avoidStairs", () => {
  const direct = shortestRoute(alternatives, 0, "T")!;
  const flat = shortestRoute(alternatives, 0, "T", true)!;
  expect(direct.nodeIds).toEqual([0, 1]);
  expect(direct.lengthMeters).toBeCloseTo(111.2, 1);
  expect(flat.nodeIds).toEqual([0, 2, 1]);
  expect(flat.lengthMeters).toBeCloseTo(157.3, 1);
});

test("avoidStairs continues past the closer inaccessible entrance to building B", () => {
  expect(shortestRoute(alternatives, 1, "B")?.nodeIds).toEqual([1, 2]);
  expect(shortestRoute(alternatives, 1, "B", true)?.nodeIds).toEqual([1, 2, 0]);
});

test.each([
  { longitude: 0.0001, target: "T", ids: [1], meters: 100.08 },
  { longitude: 0.0001, target: "B", ids: [0], meters: 11.12 },
  { longitude: 0.00099, target: "B", ids: [1, 2], meters: 79.74 },
])(
  "from longitude $longitude to $target the shorter total is $meters m",
  ({ longitude, target, ids, meters }) => {
    const route = routeFromPosition(
      alternatives,
      { latitude: -0.00003, longitude },
      target,
    )!;
    expect(route.nodeIds).toEqual(ids);
    expect(route.coordinates[0].latitude).toBeCloseTo(0, 10);
    expect(route.coordinates[0].longitude).toBeCloseTo(longitude, 10);
    expect(route.coordinates.slice(1)).toEqual(
      ids.map((id) => alternatives.nodes.get(id)!.coordinate),
    );
    expect(route.lengthMeters).toBeCloseTo(meters, 2);
  },
);

test("a position within 60 m routes and a position just beyond 60 m only snaps", () => {
  const inside = { latitude: -0.000539, longitude: 0.0005 };
  const outside = { ...inside, latitude: -0.00054 };
  expect(routeFromPosition(alternatives, inside, "T")).not.toBeNull();
  expect(snapToNetwork(alternatives, outside)!.distanceMeters).toBeGreaterThan(
    60,
  );
  expect(routeFromPosition(alternatives, outside, "T")).toBeNull();
});

test("GPS near the middle of stairs snaps to the nearest flat edge with avoidStairs", () => {
  const position = { latitude: 0.00002, longitude: 0.0006 };
  expect(snapToNetwork(alternatives, position)?.edge.stairs).toBe(true);
  const snap = snapToNetwork(alternatives, position, true)!;
  expect(snap.edge.stairs).toBe(false);
  expect(snap.point.latitude).toBeCloseTo(0.00021, 8);
  expect(snap.point.longitude).toBeCloseTo(0.00079, 8);

  const route = routeFromPosition(alternatives, position, "T", true)!;
  expect(route.nodeIds).toEqual([1]);
  expect(route.coordinates[0].latitude).toBeCloseTo(snap.point.latitude, 8);
  expect(route.coordinates[0].longitude).toBeCloseTo(snap.point.longitude, 8);
});

test("stairs within 60 m do not extend the range of a step-free route", () => {
  const position = { latitude: -0.00045, longitude: 0.0005 };
  expect(routeFromPosition(alternatives, position, "T")).not.toBeNull();
  expect(
    snapToNetwork(alternatives, position, true)!.distanceMeters,
  ).toBeGreaterThan(60);
  expect(routeFromPosition(alternatives, position, "T", true)).toBeNull();
});

test("a step-free route can start where stairs meet a flat walkway", () => {
  const start = alternatives.nodes.get(0)!.coordinate;
  expect(routeFromPosition(alternatives, start, "T", true)).toEqual(
    shortestRoute(alternatives, 0, "T", true),
  );
});
