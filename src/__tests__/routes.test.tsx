import {
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react-native";
import { Linking } from "react-native";
import { campusGraph, campusWalkways } from "@/data/campusGraph";
import { colors } from "@/constants/colors";
import { useGuidance } from "@/hooks/useGuidance";
import { buildManeuvers } from "@/utils/maneuvers";
import { getRouteProgress } from "@/utils/progress";
import { shortestRoute } from "@/utils/routing";
import NavigationScreen from "../app/navigate/[roomId]";
import SavePlace from "../app/place/new";
import ReportIssue from "../app/report";

const mockReplace = jest.fn();
const mockBack = jest.fn();
let mockRoomId: string | string[] = "C-102";
let mockAvoidStairs = false;
const mockBuildings = [
  {
    id: "C",
    code: "C",
    name: "Student Union",
    rooms: [{ id: "room-key", number: "C-102", floor: 1, is_accessible: true }],
  },
  {
    id: "D",
    code: "D",
    name: "D Building",
    rooms: [{ id: "D-204", number: "D-204", floor: 2, is_accessible: true }],
  },
];
jest.mock("@/context/CampusContext", () => ({
  useCampus: () => ({
    buildings: mockBuildings,
    avoidStairs: mockAvoidStairs,
    isLoading: false,
  }),
}));
jest.mock("@/hooks/useGuidance", () => ({ useGuidance: jest.fn() }));
const mockGuidance = jest.mocked(useGuidance);
const d = [...campusGraph.nodes.values()].find(
  (node) => node.entrance?.buildingId === "D",
)!;
const route = shortestRoute(campusGraph, d.id, "C")!;
const maneuvers = buildManeuvers(route, "Student Union");
const midpoint = {
  latitude: (route.coordinates[0].latitude + route.coordinates[1].latitude) / 2,
  longitude:
    (route.coordinates[0].longitude + route.coordinates[1].longitude) / 2,
};
const progress = getRouteProgress(route, midpoint, maneuvers)!;
const guiding: ReturnType<typeof useGuidance> = {
  status: "guiding",
  permission: "granted",
  route,
  maneuvers,
  progress,
  position: midpoint,
};

jest.mock("react-native-safe-area-context", () => ({
  ...jest.requireActual("react-native-safe-area-context"),
  useSafeAreaInsets: () => ({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }),
}));

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  useLocalSearchParams: () => ({ roomId: mockRoomId }),
  useRouter: () => ({
    replace: mockReplace,
    back: mockBack,
  }),
  router: {
    back: () => mockBack(),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockRoomId = "C-102";
  mockAvoidStairs = false;
  mockGuidance.mockReturnValue(guiding);
});

describe("Secondary Route & Modal Smoke Tests (#19)", () => {
  test("NavigationScreen renders room directions and returns home on End Route", async () => {
    await render(<NavigationScreen />);

    expect(screen.getByText("DIRECTIONS")).toBeOnTheScreen();
    expect(mockGuidance).toHaveBeenCalledWith(
      campusGraph,
      "C",
      "Student Union",
      false,
    );
    const card = within(screen.getByTestId("turn-card"));
    expect(card.getByText("Turn left")).toBeOnTheScreen();
    expect(card.getByText("119 ft")).toBeOnTheScreen();
    expect(screen.getByText("2 min · 401 ft")).toBeOnTheScreen();
    expect(screen.getByText("Head toward Student Union")).toBeOnTheScreen();
    expect(screen.getByTestId("guidance-map").props.showsUserLocation).toBe(
      true,
    );
    expect(
      screen
        .getAllByTestId("campus-walkway")
        .map((line) => line.props.coordinates),
    ).toEqual(campusWalkways);
    const walked = screen.getByTestId("walked-route").props;
    const remaining = screen.getByTestId("remaining-route").props;
    expect(walked.strokeColor).toBe(colors.gray);
    expect(walked.coordinates).toEqual([
      route.coordinates[0],
      progress.splitPoint,
    ]);
    expect(remaining).toMatchObject({
      strokeColor: colors.brand,
      strokeWidth: 6,
      coordinates: [progress.splitPoint, ...route.coordinates.slice(1)],
    });
    expect(screen.getByTestId("destination-entrance").props.coordinate).toEqual(
      route.coordinates[route.coordinates.length - 1],
    );
    await fireEvent.press(screen.getByRole("button", { name: "End Route" }));
    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  test("room IDs and the step-free preference reach guidance", async () => {
    mockRoomId = ["room-key"];
    mockAvoidStairs = true;
    await render(<NavigationScreen />);
    expect(mockGuidance).toHaveBeenCalledWith(
      campusGraph,
      "C",
      "Student Union",
      true,
    );
    expect(screen.getByText("No stairs")).toBeOnTheScreen();
  });

  test("a missing room shows the fallback before location is requested", async () => {
    mockRoomId = "unknown";
    await render(<NavigationScreen />);
    expect(screen.getByText("Room not found")).toBeOnTheScreen();
    expect(mockGuidance).not.toHaveBeenCalled();
    await fireEvent.press(
      screen.getByRole("button", { name: "Back to Search" }),
    );
    expect(mockReplace).toHaveBeenCalledWith("/search");
  });

  test("before the first fix the map shows the walkways and destination entrance", async () => {
    mockGuidance.mockReturnValue({
      status: "locating",
      permission: "granted",
      position: null,
      route: null,
      maneuvers: [],
      progress: null,
    });
    await render(<NavigationScreen />);
    expect(screen.getAllByTestId("campus-walkway")).toHaveLength(
      campusWalkways.length,
    );
    expect(screen.getByTestId("destination-entrance").props.coordinate).toEqual(
      route.coordinates[route.coordinates.length - 1],
    );
    expect(screen.queryByTestId("walked-route")).toBeNull();
    expect(screen.queryByTestId("remaining-route")).toBeNull();
    expect(screen.queryByText(/min ·/)).toBeNull();
  });

  test.each([
    ["asking", /allow location access/i],
    ["locating", /finding your location/i],
    ["denied", /location off/i],
    ["location-unavailable", /location unavailable/i],
    ["off-campus", /outside the campus paths/i],
    ["no-route", /no step-free route/i],
    ["rerouting", /rerouting/i],
    ["arrived", /arrived at Student Union/i],
  ] as const)("the turn card explains %s", async (status, message) => {
    mockAvoidStairs = true;
    mockGuidance.mockReturnValue({
      ...guiding,
      status,
      permission: status === "denied" ? "denied" : "granted",
    });
    await render(<NavigationScreen />);
    expect(
      within(screen.getByTestId("turn-card")).getByText(message),
    ).toBeOnTheScreen();
    if (status === "denied")
      expect(screen.getByTestId("guidance-map").props.showsUserLocation).toBe(
        false,
      );
  });

  test("manual directions draw the full route and step forward and back without GPS", async () => {
    mockGuidance.mockReturnValue({
      ...guiding,
      status: "denied",
      permission: "denied",
      progress: null,
      position: null,
    });
    const settings = jest.spyOn(Linking, "openSettings").mockResolvedValue();
    await render(<NavigationScreen />);
    const card = within(screen.getByTestId("turn-card"));
    const back = () => screen.getByRole("button", { name: "Back" });
    const next = () => screen.getByRole("button", { name: "Next" });
    expect(card.getByText(/from the D entrance/i)).toBeOnTheScreen();
    expect(back()).toBeDisabled();
    expect(screen.getByTestId("remaining-route").props.coordinates).toEqual(
      route.coordinates,
    );
    expect(screen.queryByTestId("walked-route")).toBeNull();
    for (const step of maneuvers.slice(1)) {
      await fireEvent.press(next());
      expect(card.getByText(step.text)).toBeOnTheScreen();
    }
    expect(next()).toBeDisabled();
    expect(
      screen.getByText("Find room C-102 on this floor."),
    ).toBeOnTheScreen();
    await fireEvent.press(back());
    expect(
      card.getByText(maneuvers[maneuvers.length - 2].text),
    ).toBeOnTheScreen();
    expect(screen.queryByText("INDOOR DIRECTIONS")).toBeNull();
    await fireEvent.press(card.getByRole("button", { name: "Open Settings" }));
    expect(settings).toHaveBeenCalledTimes(1);
    settings.mockRestore();
  });

  test("a denied user can open Settings even when no manual route exists", async () => {
    mockAvoidStairs = true;
    mockGuidance.mockReturnValue({
      status: "denied",
      permission: "denied",
      route: null,
      maneuvers: [],
      progress: null,
      position: null,
    });
    await render(<NavigationScreen />);
    expect(
      screen.getByText(/no step-free route from the D entrance/i),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole("button", { name: "Open Settings" }),
    ).toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
  });

  test("with location denied, D-204 opens indoors without outdoor steps", async () => {
    mockRoomId = "D-204";
    mockGuidance.mockReturnValue({
      status: "manual-indoors",
      permission: "denied",
      route: shortestRoute(campusGraph, d.id, "D"),
      maneuvers: [],
      position: null,
      progress: null,
    });
    await render(<NavigationScreen />);
    expect(screen.getByText("Start at the D entrance.")).toBeOnTheScreen();
    expect(screen.getByText("INDOOR DIRECTIONS")).toBeOnTheScreen();
    expect(screen.getByText("Take the elevator to floor 2.")).toBeOnTheScreen();
    expect(screen.getByText("Find room D-204.")).toBeOnTheScreen();
    expect(
      screen.getByRole("button", { name: "Open Settings" }),
    ).toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Back" })).toBeNull();
    expect(screen.queryByTestId("remaining-route")).toBeNull();
  });

  test("arriving at the entrance displays the room's indoor directions", async () => {
    mockGuidance.mockReturnValue({ ...guiding, status: "arrived" });
    await render(<NavigationScreen />);
    expect(screen.getByText("INDOOR DIRECTIONS")).toBeOnTheScreen();
    expect(screen.getByText("Enter Student Union.")).toBeOnTheScreen();
    expect(
      screen.getByText("Find room C-102 on this floor."),
    ).toBeOnTheScreen();
  });

  test("keeps the overview through early fixes, follows after 5 m, and pauses on drag", async () => {
    const { mockCamera } = jest.requireMock("react-native-maps");
    const start = route.coordinates[0];
    const nearStart = {
      latitude: (start.latitude + midpoint.latitude) / 2,
      longitude: (start.longitude + midpoint.longitude) / 2,
    };
    function fix(position: typeof start) {
      mockGuidance.mockReturnValue({
        ...guiding,
        position,
        progress: getRouteProgress(route, position, maneuvers),
      });
    }
    fix(start);
    const { rerender } = await render(<NavigationScreen />);
    const map = screen.getByTestId("guidance-map");
    await fireEvent(map, "mapReady");
    await fireEvent(screen.getByTestId("turn-card"), "layout", {
      nativeEvent: { layout: { height: 80 } },
    });
    expect(mockCamera.fitToCoordinates).toHaveBeenCalledWith(
      route.coordinates,
      {
        edgePadding: { top: 112, left: 36, bottom: 32, right: 36 },
        animated: true,
      },
    );
    expect(mockCamera.animateCamera).not.toHaveBeenCalled();
    fix(nearStart);
    await rerender(<NavigationScreen />);
    expect(mockCamera.animateCamera).not.toHaveBeenCalled();
    fix(midpoint);
    await rerender(<NavigationScreen />);
    expect(mockCamera.animateCamera).toHaveBeenCalledWith(
      { center: midpoint },
      expect.anything(),
    );
    await fireEvent(map, "panDrag");
    fix(route.coordinates[2]);
    await rerender(<NavigationScreen />);
    expect(mockCamera.animateCamera).toHaveBeenCalledTimes(1);
    await fireEvent.press(screen.getByRole("button", { name: "Recenter" }));
    expect(mockCamera.animateCamera).toHaveBeenLastCalledWith(
      { center: route.coordinates[2] },
      expect.anything(),
    );
    expect(screen.queryByRole("button", { name: "Recenter" })).toBeNull();
    expect(mockCamera.fitToCoordinates).toHaveBeenCalledTimes(1);
  });

  test("Recenter follows the user immediately even at the start of a route", async () => {
    const { mockCamera } = jest.requireMock("react-native-maps");
    const start = route.coordinates[0];
    mockGuidance.mockReturnValue({
      ...guiding,
      position: start,
      progress: getRouteProgress(route, start, maneuvers),
    });
    await render(<NavigationScreen />);
    const map = screen.getByTestId("guidance-map");
    await fireEvent(map, "mapReady");
    await fireEvent(screen.getByTestId("turn-card"), "layout", {
      nativeEvent: { layout: { height: 80 } },
    });
    await fireEvent(map, "panDrag");
    await fireEvent.press(screen.getByRole("button", { name: "Recenter" }));
    expect(mockCamera.animateCamera).toHaveBeenCalledWith(
      { center: start },
      expect.anything(),
    );
  });

  test("SavePlace modal renders disabled Save button and dismisses on Cancel", async () => {
    await render(<SavePlace />);

    expect(screen.getByRole("button", { name: "Save Place" })).toBeDisabled();
    await fireEvent.press(screen.getByRole("button", { name: "Cancel" }));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  test("ReportIssue modal renders category filters, disabled Submit button, and dismisses on Cancel", async () => {
    await render(<ReportIssue />);

    expect(screen.getByText("Report an Issue")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Bug, filter" })).toBeSelected();
    expect(
      screen.getByRole("button", { name: "Submit Report" }),
    ).toBeDisabled();

    await fireEvent.press(screen.getByRole("button", { name: "Cancel" }));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
