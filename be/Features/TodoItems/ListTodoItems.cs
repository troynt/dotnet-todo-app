using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Todo.Backend.Data;
using Todo.Backend.Shared;
using Todo.Protos;

namespace Todo.Backend.Features.TodoItems;

public static class ListTodoItems
{
    public static async Task<ListTodoItemsResponse> HandleAsync(ListTodoItemsRequest request, TodoDbContext dbContext)
    {
        var query = dbContext.TodoItems.AsQueryable();
        if (!string.IsNullOrEmpty(request.ListId))
        {
            query = query.Where(item => item.ListId == request.ListId);
        }

        int pageSize = request.PageSize > 0 ? request.PageSize : 100;
        int skip = 0;

        if (int.TryParse(request.PageToken, out int tokenSkip))
        {
            skip = tokenSkip;
        }

        var totalCount = await query.CountAsync();
        var pagedItems = await query
            .OrderBy(item => item.CreatedAt)
            .Skip(skip)
            .Take(pageSize)
            .ToListAsync();

        var nextSkip = skip + pageSize;
        var nextPageToken = nextSkip < totalCount ? nextSkip.ToString() : "";

        var response = new ListTodoItemsResponse
        {
            NextPageToken = nextPageToken
        };
        response.Items.AddRange(pagedItems.Select(item => item.MapToProto()));

        return response;
    }
}
