using System.Diagnostics;
using System.Diagnostics.Metrics;
using Grpc.AspNetCore.Web;
using Microsoft.EntityFrameworkCore;
using OpenTelemetry.Metrics;
using OpenTelemetry.Trace;
using Todo.Backend.Data;
using Todo.Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// ── OpenTelemetry: Traces ──────────────────────────────────────────────
builder.Services.AddOpenTelemetry()
    .WithTracing(t => t
        .AddAspNetCoreInstrumentation()
        .AddSource("todo.backend")
        .AddOtlpExporter());

// ── OpenTelemetry: Metrics ─────────────────────────────────────────────
builder.Services.AddOpenTelemetry()
    .WithMetrics(m => m
        .AddAspNetCoreInstrumentation()
        .AddMeter("todo.backend.metrics")
        .AddOtlpExporter());

// ── Custom ActivitySource & Meter (injected for use in handlers) ───────
builder.Services.AddSingleton(new ActivitySource("todo.backend"));
builder.Services.AddSingleton(new Meter("todo.backend.metrics", "1.0"));

// ── Application services ───────────────────────────────────────────────
builder.Services.AddGrpc();

builder.Services.AddDbContext<TodoDbContext>(options =>
    options.UseSqlite("Data Source=todo.db"));

builder.Services.AddCors(o => o.AddPolicy("AllowAll", p =>
    p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()
      .WithExposedHeaders("Grpc-Status", "Grpc-Message", "Grpc-Encoding", "Grpc-Accept-Encoding")));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<TodoDbContext>();
    context.Database.EnsureCreated();
}

app.UseRouting();
app.UseCors("AllowAll");
app.UseGrpcWeb(new GrpcWebOptions { DefaultEnabled = true });

app.MapGrpcService<TodoServiceImpl>().EnableGrpcWeb();
app.MapGet("/", () => "Communication with gRPC endpoints must be made through a gRPC client. To learn how to create a client, visit: https://go.microsoft.com/fwlink/?linkid=2086909");

app.Run();
