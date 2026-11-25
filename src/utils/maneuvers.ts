import type { Maneuver, Route } from "@/types/campus";
import { bearingDegrees, distanceMeters } from "@/utils/geo";

const minTurnSegmentMeters = 3;

function describeTurn(
  angle: number,
): Pick<Maneuver, "kind" | "text"> | undefined {
  const magnitude = Math.abs(angle);
  if (magnitude < 30) return;

  const side = angle < 0 ? "left" : "right";
  if (magnitude < 60) return { kind: `slight-${side}`, text: `Bear ${side}` };
  if (magnitude > 150)
    return { kind: `sharp-${side}`, text: `Make a sharp ${side}` };
  return { kind: side, text: `Turn ${side}` };
}

export function buildManeuvers(route: Route, buildingName: string): Maneuver[] {
  const { coordinates } = route;
  if (coordinates.length === 0) return [];

  const maneuvers: Maneuver[] = [
    {
      kind: "start",
      atMeters: 0,
      coordinate: coordinates[0],
      text: `Head toward ${buildingName}`,
    },
  ];
  let atMeters = 0;
  let incomingBearing: number | undefined;

  for (let i = 0; i < coordinates.length - 1; i++) {
    const coordinate = coordinates[i];
    const next = coordinates[i + 1];
    const length = distanceMeters(coordinate, next);
    if (length >= minTurnSegmentMeters) {
      const outgoingBearing = bearingDegrees(coordinate, next);
      if (incomingBearing !== undefined) {
        const angle = ((outgoingBearing - incomingBearing + 540) % 360) - 180;
        const turn = describeTurn(angle);
        if (turn) maneuvers.push({ ...turn, atMeters, coordinate });
      }
      incomingBearing = outgoingBearing;
    }
    atMeters += length;
  }

  maneuvers.push({
    kind: "arrive",
    atMeters: route.lengthMeters,
    coordinate: coordinates[coordinates.length - 1],
    text: `Arrive at ${buildingName}`,
  });
  return maneuvers;
}
