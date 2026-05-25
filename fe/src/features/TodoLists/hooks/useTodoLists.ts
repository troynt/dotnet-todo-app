import { useQuery, useMutation, useTransport, createQueryOptions } from "@connectrpc/connect-query";
import { useQueryClient } from "@tanstack/react-query";
import {
  listTodoLists,
  createTodoList,
  deleteTodoList,
} from "../../../gen/todo-TodoService_connectquery";
import type { TodoList, ListTodoListsResponse } from "../../../gen/todo_pb";
import { useInvalidateDashboardStats } from "../../../shared/hooks/useInvalidateDashboardStats";

interface UseTodoListsOptions {
  onListCreated?: (listId: string) => void;
  onListDeleted?: (listId: string, remainingLists: TodoList[]) => void;
}

export function useTodoLists({ onListCreated, onListDeleted }: UseTodoListsOptions = {}) {
  const queryClient = useQueryClient();
  const transport = useTransport();
  const invalidateDashboardStats = useInvalidateDashboardStats();

  const listsQueryKey = createQueryOptions(listTodoLists, {}, { transport }).queryKey;

  // Query: Lists
  const { data, isLoading } = useQuery(listTodoLists, {});
  const lists = data?.lists ?? [];

  // Mutation: Create List
  const createListMutation = useMutation(createTodoList, {
    onSuccess: (res) => {
      if (res.list) {
        queryClient.setQueryData(
          listsQueryKey,
          (old: ListTodoListsResponse | undefined) => {
            if (!old) return { lists: [res.list!], nextPageToken: "" };
            return {
              ...old,
              lists: [...old.lists, res.list!],
            };
          }
        );
        invalidateDashboardStats();
        onListCreated?.(res.list.id);
      }
    },
  });

  // Mutation: Delete List
  const deleteListMutation = useMutation(deleteTodoList, {
    onSuccess: (res, vars) => {
      if (res.success) {
        let remaining: TodoList[] = [];
        queryClient.setQueryData(
          listsQueryKey,
          (old: ListTodoListsResponse | undefined) => {
            if (!old) return { lists: [], nextPageToken: "" };
            remaining = old.lists.filter((l) => l.id !== vars.id);
            return {
              ...old,
              lists: remaining,
            };
          }
        );
        invalidateDashboardStats();
        onListDeleted?.(vars.id!, remaining);
      }
    },
  });

  const handleDeleteList = (listId: string) => {
    deleteListMutation.mutate({ id: listId });
  };

  return {
    lists,
    loading: isLoading,
    handleCreateList: createListMutation.mutate,
    handleDeleteList,
    isCreating: createListMutation.isMutating,
    isDeleting: deleteListMutation.isMutating,
  };
}
