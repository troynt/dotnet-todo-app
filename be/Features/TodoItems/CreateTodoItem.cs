using System;
using System.Threading.Tasks;
using Grpc.Core;
using Microsoft.EntityFrameworkCore;
using Todo.Backend.Data;
using Todo.Backend.Shared;
using Todo.Backend.Validation;
using Todo.Protos;

namespace Todo.Backend.Features.TodoItems;

public static class CreateTodoItem
{
    public static async Task<CreateTodoItemResponse> HandleAsync(CreateTodoItemRequest request, TodoDbContext dbContext)
    {
        ValidationRules.ValidateTitle(request.Title);
        ValidationRules.ValidateDescription(request.Description);

        var listExists = await dbContext.TodoLists.AnyAsync(l => l.Id == request.ListId);
        if (!listExists)
        {
            throw new RpcException(new Status(StatusCode.NotFound, $"TodoList with ID {request.ListId} not found."));
        }

        var id = Guid.NewGuid().ToString();
        var now = DateTime.UtcNow;

        var item = new DbTodoItem
        {
            Id = id,
            ListId = request.ListId,
            Title = request.Title,
            Description = request.Description ?? string.Empty,
            IsCompleted = false,
            CreatedAt = now,
            UpdatedAt = now,
            DueAt = request.DueAt?.ToDateTime()
        };

        dbContext.TodoItems.Add(item);
        await dbContext.SaveChangesAsync();

        return new CreateTodoItemResponse { Item = item.MapToProto() };
    }
}
