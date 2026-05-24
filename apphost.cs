#:sdk Aspire.AppHost.Sdk@13.3.5
#:package CommunityToolkit.Aspire.Hosting.Bun@13.3.0
using Aspire.Hosting;

#pragma warning disable ASPIRECSHARPAPPS001
var builder = DistributedApplication.CreateBuilder(args);

var be = builder.AddCSharpApp("be", "./be/be.csproj");

var bun = builder.AddBunApp("fe", "./fe", "dev")
    .WithHttpEndpoint(port: 3000, env: "PORT")
    .WithReference(be);

builder.Build().Run();
