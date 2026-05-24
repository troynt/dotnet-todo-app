using System.Threading.Tasks;
using Grpc.Core;
using Todo.Backend.Data;
using Todo.Backend.Shared;
using Todo.Protos;

namespace Todo.Backend.Features.TodoItems;

public static class GetTodoItem
{
    public static async Task<GetTodoItemResponse> HandleAsync(GetTodoItemRequest request, TodoDbContext dbContext)
    {
        var item = await dbContext.TodoItems.FindAsync(request.Id);
        if (item != null)
        {
            return new GetTodoItemResponse { Item = item.MapToProto() };
        }

        throw new RpcException(new Status(StatusCode.NotFound, $"TodoItem with ID {request.Id} not found."));
    }
}
