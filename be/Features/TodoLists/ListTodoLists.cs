using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Todo.Backend.Data;
using Todo.Backend.Shared;
using Todo.Protos;

namespace Todo.Backend.Features.TodoLists;

public static class ListTodoLists
{
    public static async Task<ListTodoListsResponse> HandleAsync(ListTodoListsRequest request, TodoDbContext dbContext)
    {
        int pageSize = request.PageSize > 0 ? request.PageSize : 100;
        int skip = 0;
        
        if (int.TryParse(request.PageToken, out int tokenSkip))
        {
            skip = tokenSkip;
        }

        var totalCount = await dbContext.TodoLists.CountAsync();
        var pagedLists = await dbContext.TodoLists
            .OrderBy(l => l.CreatedAt)
            .Skip(skip)
            .Take(pageSize)
            .ToListAsync();

        var nextSkip = skip + pageSize;
        var nextPageToken = nextSkip < totalCount ? nextSkip.ToString() : "";

        var response = new ListTodoListsResponse
        {
            NextPageToken = nextPageToken
        };
        response.Lists.AddRange(pagedLists.Select(l => l.MapToProto()));

        return response;
    }
}
