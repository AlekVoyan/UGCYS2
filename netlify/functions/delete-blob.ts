import type { Handler, HandlerContext } from "@netlify/functions";
import { getUploadsStore } from "./utils/blobStore";

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
        const { key } = JSON.parse(event.body);

        if (!key) {
            return jsonResponse(400, { message: 'Blob key not provided' });
        }
        
        const store = getUploadsStore();
        await store.delete(key);
        
        return jsonResponse(200, { message: "Blob deleted successfully." });

    } catch (error) {
        console.error("Delete error:", error);
        return jsonResponse(500, { message: 'Failed to delete blob', error: (error as Error).message });
    }
};

export { handler };
