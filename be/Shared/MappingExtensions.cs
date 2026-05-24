using Google.Protobuf.WellKnownTypes;
using Todo.Backend.Data;
using Todo.Backend.Shared.Mapping;
using Todo.Protos;

namespace Todo.Backend.Shared;

public static class MappingExtensions
{
    public static Timestamp ToTimestamp(this DateTime dt)
    {
        return Timestamp.FromDateTime(DateTime.SpecifyKind(dt, DateTimeKind.Utc));
    }

    public static DateTime? ToDateTime(this Timestamp ts)
    {
        if (ts == null) return null;
        return ts.ToDateTime();
    }

    public static TodoList MapToProto(this DbTodoList list)
    {
        var facet = new TodoListFacet(list);
        return new TodoList
        {
            Id = facet.Id,
            Name = facet.Name,
            Description = facet.Description,
            CreatedAt = Timestamp.FromDateTime(facet.CreatedAt),
            UpdatedAt = Timestamp.FromDateTime(facet.UpdatedAt)
        };
    }

    public static TodoItem MapToProto(this DbTodoItem item)
    {
        var facet = new TodoItemFacet(item);
        return new TodoItem
        {
            Id = facet.Id,
            Title = facet.Title,
            Description = facet.Description,
            IsCompleted = facet.IsCompleted,
            ListId = facet.ListId,
            CreatedAt = Timestamp.FromDateTime(facet.CreatedAt),
            UpdatedAt = Timestamp.FromDateTime(facet.UpdatedAt),
            DueAt = facet.DueAt.HasValue ? Timestamp.FromDateTime(facet.DueAt.Value) : null
        };
    }
}
