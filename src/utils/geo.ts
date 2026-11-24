import type { Coordinate } from "@/types/campus";

const radiansPerDegree = Math.PI / 180;
const earthRadiusMeters = 6_371_000;
const metersPerDegree = 111_320;

export function distanceMeters(from: Coordinate, to: Coordinate): number {
  const lat1 = from.latitude * radiansPerDegree;
  const lat2 = to.latitude * radiansPerDegree;
  const deltaLat = (to.latitude - from.latitude) * radiansPerDegree;
  const deltaLon = (to.longitude - from.longitude) * radiansPerDegree;
  const h =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;

  return 2 * earthRadiusMeters * Math.asin(Math.sqrt(Math.min(1, h)));
}

export function bearingDegrees(from: Coordinate, to: Coordinate): number {
  const lat1 = from.latitude * radiansPerDegree;
  const lat2 = to.latitude * radiansPerDegree;
  const deltaLon = (to.longitude - from.longitude) * radiansPerDegree;
  const y = Math.sin(deltaLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);

  return (Math.atan2(y, x) / radiansPerDegree + 360) % 360;
}

export function closestPointOnSegment(
  point: Coordinate,
  start: Coordinate,
  end: Coordinate,
): { point: Coordinate; distanceMeters: number } {
  const longitudeScale =
    metersPerDegree * Math.cos(start.latitude * radiansPerDegree);
  const deltaLon = end.longitude - start.longitude;
  const deltaLat = end.latitude - start.latitude;
  const segmentX = deltaLon * longitudeScale;
  const segmentY = deltaLat * metersPerDegree;
  const pointX = (point.longitude - start.longitude) * longitudeScale;
  const pointY = (point.latitude - start.latitude) * metersPerDegree;
  const lengthSquared = segmentX ** 2 + segmentY ** 2;
  const fraction =
    lengthSquared === 0
      ? 0
      : (pointX * segmentX + pointY * segmentY) / lengthSquared;
  const t = Math.max(0, Math.min(1, fraction));
  const closest = {
    latitude: start.latitude + t * deltaLat,
    longitude: start.longitude + t * deltaLon,
  };

  return { point: closest, distanceMeters: distanceMeters(point, closest) };
}
