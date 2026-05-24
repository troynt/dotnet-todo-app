using System;
using System.Collections.Generic;

namespace Todo.Backend.Data;

public class DbTodoList
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation property
    public ICollection<DbTodoItem> Items { get; set; } = new List<DbTodoItem>();
}

public class DbTodoItem
{
    public required string Id { get; set; }
    public required string ListId { get; set; }
    public required string Title { get; set; }
    public string Description { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? DueAt { get; set; }
}
