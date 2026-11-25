import type { CampusRoom } from "@/types/campus";

export function buildIndoorSteps(
  buildingName: string,
  room: Pick<CampusRoom, "floor" | "number" | "is_accessible">,
  avoidStairs: boolean,
): string[] {
  const wayUp =
    avoidStairs || room.is_accessible ? "elevator" : "elevator or stairs";
  return [
    `Enter ${buildingName}.`,
    `Take the ${wayUp} to floor ${room.floor}.`,
    `Find room ${room.number}.`,
  ];
}
