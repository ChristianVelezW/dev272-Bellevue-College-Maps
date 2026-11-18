import { fireEvent, render, screen } from "@testing-library/react-native";
import NavigationScreen from "../app/navigate/[roomId]";
import SavePlace from "../app/place/new";
import ReportIssue from "../app/report";

const mockReplace = jest.fn();
const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  useLocalSearchParams: () => ({ roomId: "L-201" }),
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
});

describe("Secondary Route & Modal Smoke Tests (#19)", () => {
  test("NavigationScreen renders room directions and returns home on End Route", async () => {
    await render(<NavigationScreen />);

    expect(screen.getByText("Directions to L-201")).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole("button", { name: "End Route" }));
    expect(mockReplace).toHaveBeenCalledWith("/");
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
