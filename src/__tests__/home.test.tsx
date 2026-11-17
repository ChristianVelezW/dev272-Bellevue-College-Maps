import { render, screen } from "@testing-library/react-native";

import Index from "@/app/(tabs)/index";

// Test files live outside src/app: every file in app/ is treated as a route.
test("map screen shows the campus map placeholder", async () => {
  await render(<Index />);

  expect(screen.getByText("Campus map coming soon")).toBeOnTheScreen();
});
