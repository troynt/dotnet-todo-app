import { useState, useRef } from "react";
import { useQuery, useMutation, useTransport, createQueryOptions } from "@connectrpc/connect-query";
import { useQueryClient } from "@tanstack/react-query";
import {
  listTodoItems,
  createTodoItem,
  updateTodoItem,
  deleteTodoItem,
} from "../../../gen/todo-TodoService_connectquery";
import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import type { TodoItem, ListTodoItemsResponse } from "../../../gen/todo_pb";
import { useInvalidateDashboardStats } from "../../../shared/hooks/useInvalidateDashboardStats";
import { sortBy } from "lodash-es";

export function useTodoItems(selectedListId: string | undefined) {
  const queryClient = useQueryClient();
  const transport = useTransport();
  const invalidateDashboardStats = useInvalidateDashboardStats();
  const [editingItem, setEditingItem] = useState<TodoItem | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [sortBy, setSortBy] = useState<"created" | "due" | "title">("created");
  const newItemIdsRef = useRef<Set<string>>(new Set());

  const itemsQueryKey = createQueryOptions(
    listTodoItems,
    { listId: selectedListId ?? "" },
    { transport }
  ).queryKey;

  // Query: Items
  const { data, isLoading } = useQuery(
    listTodoItems,
    { listId: selectedListId ?? "" },
    { enabled: !!selectedListId }
  );
  const items = data?.items ?? [];

  // Mutation: Create Item
  const createItemMutation = useMutation(createTodoItem, {
    onSuccess: (res) => {
      console.log("createItemMutation onSuccess res:", res);
      if (res.item) {
        newItemIdsRef.current.add(res.item!.id);
        setTimeout(() => {
          newItemIdsRef.current.delete(res.item!.id);
        }, 2500);

        queryClient.setQueryData(
          itemsQueryKey,
          (old: ListTodoItemsResponse | undefined) => {
            if (!old) return { items: [res.item!], nextPageToken: "" };
            return {
              ...old,
              items: [...old.items, res.item!],
            };
          }
        );
      }
      invalidateDashboardStats();
    },
  });

  const handleCreateItem = (vars: { title: string; description: string; dueAtStr: string }) => {
    console.log("handleCreateItem selectedListId:", selectedListId);
    console.log("handleCreateItem vars:", vars);
    if (!selectedListId) throw new Error("No active list");
    createItemMutation.mutate({
      listId: selectedListId,
      title: vars.title,
      description: vars.description,
      dueAt: vars.dueAtStr ? timestampFromDate(new Date(vars.dueAtStr)) : undefined,
    });
  };

  // Mutation: Toggle Item Completion
  const toggleItemMutation = useMutation(updateTodoItem, {
    onSuccess: (res) => {
      if (res.item) {
        queryClient.setQueryData(
          itemsQueryKey,
          (old: ListTodoItemsResponse | undefined) => {
            if (!old) return { items: [], nextPageToken: "" };
            return {
              ...old,
              items: old.items.map((i) => (i.id === res.item!.id ? res.item! : i)),
            };
          }
        );
      }
      invalidateDashboardStats();
    },
  });

  const handleToggleItem = (item: TodoItem) => {
    toggleItemMutation.mutate({
      id: item.id,
      title: item.title,
      description: item.description,
      isCompleted: !item.isCompleted,
      dueAt: item.dueAt,
    });
  };

  // Mutation: Delete Item
  const deleteItemMutation = useMutation(deleteTodoItem, {
    onSuccess: (res, vars) => {
      if (res.success) {
        queryClient.setQueryData(
          itemsQueryKey,
          (old: ListTodoItemsResponse | undefined) => {
            if (!old) return { items: [], nextPageToken: "" };
            return {
              ...old,
              items: old.items.filter((i) => i.id !== vars.id),
            };
          }
        );
      }
      invalidateDashboardStats();
    },
  });

  const handleDeleteItem = (itemId: string) => {
    deleteItemMutation.mutate({ id: itemId });
  };

  // Mutation: Update Item
  const updateItemMutation = useMutation(updateTodoItem, {
    onSuccess: (res) => {
      console.log("updateItemMutation onSuccess res:", res);
      if (res.item) {
        queryClient.setQueryData(
          itemsQueryKey,
          (old: ListTodoItemsResponse | undefined) => {
            if (!old) return { items: [], nextPageToken: "" };
            return {
              ...old,
              items: old.items.map((i) => (i.id === res.item!.id ? res.item! : i)),
            };
          }
        );
        setEditingItem(null);
      }
      invalidateDashboardStats();
    },
  });

  const handleUpdateItem = (vars: { title: string; description: string; dueAtStr: string }) => {
    console.log("handleUpdateItem editingItem:", editingItem);
    console.log("handleUpdateItem vars:", vars);
    if (!editingItem) throw new Error("No item being edited");
    updateItemMutation.mutate({
      id: editingItem.id,
      title: vars.title,
      description: vars.description,
      isCompleted: editingItem.isCompleted,
      dueAt: vars.dueAtStr ? timestampFromDate(new Date(vars.dueAtStr)) : undefined,
    });
  };

  // Processing lists statistics
  const totalCount = items.length;
  const completedCount = items.filter((i) => i.isCompleted).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter & Sort Items
  const filteredItems = items
    .filter((i) => {
      if (filter === "active") return !i.isCompleted;
      if (filter === "completed") return i.isCompleted;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "due") {
        const timeA = a.dueAt ? Number(a.dueAt.seconds) : Infinity;
        const timeB = b.dueAt ? Number(b.dueAt.seconds) : Infinity;
        return timeA - timeB;
      }
      // default: created
      const timeA = a.createdAt ? Number(a.createdAt.seconds) : 0;
      const timeB = b.createdAt ? Number(b.createdAt.seconds) : 0;
      return timeB - timeA;
    });

  const isNewItem = (itemId: string) => newItemIdsRef.current.has(itemId);

  return {
    items,
    loading: isLoading,
    editingItem,
    setEditingItem,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    totalCount,
    completedCount,
    progressPercent,
    filteredItems,
    handleCreateItem,
    handleToggleItem,
    handleDeleteItem,
    handleUpdateItem,
    isCreating: createItemMutation.isPending,
    isToggling: toggleItemMutation.isPending,
    isDeleting: deleteItemMutation.isPending,
    isUpdating: updateItemMutation.isPending,
    isNewItem,
  };
}
