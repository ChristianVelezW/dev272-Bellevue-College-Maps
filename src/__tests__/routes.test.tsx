import {
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react-native";
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
    rooms: [{ id: "room-key", number: "C-102" }],
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
    ["denied", /permission denied/i],
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
