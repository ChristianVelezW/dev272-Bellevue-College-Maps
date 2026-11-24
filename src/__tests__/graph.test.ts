import campusPaths from "@/data/campus-paths.json";
import { buildGraph, type CampusPathCollection } from "@/utils/graph";

type Feature = CampusPathCollection["features"][number];

function line(coordinates: number[][], stairs?: boolean): Feature {
  return {
    type: "Feature",
    geometry: { type: "LineString", coordinates },
    properties: { stairs },
  };
}

function door(
  coordinates: number[],
  buildingId?: string,
  accessible = true,
): Feature {
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates },
    properties: { buildingId, accessible },
  };
}

function build(...features: Feature[]) {
  return buildGraph({ type: "FeatureCollection", features });
}

const start = [-122, 47];
const junction = [-122, 47.0001];
const nearJunction = [-122, 47.00012];
const end = [-122, 47.0002];

test("the campus map has 19 nodes, one three-way junction, and entrances for D, L, and C", () => {
  const { graph, problems } = buildGraph(campusPaths);
  expect(problems).toEqual([]);
  expect(graph.nodes.size).toBe(19);

  const junctions = [...graph.neighbors.values()].filter(
    (neighbors) => neighbors.length === 3,
  );
  expect(junctions).toHaveLength(1);
  const entrances = [...graph.nodes.values()].map(
    (node) => node.entrance?.buildingId,
  );
  expect(entrances).toEqual(expect.arrayContaining(["D", "L", "C"]));
});

test("lines meeting within 3 m share a node and connect in both directions", () => {
  const { graph, problems } = build(
    line([start, junction], false),
    line([nearJunction, end], true),
  );

  expect(problems).toEqual([]);
  expect(graph.nodes.size).toBe(3);
  expect(graph.nodes.get(1)?.coordinate).toEqual({
    latitude: junction[1],
    longitude: junction[0],
  });
  const first = {
    from: 0,
    to: 1,
    lengthMeters: expect.any(Number),
    stairs: false,
  };
  const second = {
    from: 1,
    to: 2,
    lengthMeters: expect.any(Number),
    stairs: true,
  };
  expect(graph.neighbors.get(0)).toEqual([{ nodeId: 1, edge: first }]);
  expect(graph.neighbors.get(1)).toEqual([
    { nodeId: 0, edge: first },
    { nodeId: 2, edge: second },
  ]);
  expect(graph.neighbors.get(2)).toEqual([{ nodeId: 1, edge: second }]);
  expect(graph.neighbors.get(1)?.[0].edge.lengthMeters).toBeCloseTo(11.12, 2);
  expect(graph.neighbors.get(1)?.[1].edge.lengthMeters).toBeCloseTo(11.12, 2);
});

test("consecutive points merged into one node do not create a self-loop", () => {
  const { graph } = build(line([junction, nearJunction], false));
  expect(graph.nodes.size).toBe(1);
  expect(graph.neighbors.get(0)).toEqual([]);
});

test("a door attaches to a nearby node even when the door appears first", () => {
  const { graph, problems } = build(
    door(nearJunction, "D", false),
    line([start, junction], false),
  );
  expect(problems).toEqual([]);
  expect(graph.nodes.size).toBe(2);
  expect(graph.nodes.get(1)?.entrance).toEqual({
    buildingId: "D",
    accessible: false,
  });
});

test("a door 50 m from the walkway is reported without creating a node", () => {
  const { graph, problems } = build(
    line([start, junction], false),
    door([-122, 47.00055], "L"),
  );
  expect(problems).toEqual([expect.stringMatching(/Entrance L.*within 3 m/)]);
  expect(graph.nodes.size).toBe(2);
  expect([...graph.nodes.values()].every((node) => !node.entrance)).toBe(true);
});

test("missing stairs and buildingId are both reported while valid features are built", () => {
  const { graph, problems } = build(
    line([junction, end]),
    door(start),
    line([start, junction], false),
    door(junction, "C"),
  );
  expect(problems).toEqual([
    expect.stringContaining("stairs"),
    expect.stringContaining("buildingId"),
  ]);
  expect(graph.nodes.size).toBe(2);
  expect(graph.nodes.get(1)?.entrance).toEqual({
    buildingId: "C",
    accessible: true,
  });
});

test.each([{ buildingId: "D" }, { buildingId: "D", accessible: "false" }])(
  "a door with invalid accessibility is reported and skipped: %j",
  (properties) => {
    const { graph, problems } = build(
      line([start, junction], false),
      { ...door(start), properties },
      door(junction, "C"),
    );
    expect(problems).toEqual([expect.stringContaining("accessible")]);
    expect(graph.nodes.get(0)?.entrance).toBeUndefined();
    expect(graph.nodes.get(1)?.entrance?.buildingId).toBe("C");
  },
);

test("coordinates must match the geometry before a feature is added", () => {
  const { graph, problems } = build(
    {
      ...line([], false),
      geometry: { type: "LineString", coordinates: [end, 47] },
    },
    { ...door(start, "D"), geometry: { type: "Point", coordinates: [start] } },
    line([start, junction], true),
  );
  expect(problems).toEqual([
    expect.stringMatching(/LineString.*coordinates/),
    expect.stringMatching(/Point.*coordinates/),
  ]);
  expect(graph.nodes.size).toBe(2);
});
