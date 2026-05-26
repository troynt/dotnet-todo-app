using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Todo.Backend.Data;

namespace be.Tests;

internal static class TestDbContextFactory
{
    public static (TodoDbContext Context, SqliteConnection Connection) CreateContext()
    {
        var connection = new SqliteConnection("Data Source=:memory:");
        connection.Open();

        var options = new DbContextOptionsBuilder<TodoDbContext>()
            .UseSqlite(connection)
            .Options;

        var context = new TodoDbContext(options);
        context.Database.EnsureCreated();

        return (context, connection);
    }
}
