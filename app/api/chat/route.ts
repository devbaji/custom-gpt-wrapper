import { generateChatResponse } from '../../actions';

export async function POST(req: Request) {
    try {
        const { messages, model } = await req.json();

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return new Response('No messages provided', { status: 400 });
        }

        return generateChatResponse(messages, model);
    } catch {
        return new Response('Internal Server Error', { status: 500 });
    }
} 