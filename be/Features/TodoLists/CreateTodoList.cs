using System;
using System.Threading.Tasks;
using Todo.Backend.Data;
using Todo.Backend.Shared;
using Todo.Backend.Validation;
using Todo.Protos;

namespace Todo.Backend.Features.TodoLists;

public static class CreateTodoList
{
    public static async Task<CreateTodoListResponse> HandleAsync(CreateTodoListRequest request, TodoDbContext dbContext)
    {
        ValidationRules.ValidateName(request.Name);
        ValidationRules.ValidateDescription(request.Description);

        var id = Guid.NewGuid().ToString();
        var now = DateTime.UtcNow;

        var list = new DbTodoList
        {
            Id = id,
            Name = request.Name,
            Description = request.Description ?? string.Empty,
            CreatedAt = now,
            UpdatedAt = now
        };

        dbContext.TodoLists.Add(list);
        await dbContext.SaveChangesAsync();

        return new CreateTodoListResponse { List = list.MapToProto() };
    }
}
