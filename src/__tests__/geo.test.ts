import {
  bearingDegrees,
  closestPointOnSegment,
  distanceMeters,
} from "@/utils/geo";

const start = { latitude: 47.584074, longitude: -122.148805 };
const end = { ...start, longitude: start.longitude + 0.002 };

test("distance measures a thousandth of a degree of latitude in meters", () => {
  const north = { ...start, latitude: start.latitude + 0.001 };
  expect(distanceMeters(start, north)).toBeCloseTo(111.2, 0);
});

test("distance is zero at the same point", () => {
  expect(distanceMeters(start, start)).toBe(0);
});

test.each([
  ["north", 0.001, 0, 0],
  ["east", 0, 0.001, 90],
  ["south", -0.001, 0, 180],
  ["west", 0, -0.001, 270],
] as const)(
  "bearing toward the %s",
  (_, latitudeOffset, longitudeOffset, expected) => {
    const destination = {
      latitude: start.latitude + latitudeOffset,
      longitude: start.longitude + longitudeOffset,
    };
    expect(bearingDegrees(start, destination)).toBeCloseTo(expected, 2);
  },
);

test("a point beside the midpoint snaps to it and reports the distance in meters", () => {
  const longitude = start.longitude + 0.001;
  const result = closestPointOnSegment(
    { latitude: start.latitude + 0.001, longitude },
    start,
    end,
  );
  expect(result.point.latitude).toBeCloseTo(start.latitude, 8);
  expect(result.point.longitude).toBeCloseTo(longitude, 8);
  expect(result.distanceMeters).toBeCloseTo(111.2, 0);
});

test("a point past the end snaps to the endpoint", () => {
  const beyond = { ...end, longitude: end.longitude + 0.001 };
  const { point } = closestPointOnSegment(beyond, start, end);
  expect(point.latitude).toBeCloseTo(end.latitude, 8);
  expect(point.longitude).toBeCloseTo(end.longitude, 8);
});

test("a zero-length segment snaps to its only point", () => {
  const north = { ...start, latitude: start.latitude + 0.001 };
  const result = closestPointOnSegment(north, start, start);
  expect(result.point).toEqual(start);
  expect(result.distanceMeters).toBeCloseTo(111.2, 0);
});
