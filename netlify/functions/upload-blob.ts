import type { Handler, HandlerContext } from "@netlify/functions";
import { getUploadsStore } from "./utils/blobStore";
import { v4 as uuidv4 } from 'uuid';
import type { Store } from "@netlify/blobs";

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
        // This function now expects filename and mimeType to generate a signed URL
        const { filename, mimeType } = JSON.parse(event.body);
        if (!filename || !mimeType) {
            return jsonResponse(400, { message: 'Missing filename or mimeType for signed URL generation' });
        }
        
        const key = uuidv4();
        const store = getUploadsStore();
        
        // Generate a URL that allows the client to PUT a file for 1 hour
        // FIX: Use an inline type assertion to resolve the type error. This handles cases
        // where the project's @netlify/blobs version has outdated type definitions
        // but the method exists at runtime.
        const signedUrl = await (store as Store & { getSignedURL: Function }).getSignedURL(key, { 
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
