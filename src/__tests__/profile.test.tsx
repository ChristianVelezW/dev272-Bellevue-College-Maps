import { fireEvent, render, screen } from "@testing-library/react-native";
import ProfileScreen from "../app/(tabs)/profile";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Profile Screen", () => {
  test("displays the profile page and all section headers", async () => {
    await render(<ProfileScreen />);

    expect(screen.getByText("Profile")).toBeOnTheScreen();
    expect(screen.getByText("SAVED PLACES")).toBeOnTheScreen();
    expect(screen.getByText("NAVIGATION")).toBeOnTheScreen();
    expect(screen.getByText("APP")).toBeOnTheScreen();
  });

  test("opens the correct building and floor when a saved place is selected", async () => {
    await render(<ProfileScreen />);

    await fireEvent.press(screen.getByText("Quiet Study Room"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/building/[id]",
      params: {
        id: "L",
        floor: "3",
      },
    });
  });

  test("opens the Add Place screen", async () => {
    await render(<ProfileScreen />);
    await fireEvent.press(screen.getByText("Add Place"));
    expect(mockPush).toHaveBeenCalledWith("/place/new");
  });

  test("opens the Report an Issue screen", async () => {
    await render(<ProfileScreen />);
    await fireEvent.press(screen.getByText("Report an Issue"));
    expect(mockPush).toHaveBeenCalledWith("/report");
  });

  test("allows users to change navigation settings", async () => {
    await render(<ProfileScreen />);
    const accessibleSwitch = screen.getByRole("switch", {
      name: "Accessible Routes Only",
    });

    const stairsSwitch = screen.getByRole("switch", {
      name: "Avoid Stairs",
    });

    expect(accessibleSwitch.props.value).toBe(false);
    expect(stairsSwitch.props.value).toBe(false);

    await fireEvent(accessibleSwitch, "valueChange", true);
    expect(accessibleSwitch.props.value).toBe(true);

    await fireEvent(stairsSwitch, "valueChange", true);
    expect(stairsSwitch.props.value).toBe(true);
  });
});
