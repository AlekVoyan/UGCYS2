import type { Handler, HandlerContext, HandlerEvent, HandlerResponse } from "@netlify/functions";
import { getStore, connectLambda } from "@netlify/blobs";

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

    try {
        const draftKey = `draft-content-${user.email}`;
        const store = getStore("drafts");
        await store.delete(draftKey);
        
        return jsonResponse(200, { message: "Draft deleted successfully." });

    } catch (error) {
        console.error("Draft delete error:", error);
        return jsonResponse(500, { message: 'Failed to delete draft', error: (error as Error).message });
    }
};

export { handler };
