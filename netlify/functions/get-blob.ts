// FIX: Refactored to return HandlerResponse objects instead of native Response to align with the Handler type.
import type { Handler, HandlerEvent } from "@netlify/functions";
import { getStore, connectLambda } from "@netlify/blobs";
import { Buffer } from "buffer";

const handler: Handler = async (event: HandlerEvent) => {
  // FIX: Cast `event` to `any` to resolve a type mismatch between `HandlerEvent` and `connectLambda`'s expected `LambdaEvent` type.
  connectLambda(event as any);
  
  const key = event.queryStringParameters?.key;

  if (!key) {
    return {
      statusCode: 400,
      body: "Missing 'key' query parameter.",
    };
  }

  try {
    const store = getStore("uploads");
    const result = await store.getWithMetadata(key, { type: "arrayBuffer" });

    if (result === null) {
      return {
        statusCode: 404,
        body: `Blob with key "${key}" not found.`,
      };
    }

    const { data, metadata } = result;

    const headers = {
        'Content-Type': (metadata?.mimeType as string) || 'application/octet-stream',
        'Content-Length': data.byteLength.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable' // Cache for 1 year
    };

    return {
        statusCode: 200,
        headers,
        body: Buffer.from(data).toString('base64'),
        isBase64Encoded: true,
    };

  } catch (error) {
    console.error(`Error fetching blob with key ${key}:`, error);
    return {
        statusCode: 500,
        body: "Internal Server Error",
    };
  }
};

export { handler };