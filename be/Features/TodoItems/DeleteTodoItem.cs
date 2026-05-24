using System.Threading.Tasks;
using Todo.Backend.Data;
using Todo.Protos;

namespace Todo.Backend.Features.TodoItems;

public static class DeleteTodoItem
{
    public static async Task<DeleteTodoItemResponse> HandleAsync(DeleteTodoItemRequest request, TodoDbContext dbContext)
    {
        var existingItem = await dbContext.TodoItems.FindAsync(request.Id);
        if (existingItem == null)
        {
            return new DeleteTodoItemResponse { Success = false };
        }

        dbContext.TodoItems.Remove(existingItem);
        await dbContext.SaveChangesAsync();

        return new DeleteTodoItemResponse { Success = true };
    }
}
