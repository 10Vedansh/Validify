import type { Context, Next } from "hono";
import { BadRequestError } from "@/lib/errors";

const MAX_BODY_BYTES = 1_048_576;

export async function bodyLimit(c: Context, next: Next) {
  const contentLength = c.req.header("Content-Length");
  if (contentLength) {
    const bytes = parseInt(contentLength, 10);
    if (!isNaN(bytes) && bytes > MAX_BODY_BYTES) {
      throw new BadRequestError("Request body too large. Maximum size is 1MB.");
    }
  }

  const transferEncoding = c.req.header("Transfer-Encoding");
  if (transferEncoding?.toLowerCase() === "chunked") {
    const rawBody = c.req.raw.body;
    if (rawBody) {
      const reader = rawBody.getReader();
      let total = 0;
      const chunks: Uint8Array[] = [];
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        total += value.length;
        chunks.push(value);
        if (total > MAX_BODY_BYTES) {
          reader.cancel();
          throw new BadRequestError("Request body too large. Maximum size is 1MB.");
        }
      }
      // Reconstruct the body as a new ReadableStream so downstream handlers
      // can still consume it after our size check.
      const reconstructed = new Uint8Array(total);
      let offset = 0;
      for (const chunk of chunks) {
        reconstructed.set(chunk, offset);
        offset += chunk.length;
      }
      const newStream = new ReadableStream({
        start(controller) {
          controller.enqueue(reconstructed);
          controller.close();
        },
      });
      // Replace the consumed body
      Object.defineProperty(c.req.raw, "body", {
        get: () => newStream,
        configurable: true,
      });
    }
  }

  await next();
}
