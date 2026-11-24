import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import type {
  CampusGraph,
  Coordinate,
  Maneuver,
  Route,
  RouteProgress,
} from "@/types/campus";
import { buildManeuvers } from "@/utils/maneuvers";
import { getRouteProgress } from "@/utils/progress";
import {
  maxSnapDistanceMeters,
  routeFromPosition,
  snapToNetwork,
} from "@/utils/routing";

type Permission = "asking" | "granted" | "denied";
type Guidance = {
  status:
    | "asking"
    | "denied"
    | "locating"
    | "location-unavailable"
    | "off-campus"
    | "guiding"
    | "rerouting"
    | "arrived"
    | "no-route";
  route: Route | null;
  maneuvers: Maneuver[];
  progress: RouteProgress | null;
  position: Coordinate | null;
};

const initialGuidance: Guidance = {
  status: "locating",
  route: null,
  maneuvers: [],
  progress: null,
  position: null,
};
const offRouteThresholdMeters = 25;

// Pass the shared campusGraph or a memoized graph so rerenders keep the same location watcher.
export function useGuidance(
  graph: CampusGraph,
  targetBuildingId: string,
  targetBuildingName: string,
  avoidStairs: boolean,
): Guidance & { permission: Permission } {
  const [permission, setPermission] = useState<Permission>("asking");
  const [guidance, setGuidance] = useState(initialGuidance);
  const previousWalkedMeters = useRef<number | undefined>(undefined);
  const lastPosition = useRef<Coordinate | null>(null);

  useEffect(() => {
    let active = true;
    void Location.requestForegroundPermissionsAsync().then(
      (response) => {
        if (active) setPermission(response.granted ? "granted" : "denied");
      },
      () => {
        if (active) setPermission("denied");
      },
    );
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (permission !== "granted") return;
    let active = true;
    let subscription: Location.LocationSubscription | undefined;
    let route: Route | null = null;
    let maneuvers: Maneuver[] = [];
    let offRouteReadings = 0;
    let arrived = false;
    previousWalkedMeters.current = undefined;

    function updatePosition(position: Coordinate) {
      if (arrived) {
        setGuidance((previous) => ({ ...previous, position }));
        return;
      }
      let progress = route
        ? getRouteProgress(
            route,
            position,
            maneuvers,
            previousWalkedMeters.current,
          )
        : null;
      offRouteReadings =
        progress && progress.offRouteMeters > offRouteThresholdMeters
          ? offRouteReadings + 1
          : 0;
      const rerouting = offRouteReadings >= 3;
      if (!route || rerouting) {
        offRouteReadings = 0;
        previousWalkedMeters.current = undefined;
        route = routeFromPosition(
          graph,
          position,
          targetBuildingId,
          avoidStairs,
        );
        if (!route) {
          const nearest = snapToNetwork(graph, position);
          const status =
            !nearest || nearest.distanceMeters > maxSnapDistanceMeters
              ? "off-campus"
              : "no-route";
          setGuidance({ ...initialGuidance, status, position });
          return;
        }
        maneuvers = buildManeuvers(route, targetBuildingName);
        progress = getRouteProgress(route, position, maneuvers);
      }
      previousWalkedMeters.current = progress?.walkedMeters;
      arrived =
        progress !== null &&
        progress.remainingMeters < 10 &&
        progress.offRouteMeters <= offRouteThresholdMeters;
      const status = arrived ? "arrived" : rerouting ? "rerouting" : "guiding";
      setGuidance({ status, route, maneuvers, progress, position });
    }

    if (lastPosition.current) updatePosition(lastPosition.current);
    else setGuidance(initialGuidance);
    const onLocation: Location.LocationCallback = ({ coords }) => {
      if (!active || (coords.accuracy !== null && coords.accuracy > 30)) return;
      const position = {
        latitude: coords.latitude,
        longitude: coords.longitude,
      };
      lastPosition.current = position;
      updatePosition(position);
    };
    const onLocationError = () => {
      if (active && !arrived)
        setGuidance((previous) => ({
          ...previous,
          status: "location-unavailable",
        }));
    };
    void Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 3,
      },
      onLocation,
      onLocationError,
    ).then((watcher) => {
      if (active) subscription = watcher;
      else watcher.remove();
    }, onLocationError);
    return () => {
      active = false;
      subscription?.remove();
    };
  }, [permission, graph, targetBuildingId, targetBuildingName, avoidStairs]);

  return {
    ...guidance,
    permission,
    status: permission === "granted" ? guidance.status : permission,
  };
}
