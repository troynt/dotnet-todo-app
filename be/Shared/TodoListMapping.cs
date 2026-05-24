using Facet;
using Facet.Mapping;
using Google.Protobuf.WellKnownTypes;
using Todo.Backend.Data;

namespace Todo.Backend.Shared.Mapping;

public class TodoListToProtoMap
{
    public static void Map(DbTodoList source, TodoListFacet target)
    {
        target.Id = source.Id;
        target.Name = source.Name ?? string.Empty;
        target.Description = source.Description ?? string.Empty;
        target.CreatedAt = source.CreatedAt.ToUniversalTime();
        target.UpdatedAt = source.UpdatedAt.ToUniversalTime();
    }
}

[Facet(typeof(DbTodoList), Configuration = typeof(TodoListToProtoMap))]
public partial class TodoListFacet { }
