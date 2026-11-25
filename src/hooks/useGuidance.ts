import * as Location from "expo-location";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import { mainCampusEntranceBuildingId } from "@/data/campusGraph";
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
  shortestRoute,
  snapToNetwork,
} from "@/utils/routing";

type Permission = "asking" | "granted" | "denied";
type Guidance = {
  status:
    | "asking"
    | "denied"
    | "manual-indoors"
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
    let permissionCheck = 0;
    let requested = false;
    async function checkPermission(request: boolean) {
      const check = ++permissionCheck;
      let granted: boolean;
      try {
        const response = await (request
          ? Location.requestForegroundPermissionsAsync()
          : Location.getForegroundPermissionsAsync());
        granted = response.granted;
      } catch {
        if (!request) return;
        granted = false;
      }
      if (!active || check !== permissionCheck) return;
      requested = true;
      if (!granted) {
        lastPosition.current = null;
        setGuidance(initialGuidance);
      }
      setPermission(granted ? "granted" : "denied");
    }
    void checkPermission(true);
    const listener = AppState.addEventListener("change", (state) => {
      if (requested && state === "active") void checkPermission(false);
    });
    return () => {
      active = false;
      listener.remove();
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

  const manual = useMemo<Guidance | null>(() => {
    if (permission !== "denied") return null;
    const mainCampusEntrance = [...graph.nodes.values()].find(
      (node) => node.entrance?.buildingId === mainCampusEntranceBuildingId,
    );
    const route = mainCampusEntrance
      ? shortestRoute(
          graph,
          mainCampusEntrance.id,
          targetBuildingId,
          avoidStairs,
        )
      : null;
    const startsIndoors = route?.nodeIds.length === 1;
    return {
      ...initialGuidance,
      status: startsIndoors ? "manual-indoors" : "denied",
      route,
      maneuvers:
        route && !startsIndoors
          ? buildManeuvers(route, targetBuildingName)
          : [],
    };
  }, [permission, graph, targetBuildingId, targetBuildingName, avoidStairs]);

  if (manual) return { ...manual, permission };
  return {
    ...guidance,
    permission,
    status: permission === "granted" ? guidance.status : permission,
  };
}
