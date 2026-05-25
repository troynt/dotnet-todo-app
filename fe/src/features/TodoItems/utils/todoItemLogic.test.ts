import { calculateProgress, applyFilterAndSort } from "./todoItemLogic";
import type { TodoItem } from "../../../gen/todo_pb";

function makeItem(overrides: Partial<TodoItem>): TodoItem {
  return {
    id: "item-1",
    listId: "list-1",
    title: "Test item",
    description: "",
    isCompleted: false,
    ...overrides,
  } as TodoItem;
}

describe("calculateProgress", () => {
  it("returns all zeros for empty array", () => {
    const result = calculateProgress([]);
    expect(result.totalCount).toBe(0);
    expect(result.completedCount).toBe(0);
    expect(result.progressPercent).toBe(0);
  });

  it("returns correct counts when no items completed", () => {
    const items = [makeItem({ title: "A" }), makeItem({ title: "B" })];
    const result = calculateProgress(items);
    expect(result.totalCount).toBe(2);
    expect(result.completedCount).toBe(0);
    expect(result.progressPercent).toBe(0);
  });

  it("returns correct counts when all items completed", () => {
    const items = [makeItem({ title: "A", isCompleted: true }), makeItem({ title: "B", isCompleted: true })];
    const result = calculateProgress(items);
    expect(result.totalCount).toBe(2);
    expect(result.completedCount).toBe(2);
    expect(result.progressPercent).toBe(100);
  });

  it("returns correct progress when partially completed", () => {
    const items = [makeItem({ title: "A", isCompleted: true }), makeItem({ title: "B" })];
    const result = calculateProgress(items);
    expect(result.totalCount).toBe(2);
    expect(result.completedCount).toBe(1);
    expect(result.progressPercent).toBe(50);
  });

  it("rounds progress correctly for uneven percentages", () => {
    const items = [
      makeItem({ title: "A", isCompleted: true }),
      makeItem({ title: "B" }),
      makeItem({ title: "C" }),
    ];
    const result = calculateProgress(items);
    expect(result.progressPercent).toBe(33);
  });

  it("handles single item completed", () => {
    const items = [makeItem({ title: "A", isCompleted: true })];
    const result = calculateProgress(items);
    expect(result.totalCount).toBe(1);
    expect(result.completedCount).toBe(1);
    expect(result.progressPercent).toBe(100);
  });

  it("handles single item not completed", () => {
    const items = [makeItem({ title: "A" })];
    const result = calculateProgress(items);
    expect(result.totalCount).toBe(1);
    expect(result.completedCount).toBe(0);
    expect(result.progressPercent).toBe(0);
  });
});

describe("applyFilterAndSort", () => {
  describe("filtering", () => {
    it("returns all items when filter is 'all'", () => {
      const items = [
        makeItem({ title: "A", isCompleted: true }),
        makeItem({ title: "B" }),
        makeItem({ title: "C", isCompleted: true }),
      ];
      const result = applyFilterAndSort(items, "all", "created");
      expect(result).toHaveLength(3);
    });

    it("returns only active items when filter is 'active'", () => {
      const items = [
        makeItem({ title: "A", isCompleted: true }),
        makeItem({ title: "B" }),
        makeItem({ title: "C", isCompleted: false }),
      ];
      const result = applyFilterAndSort(items, "active", "created");
      expect(result).toHaveLength(2);
      expect(result.every((i) => !i.isCompleted)).toBe(true);
    });

    it("returns only completed items when filter is 'completed'", () => {
      const items = [
        makeItem({ title: "A", isCompleted: true }),
        makeItem({ title: "B" }),
        makeItem({ title: "C", isCompleted: false }),
      ];
      const result = applyFilterAndSort(items, "completed", "created");
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("A");
    });

    it("returns empty array when no items match filter", () => {
      const items = [makeItem({ title: "A" }), makeItem({ title: "B" })];
      const result = applyFilterAndSort(items, "completed", "created");
      expect(result).toHaveLength(0);
    });

    it("returns empty array when all items match filter", () => {
      const items = [makeItem({ title: "A", isCompleted: true }), makeItem({ title: "B", isCompleted: true })];
      const result = applyFilterAndSort(items, "completed", "created");
      expect(result).toHaveLength(2);
    });
  });

  describe("sorting by title", () => {
    it("sorts items alphabetically by title ascending", () => {
      const items = [
        makeItem({ title: "Charlie" }),
        makeItem({ title: "Alpha" }),
        makeItem({ title: "Bravo" }),
      ];
      const result = applyFilterAndSort(items, "all", "title");
      expect(result.map((i) => i.title)).toEqual(["Alpha", "Bravo", "Charlie"]);
    });

    it("handles case-sensitive sorting correctly", () => {
      const items = [
        makeItem({ title: "banana" }),
        makeItem({ title: "Apple" }),
        makeItem({ title: "cherry" }),
      ];
      const result = applyFilterAndSort(items, "all", "title");
      expect(result[0].title).toBe("Apple");
    });

    it("preserves filter after sorting by title", () => {
      const items = [
        makeItem({ title: "Zebra", isCompleted: true }),
        makeItem({ title: "Alpha" }),
        makeItem({ title: "Beta", isCompleted: true }),
      ];
      const result = applyFilterAndSort(items, "active", "title");
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Alpha");
    });
  });

  describe("sorting by due date", () => {
    it("sorts items by due date ascending (earliest first)", () => {
      const items = [
        makeItem({ title: "A", dueAt: { seconds: BigInt(300), nanos: 0 } }),
        makeItem({ title: "B", dueAt: { seconds: BigInt(100), nanos: 0 } }),
        makeItem({ title: "C", dueAt: { seconds: BigInt(200), nanos: 0 } }),
      ];
      const result = applyFilterAndSort(items, "all", "due");
      expect(result.map((i) => i.title)).toEqual(["B", "C", "A"]);
    });

    it("treats items without due date as last (Infinity)", () => {
      const items = [
        makeItem({ title: "A" }),
        makeItem({ title: "B", dueAt: { seconds: BigInt(100), nanos: 0 } }),
      ];
      const result = applyFilterAndSort(items, "all", "due");
      expect(result[0].title).toBe("B");
      expect(result[1].title).toBe("A");
    });

    it("handles all items without due dates", () => {
      const items = [makeItem({ title: "A" }), makeItem({ title: "B" })];
      const result = applyFilterAndSort(items, "all", "due");
      expect(result).toHaveLength(2);
    });

    it("preserves filter after sorting by due date", () => {
      const items = [
        makeItem({ title: "Zebra", isCompleted: true, dueAt: { seconds: BigInt(300), nanos: 0 } }),
        makeItem({ title: "Alpha", dueAt: { seconds: BigInt(100), nanos: 0 } }),
        makeItem({ title: "Beta", isCompleted: true, dueAt: { seconds: BigInt(200), nanos: 0 } }),
      ];
      const result = applyFilterAndSort(items, "active", "due");
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Alpha");
    });
  });

  describe("sorting by created (default)", () => {
    it("sorts items by creation time descending (newest first)", () => {
      const items = [
        makeItem({ title: "A", createdAt: { seconds: BigInt(100), nanos: 0 } }),
        makeItem({ title: "B", createdAt: { seconds: BigInt(300), nanos: 0 } }),
        makeItem({ title: "C", createdAt: { seconds: BigInt(200), nanos: 0 } }),
      ];
      const result = applyFilterAndSort(items, "all", "created");
      expect(result.map((i) => i.title)).toEqual(["B", "C", "A"]);
    });

    it("treats items without created timestamp as oldest (0)", () => {
      const items = [
        makeItem({ title: "A" }),
        makeItem({ title: "B", createdAt: { seconds: BigInt(300), nanos: 0 } }),
      ];
      const result = applyFilterAndSort(items, "all", "created");
      expect(result[0].title).toBe("B");
      expect(result[1].title).toBe("A");
    });

    it("handles all items without created timestamps", () => {
      const items = [makeItem({ title: "A" }), makeItem({ title: "B" })];
      const result = applyFilterAndSort(items, "all", "created");
      expect(result).toHaveLength(2);
    });

    it("preserves filter after sorting by created", () => {
      const items = [
        makeItem({ title: "Zebra", isCompleted: true, createdAt: { seconds: BigInt(300), nanos: 0 } }),
        makeItem({ title: "Alpha", createdAt: { seconds: BigInt(100), nanos: 0 } }),
        makeItem({ title: "Beta", isCompleted: true, createdAt: { seconds: BigInt(200), nanos: 0 } }),
      ];
      const result = applyFilterAndSort(items, "active", "created");
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Alpha");
    });
  });

  describe("combined filter + sort", () => {
    it("filters then sorts by title", () => {
      const items = [
        makeItem({ title: "Zebra", isCompleted: true }),
        makeItem({ title: "Alpha" }),
        makeItem({ title: "Beta", isCompleted: true }),
        makeItem({ title: "Gamma" }),
      ];
      const result = applyFilterAndSort(items, "active", "title");
      expect(result.map((i) => i.title)).toEqual(["Alpha", "Gamma"]);
    });

    it("filters then sorts by due date", () => {
      const items = [
        makeItem({ title: "A", isCompleted: true, dueAt: { seconds: BigInt(300), nanos: 0 } }),
        makeItem({ title: "B", dueAt: { seconds: BigInt(100), nanos: 0 } }),
        makeItem({ title: "C", isCompleted: true, dueAt: { seconds: BigInt(200), nanos: 0 } }),
      ];
      const result = applyFilterAndSort(items, "active", "due");
      expect(result.map((i) => i.title)).toEqual(["B"]);
    });

    it("filters then sorts by created descending", () => {
      const items = [
        makeItem({ title: "A", isCompleted: true, createdAt: { seconds: BigInt(300), nanos: 0 } }),
        makeItem({ title: "B", createdAt: { seconds: BigInt(100), nanos: 0 } }),
        makeItem({ title: "C", isCompleted: true, createdAt: { seconds: BigInt(200), nanos: 0 } }),
      ];
      const result = applyFilterAndSort(items, "active", "created");
      expect(result.map((i) => i.title)).toEqual(["B"]);
    });

    it("returns empty when filter excludes all items regardless of sort", () => {
      const items = [makeItem({ title: "A" }), makeItem({ title: "B" })];
      const result = applyFilterAndSort(items, "completed", "title");
      expect(result).toHaveLength(0);
    });
  });

  describe("immutability", () => {
    it("does not mutate the original array", () => {
      const items = [makeItem({ title: "A" }), makeItem({ title: "B" })];
      applyFilterAndSort(items, "all", "title");
      expect(items).toHaveLength(2);
      expect(items[0].title).toBe("A");
    });

    it("returns a new array each time", () => {
      const items = [makeItem({ title: "A" }), makeItem({ title: "B" })];
      const result1 = applyFilterAndSort(items, "all", "title");
      const result2 = applyFilterAndSort(items, "all", "title");
      expect(result1).not.toBe(result2);
    });
  });
});
