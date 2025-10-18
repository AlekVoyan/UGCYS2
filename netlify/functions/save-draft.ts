import type { Handler, HandlerContext, HandlerEvent, HandlerResponse } from "@netlify/functions";
import { getStore, connectLambda } from "@netlify/blobs";
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
    if (!user || !user.email) {
        return jsonResponse(401, { message: 'Unauthorized or missing user email' });
    }

    if (!event.body) {
        return jsonResponse(400, { message: 'No draft content provided' });
    }

    try {
        const draftKey = `draft-content-${user.email}`;
        const buffer = Buffer.from(event.body);
        
        const store = getStore("drafts");
        const arrayBuffer = new Uint8Array(buffer).buffer;
        await store.set(draftKey, arrayBuffer, { metadata: { mimeType: 'application/json' } });

        return jsonResponse(200, { message: 'Draft saved' });

    } catch (error) {
        console.error("Draft save error:", error);
        return jsonResponse(500, { message: 'Failed to save draft', error: (error as Error).message });
    }
};

export { handler };
