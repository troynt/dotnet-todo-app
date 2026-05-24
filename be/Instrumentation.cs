using System.Diagnostics;

namespace Todo.Backend;

/// <summary>
/// Custom ActivitySource for business-logic spans.
/// Use this to emit custom trace spans from your feature handlers.
/// </summary>
public static class TodoActivitySource
{
    public const string SourceName = "todo.backend";

    /// <summary>
    /// Start a span around a todo-list operation.
    /// Example: using var activity = TodoActivitySource.StartSpan("TodoList.Create") { ... }
    /// </summary>
    public static Activity? StartSpan(string name) =>
        new ActivitySource(SourceName).StartActivity(name, ActivityKind.Consumer);

    /// <summary>
    /// Start a span around a todo-item operation.
    /// </summary>
    public static Activity? StartItemSpan(string name) =>
        new ActivitySource(SourceName + ".items").StartActivity(name, ActivityKind.Consumer);
}
