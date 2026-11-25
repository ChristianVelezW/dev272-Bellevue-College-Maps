import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import NavigationScreen from "../app/navigate/[roomId]";
import SavePlace from "../app/place/new";
import ReportIssue from "../app/report";

const mockReplace = jest.fn();
const mockBack = jest.fn();

jest.mock("react-native-element-dropdown", () => ({
  Dropdown: () => null,
}));

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

function renderWithQueryClient(component: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>,
  );
}

describe("Secondary Route & Modal Smoke Tests (#19)", () => {
  test("NavigationScreen renders room directions and returns home on End Route", async () => {
    await render(<NavigationScreen />);

    expect(screen.getByText("DIRECTIONS")).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole("button", { name: "End Route" }));
    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  test("SavePlace modal renders disabled Save button and dismisses on Cancel", async () => {
    await renderWithQueryClient(<SavePlace />);

    expect(screen.getByRole("button", { name: "Save Place" })).toBeDisabled();
    await fireEvent.press(screen.getByRole("button", { name: "Cancel" }));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  test("ReportIssue modal renders category filters, disabled Submit button, and dismisses on Cancel", async () => {
    await renderWithQueryClient(<ReportIssue />);

    expect(screen.getByText("Report an Issue")).toBeOnTheScreen();
    expect(
      screen.getByRole("button", { name: "Bug, filter" }),
    ).not.toBeSelected();
    expect(
      screen.getByRole("button", { name: "Submit Report" }),
    ).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Cancel" })).toBeOnTheScreen();
    });

    await fireEvent.press(screen.getByRole("button", { name: "Cancel" }));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
