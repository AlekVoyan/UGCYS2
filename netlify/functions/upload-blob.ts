import type { Handler, HandlerContext } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { v4 as uuidv4 } from 'uuid';
import { Buffer } from 'buffer';

const jsonResponse = (status: number, body: object) => {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
};

const handler: Handler = async (event, context: HandlerContext) => {
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
        const { image, filename, mimeType } = JSON.parse(event.body);

        if (!image || !image.includes(',')) {
            return jsonResponse(400, { message: 'Invalid image data format' });
        }

        const base64Data = image.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        
        const key = uuidv4();
        const store = getStore("uploads");
        
        await store.set(key, buffer, { metadata: { mimeType, filename } });
        
        return jsonResponse(200, { key });

    } catch (error) {
        console.error("Upload error:", error);
        return jsonResponse(500, { message: 'Failed to upload blob', error: (error as Error).message });
    }
};

export { handler };
