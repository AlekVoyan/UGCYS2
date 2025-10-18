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
        // FIX: The `store.set` method expects an ArrayBuffer, but `Buffer.from` returns a Buffer.
        // Convert the Buffer to an ArrayBuffer to match the required type.
        // The slice is used to safely get the correct segment of the underlying ArrayBuffer.
        const arrayBuffer = buffer.buffer.slice(
            buffer.byteOffset,
            buffer.byteOffset + buffer.byteLength
        );
        await store.set(key, arrayBuffer, { metadata: { mimeType } });

        return jsonResponse(200, { key });

    } catch (error) {
        console.error("Upload error:", error);
        return jsonResponse(500, { message: 'Failed to upload blob', error: (error as Error).message });
    }
};

export { handler };