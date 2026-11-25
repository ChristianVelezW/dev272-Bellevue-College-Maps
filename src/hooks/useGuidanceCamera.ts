import { type RefObject, useEffect, useRef, useState } from "react";
import type MapView from "react-native-maps";
import type { Coordinate, Route } from "@/types/campus";

const followAfterMeters = 5;

export function useGuidanceCamera(
  map: RefObject<MapView | null>,
  route: Route | null,
  position: Coordinate | null,
  walkedMeters: number,
) {
  const fittedRoute = useRef<Route | null>(null);
  const lastCenter = useRef<Coordinate | null>(null);
  const showingOverview = useRef(false);
  const [ready, setReady] = useState(false);
  const [bannerHeight, setBannerHeight] = useState(0);
  const [following, setFollowing] = useState(true);

  useEffect(() => {
    if (!ready || !bannerHeight || !following || !map.current) return;
    if (route && route !== fittedRoute.current && route.coordinates.length) {
      fittedRoute.current = route;
      lastCenter.current = position;
      showingOverview.current = route.coordinates.length > 1;
      if (route.coordinates.length === 1) {
        map.current.animateCamera({ center: route.coordinates[0] });
      } else {
        map.current.fitToCoordinates(route.coordinates, {
          edgePadding: {
            top: bannerHeight + 32,
            right: 36,
            bottom: 32,
            left: 36,
          },
          animated: true,
        });
      }
    } else if (
      position &&
      (!route ||
        !showingOverview.current ||
        walkedMeters >= followAfterMeters) &&
      (lastCenter.current?.latitude !== position.latitude ||
        lastCenter.current.longitude !== position.longitude)
    ) {
      showingOverview.current = false;
      map.current.animateCamera({ center: position }, { duration: 350 });
      lastCenter.current = position;
    }
  }, [map, ready, bannerHeight, following, route, position, walkedMeters]);

  function recenter() {
    showingOverview.current = false;
    lastCenter.current = null;
    fittedRoute.current = position ? route : null;
    setFollowing(true);
  }

  return {
    onMapReady: () => setReady(true),
    onPanDrag: () => setFollowing(false),
    setBannerHeight,
    canRecenter: !following && Boolean(route || position),
    recenter,
  };
}
