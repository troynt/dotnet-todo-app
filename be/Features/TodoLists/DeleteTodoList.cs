using System.Threading.Tasks;
using Todo.Backend.Data;
using Todo.Protos;

namespace Todo.Backend.Features.TodoLists;

public static class DeleteTodoList
{
    public static async Task<DeleteTodoListResponse> HandleAsync(DeleteTodoListRequest request, TodoDbContext dbContext)
    {
        var existingList = await dbContext.TodoLists.FindAsync(request.Id);
        if (existingList == null)
        {
            return new DeleteTodoListResponse { Success = false };
        }

        dbContext.TodoLists.Remove(existingList);
        await dbContext.SaveChangesAsync();

        return new DeleteTodoListResponse { Success = true };
    }
}
