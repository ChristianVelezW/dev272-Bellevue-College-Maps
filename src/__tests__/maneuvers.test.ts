import campusPaths from "@/data/campus-paths.json";
import type { Coordinate, Route } from "@/types/campus";
import * as geo from "@/utils/geo";
import { buildGraph } from "@/utils/graph";
import { buildManeuvers } from "@/utils/maneuvers";
import { shortestRoute } from "@/utils/routing";

function point(eastMeters: number, northMeters: number): Coordinate {
  const metersPerDegreeAtEquator = 111_195;
  return {
    latitude: northMeters / metersPerDegreeAtEquator,
    longitude: eastMeters / metersPerDegreeAtEquator,
  };
}

function snappedRoute(...coordinates: Coordinate[]): Route {
  const nodes = coordinates.slice(1);
  return {
    coordinates,
    nodeIds: nodes.map((_, i) => i),
    lengthMeters: nodes.reduce(
      (sum, node, i) => sum + geo.distanceMeters(coordinates[i], node),
      0,
    ),
  };
}

const rightAngle = snappedRoute(point(0, 0), point(0, 100), point(100, 100));

test("a snapped start 100 m south of a right turn gives a 200 m L-shaped route", () => {
  const steps = buildManeuvers(rightAngle, "Student Union");
  expect(steps.map((step) => step.kind)).toEqual(["start", "right", "arrive"]);
  expect(steps.map((step) => step.coordinate)).toEqual(rightAngle.coordinates);
  expect(steps[0].atMeters).toBe(0);
  expect(steps[1].atMeters).toBeCloseTo(100, 2);
  expect(steps[2].atMeters).toBeCloseTo(200, 2);
  expect(steps.map((step) => step.text)).toEqual([
    "Head toward Student Union",
    "Turn right",
    "Arrive at Student Union",
  ]);
});

test("a 10-degree wiggle produces only start and arrive", () => {
  const route = snappedRoute(
    point(0, 0),
    point(0, 100),
    point(17.36, 198.48),
    point(17.36, 298.48),
  );
  expect(buildManeuvers(route, "Library").map((step) => step.kind)).toEqual([
    "start",
    "arrive",
  ]);
});

test("a 2 m connector between north and east produces one right turn", () => {
  const route = snappedRoute(
    point(0, 0),
    point(0, 100),
    point(2, 100),
    point(102, 100),
  );
  const steps = buildManeuvers(route, "Library");
  expect(steps.map((step) => step.kind)).toEqual(["start", "right", "arrive"]);
  expect(steps[1].coordinate).toEqual(point(2, 100));
  expect(steps[1].atMeters).toBeCloseTo(102, 2);
});

test("a 2 m sideways jog along a northbound path counts toward the next turn", () => {
  const route = snappedRoute(
    point(0, 0),
    point(0, 100),
    point(2, 100),
    point(2, 200),
    point(102, 200),
  );
  const steps = buildManeuvers(route, "Library");
  expect(steps.map((step) => step.kind)).toEqual(["start", "right", "arrive"]);
  expect(steps[1].coordinate).toEqual(point(2, 200));
  expect(steps[1].atMeters).toBeCloseTo(202, 2);
});

describe("turn angle thresholds", () => {
  afterEach(() => jest.restoreAllMocks());

  test.each([
    { incoming: 350, outgoing: 10, turns: [] },
    { incoming: 20, outgoing: 350, turns: ["slight-left"] },
    { incoming: 0, outgoing: 60, turns: ["right"] },
    { incoming: 180, outgoing: 30, turns: ["left"] },
    { incoming: 0, outgoing: 151, turns: ["sharp-right"] },
    { incoming: 180, outgoing: 29, turns: ["sharp-left"] },
  ])(
    "bearings of $incoming° then $outgoing° give $turns",
    ({ incoming, outgoing, turns }) => {
      jest
        .spyOn(geo, "bearingDegrees")
        .mockReturnValueOnce(incoming)
        .mockReturnValueOnce(outgoing);
      expect(
        buildManeuvers(rightAngle, "Library").map((step) => step.kind),
      ).toEqual(["start", ...turns, "arrive"]);
    },
  );
});

const { graph } = buildGraph(campusPaths);
const dEntrance = [...graph.nodes.values()].find(
  (node) => node.entrance?.buildingId === "D",
)!;

test("D to C turns left at the junction, bears right, then turns left before arrival", () => {
  const route = shortestRoute(graph, dEntrance.id, "C")!;
  const steps = buildManeuvers(route, "C Building (Cafeteria & Student Union)");
  expect(steps.map((step) => step.kind)).toEqual([
    "start",
    "left",
    "slight-right",
    "left",
    "arrive",
  ]);
  const junction = [...graph.nodes.values()].find(
    (node) => graph.neighbors.get(node.id)?.length === 3,
  )!;
  expect(steps[1].coordinate).toEqual(junction.coordinate);
  expect(steps[1].atMeters).toBeCloseTo(42.62, 2);
  expect(steps[2].atMeters).toBeCloseTo(119.41, 2);
  expect(steps[3].atMeters).toBeCloseTo(123.93, 2);
  expect(steps[4].atMeters).toBeCloseTo(128, 0);
});

test("D to L has only start and arrive", () => {
  const route = shortestRoute(graph, dEntrance.id, "L")!;
  const steps = buildManeuvers(route, "L Building");
  expect(steps.map((step) => step.kind)).toEqual(["start", "arrive"]);
  expect(steps[1].atMeters).toBeCloseTo(127, 0);
});
