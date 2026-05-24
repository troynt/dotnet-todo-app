# Agent Guide & Architecture Reference

This repository is structured for ease of maintenance by developers and AI agents alike. It follows modern clean practices, including a **Vertical Slice Architecture** for both the backend and frontend services.

## Architecture Overview

### Technology Stack
- **Frontend (`fe`)**: Vite-powered React application using TypeScript, styled with Tailwind CSS, using TanStack Query for data fetching and state management.
- **Backend (`be`)**: ASP.NET Core gRPC service built on .NET 10, using Entity Framework Core with SQLite.
- **Orchestration**: .NET Aspire orchestrates both services under `apphost.cs`.
- **Contracts (`protos`)**: Protobuf files define gRPC APIs and messages.

### Backend Structure: Vertical Slice Architecture
The backend is structured around features (or slices) rather than technical layers. 

1. **Domain Models & DbContext (`be/Data/`)**:
   - `DbModels.cs`: Defines the SQLite database entities (`DbTodoList` and `DbTodoItem`). These are shared models.
   - `TodoDbContext.cs`: EF Core Database Context.
2. **Shared Mapping (`be/Shared/`)**:
   - `MappingExtensions.cs`: Provides extension methods to map between EF Core database models and protobuf messages.
3. **Shared Validation (`be/Validation/`)**:
   - `ValidationRules.cs`: Contains shared business logic validators for requests. Use cases leverage these validators to ensure data integrity before database insertion/update.
4. **Use Cases (`be/Features/`)**:
   - Organized by feature folders (e.g., `Features/TodoLists/` and `Features/TodoItems/`).
   - Each use case (e.g., `CreateTodoList`, `GetTodoList`, etc.) is fully self-contained in its own class, handling its specific request and executing its query/command.
5. **gRPC Service Entry Point (`be/Services/`)**:
   - `TodoServiceImpl.cs` overrides gRPC endpoints and acts as an API router, immediately delegating execution to the respective feature slice handlers.

### Frontend Structure: Vertical Slice Architecture (Feature Folders)
The frontend is structured around features/domains under `fe/src/features/` rather than technical roles:

- **Feature Slices (`fe/src/features/<FeatureName>/`)**: Each feature contains its own `components/` and `hooks/` subfolders, keeping all related UI code together.
- **Shared (`fe/src/shared/`)**: Globally reused UI components (e.g., `EmptyState.tsx`) or utility hooks (e.g., `dateHelpers.ts`).
- **Orchestrator (`fe/src/App.tsx`)**: Coordinates state between feature slices and defines the root layout.

---

## Guidelines for Adding Features

### 1. Define Protobuf Contracts
If you need a new operation or model:
- Edit the `.proto` file in the `protos` directory.
- Regenerate clients and servers (run `dotnet build` on the backend).

> **Note**: Generated TypeScript files (`fe/src/gen/`) are automatically compiled as part of the frontend dev/build pipeline — no manual import or reference needed.

### 2. Implement Backend Slice
- Create a new file under the appropriate folder in `be/Features/<FeatureName>/<UseCaseName>.cs`.
- Ensure it contains the handler code, utilizing shared mapping and validation.
- Keep dependencies explicit. Leverage `TodoDbContext` directly.
- Update `TodoServiceImpl.cs` to delegate to the new handler.

### 3. Implement Frontend Slice
- Place feature-specific components under `fe/src/features/<FeatureName>/components/`.
- Place feature-specific queries, mutations, or hooks under `fe/src/features/<FeatureName>/hooks/`.
- Coordinate the new feature state in `fe/src/App.tsx` if it spans across slices.

---

## Useful Commands

### Aspire Orchestration (Aspire CLI)
- `aspire start` - Starts the AppHost in the background. Rerun this to restart the application after AppHost or code changes.
- `aspire start --isolated` - Starts the AppHost in an isolated session (highly recommended in git worktrees or to prevent port/state conflicts).
- `aspire stop` - Stops the running AppHost.
- `aspire ps` - Lists currently running AppHosts.
- `aspire describe` - Inspects current resource states, endpoints, and statuses. Use `--format Json` for machine-readable output.
- `aspire wait <resource>` - Waits for a specific resource (e.g., `be` or `fe`) to become healthy before proceeding.
- `aspire otel logs [resource]` - View structured OpenTelemetry logs (useful with `--format Json`).
- `aspire logs [resource]` - View raw console logs for a resource.
- `aspire doctor` - Checks the health of the local Aspire environment.

### Build Commands
| Component | Command | Notes |
|-----------|---------|-------|
| Full app (Aspire) | `aspire start` or `aspire start --isolated` | Builds backend, generates protos to `fe/src/gen/`, starts frontend dev server |
| Backend only | `dotnet build` in `be/` | Also triggers proto generation via MSBuild target |
| Frontend dev | `bun run dev` or `npm run dev` in `fe/` | Hot-reload Bun + React on localhost:3000 |
| Frontend prod build | `npm run build` in `fe/` | Runs proto gen + bundler step |
| Proto generation only | `npm run generate-proto` in `fe/` | Runs `buf generate` against `protos/todo.proto` |

### Testing
| Test type | Command | Details |
|-----------|---------|---------|
| E2E tests (Playwright) | `npm run test:e2e` in `fe/` | Runs `playwright test` against the running app |
| Backend unit tests | *(none yet)* | Create a new `.csproj` with xUnit/NUnit/MSTest to add unit tests |

### Debugging Quick Reference

**Resource names and endpoints:**
| Resource | Type | State | HTTP Endpoint |
|----------|------|-------|---------------|
| `be` | .NET Project | Running | localhost:5165 (HTTP), localhost:7218 (HTTPS) |
| `fe` | Executable (Bun) | Running | localhost:3000 |
| `aspire-dashboard` | Executable | Running | localhost:15189 / localhost:17020 |

**Debugging workflow:**
1. **Resource not healthy?** → Run `aspire logs <resource>` to inspect raw console output, or `aspire otel logs <resource> --format Json` for structured logs with traces.
2. **Apply code changes without restart?** → Use the resource's `restart` command via Aspire (available per-resource).
3. **Trace a request across services?** → Check `aspire describe --format Json` for trace IDs, or use `aspire otel logs <resource>` to filter by span/trace ID.
4. **gRPC call failing?** → Verify the backend is healthy first (`aspire wait be`), then check `fe/src/client.ts` for the gRPC-Web client configuration and CORS headers (backend allows all origins with exposed `Grpc-*` headers).
5. **Database issues?** → SQLite database lives at `C:\work\Todo2\be\todo.db`, created on each startup via `EnsureCreated()`.

**Common troubleshooting:**
- Port conflicts → Use `aspire start --isolated` for isolated session with unique ports/state.
- Stale generated types → Run `npm run generate-proto` in `fe/` to regenerate TypeScript from `protos/todo.proto`, then rebuild backend with `dotnet build`.
- Frontend not connecting to backend → Confirm both resources are healthy (`aspire wait be && aspire wait fe`). The frontend client connects via gRPC-Web at the endpoint configured in `fe/src/client.ts`.

### Backend Build
- `dotnet build` inside `be/` to compile.

### Frontend Development
- `bun run dev` or `npm run dev` in `fe/` to run the frontend developer server independently.
