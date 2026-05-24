using System.Threading.Tasks;
using Grpc.Core;
using Todo.Backend.Data;
using Todo.Protos;

namespace Todo.Backend.Services;

public class TodoServiceImpl : TodoService.TodoServiceBase
{
    private readonly TodoDbContext _dbContext;

    public TodoServiceImpl(TodoDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // --- TodoList Operations ---

    public override Task<CreateTodoListResponse> CreateTodoList(CreateTodoListRequest request, ServerCallContext context)
    {
        return Features.TodoLists.CreateTodoList.HandleAsync(request, _dbContext);
    }

    public override Task<GetTodoListResponse> GetTodoList(GetTodoListRequest request, ServerCallContext context)
    {
        return Features.TodoLists.GetTodoList.HandleAsync(request, _dbContext);
    }

    public override Task<UpdateTodoListResponse> UpdateTodoList(UpdateTodoListRequest request, ServerCallContext context)
    {
        return Features.TodoLists.UpdateTodoList.HandleAsync(request, _dbContext);
    }

    public override Task<DeleteTodoListResponse> DeleteTodoList(DeleteTodoListRequest request, ServerCallContext context)
    {
        return Features.TodoLists.DeleteTodoList.HandleAsync(request, _dbContext);
    }

    public override Task<ListTodoListsResponse> ListTodoLists(ListTodoListsRequest request, ServerCallContext context)
    {
        return Features.TodoLists.ListTodoLists.HandleAsync(request, _dbContext);
    }

    // --- TodoItem Operations ---

    public override Task<CreateTodoItemResponse> CreateTodoItem(CreateTodoItemRequest request, ServerCallContext context)
    {
        return Features.TodoItems.CreateTodoItem.HandleAsync(request, _dbContext);
    }

    public override Task<GetTodoItemResponse> GetTodoItem(GetTodoItemRequest request, ServerCallContext context)
    {
        return Features.TodoItems.GetTodoItem.HandleAsync(request, _dbContext);
    }

    public override Task<UpdateTodoItemResponse> UpdateTodoItem(UpdateTodoItemRequest request, ServerCallContext context)
    {
        return Features.TodoItems.UpdateTodoItem.HandleAsync(request, _dbContext);
    }

    public override Task<DeleteTodoItemResponse> DeleteTodoItem(DeleteTodoItemRequest request, ServerCallContext context)
    {
        return Features.TodoItems.DeleteTodoItem.HandleAsync(request, _dbContext);
    }

    public override Task<ListTodoItemsResponse> ListTodoItems(ListTodoItemsRequest request, ServerCallContext context)
    {
        return Features.TodoItems.ListTodoItems.HandleAsync(request, _dbContext);
    }

    // --- Dashboard Operations ---

    public override Task<GetDashboardStatsResponse> GetDashboardStats(GetDashboardStatsRequest request, ServerCallContext context)
    {
        return Features.Dashboard.GetDashboardStats.HandleAsync(request, _dbContext);
    }
}
