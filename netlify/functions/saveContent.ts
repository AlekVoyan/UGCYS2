import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { Buffer } from 'buffer';

const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, CONTENT_PATH } = process.env;

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    const { user } = context.clientContext || {};
    if (!user) {
        return { statusCode: 401, body: JSON.stringify({ message: 'Unauthorized' }) };
    }
    
    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO || !CONTENT_PATH) {
        return { statusCode: 500, body: JSON.stringify({ message: 'Server configuration error: Missing GitHub environment variables.' }) };
    }

    const API_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${CONTENT_PATH}`;
    const headers = {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
    };

    try {
        const getFileResponse = await fetch(API_URL, { headers });
        if (!getFileResponse.ok && getFileResponse.status !== 404) {
             const errorBody = await getFileResponse.text();
            throw new Error(`Failed to fetch file from GitHub: ${getFileResponse.statusText} - ${errorBody}`);
        }
        const fileData = getFileResponse.status === 404 ? {} : await getFileResponse.json();
        const currentSha = fileData.sha;

        const newContent = event.body;
        if (!newContent) {
            return { statusCode: 400, body: JSON.stringify({ message: 'Bad Request: No content provided.' }) };
        }
        const encodedContent = Buffer.from(newContent).toString('base64');

        const payload: { message: string; content: string; sha?: string } = {
            message: `CMS: Content update by ${user.email} on ${new Date().toISOString()}`,
            content: encodedContent,
        };

        if (currentSha) {
            payload.sha = currentSha;
        }

        const updateFileResponse = await fetch(API_URL, {
            method: 'PUT',
            headers,
            body: JSON.stringify(payload),
        });

        if (!updateFileResponse.ok) {
            const errorBody = await updateFileResponse.text();
            throw new Error(`Failed to update file on GitHub: ${updateFileResponse.statusText} - ${errorBody}`);
        }
        
        const responseData = await updateFileResponse.json();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Content saved successfully!', commit: responseData.commit.sha }),
        };

    } catch (error: any) {
        console.error('Error saving content:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error saving content.', error: error.message }),
        };
    }
};

export { handler };
