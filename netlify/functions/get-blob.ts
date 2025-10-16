import type { Handler } from "@netlify/functions";
import { getUploadsStore } from "./utils/blobStore";

const handler: Handler = async (event) => {
  const key = event.queryStringParameters?.key;

  if (!key) {
    return new Response("Missing 'key' query parameter.", { status: 400 });
  }

  try {
    const store = getUploadsStore();
    const result = await store.getWithMetadata(key, { type: "arrayBuffer" });

    if (!result || !result.data) {
        return new Response(`Blob with key "${key}" not found.`, { status: 404 });
    }

    const { data, metadata } = result;

    const headers = {
        // FIX: Cast metadata.mimeType to string to satisfy HeadersInit type.
        'Content-Type': (metadata?.mimeType as string) || 'application/octet-stream',
        'Content-Length': data.byteLength.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable' // Cache for 1 year
    };

    return new Response(data, {
        status: 200,
        headers,
    });

  } catch (error) {
    console.error(`Error fetching blob with key ${key}:`, error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

export { handler };
