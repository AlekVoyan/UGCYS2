import type { Handler, HandlerContext, HandlerResponse, HandlerEvent } from "@netlify/functions";
import { getStore, connectLambda } from "@netlify/blobs";
import { v4 as uuidv4 } from 'uuid';
import { Buffer } from 'buffer';

const jsonResponse = (status: number, body: object): HandlerResponse => {
    return {
        statusCode: status,
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    };
};

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
    connectLambda(event as any);

    if (event.httpMethod !== 'POST') {
        return jsonResponse(405, { message: 'Method Not Allowed' });
    }
    
    const { user } = context.clientContext || {};
    if (!user) {
        return jsonResponse(401, { message: 'Unauthorized' });
    }

    if (!event.body) {
        return jsonResponse(400, { message: 'No body provided' });
    }

    try {
        const { fileData, mimeType } = JSON.parse(event.body);
        if (!fileData || !mimeType) {
            return jsonResponse(400, { message: 'Missing fileData or mimeType for upload' });
        }

        const key = uuidv4();
        const buffer = Buffer.from(fileData, 'base64');
        
        const store = getStore("uploads");
        // Fix: The `store.set` method expects a plain `ArrayBuffer`. A Node.js `Buffer` can be backed by a
        // `SharedArrayBuffer`, which is not a valid `BlobInput`. To prevent a type error, this creates a new
        // `Uint8Array` from the buffer, which copies the data and ensures the underlying buffer is a plain `ArrayBuffer`.
        const arrayBuffer = new Uint8Array(buffer).buffer;
        await store.set(key, arrayBuffer, { metadata: { mimeType } });

        return jsonResponse(200, { key });

    } catch (error) {
        console.error("Upload error:", error);
        return jsonResponse(500, { message: 'Failed to upload blob', error: (error as Error).message });
    }
};

export { handler };