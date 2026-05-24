# Todo App

A modern todo application built with ASP.NET Core gRPC (backend), React + TypeScript (frontend), and .NET Aspire for orchestration.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Bun, Tailwind CSS v4, Ant Design, TanStack Query, Connect RPC / gRPC-Web |
| **Backend** | ASP.NET Core (NET 10), gRPC, EF Core with SQLite, OpenTelemetry |
| **Orchestration** | .NET Aspire |
| **Contracts** | Protocol Buffers (buf) |

## Project Structure

```
├── apphost.cs          # Aspire AppHost – orchestrates all resources
├── protos/             # Protobuf definitions (single source of truth for the API)
│   └── todo.proto
├── be/                 # Backend – ASP.NET Core gRPC service
│   ├── Data/           # EF Core models & DbContext
│   ├── Features/       # Vertical slice handlers per use case
│   ├── Services/       # gRPC service entry point (TodoServiceImpl)
│   ├── Shared/         # Mapping extensions, shared validators
│   └── appsettings.*.json
├── fe/                 # Frontend – React + TypeScript app
│   ├── src/
│   │   ├── gen/        # Auto-generated protobuf/connect types (do not edit)
│   │   ├── features/   # Feature folders (each has components/ and hooks/)
│   │   ├── shared/     # Shared UI components & utilities
│   │   ├── App.tsx     # Root layout / state coordinator
│   │   └── client.ts   # gRPC-Web client configuration
│   └── e2e/            # Playwright E2E tests
└── aspire.config.json  # Aspire configuration
```

## Quick Start

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Bun](https://bun.sh/)
- [Aspire CLI](https://learn.microsoft.com/dotnet/aspire/get-started/install-aspire)

### Run the full app

```bash
aspire start
```

This builds the backend, generates TypeScript types from `protos/todo.proto`, starts the Bun dev server, and launches all resources under Aspire.

> **Tip:** Use `aspire start --isolated` to avoid port/state conflicts when working in git worktrees or multiple terminals.

### Run individual parts

```bash
# Backend only (also triggers proto generation)
dotnet build -c Debug   # run inside be/

# Frontend dev server independently
cd fe && bun run dev

# Proto generation only
cd fe && bun run generate-proto
```

## Available Commands

### Aspire Orchestration

| Command | Description |
|---------|-------------|
| `aspire start` | Start all resources (builds + generates protos) |
| `aspire start --isolated` | Start in an isolated session (unique ports/state) |
| `aspire stop` | Stop the running AppHost |
| `aspire ps` | List currently running AppHosts |
| `aspire describe` | Inspect resource states and endpoints (`--format Json`) |
| `aspire wait <resource>` | Wait for a resource to become healthy (e.g. `be`, `fe`) |
| `aspire logs [resource]` | View raw console logs |
| `aspire otel logs [resource] --format Json` | View structured OpenTelemetry logs |
| `aspire doctor` | Check local Aspire environment health |

### Frontend

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Vite + React dev server (localhost:3000) |
| `bun run build` | Build for production (runs proto gen + bundler) |
| `bun run generate-proto` | Regenerate TypeScript from `.proto` files |
| `bun run test:e2e` | Run Playwright E2E tests |

### Backend

| Command | Description |
|---------|-------------|
| `dotnet build` | Compile backend + generate C# types from protos |

## Resource Endpoints

| Resource | Type | URL |
|----------|------|-----|
| `fe` | Bun dev server | http://localhost:3000 |
| `be` | .NET gRPC/HTTP | localhost:5165 (HTTP) / localhost:7218 (HTTPS) |
| `aspire-dashboard` | Aspire dashboard | http://localhost:15189 / http://localhost:17020 |

## Adding a New Feature

### 1. Define the protobuf contract

Edit `protos/todo.proto` to add new messages or service methods. Then regenerate types:

```bash
cd fe && bun run generate-proto   # generates TypeScript in fe/src/gen/
dotnet build                      # generates C# in be/
```

### 2. Implement the backend slice

Each use case gets its own class under `be/Features/<FeatureName>/`:

1. Create a handler class (e.g., `be/Features/TodoLists/MyNewUseCase.cs`) that processes the request and uses `TodoDbContext` directly.
2. Register it in `be/Services/TodoServiceImpl.cs` by overriding the corresponding gRPC method and delegating to your handler.

### 3. Implement the frontend slice

1. Create components under `fe/src/features/<FeatureName>/components/`.
2. Create hooks (queries/mutations) under `fe/src/features/<FeatureName>/hooks/` using the auto-generated `@connectrpc/connect-query` types in `fe/src/gen/`.
3. Wire everything together in `fe/src/App.tsx` if it affects global state or routing.

### 4. Run and verify

```bash
aspire start          # rebuilds everything and starts all resources
bun run test:e2e      # run E2E tests (add new ones in fe/e2e/)
```

## Debugging

1. **Resource not healthy?** → `aspire logs <resource>` or `aspire otel logs <resource> --format Json`
2. **gRPC call failing?** → Confirm both resources are up (`aspire wait be && aspire wait fe`). Check `fe/src/client.ts` for the gRPC-Web endpoint config.
3. **Stale generated types?** → Run `bun run generate-proto` in `fe/`, then `dotnet build` in `be/`.
4. **Database issues?** → SQLite database is at `be/todo.db`, created on each startup via `EnsureCreated()`.

## Architecture Notes

- **Vertical Slice Architecture**: Both backend and frontend are organized by feature/domain rather than technical layer. Each use case (backend) or feature folder (frontend) is self-contained.
- **Protobuf as the contract**: `protos/todo.proto` is the single source of truth for all API messages and service definitions. TypeScript and C# types are generated from it.
- **gRPC-Web on the frontend**: The React app connects to the gRPC backend via Connect RPC / gRPC-Web (`fe/src/client.ts`). CORS headers (`Grpc-*`) are exposed on the backend.
