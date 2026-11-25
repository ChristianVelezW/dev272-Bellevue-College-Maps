import campusPaths from "@/data/campus-paths.json";
import type { Coordinate, Route } from "@/types/campus";
import { distanceMeters } from "@/utils/geo";
import { buildGraph } from "@/utils/graph";
import { buildManeuvers } from "@/utils/maneuvers";
import { getRouteProgress } from "@/utils/progress";
import { shortestRoute } from "@/utils/routing";

function point(eastMeters: number, northMeters: number): Coordinate {
  return { latitude: northMeters / 111_195, longitude: eastMeters / 111_195 };
}

function snappedRoute(...coordinates: Coordinate[]): Route {
  const nodes = coordinates.slice(1);
  return {
    coordinates,
    nodeIds: nodes.map((_, i) => i),
    lengthMeters: nodes.reduce(
      (sum, node, i) => sum + distanceMeters(coordinates[i], node),
      0,
    ),
  };
}

const corner = snappedRoute(point(0, 0), point(100, 0), point(100, 100));
const steps = buildManeuvers(corner, "Library");

test("mid-edge progress splits the route at the projection and measures to the next turn", () => {
  const progress = getRouteProgress(corner, point(40, 3), steps)!;
  expect(progress.walkedMeters).toBeCloseTo(40, 2);
  expect(progress.remainingMeters).toBeCloseTo(160, 2);
  expect(progress.offRouteMeters).toBeCloseTo(3, 2);
  expect(progress.nextManeuver?.kind).toBe("left");
  expect(progress.metersToNext).toBeCloseTo(60, 2);
  expect(progress.splitIndex).toBe(0);
  expect(distanceMeters(progress.splitPoint, point(40, 0))).toBeLessThan(0.01);
});

test("completed segments count toward progress and a passed turn gives way to arrival", () => {
  const progress = getRouteProgress(corner, point(103, 25), steps)!;
  expect(progress.walkedMeters).toBeCloseTo(125, 2);
  expect(progress.remainingMeters).toBeCloseTo(75, 2);
  expect(progress.offRouteMeters).toBeCloseTo(3, 2);
  expect(progress.nextManeuver?.kind).toBe("arrive");
  expect(progress.metersToNext).toBeCloseTo(75, 2);
  expect(progress.splitIndex).toBe(1);
  expect(distanceMeters(progress.splitPoint, point(100, 25))).toBeLessThan(
    0.01,
  );
});

test("previous progress keeps a returning walker on the return leg of a double-back", () => {
  const route = snappedRoute(
    point(0, 0),
    point(100, 0),
    point(100, 4),
    point(0, 4),
  );
  const position = point(30, 0.5);
  const initial = getRouteProgress(route, position, [])!;
  expect(initial.splitIndex).toBe(0);
  expect(initial.walkedMeters).toBeCloseTo(30, 2);

  const returning = getRouteProgress(route, position, [], 160)!;
  expect(returning.splitIndex).toBe(2);
  expect(returning.walkedMeters).toBeCloseTo(174, 2);
  expect(returning.offRouteMeters).toBeCloseTo(3.5, 2);
  expect(distanceMeters(returning.splitPoint, point(30, 4))).toBeLessThan(0.01);
});

test("the 5 m lookback also clips a long segment that crosses the cutoff", () => {
  const smallDrift = getRouteProgress(corner, point(78, 0), steps, 80)!;
  expect(smallDrift.walkedMeters).toBeCloseTo(78, 2);
  const largerDrift = getRouteProgress(corner, point(20, 0), steps, 80)!;
  expect(largerDrift.walkedMeters).toBeCloseTo(75, 2);
  expect(largerDrift.offRouteMeters).toBeCloseTo(55, 2);
  expect(distanceMeters(largerDrift.splitPoint, point(75, 0))).toBeLessThan(
    0.01,
  );
});

test("GPS drift toward the return leg keeps an outbound walker on the first leg", () => {
  const route = snappedRoute(
    point(0, 0),
    point(100, 0),
    point(100, 4),
    point(0, 4),
  );
  const position = point(30, 2.5);
  const first = getRouteProgress(route, position, [])!;
  expect(first.splitIndex).toBe(2);
  expect(first.walkedMeters).toBeCloseTo(174, 2);
  const steps = buildManeuvers(route, "Library");
  const drift = getRouteProgress(route, position, steps, 30)!;
  expect(drift.splitIndex).toBe(0);
  expect(drift.walkedMeters).toBeCloseTo(30, 2);
  expect(drift.offRouteMeters).toBeCloseTo(2.5, 2);
  expect(drift.nextManeuver).toBe(steps[1]);
  const recovered = getRouteProgress(
    route,
    point(32, 0),
    steps,
    drift.walkedMeters,
  )!;
  expect(recovered.walkedMeters).toBeCloseTo(32, 2);
});

test("a prior reading at zero clips the first long segment to 25 m", () => {
  const position = point(90, 0);
  const first = getRouteProgress(corner, position, steps)!;
  expect(first.walkedMeters).toBeCloseTo(90, 2);
  const limited = getRouteProgress(corner, position, steps, 0)!;
  expect(limited.walkedMeters).toBeCloseTo(25, 2);
  expect(limited.offRouteMeters).toBeCloseTo(65, 2);
  expect(distanceMeters(limited.splitPoint, point(25, 0))).toBeLessThan(0.01);
});

test("on D to C the junction advances to the slight right and the entrance completes the route", () => {
  const { graph } = buildGraph(campusPaths);
  const d = [...graph.nodes.values()].find(
    (node) => node.entrance?.buildingId === "D",
  )!;
  const route = shortestRoute(graph, d.id, "C")!;
  const maneuvers = buildManeuvers(route, "C Building");
  const junction = getRouteProgress(route, maneuvers[1].coordinate, maneuvers)!;
  expect(junction.walkedMeters).toBeCloseTo(42.62, 2);
  expect(junction.nextManeuver?.kind).toBe("slight-right");
  expect(junction.metersToNext).toBeCloseTo(76.8, 1);

  const end = route.coordinates[route.coordinates.length - 1];
  const arrival = getRouteProgress(
    route,
    end,
    maneuvers,
    route.lengthMeters - 8,
  )!;
  expect(arrival.walkedMeters).toBe(route.lengthMeters);
  expect(arrival.remainingMeters).toBe(0);
  expect(arrival.offRouteMeters).toBe(0);
  expect(arrival.nextManeuver).toBeNull();
  expect(arrival.metersToNext).toBeNull();
});

test("a route already at the entrance snaps to its sole point", () => {
  const entrance = point(0, 0);
  const route = snappedRoute(entrance);
  const result = getRouteProgress(
    route,
    point(0, 7),
    buildManeuvers(route, "Library"),
  )!;
  expect(result).toEqual({
    walkedMeters: 0,
    remainingMeters: 0,
    offRouteMeters: expect.closeTo(7, 2),
    nextManeuver: null,
    metersToNext: null,
    splitIndex: 0,
    splitPoint: entrance,
  });
  expect(getRouteProgress(snappedRoute(), entrance, [])).toBeNull();
});
