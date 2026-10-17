import assert from "node:assert/strict";
import test from "node:test";
import { readLimitedRequestBody, RequestBodyTooLargeError } from "../lib/http/read-limited-request-body.ts";

test("reads bounded JSON bodies from a stream", async () => {
  const request = new Request("http://localhost.test", { method: "POST", body: "{\"ok\":true}" });
  assert.equal(await readLimitedRequestBody(request, 32), "{\"ok\":true}");
});

test("rejects oversized declared and streamed bodies", async () => {
  const declared = new Request("http://localhost.test", {
    method: "POST",
    headers: { "content-length": "100" },
    body: "{}",
  });
  await assert.rejects(readLimitedRequestBody(declared, 10), RequestBodyTooLargeError);

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode("123456"));
      controller.enqueue(new TextEncoder().encode("789012"));
      controller.close();
    },
  });
  const streamed = new Request("http://localhost.test", { method: "POST", body: stream, duplex: "half" });
  await assert.rejects(readLimitedRequestBody(streamed, 10), RequestBodyTooLargeError);
});
