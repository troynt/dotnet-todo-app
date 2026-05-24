import type { Timestamp } from "@bufbuild/protobuf/wkt";
import { timestampDate } from "@bufbuild/protobuf/wkt";

export function formatTimestamp(ts?: Timestamp): string {
  if (!ts) return "";
  const date = timestampDate(ts);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function formatTimestampInput(ts: Timestamp): string {
  const date = timestampDate(ts);
  return date.toISOString().substring(0, 16);
}

export type DueStatus = "overdue" | "today" | "future" | "none";

export function getDueDateStatus(ts?: Timestamp): DueStatus {
  if (!ts) return "none";
  const date = timestampDate(ts);
  const now = new Date();

  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (dateOnly.getTime() === nowOnly.getTime()) return "today";
  if (dateOnly < nowOnly) return "overdue";
  return "future";
}
