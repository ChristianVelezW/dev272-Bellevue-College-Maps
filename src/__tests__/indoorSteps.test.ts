import { buildIndoorSteps } from "@/utils/indoorSteps";

test.each([false, true])(
  "goes straight to L-101 on the entrance floor with avoidStairs=%s",
  (avoidStairs) => {
    expect(
      buildIndoorSteps(
        "Library",
        { number: "L-101", floor: 1, is_accessible: true },
        avoidStairs,
      ),
    ).toEqual(["Enter Library.", "Find room L-101 on this floor."]);
  },
);

test.each([
  [false, false, "elevator or stairs"],
  [true, false, "elevator"],
  [false, true, "elevator"],
  [true, true, "elevator"],
] as const)(
  "indoor directions honor avoidStairs=%s and room accessibility=%s",
  (avoidStairs, accessible, travel) => {
    expect(
      buildIndoorSteps(
        "Library",
        { number: "L-201", floor: 2, is_accessible: accessible },
        avoidStairs,
      ),
    ).toEqual([
      "Enter Library.",
      `Take the ${travel} to floor 2.`,
      "Find room L-201.",
    ]);
  },
);
