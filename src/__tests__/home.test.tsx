import { render, screen } from "@testing-library/react-native";

import Index from "@/app/(tabs)/index";

// Test files live outside src/app: every file in app/ is treated as a route.
// This starter test proves Jest works. Replace it when you replace the screen.
test("home screen shows app name", async () => {
  await render(<Index />);

  expect(screen.getByText("BC Maps")).toBeOnTheScreen();
});
