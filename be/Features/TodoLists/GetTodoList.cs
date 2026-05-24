using System.Threading.Tasks;
using Grpc.Core;
using Todo.Backend.Data;
using Todo.Backend.Shared;
using Todo.Protos;

namespace Todo.Backend.Features.TodoLists;

public static class GetTodoList
{
    public static async Task<GetTodoListResponse> HandleAsync(GetTodoListRequest request, TodoDbContext dbContext)
    {
        var list = await dbContext.TodoLists.FindAsync(request.Id);
        if (list != null)
        {
            return new GetTodoListResponse { List = list.MapToProto() };
        }

        throw new RpcException(new Status(StatusCode.NotFound, $"TodoList with ID {request.Id} not found."));
    }
}
