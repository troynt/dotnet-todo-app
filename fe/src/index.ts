import { serve } from "bun";
import index from "./index.html";
import { watch } from "node:fs";
import path from "node:path";

// Resolve backend endpoint from environment variables injected by Aspire
const backendUrl = process.env.services__be__http__0 || "http://localhost:5165";
console.log(`🔌 gRPC-Web reverse proxy → Backend: ${backendUrl}`);

const server = serve({
  port: process.env.PORT || 3000,
  routes: {
    // Reverse-proxy gRPC-Web requests to the ASP.NET backend.
    // The browser Connect client sends POST requests to paths like
    // /todo.TodoService/ListTodoLists — we forward those transparently.
    "/todo.TodoService/:method": {
      async POST(req) {
        const url = new URL(req.url);
        const target = new URL(url.pathname + url.search, backendUrl);
        const proxyReq = new Request(target.toString(), {
          method: "POST",
          headers: req.headers,
          body: req.body,
          // @ts-ignore — Bun supports duplex streaming
          duplex: "half",
        });

        try {
          const proxyRes = await fetch(proxyReq);
          return new Response(proxyRes.body, {
            status: proxyRes.status,
            headers: proxyRes.headers,
          });
        } catch (err: any) {
          console.error("gRPC-Web proxy error:", err);
          return new Response(`Proxy error: ${err.message}`, { status: 502 });
        }
      },
    },

    // Serve index.html for all unmatched routes (SPA fallback).
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);

// In development, watch the protos directory and regenerate TypeScript definitions on change
if (process.env.NODE_ENV !== "production") {
  const protoDir = path.resolve(import.meta.dir, "../../protos");
  console.log(`👁️  Watching proto directory for changes: ${protoDir}`);

  let isGenerating = false;
  watch(protoDir, { recursive: true }, async (eventType, filename) => {
    if (filename && filename.endsWith(".proto")) {
      if (isGenerating) return;
      isGenerating = true;

      console.log(`🔄 Proto file changed (${filename}), regenerating TypeScript definitions...`);
      try {
        const proc = Bun.spawn(["bun", "run", "generate-proto"], {
          cwd: path.resolve(import.meta.dir, ".."),
          stdout: "inherit",
          stderr: "inherit",
        });
        await proc.exited;
        console.log("✅ TypeScript definitions regenerated.");
      } catch (err) {
        console.error("❌ Failed to regenerate TypeScript definitions:", err);
      } finally {
        isGenerating = false;
      }
    }
  });
}

