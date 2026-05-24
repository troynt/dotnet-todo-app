using Microsoft.EntityFrameworkCore;

namespace Todo.Backend.Data;

public class TodoDbContext : DbContext
{
    public TodoDbContext(DbContextOptions<TodoDbContext> options) : base(options)
    {
    }

    public DbSet<DbTodoList> TodoLists { get; set; } = null!;
    public DbSet<DbTodoItem> TodoItems { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<DbTodoList>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasMany(e => e.Items)
                  .WithOne()
                  .HasForeignKey(e => e.ListId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<DbTodoItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ListId).IsRequired();
        });
    }
}
