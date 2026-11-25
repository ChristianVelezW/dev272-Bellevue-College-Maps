import { supabase } from "@/lib/supabase";
import { CreateIssueReportInput, IssueReport, ReportRow } from "@/types/campus";

// converts reports table row into object
export function mapReportRow(row: ReportRow): IssueReport {
  return {
    id: row.id,
    category: row.category,
    building_id: row.building_id,
    room_id: row.room_id,
    description: row.description,
    created_at: row.created_at,
  };
}

// fetches all submitted reports, ordered by newest
export async function getIssueReports(): Promise<IssueReport[]> {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load issue report: ${error.message}`);
  }

  return ((data as ReportRow[] | null) ?? []).map(mapReportRow);
}

// validates that description isn't blank, inserts new report, and returns the created record
export async function createIssueReport(
  input: CreateIssueReportInput,
): Promise<IssueReport> {
  const trimmedDescription = input.description.trim();

  if (!trimmedDescription) {
    throw new Error("Issue description cannot be empty.");
  }

  if (trimmedDescription.length < 20) {
    throw new Error("Description must be at least 20 characters.");
  }

  if (trimmedDescription.length > 300) {
    throw new Error("Description cannot exceed 300 characters.");
  }

  const { data, error } = await supabase
    .from("reports")
    .insert({
      category: input.category,
      building_id: input.building_id,
      room_id: input.room_id ?? null,
      description: trimmedDescription,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to submit issue report: ${error.message}`);
  }

  return mapReportRow(data as ReportRow);
}
