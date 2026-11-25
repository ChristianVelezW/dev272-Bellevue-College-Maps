import { act, renderHook } from "@testing-library/react-native";
import * as Location from "expo-location";
import { AppState } from "react-native";
import { campusGraph } from "@/data/campusGraph";
import { useGuidance } from "@/hooks/useGuidance";
import { buildGraph } from "@/utils/graph";

jest.mock("expo-location", () => ({
  Accuracy: { High: 4 },
  PermissionStatus: { GRANTED: "granted", DENIED: "denied" },
  requestForegroundPermissionsAsync: jest.fn(),
  getForegroundPermissionsAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
}));

const requestPermission = jest.mocked(
  Location.requestForegroundPermissionsAsync,
);
const watch = jest.mocked(Location.watchPositionAsync);
const remove = jest.fn();
const granted: Location.LocationPermissionResponse = {
  granted: true,
  status: Location.PermissionStatus.GRANTED,
  canAskAgain: true,
  expires: "never",
};
const metersPerDegree = 111_195;
const west = [0, 0];
const east = [150 / metersPerDegree, 0];
const north = 40 / metersPerDegree;
const { graph } = buildGraph({
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "LineString", coordinates: [west, east] },
      properties: { stairs: true },
    },
    {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [west, [west[0], north], [east[0], north], east],
      },
      properties: { stairs: false },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: east },
      properties: { buildingId: "T", accessible: true },
    },
  ],
});

beforeEach(() => {
  jest.resetAllMocks();
  jest
    .spyOn(AppState, "addEventListener")
    .mockReturnValue({ remove: jest.fn() });
  requestPermission.mockResolvedValue(granted);
  watch.mockResolvedValue({ remove });
});

function start() {
  return renderHook(() => useGuidance(graph, "T", "Student Union", false));
}

function reading(
  x: number,
  y: number,
  accuracy = 5,
  callback = watch.mock.lastCall![1],
) {
  return act(() =>
    callback({
      timestamp: Date.now(),
      coords: {
        latitude: y / metersPerDegree,
        longitude: x / metersPerDegree,
        accuracy,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
    }),
  );
}

test("permission stays asking until resolved and a denial never starts the watcher", async () => {
  let resolve!: (response: Location.LocationPermissionResponse) => void;
  requestPermission.mockReturnValue(
    new Promise((done) => {
      resolve = done;
    }),
  );
  const { result } = await start();
  expect(result.current).toMatchObject({
    permission: "asking",
    status: "asking",
    position: null,
  });
  await act(() =>
    resolve({
      ...granted,
      granted: false,
      status: Location.PermissionStatus.DENIED,
    }),
  );
  expect(result.current).toMatchObject({
    permission: "denied",
    status: "denied",
    route: null,
  });
  expect(watch).not.toHaveBeenCalled();
});

test("denial routes from D and returning from Settings starts live GPS after a grant", async () => {
  requestPermission.mockResolvedValue({
    ...granted,
    granted: false,
    status: Location.PermissionStatus.DENIED,
  });
  const check = jest.mocked(Location.getForegroundPermissionsAsync);
  check.mockResolvedValue(granted);
  const listener = jest.mocked(AppState.addEventListener);
  const { result, unmount } = await renderHook(() =>
    useGuidance(campusGraph, "C", "Student Union", true),
  );
  const entrance = [...campusGraph.nodes.values()].find(
    (node) => node.entrance?.buildingId === "D",
  );
  expect(result.current.route?.coordinates[0]).toEqual(entrance?.coordinate);
  expect(result.current.route?.lengthMeters).toBeCloseTo(128, 0);
  expect(result.current.maneuvers.map((step) => step.kind)).toEqual([
    "start",
    "left",
    "slight-right",
    "left",
    "arrive",
  ]);
  expect(result.current.position).toBeNull();
  expect(watch).not.toHaveBeenCalled();
  await act(() => listener.mock.lastCall![1]("active"));
  expect(check).toHaveBeenCalledTimes(1);
  expect(result.current).toMatchObject({
    permission: "granted",
    status: "locating",
    route: null,
  });
  expect(watch).toHaveBeenCalledTimes(1);
  await unmount();
});

test("a denied route to the starting building goes straight indoors", async () => {
  requestPermission.mockResolvedValue({
    ...granted,
    granted: false,
    status: Location.PermissionStatus.DENIED,
  });
  const { result } = await renderHook(() =>
    useGuidance(campusGraph, "D", "D Building", true),
  );
  expect(result.current).toMatchObject({
    status: "manual-indoors",
    permission: "denied",
    maneuvers: [],
    position: null,
  });
  expect(result.current.route?.nodeIds).toHaveLength(1);
  expect(watch).not.toHaveBeenCalled();
});

test("accurate fixes build guidance, advance progress, and latch arrival under 10 m", async () => {
  const { result, unmount } = await start();
  expect(result.current).toMatchObject({
    permission: "granted",
    status: "locating",
    position: null,
  });
  expect(watch.mock.calls[0][0]).toEqual({
    accuracy: Location.Accuracy.High,
    timeInterval: 1000,
    distanceInterval: 3,
  });
  await reading(0, 0, 31);
  expect(result.current).toMatchObject({ status: "locating", position: null });
  await reading(125, 0, 30);
  expect(result.current).toMatchObject({
    permission: "granted",
    status: "guiding",
  });
  expect(result.current.maneuvers[0].text).toBe("Head toward Student Union");
  const route = result.current.route;
  await reading(139, 0);
  expect(result.current.status).toBe("guiding");
  expect(result.current.progress?.walkedMeters).toBeCloseTo(14, 2);
  await reading(141, 0);
  expect(result.current.status).toBe("arrived");
  await reading(100, 0);
  expect(result.current.status).toBe("arrived");
  expect(result.current.route).toBe(route);
  await unmount();
  expect(remove).toHaveBeenCalledTimes(1);
});

test("a watcher startup failure reports location unavailable with permission granted", async () => {
  watch.mockRejectedValueOnce(new Error("Location Services are off"));
  const { result } = await start();
  expect(result.current).toMatchObject({
    permission: "granted",
    status: "location-unavailable",
    route: null,
  });
});

test("a GPS interruption preserves the route and the next good fix resumes guidance", async () => {
  const { result } = await start();
  await reading(0, 0);
  const route = result.current.route;
  await act(() => watch.mock.lastCall![2]!("Location unavailable"));
  expect(result.current.status).toBe("location-unavailable");
  expect(result.current.route).toBe(route);
  await reading(5, 0);
  expect(result.current.status).toBe("guiding");
  expect(result.current.route).toBe(route);
  expect(result.current.progress?.walkedMeters).toBeCloseTo(5, 2);
});

test("rerendering with the shared campus graph keeps the same watcher", async () => {
  const { rerender } = await renderHook(() =>
    useGuidance(campusGraph, "C", "C Building", false),
  );
  await rerender(undefined);
  expect(watch).toHaveBeenCalledTimes(1);
  expect(remove).not.toHaveBeenCalled();
});

test("three consecutive off-route fixes rebuild from the current position", async () => {
  const { result } = await start();
  await reading(0, 0);
  const original = result.current.route;
  await reading(15, 40);
  await reading(15, 40);
  await reading(15, 0);
  await reading(20, 40);
  await reading(20, 40, 40);
  await reading(20, 40);
  expect(result.current.route).toBe(original);
  expect(result.current.status).toBe("guiding");
  await reading(20, 40);
  expect(result.current.status).toBe("rerouting");
  expect(result.current.route?.coordinates[0].latitude).toBeCloseTo(north, 8);
  expect(result.current.progress?.walkedMeters).toBeCloseTo(0, 2);
  await reading(25, 40);
  expect(result.current.status).toBe("guiding");
  expect(result.current.progress?.walkedMeters).toBeCloseTo(5, 2);
});

test("guidance retries an off-campus fix and distinguishes an unreachable destination", async () => {
  const { result, rerender } = await renderHook(
    (target: string) => useGuidance(graph, target, "Student Union", false),
    { initialProps: "T" },
  );
  await reading(0, -100);
  expect(result.current).toMatchObject({ status: "off-campus", route: null });
  await reading(0, 0);
  expect(result.current.status).toBe("guiding");
  await rerender("unknown");
  expect(result.current).toMatchObject({
    status: "no-route",
    route: null,
    maneuvers: [],
    progress: null,
  });
});

test("changing avoidStairs replans from the last fix and ignores the old subscription", async () => {
  const { result, rerender } = await renderHook(
    (avoidStairs: boolean) =>
      useGuidance(graph, "T", "Student Union", avoidStairs),
    { initialProps: false },
  );
  const oldCallback = watch.mock.lastCall![1];
  await reading(0, 0);
  expect(result.current.route?.lengthMeters).toBeCloseTo(150, 2);
  await rerender(true);
  expect(result.current.route?.lengthMeters).toBeCloseTo(230, 2);
  expect(remove).toHaveBeenCalledTimes(1);
  expect(requestPermission).toHaveBeenCalledTimes(1);
  await reading(150, 0, 5, oldCallback);
  expect(result.current.position?.longitude).toBe(0);
  expect(result.current.status).toBe("guiding");
});

test("a subscription that resolves after unmount is removed", async () => {
  let resolve!: (subscription: Location.LocationSubscription) => void;
  watch.mockReturnValue(
    new Promise((done) => {
      resolve = done;
    }),
  );
  const { unmount } = await start();
  expect(watch).toHaveBeenCalledTimes(1);
  await unmount();
  await act(() => resolve({ remove }));
  expect(remove).toHaveBeenCalledTimes(1);
});
