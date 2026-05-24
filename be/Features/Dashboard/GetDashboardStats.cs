using System.Globalization;
using Microsoft.EntityFrameworkCore;
using Todo.Backend.Data;
using Todo.Backend.Shared;
using Todo.Protos;

namespace Todo.Backend.Features.Dashboard;

public static class GetDashboardStats
{
    public static async Task<GetDashboardStatsResponse> HandleAsync(
        GetDashboardStatsRequest request,
        TodoDbContext dbContext)
    {
        var now = DateTime.UtcNow;
        var todayStart = new DateTime(now.Year, now.Month, now.Day, 0, 0, 0, DateTimeKind.Utc);

        // Fetch all lists first (needed for list stats and upcoming task list names)
        var allLists = await dbContext.TodoLists.ToListAsync();

        int totalLists = allLists.Count;

        // All items in a single query
        var allItems = await dbContext.TodoItems.ToListAsync();

        int totalTasks = allItems.Count;
        int completedTasks = allItems.Count(i => i.IsCompleted);

        // Overdue: not completed and due_at < todayStart
        var overdueCount = allItems.Count(i => !i.IsCompleted && i.DueAt.HasValue && i.DueAt.Value < todayStart);

        int completionRate = totalTasks > 0 ? (int)Math.Round((double)completedTasks / totalTasks * 100) : 0;

        // Per-list stats
        var listStatsList = new List<ListStats>();
        foreach (var list in allLists)
        {
            var itemsForList = allItems.Where(i => i.ListId == list.Id).ToList();
            int itemTotal = itemsForList.Count;
            int itemCompleted = itemsForList.Count(i => i.IsCompleted);
            int percentComplete = itemTotal > 0 ? (int)Math.Round((double)itemCompleted / itemTotal * 100) : 0;

            listStatsList.Add(new ListStats
            {
                ListId = list.Id,
                ListName = list.Name ?? "",
                ListDescription = list.Description ?? "",
                TotalTasks = itemTotal,
                CompletedTasks = itemCompleted,
                PercentComplete = percentComplete
            });
        }

        // Upcoming tasks: not completed, has due_at, ordered by due_at asc, top 5
        var upcomingItems = allItems
            .Where(i => !i.IsCompleted && i.DueAt.HasValue)
            .OrderBy(i => i.DueAt.Value)
            .Take(5)
            .ToList();

        var listNameMap = new Dictionary<string, string>();
        foreach (var list in allLists)
        {
            listNameMap[list.Id] = list.Name ?? "";
        }

        var upcomingTasksList = new List<UpcomingTask>();
        foreach (var item in upcomingItems)
        {
            string status;
            if (item.DueAt!.Value < todayStart)
                status = "overdue";
            else if (item.DueAt.Value.Date == todayStart.Date)
                status = "today";
            else
                status = "future";

            var listName = listNameMap.TryGetValue(item.ListId, out var name) ? name : "";

            upcomingTasksList.Add(new UpcomingTask
            {
                Id = item.Id,
                Title = item.Title ?? "",
                ListName = listName,
                DueAt = item.DueAt.Value.ToTimestamp(),
                Status = status
            });
        }

        var stats = new DashboardStats
        {
            TotalLists = totalLists,
            TotalTasks = totalTasks,
            CompletedTasks = completedTasks,
            OverdueTasks = overdueCount,
            CompletionRate = completionRate,
            ListStats = { listStatsList },
            UpcomingTasks = { upcomingTasksList }
        };

        return new GetDashboardStatsResponse { Stats = stats };
    }
}
