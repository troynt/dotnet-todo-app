using Google.Protobuf.WellKnownTypes;
using Todo.Backend.Data;
using Todo.Backend.Features.Dashboard;
using Todo.Backend.Shared;
using Todo.Protos;

namespace be.Tests;

public class DashboardAndMappingTests
{
    [Fact]
    public async Task GetDashboardStats_WithNoData_ReturnsZeroedStats()
    {
        var (db, connection) = TestDbContextFactory.CreateContext();
        await using var _ = db;
        await using var __ = connection;

        var response = await GetDashboardStats.HandleAsync(new GetDashboardStatsRequest(), db);

        Assert.Equal(0, response.Stats.TotalLists);
        Assert.Equal(0, response.Stats.TotalTasks);
        Assert.Equal(0, response.Stats.CompletedTasks);
        Assert.Equal(0, response.Stats.OverdueTasks);
        Assert.Equal(0, response.Stats.CompletionRate);
        Assert.Empty(response.Stats.ListStats);
        Assert.Empty(response.Stats.UpcomingTasks);
    }

    [Fact]
    public async Task GetDashboardStats_ComputesAggregatesAndUpcomingStatuses()
    {
        var (db, connection) = TestDbContextFactory.CreateContext();
        await using var _ = db;
        await using var __ = connection;

        var now = DateTime.UtcNow;
        var todayStart = now.Date;

        db.TodoLists.AddRange(
            new DbTodoList { Id = "l1", Name = "Home", Description = "", CreatedAt = now, UpdatedAt = now },
            new DbTodoList { Id = "l2", Name = "Work", Description = "", CreatedAt = now, UpdatedAt = now });

        db.TodoItems.AddRange(
            new DbTodoItem { Id = "i1", ListId = "l1", Title = "Completed", Description = "", IsCompleted = true, CreatedAt = now, UpdatedAt = now },
            new DbTodoItem { Id = "i2", ListId = "l1", Title = "Overdue", Description = "", IsCompleted = false, CreatedAt = now, UpdatedAt = now, DueAt = todayStart.AddDays(-1) },
            new DbTodoItem { Id = "i3", ListId = "l2", Title = "Today", Description = "", IsCompleted = false, CreatedAt = now, UpdatedAt = now, DueAt = todayStart.AddHours(12) },
            new DbTodoItem { Id = "i4", ListId = "l2", Title = "Future", Description = "", IsCompleted = false, CreatedAt = now, UpdatedAt = now, DueAt = todayStart.AddDays(2) });
        await db.SaveChangesAsync();

        var response = await GetDashboardStats.HandleAsync(new GetDashboardStatsRequest(), db);

        Assert.Equal(2, response.Stats.TotalLists);
        Assert.Equal(4, response.Stats.TotalTasks);
        Assert.Equal(1, response.Stats.CompletedTasks);
        Assert.Equal(1, response.Stats.OverdueTasks);
        Assert.Equal(25, response.Stats.CompletionRate);
        Assert.Equal(2, response.Stats.ListStats.Count);

        Assert.Equal(3, response.Stats.UpcomingTasks.Count);
        Assert.Equal("overdue", response.Stats.UpcomingTasks[0].Status);
        Assert.Equal("today", response.Stats.UpcomingTasks[1].Status);
        Assert.Equal("future", response.Stats.UpcomingTasks[2].Status);
    }

    [Fact]
    public void MapToProto_TodoList_MapsValues()
    {
        var createdAt = DateTime.SpecifyKind(new DateTime(2025, 1, 1, 8, 0, 0), DateTimeKind.Utc);
        var updatedAt = DateTime.SpecifyKind(new DateTime(2025, 1, 2, 8, 0, 0), DateTimeKind.Utc);
        var model = new DbTodoList
        {
            Id = "l1",
            Name = "Inbox",
            Description = "Desc",
            CreatedAt = createdAt,
            UpdatedAt = updatedAt
        };

        var proto = model.MapToProto();

        Assert.Equal("l1", proto.Id);
        Assert.Equal("Inbox", proto.Name);
        Assert.Equal("Desc", proto.Description);
        Assert.Equal(Timestamp.FromDateTime(createdAt), proto.CreatedAt);
        Assert.Equal(Timestamp.FromDateTime(updatedAt), proto.UpdatedAt);
    }

    [Fact]
    public void MapToProto_TodoItem_MapsOptionalDueDate()
    {
        var now = DateTime.SpecifyKind(new DateTime(2025, 3, 1, 0, 0, 0), DateTimeKind.Utc);
        var due = now.AddDays(1);
        var model = new DbTodoItem
        {
            Id = "i1",
            ListId = "l1",
            Title = "Task",
            Description = "Desc",
            IsCompleted = true,
            CreatedAt = now,
            UpdatedAt = now,
            DueAt = due
        };

        var proto = model.MapToProto();

        Assert.Equal("i1", proto.Id);
        Assert.Equal("l1", proto.ListId);
        Assert.Equal("Task", proto.Title);
        Assert.True(proto.IsCompleted);
        Assert.Equal(Timestamp.FromDateTime(due), proto.DueAt);
    }
}
