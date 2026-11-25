import type { CampusRoom } from "@/types/campus";

export function buildIndoorSteps(
  buildingName: string,
  room: Pick<CampusRoom, "floor" | "number" | "is_accessible">,
  avoidStairs: boolean,
): string[] {
  const enter = `Enter ${buildingName}.`;
  if (room.floor === 1) {
    return [enter, `Find room ${room.number} on this floor.`];
  }
  const wayUp =
    avoidStairs || room.is_accessible ? "elevator" : "elevator or stairs";
  return [
    enter,
    `Take the ${wayUp} to floor ${room.floor}.`,
    `Find room ${room.number}.`,
  ];
}
