import { type RefObject, useEffect, useRef, useState } from "react";
import type MapView from "react-native-maps";
import type { Coordinate, Route } from "@/types/campus";

export function useGuidanceCamera(
  map: RefObject<MapView | null>,
  route: Route | null,
  position: Coordinate | null,
) {
  const fittedRoute = useRef<Route | null>(null);
  const lastCenter = useRef<Coordinate | null>(null);
  const [ready, setReady] = useState(false);
  const [bannerHeight, setBannerHeight] = useState(0);
  const [following, setFollowing] = useState(true);

  useEffect(() => {
    if (!ready || !bannerHeight || !following || !map.current) return;
    if (route && route !== fittedRoute.current && route.coordinates.length) {
      fittedRoute.current = route;
      lastCenter.current = position;
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
      (lastCenter.current?.latitude !== position.latitude ||
        lastCenter.current.longitude !== position.longitude)
    ) {
      map.current.animateCamera({ center: position }, { duration: 350 });
      lastCenter.current = position;
    }
  }, [map, ready, bannerHeight, following, route, position]);

  function recenter() {
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
