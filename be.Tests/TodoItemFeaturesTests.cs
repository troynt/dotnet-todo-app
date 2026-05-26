using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using Todo.Backend.Data;
using Todo.Backend.Features.TodoItems;
using Todo.Protos;

namespace be.Tests;

public class TodoItemFeaturesTests
{
    [Fact]
    public async Task CreateTodoItem_WhenListMissing_ThrowsNotFound()
    {
        var (db, connection) = TestDbContextFactory.CreateContext();
        await using var _ = db;
        await using var __ = connection;

        var ex = await Assert.ThrowsAsync<RpcException>(() =>
            CreateTodoItem.HandleAsync(new CreateTodoItemRequest
            {
                ListId = "missing",
                Title = "Task"
            }, db));

        Assert.Equal(StatusCode.NotFound, ex.StatusCode);
    }

    [Fact]
    public async Task CreateTodoItem_PersistsAndReturnsItem()
    {
        var (db, connection) = TestDbContextFactory.CreateContext();
        await using var _ = db;
        await using var __ = connection;

        db.TodoLists.Add(new DbTodoList
        {
            Id = "l1",
            Name = "Inbox",
            Description = "",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var due = DateTime.UtcNow.AddDays(1);
        var response = await CreateTodoItem.HandleAsync(new CreateTodoItemRequest
        {
            ListId = "l1",
            Title = "Task",
            Description = "Desc",
            DueAt = Timestamp.FromDateTime(due)
        }, db);

        Assert.Equal("l1", response.Item.ListId);
        Assert.Equal("Task", response.Item.Title);
        Assert.Equal("Desc", response.Item.Description);
        Assert.False(response.Item.IsCompleted);
        Assert.Single(db.TodoItems);
    }

    [Fact]
    public async Task GetTodoItem_WhenMissing_ThrowsNotFound()
    {
        var (db, connection) = TestDbContextFactory.CreateContext();
        await using var _ = db;
        await using var __ = connection;

        var ex = await Assert.ThrowsAsync<RpcException>(() =>
            GetTodoItem.HandleAsync(new GetTodoItemRequest { Id = "missing" }, db));

        Assert.Equal(StatusCode.NotFound, ex.StatusCode);
    }

    [Fact]
    public async Task UpdateTodoItem_WhenExists_UpdatesFields()
    {
        var (db, connection) = TestDbContextFactory.CreateContext();
        await using var _ = db;
        await using var __ = connection;

        db.TodoLists.Add(new DbTodoList
        {
            Id = "l1",
            Name = "Inbox",
            Description = "",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        db.TodoItems.Add(new DbTodoItem
        {
            Id = "i1",
            ListId = "l1",
            Title = "Old",
            Description = "Old",
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow.AddDays(-2),
            UpdatedAt = DateTime.UtcNow.AddDays(-2)
        });
        await db.SaveChangesAsync();

        var newDue = DateTime.UtcNow.AddDays(2);
        var response = await UpdateTodoItem.HandleAsync(new UpdateTodoItemRequest
        {
            Id = "i1",
            Title = "New",
            Description = "New desc",
            IsCompleted = true,
            DueAt = Timestamp.FromDateTime(newDue)
        }, db);

        Assert.Equal("New", response.Item.Title);
        Assert.Equal("New desc", response.Item.Description);
        Assert.True(response.Item.IsCompleted);
        Assert.NotNull(response.Item.DueAt);
    }

    [Fact]
    public async Task DeleteTodoItem_ReturnsFalseWhenMissing()
    {
        var (db, connection) = TestDbContextFactory.CreateContext();
        await using var _ = db;
        await using var __ = connection;

        var response = await DeleteTodoItem.HandleAsync(new DeleteTodoItemRequest { Id = "missing" }, db);
        Assert.False(response.Success);
    }

    [Fact]
    public async Task ListTodoItems_FiltersByListAndPaginates()
    {
        var (db, connection) = TestDbContextFactory.CreateContext();
        await using var _ = db;
        await using var __ = connection;

        var now = DateTime.UtcNow;
        db.TodoLists.AddRange(
            new DbTodoList { Id = "l1", Name = "A", Description = "", CreatedAt = now, UpdatedAt = now },
            new DbTodoList { Id = "l2", Name = "B", Description = "", CreatedAt = now, UpdatedAt = now });
        db.TodoItems.AddRange(
            new DbTodoItem { Id = "i1", ListId = "l1", Title = "A1", Description = "", CreatedAt = now.AddMinutes(-3), UpdatedAt = now, IsCompleted = false },
            new DbTodoItem { Id = "i2", ListId = "l1", Title = "A2", Description = "", CreatedAt = now.AddMinutes(-2), UpdatedAt = now, IsCompleted = false },
            new DbTodoItem { Id = "i3", ListId = "l2", Title = "B1", Description = "", CreatedAt = now.AddMinutes(-1), UpdatedAt = now, IsCompleted = false });
        await db.SaveChangesAsync();

        var firstPage = await ListTodoItems.HandleAsync(new ListTodoItemsRequest
        {
            ListId = "l1",
            PageSize = 1
        }, db);

        Assert.Single(firstPage.Items);
        Assert.Equal("i1", firstPage.Items[0].Id);
        Assert.Equal("1", firstPage.NextPageToken);

        var secondPage = await ListTodoItems.HandleAsync(new ListTodoItemsRequest
        {
            ListId = "l1",
            PageSize = 1,
            PageToken = firstPage.NextPageToken
        }, db);

        Assert.Single(secondPage.Items);
        Assert.Equal("i2", secondPage.Items[0].Id);
        Assert.Equal(string.Empty, secondPage.NextPageToken);
    }
}
