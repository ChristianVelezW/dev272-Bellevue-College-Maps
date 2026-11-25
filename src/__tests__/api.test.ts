import { createIssueReport } from "@/api/reports";
import { createSavedPlace } from "@/api/savedPlaces";
import { supabase } from "@/lib/supabase";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockSingle = jest.fn();
const mockSelect = jest.fn(() => ({ single: mockSingle }));
const mockInsert = jest.fn(() => ({ select: mockSelect }));

beforeEach(() => {
  jest.clearAllMocks();
  (supabase.from as jest.Mock).mockReturnValue({
    insert: mockInsert,
  });
});

describe("Issue Report Validation & Submission (createIssueReport)", () => {
  test("rejects blank or whitespace-only descriptions before calling Supabase", async () => {
    await expect(
      createIssueReport({
        category: "Bug",
        building_id: "L",
        description: "   ",
      }),
    ).rejects.toThrow("Issue description cannot be empty.");

    expect(supabase.from).not.toHaveBeenCalled();
  });

  test("rejects descriptions shorter than 20 characters", async () => {
    await expect(
      createIssueReport({
        category: "Bug",
        building_id: "L",
        description: "Too short",
      }),
    ).rejects.toThrow("Description must be at least 20 characters.");

    expect(supabase.from).not.toHaveBeenCalled();
  });

  test("rejects descriptions longer than 300 characters", async () => {
    await expect(
      createIssueReport({
        category: "Bug",
        building_id: "L",
        description: "A".repeat(301),
      }),
    ).rejects.toThrow("Description cannot exceed 300 characters.");

    expect(supabase.from).not.toHaveBeenCalled();
  });

  test("trims description, inserts valid report, and returns mapped IssueReport", async () => {
    const mockRow = {
      id: "rep-1",
      category: "Wrong Information" as const,
      building_id: "D",
      room_id: null,
      description: "The building hours changed on Friday",
      created_at: "2026-11-24T12:00:00.000Z",
    };

    mockSingle.mockResolvedValueOnce({ data: mockRow, error: null });

    const result = await createIssueReport({
      category: "Wrong Information",
      building_id: "D",
      description: "  The building hours changed on Friday  ",
    });

    expect(supabase.from).toHaveBeenCalledWith("reports");
    expect(mockInsert).toHaveBeenCalledWith({
      category: "Wrong Information",
      building_id: "D",
      room_id: null,
      description: "The building hours changed on Friday",
    });
    expect(result).toEqual(mockRow);
  });

  test("throws a descriptive error when Supabase insert fails", async () => {
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { message: "permission denied" },
    });

    await expect(
      createIssueReport({
        category: "Bug",
        building_id: "L",
        description: "The building map pin is showing the wrong location",
      }),
    ).rejects.toThrow("Failed to submit issue report: permission denied");
  });
});

describe("Saved Place Submission (createSavedPlace)", () => {
  test("inserts a valid saved place and defaults optional label to null", async () => {
    const mockRow = {
      id: "sp-10",
      building_id: "L",
      room_id: "L-201",
      label: null,
      location_type: "Classroom" as const,
      notes: null,
      created_at: "2026-11-24T12:05:00.000Z",
    };

    mockSingle.mockResolvedValueOnce({ data: mockRow, error: null });

    const result = await createSavedPlace({
      building_id: "L",
      room_id: "L-201",
      label: null,
      location_type: "Classroom",
      notes: null,
    });

    expect(supabase.from).toHaveBeenCalledWith("saved_places");
    expect(mockInsert).toHaveBeenCalledWith({
      building_id: "L",
      room_id: "L-201",
      label: null,
      location_type: "Classroom",
      notes: null,
    });
    expect(result).toEqual(mockRow);
  });

  test("throws a descriptive error when saving a place fails", async () => {
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { message: "foreign key violation" },
    });

    await expect(
      createSavedPlace({
        building_id: "INVALID",
        room_id: "INVALID-101",
        label: "Class",
        location_type: "Classroom",
        notes: null,
      }),
    ).rejects.toThrow("Failed to save place: foreign key violation");
  });
});
