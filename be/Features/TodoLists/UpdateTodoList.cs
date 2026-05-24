using System;
using System.Threading.Tasks;
using Grpc.Core;
using Todo.Backend.Data;
using Todo.Backend.Shared;
using Todo.Backend.Validation;
using Todo.Protos;

namespace Todo.Backend.Features.TodoLists;

public static class UpdateTodoList
{
    public static async Task<UpdateTodoListResponse> HandleAsync(UpdateTodoListRequest request, TodoDbContext dbContext)
    {
        ValidationRules.ValidateName(request.Name);
        ValidationRules.ValidateDescription(request.Description);

        var existingList = await dbContext.TodoLists.FindAsync(request.Id);
        if (existingList != null)
        {
            existingList.Name = request.Name;
            existingList.Description = request.Description ?? string.Empty;
            existingList.UpdatedAt = DateTime.UtcNow;

            await dbContext.SaveChangesAsync();

            return new UpdateTodoListResponse { List = existingList.MapToProto() };
        }

        throw new RpcException(new Status(StatusCode.NotFound, $"TodoList with ID {request.Id} not found."));
    }
}
