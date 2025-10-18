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

    if (event.httpMethod !== 'GET') {
        return jsonResponse(405, { message: 'Method Not Allowed' });
    }

    const { user } = context.clientContext || {};
    if (!user || !user.email) {
        return jsonResponse(401, { message: 'Unauthorized or missing user email' });
    }
    
    try {
        const draftKey = `draft-content-${user.email}`;
        const store = getStore("drafts");
        const draftContent = await store.get(draftKey, { type: 'json' });

        if (draftContent === null) {
            return {
                statusCode: 404,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'No draft found.' }),
            };
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(draftContent),
        };

    } catch (error) {
        console.error(`Error fetching draft:`, error);
        return jsonResponse(500, { message: 'Internal Server Error' });
    }
};
export { handler };
