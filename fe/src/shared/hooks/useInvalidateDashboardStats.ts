import { useTransport, createQueryOptions } from "@connectrpc/connect-query";
import { getDashboardStats } from "../../gen/todo-TodoService_connectquery";
import { useQueryClient } from "@tanstack/react-query";

export function useInvalidateDashboardStats() {
  const queryClient = useQueryClient();
  const transport = useTransport();

  const dashboardStatsQueryKey = createQueryOptions(
    getDashboardStats,
    {},
    { transport }
  ).queryKey;

  return () => {
    queryClient.invalidateQueries({ queryKey: dashboardStatsQueryKey });
  };
}
