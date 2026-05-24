using System;
using System.Threading.Tasks;
using Grpc.Core;
using Todo.Backend.Data;
using Todo.Backend.Shared;
using Todo.Backend.Validation;
using Todo.Protos;

namespace Todo.Backend.Features.TodoItems;

public static class UpdateTodoItem
{
    public static async Task<UpdateTodoItemResponse> HandleAsync(UpdateTodoItemRequest request, TodoDbContext dbContext)
    {
        ValidationRules.ValidateTitle(request.Title);
        ValidationRules.ValidateDescription(request.Description);

        var existingItem = await dbContext.TodoItems.FindAsync(request.Id);
        if (existingItem != null)
        {
            existingItem.Title = request.Title;
            existingItem.Description = request.Description ?? string.Empty;
            existingItem.IsCompleted = request.IsCompleted;
            existingItem.DueAt = request.DueAt?.ToDateTime();
            existingItem.UpdatedAt = DateTime.UtcNow;

            await dbContext.SaveChangesAsync();

            return new UpdateTodoItemResponse { Item = existingItem.MapToProto() };
        }

        throw new RpcException(new Status(StatusCode.NotFound, $"TodoItem with ID {request.Id} not found."));
    }
}
