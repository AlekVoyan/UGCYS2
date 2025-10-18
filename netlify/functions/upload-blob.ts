import type { Handler, HandlerContext, HandlerResponse, HandlerEvent } from "@netlify/functions";
import { getStore, connectLambda } from "@netlify/blobs";
import { v4 as uuidv4 } from 'uuid';

// FIX: Refactored to return HandlerResponse objects instead of native Response to align with the Handler type.
const jsonResponse = (status: number, body: object): HandlerResponse => {
    return {
        statusCode: status,
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    };
};

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
    // FIX: Cast `event` to `any` to resolve a type mismatch between `HandlerEvent` and `connectLambda`'s expected `LambdaEvent` type.
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
        // This function now expects filename and mimeType to generate a signed URL
        const { filename, mimeType } = JSON.parse(event.body);
        if (!filename || !mimeType) {
            return jsonResponse(400, { message: 'Missing filename or mimeType for signed URL generation' });
        }
        
        const key = uuidv4();
        const store = getStore("uploads");
        
        // Generate a URL that allows the client to PUT a file for 1 hour
        // FIX: Cast `store` to `any` to bypass an outdated TypeScript type definition that reports `getSignedURL` as not existing. This relies on the method being available in the Netlify runtime.
        const signedUrl = await (store as any).getSignedURL(key, { 
            expiresIn: 3600, // 1 hour
            access: 'put'
        });
        
        // Return the key and the URL for the client to upload to
        return jsonResponse(200, { key, signedUrl });

    } catch (error) {
        console.error("Signed URL generation error:", error);
        return jsonResponse(500, { message: 'Failed to get signed URL', error: (error as Error).message });
    }
};

export { handler };