/**
 * Browser-side Connect/gRPC-Web client.
 *
 * Tree-shakable: only the RPC methods you actually call (and their
 * request/response schemas) will survive bundler dead-code elimination
 * thanks to the `@__PURE__` annotations emitted by protoc-gen-es.
 */

import { createClient } from "@connectrpc/connect";
import { createGrpcWebTransport } from "@connectrpc/connect-web";
import { TodoService } from "./gen/todo_pb";

// The transport talks gRPC-Web back to the Bun server, which reverse-proxies
// to the ASP.NET backend. Same-origin, so no CORS needed.
export const transport = createGrpcWebTransport({
  baseUrl: "/",
});

/**
 * Raw typed Connect client — kept as a low-level escape hatch.
 */
export const todoClient = createClient(TodoService, transport);
