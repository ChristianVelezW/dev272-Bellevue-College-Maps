// jest.setup.ts: runs before every test file (see "setupFiles" under "jest"
// in package.json). Tests run in Node on your computer, not on a phone, so
// native code and secrets get stand-ins here.
//
// Nothing needs a stand-in yet. As your app grows, add these:
//
// After you install AsyncStorage:
//   import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";
//   jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);
//
// After you add Supabase (fake values; your real keys stay in .env):
//   process.env.EXPO_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
//   process.env.EXPO_PUBLIC_SUPABASE_KEY = "sb_publishable_test";

export {};
