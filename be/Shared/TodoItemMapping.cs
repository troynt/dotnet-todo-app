using Facet;
using Facet.Mapping;
using Google.Protobuf.WellKnownTypes;
using Todo.Backend.Data;

namespace Todo.Backend.Shared.Mapping;

public class TodoItemToProtoMap
{
    public static void Map(DbTodoItem source, TodoItemFacet target)
    {
        target.Id = source.Id;
        target.ListId = source.ListId;
        target.Title = source.Title ?? string.Empty;
        target.Description = source.Description ?? string.Empty;
        target.IsCompleted = source.IsCompleted;
        target.CreatedAt = source.CreatedAt.ToUniversalTime();
        target.UpdatedAt = source.UpdatedAt.ToUniversalTime();
    }
}

[Facet(typeof(DbTodoItem), Configuration = typeof(TodoItemToProtoMap))]
public partial class TodoItemFacet { }
