import type { TodoItem } from "../../../gen/todo_pb";

export type FilterMode = "all" | "active" | "completed";
export type SortBy = "created" | "due" | "title";

/**
 * Calculate progress percentage for a list of items.
 */
export function calculateProgress(items: TodoItem[]): {
  totalCount: number;
  completedCount: number;
  progressPercent: number;
} {
  const totalCount = items.length;
  const completedCount = items.filter((i) => i.isCompleted).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  return { totalCount, completedCount, progressPercent };
}

/**
 * Filter and sort a list of items by the given filter mode and sort criteria.
 */
export function applyFilterAndSort(
  items: TodoItem[],
  filter: FilterMode,
  sortBy: SortBy
): TodoItem[] {
  const filtered = items.filter((i) => {
    if (filter === "active") return !i.isCompleted;
    if (filter === "completed") return i.isCompleted;
    return true;
  });

  return [...filtered].sort((a, b) => {
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === "due") {
      const timeA = a.dueAt ? Number(a.dueAt.seconds) : Infinity;
      const timeB = b.dueAt ? Number(b.dueAt.seconds) : Infinity;
      return timeA - timeB;
    }
    // default: created (descending)
    const timeA = a.createdAt ? Number(a.createdAt.seconds) : 0;
    const timeB = b.createdAt ? Number(b.createdAt.seconds) : 0;
    return timeB - timeA;
  });
}
