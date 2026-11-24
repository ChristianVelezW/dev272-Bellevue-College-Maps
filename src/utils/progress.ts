import type {
  Coordinate,
  Maneuver,
  Route,
  RouteProgress,
} from "@/types/campus";
import { closestPointOnSegment, distanceMeters } from "@/utils/geo";

const lookbackMeters = 5;
const lookaheadMeters = 25;

export function getRouteProgress(
  route: Route,
  position: Coordinate,
  maneuvers: readonly Maneuver[],
  previousWalkedMeters?: number,
): RouteProgress | null {
  const { coordinates, lengthMeters } = route;
  if (coordinates.length === 0) return null;

  const lastMeters = Math.max(
    0,
    Math.min(previousWalkedMeters ?? 0, lengthMeters),
  );
  const earliestMeters = Math.max(0, lastMeters - lookbackMeters);
  const latestMeters =
    previousWalkedMeters === undefined
      ? Infinity
      : lastMeters + lookaheadMeters;
  let splitIndex = 0;
  let splitPoint = coordinates[0];
  let offRouteMeters =
    coordinates.length === 1 ? distanceMeters(position, splitPoint) : Infinity;
  let snappedMeters = 0;
  let cumulativeMeters = 0;

  for (let i = 0; i < coordinates.length - 1; i++) {
    const start = coordinates[i];
    const end = coordinates[i + 1];
    const segmentLength = distanceMeters(start, end);
    const startMeters = cumulativeMeters;
    cumulativeMeters += segmentLength;
    if (cumulativeMeters < earliestMeters || startMeters > latestMeters)
      continue;

    const minFraction =
      segmentLength > 0 ? (earliestMeters - startMeters) / segmentLength : 0;
    const maxFraction =
      segmentLength > 0 ? (latestMeters - startMeters) / segmentLength : 1;
    const snap = closestPointOnSegment(
      position,
      start,
      end,
      minFraction,
      maxFraction,
    );
    if (snap.distanceMeters < offRouteMeters) {
      splitIndex = i;
      splitPoint = snap.point;
      offRouteMeters = snap.distanceMeters;
      snappedMeters = startMeters + distanceMeters(start, splitPoint);
    }
  }

  const walkedMeters =
    snappedMeters >= cumulativeMeters
      ? lengthMeters
      : Math.min(
          lengthMeters,
          latestMeters,
          Math.max(earliestMeters, snappedMeters),
        );
  const nextManeuver =
    maneuvers.find((maneuver) => maneuver.atMeters > walkedMeters) ?? null;
  return {
    walkedMeters,
    remainingMeters: lengthMeters - walkedMeters,
    offRouteMeters,
    nextManeuver,
    metersToNext: nextManeuver ? nextManeuver.atMeters - walkedMeters : null,
    splitIndex,
    splitPoint,
  };
}
