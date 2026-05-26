using Grpc.Core;
using Todo.Backend.Data;
using Todo.Backend.Features.TodoLists;
using Todo.Protos;

namespace be.Tests;

public class TodoListFeaturesTests
{
    [Fact]
    public async Task CreateTodoList_PersistsAndReturnsMappedList()
    {
        var (db, connection) = TestDbContextFactory.CreateContext();
        await using var _ = db;
        await using var __ = connection;

        var response = await CreateTodoList.HandleAsync(
            new CreateTodoListRequest { Name = "Work", Description = "Tasks" },
            db);

        Assert.NotNull(response.List);
        Assert.Equal("Work", response.List.Name);
        Assert.Equal("Tasks", response.List.Description);
        Assert.False(string.IsNullOrWhiteSpace(response.List.Id));
        Assert.Equal(1, db.TodoLists.Count());
    }

    [Fact]
    public async Task GetTodoList_WhenMissing_ThrowsNotFound()
    {
        var (db, connection) = TestDbContextFactory.CreateContext();
        await using var _ = db;
        await using var __ = connection;

        var ex = await Assert.ThrowsAsync<RpcException>(() =>
            GetTodoList.HandleAsync(new GetTodoListRequest { Id = "missing" }, db));

        Assert.Equal(StatusCode.NotFound, ex.StatusCode);
    }

    [Fact]
    public async Task UpdateTodoList_WhenExists_UpdatesFields()
    {
        var (db, connection) = TestDbContextFactory.CreateContext();
        await using var _ = db;
        await using var __ = connection;

        db.TodoLists.Add(new DbTodoList
        {
            Id = "l1",
            Name = "Old",
            Description = "Old desc",
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            UpdatedAt = DateTime.UtcNow.AddDays(-1)
        });
        await db.SaveChangesAsync();

        var response = await UpdateTodoList.HandleAsync(
            new UpdateTodoListRequest { Id = "l1", Name = "New", Description = "New desc" },
            db);

        Assert.Equal("New", response.List.Name);
        Assert.Equal("New desc", response.List.Description);
        Assert.True(db.TodoLists.Single(l => l.Id == "l1").UpdatedAt > DateTime.UtcNow.AddMinutes(-1));
    }

    [Fact]
    public async Task DeleteTodoList_ReturnsFalseWhenMissing()
    {
        var (db, connection) = TestDbContextFactory.CreateContext();
        await using var _ = db;
        await using var __ = connection;

        var response = await DeleteTodoList.HandleAsync(new DeleteTodoListRequest { Id = "missing" }, db);

        Assert.False(response.Success);
    }

    [Fact]
    public async Task DeleteTodoList_RemovesListWhenFound()
    {
        var (db, connection) = TestDbContextFactory.CreateContext();
        await using var _ = db;
        await using var __ = connection;

        db.TodoLists.Add(new DbTodoList
        {
            Id = "l1",
            Name = "ToDelete",
            Description = string.Empty,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var response = await DeleteTodoList.HandleAsync(new DeleteTodoListRequest { Id = "l1" }, db);

        Assert.True(response.Success);
        Assert.Empty(db.TodoLists);
    }

    [Fact]
    public async Task ListTodoLists_UsesPaginationTokenAndPageSize()
    {
        var (db, connection) = TestDbContextFactory.CreateContext();
        await using var _ = db;
        await using var __ = connection;

        var now = DateTime.UtcNow;
        db.TodoLists.AddRange(
            new DbTodoList { Id = "l1", Name = "A", Description = "", CreatedAt = now.AddMinutes(-3), UpdatedAt = now },
            new DbTodoList { Id = "l2", Name = "B", Description = "", CreatedAt = now.AddMinutes(-2), UpdatedAt = now },
            new DbTodoList { Id = "l3", Name = "C", Description = "", CreatedAt = now.AddMinutes(-1), UpdatedAt = now });
        await db.SaveChangesAsync();

        var firstPage = await ListTodoLists.HandleAsync(new ListTodoListsRequest { PageSize = 2 }, db);
        Assert.Equal(2, firstPage.Lists.Count);
        Assert.Equal("2", firstPage.NextPageToken);
        Assert.Equal(new[] { "l1", "l2" }, firstPage.Lists.Select(l => l.Id).ToArray());

        var secondPage = await ListTodoLists.HandleAsync(new ListTodoListsRequest { PageSize = 2, PageToken = firstPage.NextPageToken }, db);
        Assert.Single(secondPage.Lists);
        Assert.Equal(string.Empty, secondPage.NextPageToken);
        Assert.Equal("l3", secondPage.Lists[0].Id);
    }
}
