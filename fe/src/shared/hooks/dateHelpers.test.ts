import { formatTimestamp, formatTimestampInput, getDueDateStatus } from "./dateHelpers";
import { Timestamp, timestampDate } from "@bufbuild/protobuf/wkt";

function makeTimestamp(seconds: number): Timestamp {
  return { seconds: BigInt(seconds), nanos: 0 };
}

describe("formatTimestamp", () => {
  it("returns empty string for undefined", () => {
    expect(formatTimestamp(undefined)).toBe("");
  });

  it("returns empty string for null-like values", () => {
    // @ts-expect-error testing runtime behavior
    expect(formatTimestamp(null)).toBe("");
  });

  it("formats a timestamp with locale-aware date string", () => {
    const ts = makeTimestamp(1704067200); // 2024-01-01 00:00:00 UTC
    const result = formatTimestamp(ts);
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    // Should contain the year since we include year in options
    expect(result.includes("2024")).toBe(true);
  });

  it("handles timestamps across different dates", () => {
    const jan = makeTimestamp(1704067200);   // 2024-01-01
    const feb = makeTimestamp(1706745600);   // 2024-02-01

    expect(formatTimestamp(jan)).not.toBe(formatTimestamp(feb));
  });
});

describe("formatTimestampInput", () => {
  it("returns ISO substring for date input (YYYY-MM-DDTHH:MM)", () => {
    const ts = makeTimestamp(1704067200); // 2024-01-01 00:00:00 UTC
    const result = formatTimestampInput(ts);
    // Format is YYYY-MM-DDTHH:MM in local time; verify structure not exact value
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });

  it("handles different timestamps with correct length", () => {
    const ts = makeTimestamp(0); // epoch
    const result = formatTimestampInput(ts);
    expect(result.length).toBe(16);
  });
});

describe("getDueDateStatus", () => {
  it("returns 'none' for undefined", () => {
    expect(getDueDateStatus(undefined)).toBe("none");
  });

  it("returns 'today' when timestamp is today (ignoring time)", () => {
    const now = new Date();
    const todayNoon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
    const ts = makeTimestamp(Math.floor(todayNoon.getTime() / 1000));

    expect(getDueDateStatus(ts)).toBe("today");
  });

  it("returns 'overdue' when timestamp is in the past (date only)", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayNoon = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 12, 0, 0);
    const ts = makeTimestamp(Math.floor(yesterdayNoon.getTime() / 1000));

    expect(getDueDateStatus(ts)).toBe("overdue");
  });

  it("returns 'future' when timestamp is in the future (date only)", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowNoon = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 12, 0, 0);
    const ts = makeTimestamp(Math.floor(tomorrowNoon.getTime() / 1000));

    expect(getDueDateStatus(ts)).toBe("future");
  });

  it("treats end-of-day timestamps as same day", () => {
    const now = new Date();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const ts = makeTimestamp(Math.floor(todayEnd.getTime() / 1000));

    expect(getDueDateStatus(ts)).toBe("today");
  });
});
