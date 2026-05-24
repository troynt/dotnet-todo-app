using System.Diagnostics.Metrics;

namespace Todo.Backend;

/// <summary>
/// Custom OpenTelemetry metrics for the todo application.
/// Inject Meter into your handlers via constructor injection.
/// </summary>
public static class TodoMetrics
{
    public const string MeterName = "todo.backend.metrics";

    /// <summary>
    /// Counter: total number of todo lists created.
    /// </summary>
    public static readonly string CounterTodoListsCreated = "todo.lists.created";

    /// <summary>
    /// Counter: total number of todo items completed.
    /// </summary>
    public static readonly string CounterTodoItemsCompleted = "todo.items.completed";

    /// <summary>
    /// Histogram: duration of todo-list operations in milliseconds.
    /// </summary>
    public static readonly string HistogramListOperationDurationMs = "todo.list.operation.duration_ms";
}
